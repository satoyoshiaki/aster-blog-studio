from __future__ import annotations

from dataclasses import dataclass, field
from datetime import datetime, timezone
from decimal import Decimal, ROUND_DOWN
from enum import Enum
from typing import Any, Mapping
from uuid import uuid4


def utc_now() -> datetime:
    return datetime.now(timezone.utc)


class ExecutionMode(str, Enum):
    BACKTEST = "backtest"
    PAPER = "paper"
    SANDBOX = "sandbox"
    LIVE = "live"


class AIAction(str, Enum):
    BUY = "BUY"
    SELL = "SELL"
    CLOSE = "CLOSE"
    HOLD = "HOLD"


class OrderSide(str, Enum):
    BUY = "BUY"
    SELL = "SELL"


class OrderType(str, Enum):
    MARKET = "MARKET"
    LIMIT = "LIMIT"


class OrderState(str, Enum):
    CREATED = "CREATED"
    VALIDATED = "VALIDATED"
    REJECTED = "REJECTED"
    SUBMITTING = "SUBMITTING"
    SUBMITTED = "SUBMITTED"
    PARTIALLY_FILLED = "PARTIALLY_FILLED"
    FILLED = "FILLED"
    CANCEL_PENDING = "CANCEL_PENDING"
    CANCELLED = "CANCELLED"
    FAILED = "FAILED"
    EXPIRED = "EXPIRED"
    RECONCILING = "RECONCILING"


class RejectCode(str, Enum):
    LIVE_MODE_GUARD = "live_mode_guard"
    GLOBAL_KILL_SWITCH = "global_kill_switch"
    SYMBOL_KILL_SWITCH = "symbol_kill_switch"
    SYMBOL_NOT_ALLOWED = "symbol_not_allowed"
    MAX_NOTIONAL_EXCEEDED = "max_notional_exceeded"
    MAX_DAILY_LOSS_EXCEEDED = "max_daily_loss_exceeded"
    MAX_EXPOSURE_EXCEEDED = "max_exposure_exceeded"
    LEVERAGE_CAP_EXCEEDED = "leverage_cap_exceeded"
    MIN_MARGIN_BALANCE_BREACH = "min_margin_balance_breach"
    CONSECUTIVE_LOSS_STOP = "consecutive_loss_stop"
    CONSECUTIVE_API_ERROR_STOP = "consecutive_api_error_stop"
    MARKET_CONSTRAINT_VIOLATION = "market_constraint_violation"
    REDUCE_ONLY_REQUIRED = "reduce_only_required"


@dataclass(frozen=True)
class MarketConstraints:
    symbol: str
    min_qty: Decimal
    step_size: Decimal
    tick_size: Decimal
    min_notional: Decimal
    max_leverage: int
    reduce_only_required: bool = False


@dataclass(frozen=True)
class ValidatedAIDecision:
    action: AIAction
    confidence: Decimal
    rationale: str
    desired_risk_pct: Decimal
    stop_loss_pct: Decimal
    take_profit_pct: Decimal


@dataclass
class OrderRequest:
    account_id: str
    strategy_id: str
    symbol: str
    side: OrderSide
    order_type: OrderType
    quantity: Decimal
    price: Decimal | None
    leverage: int
    reduce_only: bool
    execution_mode: ExecutionMode = ExecutionMode.PAPER
    client_order_id: str = field(default_factory=lambda: f"coa-{uuid4().hex[:24]}")
    idempotency_key: str = field(default_factory=lambda: uuid4().hex)
    created_at: datetime = field(default_factory=utc_now)

    def notional(self, fallback_price: Decimal | None = None) -> Decimal:
        chosen_price = self.price if self.price is not None else fallback_price
        if chosen_price is None:
            raise ValueError("price is required to calculate notional")
        return (self.quantity * chosen_price).quantize(Decimal("0.00000001"))


@dataclass
class OrderRecord:
    order_id: str
    account_id: str
    strategy_id: str
    symbol: str
    side: OrderSide
    order_type: OrderType
    quantity: Decimal
    price: Decimal | None
    leverage: int
    reduce_only: bool
    execution_mode: ExecutionMode
    client_order_id: str
    idempotency_key: str
    state: OrderState = OrderState.CREATED
    external_order_id: str | None = None
    filled_quantity: Decimal = Decimal("0")
    average_fill_price: Decimal | None = None
    failure_reason: str | None = None
    created_at: datetime = field(default_factory=utc_now)
    updated_at: datetime = field(default_factory=utc_now)


@dataclass(frozen=True)
class FillRecord:
    fill_id: str
    order_id: str
    symbol: str
    quantity: Decimal
    price: Decimal
    fee: Decimal
    liquidity: str
    filled_at: datetime


@dataclass(frozen=True)
class TradeEvent:
    event_id: str
    order_id: str
    state: OrderState
    payload: Mapping[str, Any]
    created_at: datetime


@dataclass(frozen=True)
class PositionSnapshot:
    snapshot_id: str
    account_id: str
    symbol: str
    quantity: Decimal
    average_entry_price: Decimal
    unrealized_pnl: Decimal
    exposure_notional: Decimal
    leverage: int
    created_at: datetime


@dataclass(frozen=True)
class RiskReject:
    reject_id: str
    order_id: str
    code: RejectCode
    message: str
    details: Mapping[str, Any]
    created_at: datetime


@dataclass(frozen=True)
class AuditLogEntry:
    audit_id: str
    request_id: str
    order_id: str | None
    strategy_id: str | None
    account_id: str | None
    action: str
    payload: Mapping[str, Any]
    created_at: datetime


@dataclass(frozen=True)
class RiskPolicy:
    allowed_symbols: frozenset[str]
    max_notional_per_order: Decimal
    max_daily_loss: Decimal
    max_account_exposure: Decimal
    leverage_cap: int
    min_margin_balance: Decimal
    max_consecutive_losses: int
    max_consecutive_api_errors: int
    global_kill_switch: bool = False
    symbol_kill_switches: frozenset[str] = frozenset()


@dataclass(frozen=True)
class RiskContext:
    mode: ExecutionMode
    daily_realized_pnl: Decimal
    account_exposure: Decimal
    margin_balance: Decimal
    consecutive_losses: int
    consecutive_api_errors: int
    market_constraints: MarketConstraints


def quantize_step(value: Decimal, step: Decimal) -> Decimal:
    if step <= 0:
        return value
    return (value / step).to_integral_value(rounding=ROUND_DOWN) * step
