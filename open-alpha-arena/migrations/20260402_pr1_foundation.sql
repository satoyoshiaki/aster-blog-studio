CREATE TABLE IF NOT EXISTS orders (
  order_id TEXT PRIMARY KEY,
  account_id TEXT NOT NULL,
  strategy_id TEXT NOT NULL,
  symbol TEXT NOT NULL,
  side TEXT NOT NULL,
  order_type TEXT NOT NULL,
  quantity TEXT NOT NULL,
  price TEXT,
  leverage INTEGER NOT NULL,
  reduce_only INTEGER NOT NULL,
  execution_mode TEXT NOT NULL,
  client_order_id TEXT NOT NULL UNIQUE,
  idempotency_key TEXT NOT NULL UNIQUE,
  state TEXT NOT NULL,
  external_order_id TEXT,
  filled_quantity TEXT NOT NULL,
  average_fill_price TEXT,
  failure_reason TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS fills (
  fill_id TEXT PRIMARY KEY,
  order_id TEXT NOT NULL,
  symbol TEXT NOT NULL,
  quantity TEXT NOT NULL,
  price TEXT NOT NULL,
  fee TEXT NOT NULL,
  liquidity TEXT NOT NULL,
  filled_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS trade_events (
  event_id TEXT PRIMARY KEY,
  order_id TEXT NOT NULL,
  state TEXT NOT NULL,
  payload_json TEXT NOT NULL,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS position_snapshots (
  snapshot_id TEXT PRIMARY KEY,
  account_id TEXT NOT NULL,
  symbol TEXT NOT NULL,
  quantity TEXT NOT NULL,
  average_entry_price TEXT NOT NULL,
  unrealized_pnl TEXT NOT NULL,
  exposure_notional TEXT NOT NULL,
  leverage INTEGER NOT NULL,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS risk_rejects (
  reject_id TEXT PRIMARY KEY,
  order_id TEXT NOT NULL,
  code TEXT NOT NULL,
  message TEXT NOT NULL,
  details_json TEXT NOT NULL,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS audit_log (
  audit_id TEXT PRIMARY KEY,
  request_id TEXT NOT NULL,
  order_id TEXT,
  strategy_id TEXT,
  account_id TEXT,
  action TEXT NOT NULL,
  payload_json TEXT NOT NULL,
  created_at TEXT NOT NULL
);
