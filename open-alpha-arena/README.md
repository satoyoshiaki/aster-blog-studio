## Open Alpha Arena

Open Alpha Arena is a local safety-first trading control surface built around the reconstructed PR1 foundation in this directory. It provides:

- strict AI decision validation
- execution-mode guardrails for `paper` vs `live`
- risk evaluation and machine-readable reject capture
- order lifecycle tracking with a documented state machine
- a runnable local web UI and JSON API for order entry, cancel requests, kill switch management, confirmation tokens, and exchange health

### Run the app

```bash
cd open-alpha-arena
python3 -m backend.main --host 127.0.0.1 --port 8000
```

Then open `http://127.0.0.1:8000/`.

### Main API

- `POST /api/v1/orders`
- `GET /api/v1/orders/{order_id}`
- `POST /api/v1/orders/{order_id}/cancel`
- `GET /api/v1/risk/rejects`
- `POST /api/v1/ops/kill-switch`
- `POST /api/v1/ops/live-confirmation`
- `GET /api/v1/health/exchange`

### Test and verify

```bash
cd open-alpha-arena
pytest -q
python3 -m py_compile backend/*.py
python3 -m backend.main --help
```

### Notes

- The included adapter is a local demo adapter so the app can run in this sandbox without exchange credentials.
- Live mode remains guarded by the documented environment checks and confirmation-token workflow.
- Architecture, rollout constraints, and follow-on roadmap remain in `docs/`.
