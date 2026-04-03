from __future__ import annotations

import contextvars
import json
import logging
from typing import Any


request_id_var = contextvars.ContextVar("request_id", default="-")
order_id_var = contextvars.ContextVar("order_id", default="-")
strategy_id_var = contextvars.ContextVar("strategy_id", default="-")
account_id_var = contextvars.ContextVar("account_id", default="-")


class CorrelationFilter(logging.Filter):
    def filter(self, record: logging.LogRecord) -> bool:
        record.request_id = request_id_var.get()
        record.order_id = order_id_var.get()
        record.strategy_id = strategy_id_var.get()
        record.account_id = account_id_var.get()
        return True


class JsonFormatter(logging.Formatter):
    def format(self, record: logging.LogRecord) -> str:
        payload: dict[str, Any] = {
            "level": record.levelname,
            "message": record.getMessage(),
            "logger": record.name,
            "request_id": getattr(record, "request_id", "-"),
            "order_id": getattr(record, "order_id", "-"),
            "strategy_id": getattr(record, "strategy_id", "-"),
            "account_id": getattr(record, "account_id", "-"),
        }
        if record.exc_info:
            payload["exception"] = self.formatException(record.exc_info)
        return json.dumps(payload, sort_keys=True)


def configure_logging(level: int = logging.INFO) -> None:
    root = logging.getLogger()
    root.handlers.clear()
    handler = logging.StreamHandler()
    handler.addFilter(CorrelationFilter())
    handler.setFormatter(JsonFormatter())
    root.addHandler(handler)
    root.setLevel(level)


def set_correlation_ids(request_id: str, order_id: str = "-", strategy_id: str = "-", account_id: str = "-") -> None:
    request_id_var.set(request_id)
    order_id_var.set(order_id)
    strategy_id_var.set(strategy_id)
    account_id_var.set(account_id)
