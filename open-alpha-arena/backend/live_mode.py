from __future__ import annotations

from dataclasses import dataclass
from typing import Mapping

from backend.models import ExecutionMode


@dataclass(frozen=True)
class LiveModeDecision:
    activated_mode: ExecutionMode
    allowed: bool
    reason: str | None = None


def _is_truthy(value: str | None) -> bool:
    return str(value).strip().lower() in {"1", "true", "yes", "on"}


def guard_execution_mode(
    requested_mode: ExecutionMode,
    env: Mapping[str, str],
    ui_confirmation_token: str | None,
    expected_confirmation_token: str | None,
) -> LiveModeDecision:
    if requested_mode is not ExecutionMode.LIVE:
        return LiveModeDecision(activated_mode=requested_mode, allowed=True)

    checks = {
        "ENABLE_LIVE_TRADING=true": _is_truthy(env.get("ENABLE_LIVE_TRADING")),
        "ENVIRONMENT=production": env.get("ENVIRONMENT") == "production",
        "EXCHANGE_SANITY_CHECK_PASSED=true": _is_truthy(env.get("EXCHANGE_SANITY_CHECK_PASSED")),
        "ui_confirmation_token": bool(
            expected_confirmation_token
            and ui_confirmation_token
            and ui_confirmation_token == expected_confirmation_token
        ),
    }
    failed = [name for name, passed in checks.items() if not passed]
    if failed:
        return LiveModeDecision(
            activated_mode=ExecutionMode.PAPER,
            allowed=False,
            reason="live mode denied: " + ", ".join(failed),
        )
    return LiveModeDecision(activated_mode=ExecutionMode.LIVE, allowed=True)
