from backend.live_mode import guard_execution_mode
from backend.models import ExecutionMode


def test_live_mode_guard_falls_back_to_paper_without_all_conditions():
    result = guard_execution_mode(
        requested_mode=ExecutionMode.LIVE,
        env={},
        ui_confirmation_token=None,
        expected_confirmation_token="confirm-me",
    )
    assert result.allowed is False
    assert result.activated_mode is ExecutionMode.PAPER


def test_live_mode_guard_accepts_when_all_conditions_match():
    result = guard_execution_mode(
        requested_mode=ExecutionMode.LIVE,
        env={
            "ENABLE_LIVE_TRADING": "true",
            "ENVIRONMENT": "production",
            "EXCHANGE_SANITY_CHECK_PASSED": "true",
        },
        ui_confirmation_token="confirm-me",
        expected_confirmation_token="confirm-me",
    )
    assert result.allowed is True
    assert result.activated_mode is ExecutionMode.LIVE
