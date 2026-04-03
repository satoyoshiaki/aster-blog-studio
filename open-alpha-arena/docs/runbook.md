# Operations Runbook

## Sandbox Startup

1. Keep `TRADING_MODE` unset or explicitly set to `paper` until sandbox credentials are verified.
2. Run exchange adapter `health_check()` and confirm market metadata loads.
3. Set sandbox credentials in environment variables only.
4. Start with:
   - `ENABLE_LIVE_TRADING=false`
   - `ENVIRONMENT=development`
   - `EXCHANGE_SANITY_CHECK_PASSED=false`
5. Submit a paper order and verify:
   - order row
   - trade event row
   - audit log row
   - no live adapter call in paper mode

## Live Enablement Checklist

1. Deploy to production only.
2. Verify reconciliation worker is clean for at least one full session in sandbox.
3. Set:
   - `ENABLE_LIVE_TRADING=true`
   - `ENVIRONMENT=production`
   - `EXCHANGE_SANITY_CHECK_PASSED=true`
4. Generate and verify a short-lived UI confirmation token.
5. Enable per-symbol whitelist only for one symbol and one account.
6. Confirm kill switch path works before first live order.
7. Start with minimum notional and observe reconciliation before scaling.

## Rollback Procedure

1. Activate the global kill switch.
2. Cancel all open live orders through the adapter.
3. Force execution mode back to `paper`.
4. Run reconciliation and compare positions, balances, and fills.
5. Preserve `audit_log`, `trade_events`, and `risk_rejects` for incident review.

## Emergency Kill Switch

1. Set global kill switch immediately.
2. If venue-specific, also set per-symbol kill switch for affected instruments.
3. Block new submissions at the risk engine.
4. Reconcile exchange state before attempting any restart.
