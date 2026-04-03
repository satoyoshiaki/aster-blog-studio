from __future__ import annotations

import json
from decimal import Decimal
from typing import Any, Mapping

from backend.models import AIAction, ValidatedAIDecision


class AIValidationError(ValueError):
    pass


def _to_decimal(value: Any, field_name: str) -> Decimal:
    try:
        return Decimal(str(value))
    except Exception as exc:
        raise AIValidationError(f"{field_name} must be numeric") from exc


def validate_ai_decision(payload: str | Mapping[str, Any]) -> ValidatedAIDecision:
    if isinstance(payload, str):
        try:
            raw = json.loads(payload)
        except json.JSONDecodeError as exc:
            raise AIValidationError("AI output must be valid JSON") from exc
    else:
        raw = dict(payload)

    required = {
        "action",
        "confidence",
        "rationale",
        "desired_risk_pct",
        "stop_loss_pct",
        "take_profit_pct",
    }
    missing = required.difference(raw)
    extra = set(raw).difference(required)
    if missing:
        raise AIValidationError(f"Missing fields: {', '.join(sorted(missing))}")
    if extra:
        raise AIValidationError(f"Unexpected fields: {', '.join(sorted(extra))}")

    try:
        action = AIAction(str(raw["action"]).upper())
    except Exception as exc:
        raise AIValidationError("action must be BUY, SELL, CLOSE, or HOLD") from exc

    confidence = _to_decimal(raw["confidence"], "confidence")
    if confidence < Decimal("0") or confidence > Decimal("1"):
        raise AIValidationError("confidence must be between 0 and 1")

    rationale = str(raw["rationale"]).strip()
    if not rationale:
        raise AIValidationError("rationale must be non-empty")
    if len(rationale) > 200:
        raise AIValidationError("rationale must be 200 chars or fewer")

    desired_risk_pct = _to_decimal(raw["desired_risk_pct"], "desired_risk_pct")
    stop_loss_pct = _to_decimal(raw["stop_loss_pct"], "stop_loss_pct")
    take_profit_pct = _to_decimal(raw["take_profit_pct"], "take_profit_pct")

    for field_name, value in {
        "desired_risk_pct": desired_risk_pct,
        "stop_loss_pct": stop_loss_pct,
        "take_profit_pct": take_profit_pct,
    }.items():
        if value < Decimal("0"):
            raise AIValidationError(f"{field_name} must be non-negative")

    return ValidatedAIDecision(
        action=action,
        confidence=confidence,
        rationale=rationale,
        desired_risk_pct=desired_risk_pct,
        stop_loss_pct=stop_loss_pct,
        take_profit_pct=take_profit_pct,
    )
