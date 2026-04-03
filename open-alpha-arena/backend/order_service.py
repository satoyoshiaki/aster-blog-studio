from __future__ import annotations

from uuid import uuid4

from backend.exchange_adapter import ExchangeAdapter
from backend.models import (
    AuditLogEntry,
    ExecutionMode,
    OrderRecord,
    OrderRequest,
    OrderState,
    RiskContext,
    RiskPolicy,
    RiskReject,
    TradeEvent,
    utc_now,
)
from backend.order_state_machine import transition_order
from backend.persistence import SQLiteRepository
from backend.risk_engine import RiskEngine


class OrderService:
    def __init__(self, repository: SQLiteRepository, risk_engine: RiskEngine):
        self.repository = repository
        self.risk_engine = risk_engine

    def submit_order(
        self,
        adapter: ExchangeAdapter,
        order_request: OrderRequest,
        policy: RiskPolicy,
        context: RiskContext,
        env: dict[str, str],
        request_id: str,
        ui_confirmation_token: str | None = None,
        expected_confirmation_token: str | None = None,
    ) -> OrderRecord:
        order = OrderRecord(
            order_id=uuid4().hex,
            account_id=order_request.account_id,
            strategy_id=order_request.strategy_id,
            symbol=order_request.symbol,
            side=order_request.side,
            order_type=order_request.order_type,
            quantity=order_request.quantity,
            price=order_request.price,
            leverage=order_request.leverage,
            reduce_only=order_request.reduce_only,
            execution_mode=order_request.execution_mode,
            client_order_id=order_request.client_order_id,
            idempotency_key=order_request.idempotency_key,
        )
        self.repository.save_order(order)

        decision = self.risk_engine.evaluate(
            order=order_request,
            policy=policy,
            context=context,
            env=env,
            ui_confirmation_token=ui_confirmation_token,
            expected_confirmation_token=expected_confirmation_token,
        )

        if not decision.allowed:
            for violation in decision.violations:
                self.repository.save_risk_reject(
                    RiskReject(
                        reject_id=uuid4().hex,
                        order_id=order.order_id,
                        code=violation.code,
                        message=violation.message,
                        details=violation.details,
                        created_at=utc_now(),
                    )
                )
            transition_order(order, OrderState.REJECTED, decision.violations[0].message)
            self.repository.save_order(order)
            self.repository.save_trade_event(
                TradeEvent(
                    event_id=uuid4().hex,
                    order_id=order.order_id,
                    state=order.state,
                    payload={"violations": [v.code.value for v in decision.violations]},
                    created_at=utc_now(),
                )
            )
            self.repository.save_audit_log(
                AuditLogEntry(
                    audit_id=uuid4().hex,
                    request_id=request_id,
                    order_id=order.order_id,
                    strategy_id=order.strategy_id,
                    account_id=order.account_id,
                    action="risk_rejected",
                    payload={"mode": decision.execution_mode.value},
                    created_at=utc_now(),
                )
            )
            return order

        order.execution_mode = decision.execution_mode
        transition_order(order, OrderState.VALIDATED)
        self.repository.save_order(order)

        if order.execution_mode is ExecutionMode.PAPER:
            transition_order(order, OrderState.SUBMITTING)
            self.repository.save_order(order)
            transition_order(order, OrderState.SUBMITTED)
            order.external_order_id = f"paper-{order.order_id}"
            self.repository.save_order(order)
        else:
            transition_order(order, OrderState.SUBMITTING)
            self.repository.save_order(order)
            if order.leverage > 1:
                adapter.set_leverage(order.account_id, order.symbol, order.leverage)
            exchange_result = adapter.create_order(order.account_id, order_request)
            transition_order(order, OrderState.SUBMITTED)
            order.external_order_id = str(exchange_result.get("id") or exchange_result.get("orderId") or "")
            self.repository.save_order(order)

        self.repository.save_trade_event(
            TradeEvent(
                event_id=uuid4().hex,
                order_id=order.order_id,
                state=order.state,
                payload={"external_order_id": order.external_order_id},
                created_at=utc_now(),
            )
        )
        self.repository.save_audit_log(
            AuditLogEntry(
                audit_id=uuid4().hex,
                request_id=request_id,
                order_id=order.order_id,
                strategy_id=order.strategy_id,
                account_id=order.account_id,
                action="order_submitted",
                payload={"mode": order.execution_mode.value},
                created_at=utc_now(),
            )
        )
        return order

    def cancel_order(
        self,
        adapter: ExchangeAdapter,
        order_id: str,
        request_id: str,
    ) -> OrderRecord:
        order = self.repository.get_order(order_id)
        if order is None:
            raise KeyError(order_id)

        transition_order(order, OrderState.CANCEL_PENDING)
        self.repository.save_order(order)

        if order.execution_mode is not ExecutionMode.PAPER and order.external_order_id:
            adapter.cancel_order(order.account_id, order.external_order_id, symbol=order.symbol)

        self.repository.save_trade_event(
            TradeEvent(
                event_id=uuid4().hex,
                order_id=order.order_id,
                state=order.state,
                payload={"external_order_id": order.external_order_id},
                created_at=utc_now(),
            )
        )
        self.repository.save_audit_log(
            AuditLogEntry(
                audit_id=uuid4().hex,
                request_id=request_id,
                order_id=order.order_id,
                strategy_id=order.strategy_id,
                account_id=order.account_id,
                action="order_cancel_requested",
                payload={"mode": order.execution_mode.value},
                created_at=utc_now(),
            )
        )
        return order
