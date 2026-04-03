from decimal import Decimal

from backend.models import ExecutionMode, OrderRecord, OrderSide, OrderState, OrderType
from backend.order_state_machine import InvalidOrderTransition, transition_order


def build_order() -> OrderRecord:
    return OrderRecord(
        order_id="o1",
        account_id="acct",
        strategy_id="strat",
        symbol="BTCUSDT",
        side=OrderSide.BUY,
        order_type=OrderType.MARKET,
        quantity=Decimal("1"),
        price=Decimal("100"),
        leverage=1,
        reduce_only=False,
        execution_mode=ExecutionMode.PAPER,
        client_order_id="cid",
        idempotency_key="idk",
    )


def test_valid_transition_chain():
    order = build_order()
    transition_order(order, OrderState.VALIDATED)
    transition_order(order, OrderState.SUBMITTING)
    transition_order(order, OrderState.SUBMITTED)
    transition_order(order, OrderState.PARTIALLY_FILLED)
    transition_order(order, OrderState.FILLED)
    assert order.state is OrderState.FILLED


def test_invalid_transition_is_rejected():
    order = build_order()
    try:
        transition_order(order, OrderState.FILLED)
        assert False, "expected invalid transition"
    except InvalidOrderTransition:
        assert True
