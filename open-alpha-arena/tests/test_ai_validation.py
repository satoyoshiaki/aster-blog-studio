from backend.ai_validation import AIValidationError, validate_ai_decision


def test_ai_validation_accepts_strict_payload():
    decision = validate_ai_decision(
        {
            "action": "buy",
            "confidence": "0.8",
            "rationale": "Breakout with controlled risk.",
            "desired_risk_pct": "0.02",
            "stop_loss_pct": "0.01",
            "take_profit_pct": "0.03",
        }
    )
    assert decision.action.value == "BUY"
    assert str(decision.confidence) == "0.8"


def test_ai_validation_rejects_extra_fields():
    try:
        validate_ai_decision(
            {
                "action": "BUY",
                "confidence": 0.5,
                "rationale": "x",
                "desired_risk_pct": 0.01,
                "stop_loss_pct": 0.01,
                "take_profit_pct": 0.02,
                "hallucinated": True,
            }
        )
        assert False, "expected validation error"
    except AIValidationError as exc:
        assert "Unexpected fields" in str(exc)


def test_ai_validation_rejects_bad_confidence():
    try:
        validate_ai_decision(
            {
                "action": "BUY",
                "confidence": 1.5,
                "rationale": "x",
                "desired_risk_pct": 0.01,
                "stop_loss_pct": 0.01,
                "take_profit_pct": 0.02,
            }
        )
        assert False, "expected validation error"
    except AIValidationError as exc:
        assert "between 0 and 1" in str(exc)
