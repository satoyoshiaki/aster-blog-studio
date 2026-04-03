from decimal import Decimal

from backend.models import ExecutionMode, MarketConstraints, OrderRequest, OrderSide, OrderType, RiskContext, RiskPolicy
from backend.risk_engine import RiskEngine


def build_policy() -> RiskPolicy:
    return RiskPolicy(
        allowed_symbols=frozenset({"BTCUSDT"}),
        max_notional_per_order=Decimal("1000"),
        max_daily_loss=Decimal("100"),
        max_account_exposure=Decimal("5000"),
        leverage_cap=3,
        min_margin_balance=Decimal("50"),
        max_consecutive_losses=2,
        max_consecutive_api_errors=3,
    )


def build_context() -> RiskContext:
    return RiskContext(
        mode=ExecutionMode.PAPER,
        daily_realized_pnl=Decimal("0"),
        account_exposure=Decimal("0"),
        margin_balance=Decimal("100"),
        consecutive_losses=0,
        consecutive_api_errors=0,
        market_constraints=MarketConstraints(
            symbol="BTCUSDT",
            min_qty=Decimal("0.001"),
            step_size=Decimal("0.001"),
            tick_size=Decimal("0.10"),
            min_notional=Decimal("5"),
            max_leverage=5,
        ),
    )


def build_order(**kwargs) -> OrderRequest:
    params = {
        "account_id": "acct",
        "strategy_id": "strat",
        "symbol": "BTCUSDT",
        "side": OrderSide.BUY,
        "order_type": OrderType.LIMIT,
        "quantity": Decimal("0.100"),
        "price": Decimal("100.00"),
        "leverage": 2,
        "reduce_only": False,
        "execution_mode": ExecutionMode.PAPER,
    }
    params.update(kwargs)
    return OrderRequest(**params)


def test_risk_engine_rejects_symbol_not_allowed():
    decision = RiskEngine().evaluate(
        order=build_order(symbol="DOGEUSDT"),
        policy=build_policy(),
        context=build_context(),
        env={},
        ui_confirmation_token=None,
        expected_confirmation_token=None,
    )
    assert decision.allowed is False
    assert any(v.code.value == "symbol_not_allowed" for v in decision.violations)


def test_risk_engine_rejects_notional_limit():
    decision = RiskEngine().evaluate(
        order=build_order(quantity=Decimal("20.000"), price=Decimal("100.00")),
        policy=build_policy(),
        context=build_context(),
        env={},
        ui_confirmation_token=None,
        expected_confirmation_token=None,
    )
    assert any(v.code.value == "max_notional_exceeded" for v in decision.violations)


def test_risk_engine_rejects_consecutive_error_stop():
    context = build_context()
    context = RiskContext(
        mode=context.mode,
        daily_realized_pnl=context.daily_realized_pnl,
        account_exposure=context.account_exposure,
        margin_balance=context.margin_balance,
        consecutive_losses=context.consecutive_losses,
        consecutive_api_errors=3,
        market_constraints=context.market_constraints,
    )
    decision = RiskEngine().evaluate(
        order=build_order(),
        policy=build_policy(),
        context=context,
        env={},
        ui_confirmation_token=None,
        expected_confirmation_token=None,
    )
    assert any(v.code.value == "consecutive_api_error_stop" for v in decision.violations)
