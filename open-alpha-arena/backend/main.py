from __future__ import annotations

import argparse
import json
import logging
import secrets
from dataclasses import asdict, replace
from datetime import UTC, datetime, timedelta
from decimal import Decimal
from http import HTTPStatus
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from typing import Any
from urllib.parse import urlparse

from backend.ai_validation import validate_ai_decision
from backend.exchange_adapter import HealthCheckResult
from backend.logging_utils import configure_logging, set_correlation_ids
from backend.models import (
    ExecutionMode,
    MarketConstraints,
    OrderRecord,
    OrderRequest,
    OrderState,
    OrderType,
    OrderSide,
    RiskContext,
    RiskPolicy,
    RiskReject,
    TradeEvent,
)
from backend.order_service import OrderService
from backend.order_state_machine import InvalidOrderTransition
from backend.persistence import SQLiteRepository
from backend.risk_engine import RiskEngine


STATIC_DIR = Path(__file__).resolve().parent / "static"
LOGGER = logging.getLogger(__name__)


def build_default_policy() -> RiskPolicy:
    return RiskPolicy(
        allowed_symbols=frozenset({"BTCUSDT", "ETHUSDT", "SOLUSDT"}),
        max_notional_per_order=Decimal("10000"),
        max_daily_loss=Decimal("500"),
        max_account_exposure=Decimal("25000"),
        leverage_cap=5,
        min_margin_balance=Decimal("100"),
        max_consecutive_losses=3,
        max_consecutive_api_errors=5,
    )


def build_default_context(symbol: str = "BTCUSDT") -> RiskContext:
    return RiskContext(
        mode=ExecutionMode.PAPER,
        daily_realized_pnl=Decimal("0"),
        account_exposure=Decimal("0"),
        margin_balance=Decimal("1000"),
        consecutive_losses=0,
        consecutive_api_errors=0,
        market_constraints=MarketConstraints(
            symbol=symbol,
            min_qty=Decimal("0.001"),
            step_size=Decimal("0.001"),
            tick_size=Decimal("0.10"),
            min_notional=Decimal("5"),
            max_leverage=10,
        ),
    )


class DemoExchangeAdapter:
    name = "demo"

    def fetch_balance(self, account_id: str) -> dict[str, Any]:
        return {"account_id": account_id, "total": {"USDT": "1000"}}

    def fetch_positions(self, account_id: str) -> list[dict[str, Any]]:
        return []

    def fetch_open_orders(self, account_id: str, symbol: str | None = None) -> list[dict[str, Any]]:
        return []

    def fetch_order(self, account_id: str, order_id: str, symbol: str | None = None) -> dict[str, Any]:
        return {"id": order_id, "symbol": symbol}

    def create_order(self, account_id: str, order: OrderRequest) -> dict[str, Any]:
        return {"id": f"demo-{order.client_order_id}", "clientOrderId": order.client_order_id}

    def cancel_order(self, account_id: str, order_id: str, symbol: str | None = None) -> dict[str, Any]:
        return {"id": order_id, "status": "cancel_requested", "symbol": symbol}

    def cancel_all_orders(self, account_id: str, symbol: str | None = None) -> list[dict[str, Any]]:
        return []

    def fetch_ticker(self, symbol: str) -> dict[str, Any]:
        return {"symbol": symbol, "last": "50000.00"}

    def fetch_orderbook(self, symbol: str, limit: int = 20) -> dict[str, Any]:
        return {"symbol": symbol, "limit": limit, "bids": [], "asks": []}

    def fetch_ohlcv(self, symbol: str, timeframe: str, limit: int = 100) -> list[list[Any]]:
        return []

    def set_leverage(self, account_id: str, symbol: str, leverage: int) -> dict[str, Any]:
        return {"account_id": account_id, "symbol": symbol, "leverage": leverage}

    def fetch_market_info(self, symbol: str) -> MarketConstraints:
        return build_default_context(symbol).market_constraints

    def normalize_symbol(self, symbol: str) -> str:
        return symbol.upper()

    def health_check(self) -> HealthCheckResult:
        return HealthCheckResult(ok=True, message="demo adapter ready", details={"adapter": self.name})


class ArenaApp:
    def __init__(self, repository: SQLiteRepository, service: OrderService, db_path: str):
        self.repository = repository
        self.service = service
        self.db_path = db_path
        self.adapter = DemoExchangeAdapter()
        self._base_policy = build_default_policy()
        self._global_kill_switch = False
        self._symbol_kill_switches: set[str] = set()
        self._live_confirmation_tokens: dict[str, tuple[str, datetime]] = {}

    def close(self) -> None:
        self.repository.close()

    def policy(self) -> RiskPolicy:
        return replace(
            self._base_policy,
            global_kill_switch=self._global_kill_switch,
            symbol_kill_switches=frozenset(self._symbol_kill_switches),
        )

    def context_for_symbol(self, symbol: str) -> RiskContext:
        return build_default_context(symbol)

    def issue_live_confirmation_token(self, account_id: str, ttl_seconds: int = 300) -> tuple[str, datetime]:
        token = secrets.token_urlsafe(12)
        expires_at = datetime.now(UTC) + timedelta(seconds=max(30, ttl_seconds))
        self._live_confirmation_tokens[account_id] = (token, expires_at)
        return token, expires_at

    def expected_confirmation_token(self, account_id: str | None) -> str | None:
        if not account_id:
            return None
        record = self._live_confirmation_tokens.get(account_id)
        if record is None:
            return None
        token, expires_at = record
        if expires_at <= datetime.now(UTC):
            self._live_confirmation_tokens.pop(account_id, None)
            return None
        return token

    def handle(self, method: str, path: str, headers: dict[str, str], body: bytes) -> dict[str, Any]:
        parsed = urlparse(path)
        route = parsed.path
        request_id = headers.get("X-Request-Id") or f"req-{secrets.token_hex(6)}"
        set_correlation_ids(request_id)

        try:
            if method == "GET" and route == "/":
                return self._html_response(self._render_dashboard())
            if method == "GET" and route.startswith("/static/"):
                return self._serve_static(route.removeprefix("/static/"))
            if method == "POST" and route == "/api/v1/orders":
                return self._submit_order(request_id, headers, body)
            if method == "GET" and route.startswith("/api/v1/orders/") and not route.endswith("/cancel"):
                order_id = route.removeprefix("/api/v1/orders/")
                return self._get_order(order_id)
            if method == "POST" and route.endswith("/cancel") and route.startswith("/api/v1/orders/"):
                order_id = route.removeprefix("/api/v1/orders/").removesuffix("/cancel")
                return self._cancel_order(order_id, body)
            if method == "GET" and route == "/api/v1/risk/rejects":
                return self._json_response({"items": [self._serialize_risk_reject(item) for item in self.repository.list_risk_reject_records()]})
            if method == "POST" and route == "/api/v1/ops/kill-switch":
                return self._set_kill_switch(body)
            if method == "POST" and route == "/api/v1/ops/live-confirmation":
                return self._create_live_confirmation(body)
            if method == "GET" and route == "/api/v1/health/exchange":
                return self._exchange_health()
            return self._json_response({"error": "not_found"}, status=HTTPStatus.NOT_FOUND)
        except ValueError as exc:
            LOGGER.warning("request validation failed: %s", exc)
            return self._json_response({"error": "bad_request", "message": str(exc)}, status=HTTPStatus.BAD_REQUEST)
        except KeyError:
            return self._json_response({"error": "not_found"}, status=HTTPStatus.NOT_FOUND)

    def _submit_order(self, request_id: str, headers: dict[str, str], body: bytes) -> dict[str, Any]:
        payload = self._load_json(body, headers)
        ai_decision = None
        if "ai_decision" in payload and payload["ai_decision"] is not None:
            ai_decision = validate_ai_decision(payload["ai_decision"])

        account_id = str(payload["account_id"])
        order_request = OrderRequest(
            account_id=account_id,
            strategy_id=str(payload["strategy_id"]),
            symbol=str(payload["symbol"]).upper(),
            side=OrderSide(str(payload["side"]).upper()),
            order_type=OrderType(str(payload["order_type"]).upper()),
            quantity=Decimal(str(payload["quantity"])),
            price=Decimal(str(payload["price"])) if payload.get("price") is not None else None,
            leverage=int(payload["leverage"]),
            reduce_only=bool(payload.get("reduce_only", False)),
            execution_mode=ExecutionMode(str(payload.get("execution_mode", "paper")).lower()),
        )
        request_id = str(payload.get("request_id") or request_id)

        order = self.service.submit_order(
            adapter=self.adapter,
            order_request=order_request,
            policy=self.policy(),
            context=self.context_for_symbol(order_request.symbol),
            env={},
            request_id=request_id,
            ui_confirmation_token=payload.get("ui_confirmation_token"),
            expected_confirmation_token=self.expected_confirmation_token(account_id),
        )
        events = self.repository.list_trade_events(order.order_id)
        rejects = self.repository.list_risk_rejects_for_order(order.order_id)
        response = {
            "order": self._serialize_order(order),
            "events": [self._serialize_trade_event(event) for event in events],
            "violations": [self._serialize_risk_reject(reject) for reject in rejects],
        }
        if ai_decision is not None:
            response["validated_ai_decision"] = self._serialize_dataclass(ai_decision)

        if order.state is OrderState.REJECTED:
            return self._json_response(response, status=HTTPStatus.UNPROCESSABLE_ENTITY)
        return self._json_response(response, status=HTTPStatus.CREATED)

    def _get_order(self, order_id: str) -> dict[str, Any]:
        order = self.repository.get_order(order_id)
        if order is None:
            return self._json_response({"error": "not_found"}, status=HTTPStatus.NOT_FOUND)
        return self._json_response(
            {
                "order": self._serialize_order(order),
                "events": [self._serialize_trade_event(event) for event in self.repository.list_trade_events(order_id)],
                "violations": [self._serialize_risk_reject(reject) for reject in self.repository.list_risk_rejects_for_order(order_id)],
            }
        )

    def _cancel_order(self, order_id: str, body: bytes) -> dict[str, Any]:
        payload = self._load_json(body, default={})
        try:
            order = self.service.cancel_order(
                adapter=self.adapter,
                order_id=order_id,
                request_id=str(payload.get("request_id") or f"cancel-{order_id}"),
            )
        except InvalidOrderTransition as exc:
            return self._json_response({"error": "invalid_transition", "message": str(exc)}, status=HTTPStatus.CONFLICT)
        return self._json_response({"order": self._serialize_order(order)})

    def _set_kill_switch(self, body: bytes) -> dict[str, Any]:
        payload = self._load_json(body)
        if "global_kill_switch" in payload:
            self._global_kill_switch = bool(payload["global_kill_switch"])

        symbols = payload.get("symbol_kill_switches")
        if symbols is not None:
            self._symbol_kill_switches = {str(symbol).upper() for symbol in symbols}

        symbol = payload.get("symbol")
        enabled = payload.get("enabled")
        if symbol is not None and enabled is not None:
            normalized = str(symbol).upper()
            if enabled:
                self._symbol_kill_switches.add(normalized)
            else:
                self._symbol_kill_switches.discard(normalized)

        return self._json_response({"policy": self._serialize_policy(self.policy())})

    def _create_live_confirmation(self, body: bytes) -> dict[str, Any]:
        payload = self._load_json(body)
        account_id = str(payload.get("account_id") or "default")
        ttl_seconds = int(payload.get("ttl_seconds") or 300)
        token, expires_at = self.issue_live_confirmation_token(account_id, ttl_seconds=ttl_seconds)
        return self._json_response(
            {
                "account_id": account_id,
                "token": token,
                "expires_at": expires_at.isoformat(),
            }
        )

    def _exchange_health(self) -> dict[str, Any]:
        health = self.adapter.health_check()
        return self._json_response({"ok": health.ok, "message": health.message, "details": health.details})

    def _serve_static(self, relative_path: str) -> dict[str, Any]:
        file_path = (STATIC_DIR / relative_path).resolve()
        if not str(file_path).startswith(str(STATIC_DIR.resolve())) or not file_path.exists():
            return self._json_response({"error": "not_found"}, status=HTTPStatus.NOT_FOUND)
        content_type = "text/plain; charset=utf-8"
        if file_path.suffix == ".css":
            content_type = "text/css; charset=utf-8"
        elif file_path.suffix == ".js":
            content_type = "application/javascript; charset=utf-8"
        return {
            "status": HTTPStatus.OK,
            "headers": {"Content-Type": content_type},
            "body": file_path.read_bytes(),
        }

    def _render_dashboard(self) -> str:
        orders = [self._serialize_order(order) for order in self.repository.list_recent_orders(limit=8)]
        rejects = [self._serialize_risk_reject(item) for item in self.repository.list_risk_reject_records()]
        health = self.adapter.health_check()
        bootstrap = {
            "orders": orders,
            "rejects": rejects,
            "policy": self._serialize_policy(self.policy()),
            "health": {"ok": health.ok, "message": health.message, "details": health.details},
        }
        return f"""<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Open Alpha Arena</title>
    <link rel="stylesheet" href="/static/styles.css">
  </head>
  <body>
    <main class="shell">
      <section class="hero">
        <p class="eyebrow">Execution Safety Console</p>
        <h1>Open Alpha Arena</h1>
        <p class="lede">A local control surface for AI-assisted crypto order validation, paper submission, kill-switch management, and exchange-readiness checks.</p>
      </section>
      <section class="grid">
        <article class="panel">
          <h2>Submit Order</h2>
          <form id="order-form">
            <label>Account ID<input name="account_id" value="acct-demo" required></label>
            <label>Strategy ID<input name="strategy_id" value="mean-reversion" required></label>
            <label>Symbol<input name="symbol" value="BTCUSDT" required></label>
            <label>Side
              <select name="side">
                <option>BUY</option>
                <option>SELL</option>
              </select>
            </label>
            <label>Order Type
              <select name="order_type">
                <option>LIMIT</option>
                <option>MARKET</option>
              </select>
            </label>
            <label>Quantity<input name="quantity" value="0.010" required></label>
            <label>Price<input name="price" value="50000.00"></label>
            <label>Leverage<input name="leverage" type="number" min="1" max="10" value="1" required></label>
            <label>Execution Mode
              <select name="execution_mode">
                <option value="paper">paper</option>
                <option value="live">live</option>
              </select>
            </label>
            <label class="checkbox"><input name="reduce_only" type="checkbox">Reduce Only</label>
            <label>AI Decision JSON<textarea name="ai_decision" rows="6" placeholder='{{"action":"BUY","confidence":"0.8","rationale":"Breakout","desired_risk_pct":"0.02","stop_loss_pct":"0.01","take_profit_pct":"0.03"}}'></textarea></label>
            <button type="submit">Place Order</button>
          </form>
        </article>
        <article class="panel">
          <h2>Operations</h2>
          <button id="health-button" type="button">Refresh Exchange Health</button>
          <button id="token-button" type="button">Create Live Confirmation Token</button>
          <label class="checkbox"><input id="kill-switch-toggle" type="checkbox">Global Kill Switch</label>
          <pre id="ops-output"></pre>
        </article>
      </section>
      <section class="grid">
        <article class="panel">
          <h2>Recent Orders</h2>
          <div id="orders"></div>
        </article>
        <article class="panel">
          <h2>Risk Rejects</h2>
          <div id="rejects"></div>
        </article>
      </section>
      <section class="panel">
        <h2>Latest Response</h2>
        <pre id="response"></pre>
      </section>
    </main>
    <script>window.__BOOTSTRAP__ = {json.dumps(bootstrap, sort_keys=True)};</script>
    <script src="/static/app.js"></script>
  </body>
</html>"""

    def _load_json(
        self,
        body: bytes,
        headers: dict[str, str] | None = None,
        default: dict[str, Any] | None = None,
    ) -> dict[str, Any]:
        if not body:
            return {} if default is None else default
        if headers and headers.get("Content-Type", "").split(";")[0] not in {"", "application/json"}:
            raise ValueError("Content-Type must be application/json")
        try:
            payload = json.loads(body.decode("utf-8"))
        except json.JSONDecodeError as exc:
            raise ValueError("Request body must be valid JSON") from exc
        if not isinstance(payload, dict):
            raise ValueError("Request body must be a JSON object")
        return payload

    def _html_response(self, body: str, status: HTTPStatus = HTTPStatus.OK) -> dict[str, Any]:
        return {
            "status": status,
            "headers": {"Content-Type": "text/html; charset=utf-8"},
            "body": body.encode("utf-8"),
        }

    def _json_response(self, payload: dict[str, Any], status: HTTPStatus = HTTPStatus.OK) -> dict[str, Any]:
        return {
            "status": status,
            "headers": {"Content-Type": "application/json; charset=utf-8"},
            "body": json.dumps(payload, sort_keys=True).encode("utf-8"),
        }

    def _serialize_order(self, order: OrderRecord) -> dict[str, Any]:
        return {
            "order_id": order.order_id,
            "account_id": order.account_id,
            "strategy_id": order.strategy_id,
            "symbol": order.symbol,
            "side": order.side.value,
            "order_type": order.order_type.value,
            "quantity": str(order.quantity),
            "price": str(order.price) if order.price is not None else None,
            "leverage": order.leverage,
            "reduce_only": order.reduce_only,
            "execution_mode": order.execution_mode.value,
            "client_order_id": order.client_order_id,
            "idempotency_key": order.idempotency_key,
            "state": order.state.value,
            "external_order_id": order.external_order_id,
            "filled_quantity": str(order.filled_quantity),
            "average_fill_price": str(order.average_fill_price) if order.average_fill_price is not None else None,
            "failure_reason": order.failure_reason,
            "created_at": order.created_at.isoformat(),
            "updated_at": order.updated_at.isoformat(),
        }

    def _serialize_trade_event(self, event: TradeEvent) -> dict[str, Any]:
        return {
            "event_id": event.event_id,
            "order_id": event.order_id,
            "state": event.state.value,
            "payload": event.payload,
            "created_at": event.created_at.isoformat(),
        }

    def _serialize_risk_reject(self, reject: RiskReject) -> dict[str, Any]:
        return {
            "reject_id": reject.reject_id,
            "order_id": reject.order_id,
            "code": reject.code.value,
            "message": reject.message,
            "details": reject.details,
            "created_at": reject.created_at.isoformat(),
        }

    def _serialize_policy(self, policy: RiskPolicy) -> dict[str, Any]:
        return {
            "allowed_symbols": sorted(policy.allowed_symbols),
            "max_notional_per_order": str(policy.max_notional_per_order),
            "max_daily_loss": str(policy.max_daily_loss),
            "max_account_exposure": str(policy.max_account_exposure),
            "leverage_cap": policy.leverage_cap,
            "min_margin_balance": str(policy.min_margin_balance),
            "max_consecutive_losses": policy.max_consecutive_losses,
            "max_consecutive_api_errors": policy.max_consecutive_api_errors,
            "global_kill_switch": policy.global_kill_switch,
            "symbol_kill_switches": sorted(policy.symbol_kill_switches),
        }

    def _serialize_dataclass(self, item: Any) -> dict[str, Any]:
        raw = asdict(item)
        serialized: dict[str, Any] = {}
        for key, value in raw.items():
            if isinstance(value, Decimal):
                serialized[key] = str(value)
            else:
                serialized[key] = value.value if hasattr(value, "value") else value
        return serialized


def create_app(db_path: str = ":memory:") -> ArenaApp:
    repository = SQLiteRepository(db_path)
    return ArenaApp(repository=repository, service=OrderService(repository=repository, risk_engine=RiskEngine()), db_path=db_path)


class ArenaRequestHandler(BaseHTTPRequestHandler):
    server_version = "OpenAlphaArena/0.1"

    @property
    def arena_app(self) -> ArenaApp:
        return self.server.arena_app  # type: ignore[attr-defined]

    def do_GET(self) -> None:
        self._dispatch("GET")

    def do_POST(self) -> None:
        self._dispatch("POST")

    def log_message(self, format: str, *args: Any) -> None:
        LOGGER.info("%s - %s", self.address_string(), format % args)

    def _dispatch(self, method: str) -> None:
        content_length = int(self.headers.get("Content-Length", "0"))
        body = self.rfile.read(content_length) if content_length else b""
        response = self.arena_app.handle(
            method=method,
            path=self.path,
            headers={key: value for key, value in self.headers.items()},
            body=body,
        )
        self.send_response(int(response["status"]))
        for key, value in response["headers"].items():
            self.send_header(key, value)
        self.send_header("Content-Length", str(len(response["body"])))
        self.end_headers()
        self.wfile.write(response["body"])


def run_server(app: ArenaApp, host: str = "127.0.0.1", port: int = 8000) -> None:
    server = ThreadingHTTPServer((host, port), ArenaRequestHandler)
    server.arena_app = app  # type: ignore[attr-defined]
    LOGGER.info("serving on http://%s:%s", host, port)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        LOGGER.info("shutting down")
    finally:
        server.server_close()
        app.close()


def parse_args(argv: list[str] | None = None) -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Run the Open Alpha Arena local control surface.")
    parser.add_argument("--host", default="127.0.0.1")
    parser.add_argument("--port", type=int, default=8000)
    parser.add_argument("--db-path", default=":memory:")
    return parser.parse_args(argv)


def main(argv: list[str] | None = None) -> int:
    args = parse_args(argv)
    configure_logging()
    app = create_app(db_path=args.db_path)
    run_server(app, host=args.host, port=args.port)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
