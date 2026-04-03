import json

from backend.main import create_app


def decode_json(response):
    assert response["status"] < 400, response["body"].decode()
    return json.loads(response["body"].decode())


def test_dashboard_renders_main_ui():
    app = create_app()

    response = app.handle("GET", "/", headers={}, body=b"")

    assert response["status"] == 200
    assert response["headers"]["Content-Type"].startswith("text/html")
    assert "Open Alpha Arena" in response["body"].decode()


def test_order_submit_fetch_and_cancel_flow():
    app = create_app()

    created = decode_json(
        app.handle(
            "POST",
            "/api/v1/orders",
            headers={"Content-Type": "application/json"},
            body=json.dumps(
                {
                    "account_id": "acct-demo",
                    "strategy_id": "mean-reversion",
                    "symbol": "BTCUSDT",
                    "side": "BUY",
                    "order_type": "LIMIT",
                    "quantity": "0.010",
                    "price": "50000.00",
                    "leverage": 1,
                    "reduce_only": False,
                    "execution_mode": "paper",
                    "request_id": "req-1",
                }
            ).encode(),
        )
    )
    order_id = created["order"]["order_id"]
    assert created["order"]["state"] == "SUBMITTED"

    fetched = decode_json(app.handle("GET", f"/api/v1/orders/{order_id}", headers={}, body=b""))
    assert fetched["order"]["order_id"] == order_id
    assert fetched["events"][0]["state"] == "SUBMITTED"

    cancelled = decode_json(
        app.handle(
            "POST",
            f"/api/v1/orders/{order_id}/cancel",
            headers={"Content-Type": "application/json"},
            body=json.dumps({"request_id": "req-2"}).encode(),
        )
    )
    assert cancelled["order"]["state"] == "CANCEL_PENDING"


def test_rejects_kill_switch_token_and_health_endpoints():
    app = create_app()

    kill_switch = decode_json(
        app.handle(
            "POST",
            "/api/v1/ops/kill-switch",
            headers={"Content-Type": "application/json"},
            body=json.dumps({"global_kill_switch": True}).encode(),
        )
    )
    assert kill_switch["policy"]["global_kill_switch"] is True

    rejected = app.handle(
        "POST",
        "/api/v1/orders",
        headers={"Content-Type": "application/json"},
        body=json.dumps(
            {
                "account_id": "acct-demo",
                "strategy_id": "mean-reversion",
                "symbol": "BTCUSDT",
                "side": "BUY",
                "order_type": "LIMIT",
                "quantity": "0.010",
                "price": "50000.00",
                "leverage": 1,
                "reduce_only": False,
                "execution_mode": "paper",
                "request_id": "req-3",
            }
        ).encode(),
    )
    assert rejected["status"] == 422

    rejects = decode_json(app.handle("GET", "/api/v1/risk/rejects", headers={}, body=b""))
    assert rejects["items"][0]["code"] == "global_kill_switch"

    token_payload = decode_json(
        app.handle(
            "POST",
            "/api/v1/ops/live-confirmation",
            headers={"Content-Type": "application/json"},
            body=json.dumps({"account_id": "acct-demo"}).encode(),
        )
    )
    assert token_payload["token"]
    assert token_payload["expires_at"]

    health = decode_json(app.handle("GET", "/api/v1/health/exchange", headers={}, body=b""))
    assert health["ok"] is True
