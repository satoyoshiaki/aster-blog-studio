from __future__ import annotations

import json
import sqlite3
from datetime import datetime
from decimal import Decimal
from pathlib import Path

from backend.models import (
    AuditLogEntry,
    ExecutionMode,
    FillRecord,
    OrderRecord,
    OrderSide,
    OrderState,
    OrderType,
    PositionSnapshot,
    RejectCode,
    RiskReject,
    TradeEvent,
)


SCHEMA_SQL = """
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
"""


class SQLiteRepository:
    def __init__(self, path: str | Path = ":memory:"):
        self.path = str(path)
        self.connection = sqlite3.connect(self.path)
        self.connection.row_factory = sqlite3.Row
        self.connection.executescript(SCHEMA_SQL)
        self.connection.commit()

    def close(self) -> None:
        self.connection.close()

    def save_order(self, order: OrderRecord) -> None:
        self.connection.execute(
            """
            INSERT OR REPLACE INTO orders VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                order.order_id,
                order.account_id,
                order.strategy_id,
                order.symbol,
                order.side.value,
                order.order_type.value,
                str(order.quantity),
                str(order.price) if order.price is not None else None,
                order.leverage,
                int(order.reduce_only),
                order.execution_mode.value,
                order.client_order_id,
                order.idempotency_key,
                order.state.value,
                order.external_order_id,
                str(order.filled_quantity),
                str(order.average_fill_price) if order.average_fill_price is not None else None,
                order.failure_reason,
                order.created_at.isoformat(),
                order.updated_at.isoformat(),
            ),
        )
        self.connection.commit()

    def save_fill(self, fill: FillRecord) -> None:
        self.connection.execute(
            "INSERT OR REPLACE INTO fills VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
            (
                fill.fill_id,
                fill.order_id,
                fill.symbol,
                str(fill.quantity),
                str(fill.price),
                str(fill.fee),
                fill.liquidity,
                fill.filled_at.isoformat(),
            ),
        )
        self.connection.commit()

    def save_trade_event(self, event: TradeEvent) -> None:
        self.connection.execute(
            "INSERT OR REPLACE INTO trade_events VALUES (?, ?, ?, ?, ?)",
            (
                event.event_id,
                event.order_id,
                event.state.value,
                json.dumps(dict(event.payload), sort_keys=True),
                event.created_at.isoformat(),
            ),
        )
        self.connection.commit()

    def save_position_snapshot(self, snapshot: PositionSnapshot) -> None:
        self.connection.execute(
            "INSERT OR REPLACE INTO position_snapshots VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
            (
                snapshot.snapshot_id,
                snapshot.account_id,
                snapshot.symbol,
                str(snapshot.quantity),
                str(snapshot.average_entry_price),
                str(snapshot.unrealized_pnl),
                str(snapshot.exposure_notional),
                snapshot.leverage,
                snapshot.created_at.isoformat(),
            ),
        )
        self.connection.commit()

    def save_risk_reject(self, reject: RiskReject) -> None:
        self.connection.execute(
            "INSERT OR REPLACE INTO risk_rejects VALUES (?, ?, ?, ?, ?, ?)",
            (
                reject.reject_id,
                reject.order_id,
                reject.code.value,
                reject.message,
                json.dumps(dict(reject.details), sort_keys=True),
                reject.created_at.isoformat(),
            ),
        )
        self.connection.commit()

    def save_audit_log(self, entry: AuditLogEntry) -> None:
        self.connection.execute(
            "INSERT OR REPLACE INTO audit_log VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
            (
                entry.audit_id,
                entry.request_id,
                entry.order_id,
                entry.strategy_id,
                entry.account_id,
                entry.action,
                json.dumps(dict(entry.payload), sort_keys=True),
                entry.created_at.isoformat(),
            ),
        )
        self.connection.commit()

    def list_risk_rejects(self) -> list[sqlite3.Row]:
        return self.connection.execute("SELECT * FROM risk_rejects ORDER BY created_at").fetchall()

    def list_recent_orders(self, limit: int = 20) -> list[OrderRecord]:
        rows = self.connection.execute(
            "SELECT * FROM orders ORDER BY created_at DESC LIMIT ?",
            (limit,),
        ).fetchall()
        return [self._row_to_order(row) for row in rows]

    def get_order(self, order_id: str) -> OrderRecord | None:
        row = self.connection.execute(
            "SELECT * FROM orders WHERE order_id = ?",
            (order_id,),
        ).fetchone()
        if row is None:
            return None
        return self._row_to_order(row)

    def list_trade_events(self, order_id: str) -> list[TradeEvent]:
        rows = self.connection.execute(
            "SELECT * FROM trade_events WHERE order_id = ? ORDER BY created_at",
            (order_id,),
        ).fetchall()
        return [
            TradeEvent(
                event_id=row["event_id"],
                order_id=row["order_id"],
                state=OrderState(row["state"]),
                payload=json.loads(row["payload_json"]),
                created_at=datetime.fromisoformat(row["created_at"]),
            )
            for row in rows
        ]

    def list_risk_rejects_for_order(self, order_id: str) -> list[RiskReject]:
        rows = self.connection.execute(
            "SELECT * FROM risk_rejects WHERE order_id = ? ORDER BY created_at",
            (order_id,),
        ).fetchall()
        return [self._row_to_risk_reject(row) for row in rows]

    def list_risk_reject_records(self) -> list[RiskReject]:
        return [self._row_to_risk_reject(row) for row in self.list_risk_rejects()]

    def _row_to_order(self, row: sqlite3.Row) -> OrderRecord:
        return OrderRecord(
            order_id=row["order_id"],
            account_id=row["account_id"],
            strategy_id=row["strategy_id"],
            symbol=row["symbol"],
            side=OrderSide(row["side"]),
            order_type=OrderType(row["order_type"]),
            quantity=Decimal(row["quantity"]),
            price=Decimal(row["price"]) if row["price"] is not None else None,
            leverage=row["leverage"],
            reduce_only=bool(row["reduce_only"]),
            execution_mode=ExecutionMode(row["execution_mode"]),
            client_order_id=row["client_order_id"],
            idempotency_key=row["idempotency_key"],
            state=OrderState(row["state"]),
            external_order_id=row["external_order_id"],
            filled_quantity=Decimal(row["filled_quantity"]),
            average_fill_price=Decimal(row["average_fill_price"]) if row["average_fill_price"] is not None else None,
            failure_reason=row["failure_reason"],
            created_at=datetime.fromisoformat(row["created_at"]),
            updated_at=datetime.fromisoformat(row["updated_at"]),
        )

    def _row_to_risk_reject(self, row: sqlite3.Row) -> RiskReject:
        return RiskReject(
            reject_id=row["reject_id"],
            order_id=row["order_id"],
            code=RejectCode(row["code"]),
            message=row["message"],
            details=json.loads(row["details_json"]),
            created_at=datetime.fromisoformat(row["created_at"]),
        )
