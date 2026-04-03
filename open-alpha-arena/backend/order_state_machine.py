from __future__ import annotations

from backend.models import OrderRecord, OrderState, utc_now


class InvalidOrderTransition(ValueError):
    pass


ALLOWED_TRANSITIONS: dict[OrderState, set[OrderState]] = {
    OrderState.CREATED: {OrderState.VALIDATED, OrderState.REJECTED, OrderState.FAILED},
    OrderState.VALIDATED: {OrderState.SUBMITTING, OrderState.REJECTED, OrderState.FAILED},
    OrderState.REJECTED: set(),
    OrderState.SUBMITTING: {OrderState.SUBMITTED, OrderState.FAILED, OrderState.RECONCILING},
    OrderState.SUBMITTED: {
        OrderState.PARTIALLY_FILLED,
        OrderState.FILLED,
        OrderState.CANCEL_PENDING,
        OrderState.EXPIRED,
        OrderState.RECONCILING,
        OrderState.FAILED,
    },
    OrderState.PARTIALLY_FILLED: {
        OrderState.FILLED,
        OrderState.CANCEL_PENDING,
        OrderState.RECONCILING,
        OrderState.FAILED,
    },
    OrderState.FILLED: {OrderState.RECONCILING},
    OrderState.CANCEL_PENDING: {OrderState.CANCELLED, OrderState.FAILED, OrderState.RECONCILING},
    OrderState.CANCELLED: set(),
    OrderState.FAILED: {OrderState.RECONCILING},
    OrderState.EXPIRED: {OrderState.RECONCILING},
    OrderState.RECONCILING: {
        OrderState.SUBMITTED,
        OrderState.PARTIALLY_FILLED,
        OrderState.FILLED,
        OrderState.CANCELLED,
        OrderState.FAILED,
        OrderState.EXPIRED,
    },
}


def transition_order(order: OrderRecord, new_state: OrderState, failure_reason: str | None = None) -> OrderRecord:
    allowed = ALLOWED_TRANSITIONS[order.state]
    if new_state not in allowed:
        raise InvalidOrderTransition(f"{order.state.value} -> {new_state.value} is not allowed")
    order.state = new_state
    order.failure_reason = failure_reason
    order.updated_at = utc_now()
    return order
