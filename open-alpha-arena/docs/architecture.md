# Target Architecture

## Component Flow

```text
Strategy Layer
  -> Signal Normalizer
  -> AI Output Schema Validator
  -> Risk Engine
  -> Execution Engine
  -> Exchange Adapter
  -> Order State Machine
  -> Position Service
  -> Portfolio Service
  -> Reconciliation Worker
  -> Audit Log Service
  -> Notification Service

Market Data Service
  -> Signal Normalizer
  -> Risk Engine
  -> Position Service
  -> Reconciliation Worker

Kill Switch
  -> Risk Engine
  -> Execution Engine
  -> Admin/Ops UI

Admin/Ops UI
  -> Audit Log Service
  -> Notification Service
  -> Kill Switch
  -> Portfolio Service
  -> Reconciliation Worker
```

## Order State Machine

```text
CREATED
  -> VALIDATED
  -> REJECTED
  -> FAILED

VALIDATED
  -> SUBMITTING
  -> REJECTED
  -> FAILED

SUBMITTING
  -> SUBMITTED
  -> FAILED
  -> RECONCILING

SUBMITTED
  -> PARTIALLY_FILLED
  -> FILLED
  -> CANCEL_PENDING
  -> FAILED
  -> EXPIRED
  -> RECONCILING

PARTIALLY_FILLED
  -> FILLED
  -> CANCEL_PENDING
  -> FAILED
  -> RECONCILING

CANCEL_PENDING
  -> CANCELLED
  -> FAILED
  -> RECONCILING

FILLED
  -> RECONCILING

FAILED
  -> RECONCILING

EXPIRED
  -> RECONCILING
```

## Core Tables

- `orders`
  - immutable identifiers: `order_id`, `client_order_id`, `idempotency_key`
  - execution fields: `execution_mode`, `state`, `external_order_id`
  - monetary fields stored as decimal strings/numeric
- `fills`
  - fill-level fees, liquidity flags, venue timestamps
- `trade_events`
  - append-only order lifecycle events
- `position_snapshots`
  - point-in-time account and symbol exposure
- `risk_rejects`
  - machine-readable code, message, JSON details
- `audit_log`
  - request and operator audit trail

## API Shape

- `POST /api/v1/orders`
  - validates AI signal or manual order
  - returns order object with state
- `GET /api/v1/orders/{order_id}`
  - current order and event summary
- `POST /api/v1/orders/{order_id}/cancel`
  - transitions to `CANCEL_PENDING`
- `GET /api/v1/risk/rejects`
  - recent machine-readable rejects
- `POST /api/v1/ops/kill-switch`
  - global or per-symbol switch
- `POST /api/v1/ops/live-confirmation`
  - generates short-lived UI confirmation token
- `GET /api/v1/health/exchange`
  - adapter and reconciliation health
