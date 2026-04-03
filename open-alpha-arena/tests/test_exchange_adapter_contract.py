from decimal import Decimal

from backend.exchange_adapter import ExchangeAdapter, HealthCheckResult
from backend.models import MarketConstraints, OrderRequest, OrderSide, OrderType


class FakeAdapter:
    name = "fake"

    def fetch_balance(self, account_id: str):
        return {"total": {"USDT": 1000}}

    def fetch_positions(self, account_id: str):
        return []

    def fetch_open_orders(self, account_id: str, symbol: str | None = None):
        return []

    def fetch_order(self, account_id: str, order_id: str, symbol: str | None = None):
        return {"id": order_id}

    def create_order(self, account_id: str, order: OrderRequest):
        return {"id": "exchange-order-1", "clientOrderId": order.client_order_id}

    def cancel_order(self, account_id: str, order_id: str, symbol: str | None = None):
        return {"id": order_id, "status": "canceled"}

    def cancel_all_orders(self, account_id: str, symbol: str | None = None):
        return []

    def fetch_ticker(self, symbol: str):
        return {"last": 100}

    def fetch_orderbook(self, symbol: str, limit: int = 20):
        return {"bids": [], "asks": []}

    def fetch_ohlcv(self, symbol: str, timeframe: str, limit: int = 100):
        return []

    def set_leverage(self, account_id: str, symbol: str, leverage: int):
        return {"symbol": symbol, "leverage": leverage}

    def fetch_market_info(self, symbol: str):
        return MarketConstraints(
            symbol=symbol,
            min_qty=Decimal("0.001"),
            step_size=Decimal("0.001"),
            tick_size=Decimal("0.10"),
            min_notional=Decimal("5"),
            max_leverage=5,
        )

    def normalize_symbol(self, symbol: str):
        return symbol.upper()

    def health_check(self):
        return HealthCheckResult(ok=True, message="ok", details={})


def test_fake_adapter_satisfies_contract():
    adapter: ExchangeAdapter = FakeAdapter()
    order = OrderRequest(
        account_id="acct",
        strategy_id="strat",
        symbol="BTCUSDT",
        side=OrderSide.BUY,
        order_type=OrderType.MARKET,
        quantity=Decimal("0.01"),
        price=Decimal("100"),
        leverage=1,
        reduce_only=False,
    )
    created = adapter.create_order("acct", order)
    assert created["clientOrderId"] == order.client_order_id
    assert adapter.fetch_market_info("BTCUSDT").max_leverage == 5
