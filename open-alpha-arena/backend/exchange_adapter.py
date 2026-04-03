from __future__ import annotations

from dataclasses import dataclass
from decimal import Decimal
from typing import Any, Protocol

from backend.models import MarketConstraints, OrderRequest


@dataclass(frozen=True)
class HealthCheckResult:
    ok: bool
    message: str
    details: dict[str, Any]


class ExchangeAdapter(Protocol):
    name: str

    def fetch_balance(self, account_id: str) -> dict[str, Any]: ...
    def fetch_positions(self, account_id: str) -> list[dict[str, Any]]: ...
    def fetch_open_orders(self, account_id: str, symbol: str | None = None) -> list[dict[str, Any]]: ...
    def fetch_order(self, account_id: str, order_id: str, symbol: str | None = None) -> dict[str, Any]: ...
    def create_order(self, account_id: str, order: OrderRequest) -> dict[str, Any]: ...
    def cancel_order(self, account_id: str, order_id: str, symbol: str | None = None) -> dict[str, Any]: ...
    def cancel_all_orders(self, account_id: str, symbol: str | None = None) -> list[dict[str, Any]]: ...
    def fetch_ticker(self, symbol: str) -> dict[str, Any]: ...
    def fetch_orderbook(self, symbol: str, limit: int = 20) -> dict[str, Any]: ...
    def fetch_ohlcv(self, symbol: str, timeframe: str, limit: int = 100) -> list[list[Any]]: ...
    def set_leverage(self, account_id: str, symbol: str, leverage: int) -> dict[str, Any]: ...
    def fetch_market_info(self, symbol: str) -> MarketConstraints: ...
    def normalize_symbol(self, symbol: str) -> str: ...
    def health_check(self) -> HealthCheckResult: ...


class CCXTAdapterBase:
    name = "base"
    exchange_id = ""

    def __init__(self, api_key: str | None = None, api_secret: str | None = None, sandbox: bool = False):
        self._sandbox = sandbox
        self._exchange = self._create_exchange(api_key=api_key, api_secret=api_secret, sandbox=sandbox)

    def _create_exchange(self, api_key: str | None, api_secret: str | None, sandbox: bool):
        try:
            import ccxt  # type: ignore
        except Exception as exc:
            raise RuntimeError("ccxt is required to use exchange adapters") from exc
        exchange_cls = getattr(ccxt, self.exchange_id)
        exchange = exchange_cls(
            {
                "apiKey": api_key,
                "secret": api_secret,
                "enableRateLimit": True,
            }
        )
        if sandbox and hasattr(exchange, "set_sandbox_mode"):
            exchange.set_sandbox_mode(True)
        return exchange

    def normalize_symbol(self, symbol: str) -> str:
        normalized = symbol.upper().replace("USDT", "/USDT").replace("USD", "/USD")
        return normalized if "/" in normalized else f"{normalized}/USDT"

    def fetch_balance(self, account_id: str) -> dict[str, Any]:
        return self._exchange.fetch_balance()

    def fetch_positions(self, account_id: str) -> list[dict[str, Any]]:
        fetcher = getattr(self._exchange, "fetch_positions", None)
        return fetcher() if fetcher else []

    def fetch_open_orders(self, account_id: str, symbol: str | None = None) -> list[dict[str, Any]]:
        return self._exchange.fetch_open_orders(self.normalize_symbol(symbol) if symbol else None)

    def fetch_order(self, account_id: str, order_id: str, symbol: str | None = None) -> dict[str, Any]:
        return self._exchange.fetch_order(order_id, self.normalize_symbol(symbol) if symbol else None)

    def create_order(self, account_id: str, order: OrderRequest) -> dict[str, Any]:
        params = {"clientOrderId": order.client_order_id}
        if order.reduce_only:
            params["reduceOnly"] = True
        return self._exchange.create_order(
            symbol=self.normalize_symbol(order.symbol),
            type=order.order_type.value.lower(),
            side=order.side.value.lower(),
            amount=float(order.quantity),
            price=float(order.price) if order.price is not None else None,
            params=params,
        )

    def cancel_order(self, account_id: str, order_id: str, symbol: str | None = None) -> dict[str, Any]:
        return self._exchange.cancel_order(order_id, self.normalize_symbol(symbol) if symbol else None)

    def cancel_all_orders(self, account_id: str, symbol: str | None = None) -> list[dict[str, Any]]:
        cancel_all = getattr(self._exchange, "cancel_all_orders", None)
        if not cancel_all:
            return []
        return cancel_all(self.normalize_symbol(symbol) if symbol else None)

    def fetch_ticker(self, symbol: str) -> dict[str, Any]:
        return self._exchange.fetch_ticker(self.normalize_symbol(symbol))

    def fetch_orderbook(self, symbol: str, limit: int = 20) -> dict[str, Any]:
        return self._exchange.fetch_order_book(self.normalize_symbol(symbol), limit=limit)

    def fetch_ohlcv(self, symbol: str, timeframe: str, limit: int = 100) -> list[list[Any]]:
        return self._exchange.fetch_ohlcv(self.normalize_symbol(symbol), timeframe=timeframe, limit=limit)

    def set_leverage(self, account_id: str, symbol: str, leverage: int) -> dict[str, Any]:
        setter = getattr(self._exchange, "set_leverage", None)
        if not setter:
            raise RuntimeError(f"{self.name} adapter does not support set_leverage")
        return setter(leverage, self.normalize_symbol(symbol))

    def fetch_market_info(self, symbol: str) -> MarketConstraints:
        markets = self._exchange.load_markets()
        market = markets[self.normalize_symbol(symbol)]
        limits = market.get("limits", {})
        precision = market.get("precision", {})
        amount = limits.get("amount", {})
        cost = limits.get("cost", {})
        leverage = limits.get("leverage", {})
        step_size = Decimal(str(precision.get("amount") and (Decimal("1") / (Decimal("10") ** precision["amount"])) or "1"))
        tick_size = Decimal(str(precision.get("price") and (Decimal("1") / (Decimal("10") ** precision["price"])) or "1"))
        return MarketConstraints(
            symbol=self.normalize_symbol(symbol),
            min_qty=Decimal(str(amount.get("min", "0"))),
            step_size=step_size,
            tick_size=tick_size,
            min_notional=Decimal(str(cost.get("min", "0"))),
            max_leverage=int(leverage.get("max", 1) or 1),
            reduce_only_required=False,
        )

    def health_check(self) -> HealthCheckResult:
        try:
            status = getattr(self._exchange, "fetch_status", None)
            result = status() if status else {"status": "ok"}
            return HealthCheckResult(ok=True, message="exchange reachable", details=result)
        except Exception as exc:
            return HealthCheckResult(ok=False, message=str(exc), details={})


class BinanceAdapter(CCXTAdapterBase):
    name = "binance"
    exchange_id = "binance"


class BybitAdapter(CCXTAdapterBase):
    name = "bybit"
    exchange_id = "bybit"
