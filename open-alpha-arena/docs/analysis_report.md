# Analysis Report

## Directory and Entrypoint Map

- Root workspace: `package.json` orchestrates `frontend` and `backend`.
- Backend entrypoint: `backend/main.py`
  - Creates tables on startup.
  - Seeds `TradingConfig`.
  - Deletes all non-default users, accounts, orders, trades, and positions on startup.
  - Creates a default user and default AI account with a placeholder API key.
  - Starts background services from `services/startup.py`.
- Frontend entrypoint: `frontend/app/main.tsx`
  - Creates a singleton WebSocket to `/ws`.
  - Bootstraps the hardcoded `default` user.
  - Sends order placement over WebSocket, not REST, for the primary trading panel.

## Current DB Schema

- `users`
- `accounts`
- `user_auth_sessions`
- `positions`
- `orders`
- `trades`
- `trading_configs`
- `system_configs`
- `crypto_prices`
- `crypto_klines`
- `ai_decision_logs`

## AI Decision Logic

- `backend/services/ai_decision_service.py`
  - Builds a long prompt with portfolio, prices, and news.
  - Calls any OpenAI-compatible endpoint directly with `requests.post(..., verify=False)`.
  - Retries 429 and request failures with exponential backoff plus `random.uniform`.
  - Accepts markdown-wrapped JSON.
  - On parse failure, mutates the text and then falls back to regex/manual field extraction.
  - Normalizes missing `leverage` to `1` and missing `direction` to `long`.
  - Returns decisions directly to trading logic.

## Paper Trading Execution Path

- Scheduler triggers `place_ai_driven_crypto_order()` every 5 minutes.
- AI decision is validated only with ad hoc checks in `trading_commands.py`.
- Quantities are derived from cash or position ratios and rounded to 6 decimals.
- Execution uses `place_and_execute_crypto()` in `order_executor_leverage.py`.
- Order rows are created in `orders`, then immediately converted to `FILLED`.
- Trade rows are inserted into `trades`.
- Positions and cash are mutated in place.
- Margin monitor in `scheduler.py` force-liquidates via internal market orders.

## Price Fetching

- `market_data.py` delegates to `hyperliquid_market_data.py`.
- `hyperliquid_market_data.py` uses raw `ccxt.hyperliquid`.
- A 30-second in-memory cache is used.
- On `get_all_symbols()` failure, it falls back to hardcoded symbols.

## Position, Order, Leverage, Margin, Fee Handling

- `positions` mixes spot and leveraged state in one table.
- `orders.status` is a simple string, mostly `PENDING`, `FILLED`, `CANCELLED`.
- Fees and interest are calculated inline in the executor with mutable cash updates.
- No exchange metadata enforcement for `minQty`, `stepSize`, `tickSize`, or `minNotional`.
- No adapter or reconciliation layer exists.

## Scheduler and Background Tasks

- `startup.py` starts:
  - scheduler
  - AI auto trading
  - price cache cleanup
  - margin monitor
- If AI scheduling fails, startup falls back automatically to random trading.
- WebSocket account snapshot jobs are also scheduled.

## Frontend to Backend Operation Paths

- Primary live UI path:
  - `TradingPanel` -> WebSocket `place_order` -> `api/ws.py` -> `services.order_matching.create_order()`
- Account management:
  - `SettingsDialog` -> REST `/api/account/*`
- Account switching and snapshot refresh:
  - WebSocket `switch_account`, `get_snapshot`
- Order cancellation:
  - `AccountDataView` -> REST `/api/orders/cancel/{order_id}`

## Dangerous Implementations

- Startup data deletion:
  - `backend/main.py` deletes all non-default users and related trading data.
- Hardcoded placeholder secret:
  - default account stores `default-key-please-update-in-settings`.
- Ambiguous booleans:
  - `is_active`, `executed` stored as `"true"`/`"false"` strings.
- Unvalidated AI output:
  - manual JSON cleanup and regex extraction can create fabricated actions.
- Random fallback:
  - startup falls back to random auto trading if AI scheduling fails.
- Unbounded trust in custom AI endpoints:
  - `verify=False` disables TLS validation.
- Direct `ccxt` usage in app layer:
  - no exchange abstraction or contract boundary.
- Incorrect route/model drift:
  - `order_routes.py` queries `Order.user_id`, but the ORM model uses `account_id`.
- Market fallback:
  - `get_all_symbols()` returns hardcoded pairs on failure.
- Weak auth/session design:
  - SHA-256 password hashing without salt or work factor.
- WebSocket/account confusion:
  - `api/ws.py` mixes `user_id` and `account_id` registration paths.

## Live Trading Readiness Gaps

- Execution layer:
  - no exchange adapter, no idempotency, no order state machine, no reconciliation.
- Risk management:
  - no persisted machine-readable reject path, no kill switch, no mode guard, no whitelist enforcement.
- API behavior:
  - inconsistent route semantics, broad exception handling, mutable side effects during reads.
- DB consistency:
  - no migrations, no atomic order/fill/event model, string booleans, floats mixed with decimals.
- Secret management:
  - API keys stored and returned directly.
- Auditability:
  - no audit log or correlation IDs.
- Observability:
  - no structured logging, no request/order correlation, no metrics.
- UI safety:
  - hardcoded default/paper identity without an explicit non-live banner or confirmation workflow.
- Testing:
  - no live-trading safety tests, no adapter contract tests, no state-machine tests.
- Rollout:
  - no sandbox mode, no staged enablement checklist, no reconciliation-first rollout.
