from __future__ import annotations

from dataclasses import dataclass
from decimal import Decimal

from backend.live_mode import guard_execution_mode
from backend.models import (
    ExecutionMode,
    OrderRequest,
    RejectCode,
    RiskContext,
    RiskPolicy,
    quantize_step,
)


@dataclass(frozen=True)
class RiskViolation:
    code: RejectCode
    message: str
    details: dict[str, object]


@dataclass(frozen=True)
class RiskDecision:
    allowed: bool
    execution_mode: ExecutionMode
    violations: tuple[RiskViolation, ...]


class RiskEngine:
    def evaluate(
        self,
        order: OrderRequest,
        policy: RiskPolicy,
        context: RiskContext,
        env: dict[str, str],
        ui_confirmation_token: str | None,
        expected_confirmation_token: str | None,
    ) -> RiskDecision:
        violations: list[RiskViolation] = []

        mode_decision = guard_execution_mode(
            requested_mode=order.execution_mode,
            env=env,
            ui_confirmation_token=ui_confirmation_token,
            expected_confirmation_token=expected_confirmation_token,
        )
        final_mode = mode_decision.activated_mode
        if not mode_decision.allowed:
            violations.append(
                RiskViolation(
                    code=RejectCode.LIVE_MODE_GUARD,
                    message=mode_decision.reason or "live mode denied",
                    details={"requested_mode": order.execution_mode.value},
                )
            )

        if policy.global_kill_switch:
            violations.append(
                RiskViolation(
                    code=RejectCode.GLOBAL_KILL_SWITCH,
                    message="global kill switch is active",
                    details={},
                )
            )
        if order.symbol in policy.symbol_kill_switches:
            violations.append(
                RiskViolation(
                    code=RejectCode.SYMBOL_KILL_SWITCH,
                    message=f"symbol kill switch is active for {order.symbol}",
                    details={"symbol": order.symbol},
                )
            )
        if order.symbol not in policy.allowed_symbols:
            violations.append(
                RiskViolation(
                    code=RejectCode.SYMBOL_NOT_ALLOWED,
                    message=f"{order.symbol} is not in the symbol whitelist",
                    details={"symbol": order.symbol},
                )
            )

        constraints = context.market_constraints
        effective_price = order.price or Decimal("0")
        notional = order.quantity * effective_price
        if effective_price > 0 and notional < constraints.min_notional:
            violations.append(
                RiskViolation(
                    code=RejectCode.MARKET_CONSTRAINT_VIOLATION,
                    message="order notional is below exchange minimum",
                    details={
                        "notional": str(notional),
                        "min_notional": str(constraints.min_notional),
                    },
                )
            )

        if order.quantity < constraints.min_qty:
            violations.append(
                RiskViolation(
                    code=RejectCode.MARKET_CONSTRAINT_VIOLATION,
                    message="quantity is below minimum lot size",
                    details={"quantity": str(order.quantity), "min_qty": str(constraints.min_qty)},
                )
            )

        if quantize_step(order.quantity, constraints.step_size) != order.quantity:
            violations.append(
                RiskViolation(
                    code=RejectCode.MARKET_CONSTRAINT_VIOLATION,
                    message="quantity does not match step size",
                    details={"quantity": str(order.quantity), "step_size": str(constraints.step_size)},
                )
            )

        if order.price is not None and quantize_step(order.price, constraints.tick_size) != order.price:
            violations.append(
                RiskViolation(
                    code=RejectCode.MARKET_CONSTRAINT_VIOLATION,
                    message="price does not match tick size",
                    details={"price": str(order.price), "tick_size": str(constraints.tick_size)},
                )
            )

        if notional > policy.max_notional_per_order:
            violations.append(
                RiskViolation(
                    code=RejectCode.MAX_NOTIONAL_EXCEEDED,
                    message="order exceeds max notional per order",
                    details={"notional": str(notional), "limit": str(policy.max_notional_per_order)},
                )
            )
        if context.daily_realized_pnl <= (Decimal("0") - policy.max_daily_loss):
            violations.append(
                RiskViolation(
                    code=RejectCode.MAX_DAILY_LOSS_EXCEEDED,
                    message="account exceeded max daily loss",
                    details={"daily_realized_pnl": str(context.daily_realized_pnl)},
                )
            )
        if context.account_exposure + notional > policy.max_account_exposure:
            violations.append(
                RiskViolation(
                    code=RejectCode.MAX_EXPOSURE_EXCEEDED,
                    message="account exposure would exceed cap",
                    details={
                        "current_exposure": str(context.account_exposure),
                        "proposed_notional": str(notional),
                        "limit": str(policy.max_account_exposure),
                    },
                )
            )
        if order.leverage > min(policy.leverage_cap, constraints.max_leverage):
            violations.append(
                RiskViolation(
                    code=RejectCode.LEVERAGE_CAP_EXCEEDED,
                    message="leverage exceeds risk or venue cap",
                    details={
                        "requested": order.leverage,
                        "policy_cap": policy.leverage_cap,
                        "venue_cap": constraints.max_leverage,
                    },
                )
            )
        if context.margin_balance < policy.min_margin_balance:
            violations.append(
                RiskViolation(
                    code=RejectCode.MIN_MARGIN_BALANCE_BREACH,
                    message="margin balance below minimum threshold",
                    details={"margin_balance": str(context.margin_balance)},
                )
            )
        if context.consecutive_losses >= policy.max_consecutive_losses:
            violations.append(
                RiskViolation(
                    code=RejectCode.CONSECUTIVE_LOSS_STOP,
                    message="consecutive loss stop is active",
                    details={"consecutive_losses": context.consecutive_losses},
                )
            )
        if context.consecutive_api_errors >= policy.max_consecutive_api_errors:
            violations.append(
                RiskViolation(
                    code=RejectCode.CONSECUTIVE_API_ERROR_STOP,
                    message="consecutive API error stop is active",
                    details={"consecutive_api_errors": context.consecutive_api_errors},
                )
            )
        if constraints.reduce_only_required and not order.reduce_only:
            violations.append(
                RiskViolation(
                    code=RejectCode.REDUCE_ONLY_REQUIRED,
                    message="exchange requires reduceOnly for this order",
                    details={"symbol": order.symbol},
                )
            )

        return RiskDecision(
            allowed=not violations,
            execution_mode=final_mode,
            violations=tuple(violations),
        )
