# Implementation Roadmap

## PR1

- Purpose:
  - Add execution mode guardrails, exchange adapters, strict AI schema validation, risk engine skeleton, order state foundation, structured logging, Decimal/UTC invariants, and unit tests.
- Changed files:
  - `backend/models.py`
  - `backend/ai_validation.py`
  - `backend/live_mode.py`
  - `backend/order_state_machine.py`
  - `backend/risk_engine.py`
  - `backend/exchange_adapter.py`
  - `backend/persistence.py`
  - `backend/order_service.py`
  - `backend/logging_utils.py`
  - `backend/main.py`
  - `tests/*`
  - `migrations/20260402_pr1_foundation.sql`
- Risks:
  - partial local reconstruction due sandbox limits
  - upstream framework wiring still needs integration PRs
- Test items:
  - live guard
  - AI schema validation
  - risk rejects
  - order transitions
  - adapter contract
- Rollback:
  - remove new modules and migration; no live trading activation path is introduced by default

## PR2

- Purpose:
  - Integrate PR1 foundation into existing FastAPI routes and WebSocket paths while preserving current paper UX.
- Changed files:
  - `backend/main.py`
  - `backend/api/order_routes.py`
  - `backend/api/ws.py`
  - `backend/api/account_routes.py`
  - `frontend/app/components/trading/*`
  - `frontend/app/components/layout/*`
- Risks:
  - UI compatibility regressions
  - snapshot payload changes
- Test items:
  - manual paper order placement
  - WebSocket snapshot updates
  - mode labels and safeguards in UI
- Rollback:
  - route-level feature flag to fall back to legacy paper executor

## PR3

- Purpose:
  - Add reconciliation worker, exchange-sync jobs, fill ingestion, and portfolio correctness checks.
- Changed files:
  - new reconciliation service
  - adapter sync endpoints
  - portfolio calculation paths
- Risks:
  - venue-specific data mismatches
- Test items:
  - partial fills
  - missing webhook/poll fallback
  - duplicate event idempotency
- Rollback:
  - disable reconciliation worker and preserve paper-only execution

## PR4

- Purpose:
  - Add sandbox rollout path, live enablement workflow, ops dashboard, notifications, and kill switch controls.
- Changed files:
  - ops APIs
  - admin UI
  - notification integrations
- Risks:
  - operational misuse
- Test items:
  - sandbox drill
  - live confirmation expiry
  - kill switch emergency path
- Rollback:
  - revert ops enablement endpoints and force execution mode to paper
