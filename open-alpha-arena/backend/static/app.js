const bootstrap = window.__BOOTSTRAP__ || { orders: [], rejects: [], policy: {}, health: {} };

const responseNode = document.getElementById("response");
const opsOutputNode = document.getElementById("ops-output");
const ordersNode = document.getElementById("orders");
const rejectsNode = document.getElementById("rejects");

function pretty(value) {
  return JSON.stringify(value, null, 2);
}

function renderOrders(items) {
  if (!items.length) {
    ordersNode.innerHTML = '<p class="muted">No orders yet. Submit a paper order to populate the timeline.</p>';
    return;
  }

  ordersNode.innerHTML = `<div class="item-list">${items
    .map(
      (order) => `
        <article class="item">
          <div class="item-header">
            <strong>${order.symbol}</strong>
            <span class="tag">${order.state}</span>
          </div>
          <p>${order.side} ${order.quantity} via ${order.execution_mode}</p>
          <p class="muted">${order.order_id}</p>
          <button type="button" data-order-id="${order.order_id}" class="cancel-button">Cancel</button>
        </article>`
    )
    .join("")}</div>`;

  document.querySelectorAll(".cancel-button").forEach((button) => {
    button.addEventListener("click", async () => {
      const orderId = button.getAttribute("data-order-id");
      try {
        const payload = await apiFetch(`/api/v1/orders/${orderId}/cancel`, {
          method: "POST",
          body: JSON.stringify({ request_id: `ui-cancel-${orderId}` }),
        });
        responseNode.textContent = pretty(payload);
        bootstrap.orders = (bootstrap.orders || []).map((order) =>
          order.order_id === orderId ? payload.order : order
        );
        refreshOrders();
      } catch (error) {
        responseNode.textContent = error.message;
      }
    });
  });
}

function renderRejects(items) {
  if (!items.length) {
    rejectsNode.innerHTML = '<p class="muted">No risk rejects recorded.</p>';
    return;
  }
  rejectsNode.innerHTML = `<div class="item-list">${items
    .map(
      (item) => `
        <article class="item">
          <div class="item-header">
            <strong>${item.code}</strong>
            <span class="tag">${item.order_id.slice(0, 8)}</span>
          </div>
          <p>${item.message}</p>
        </article>`
    )
    .join("")}</div>`;
}

async function apiFetch(url, options = {}) {
  const response = await fetch(url, {
    headers: { "Content-Type": "application/json", ...(options.headers || {}) },
    ...options,
  });
  const payload = await response.json();
  if (!response.ok) {
    throw new Error(pretty(payload));
  }
  return payload;
}

async function refreshOrders() {
  renderOrders(bootstrap.orders || []);
  renderRejects(bootstrap.rejects || []);
}

async function reloadRejects() {
  try {
    const payload = await apiFetch("/api/v1/risk/rejects");
    bootstrap.rejects = payload.items || [];
    renderRejects(bootstrap.rejects);
  } catch (error) {
    responseNode.textContent = error.message;
  }
}

document.getElementById("order-form").addEventListener("submit", async (event) => {
  event.preventDefault();
  const form = new FormData(event.currentTarget);
  const aiDecisionRaw = String(form.get("ai_decision") || "").trim();
  const payload = {
    account_id: String(form.get("account_id")),
    strategy_id: String(form.get("strategy_id")),
    symbol: String(form.get("symbol")),
    side: String(form.get("side")),
    order_type: String(form.get("order_type")),
    quantity: String(form.get("quantity")),
    price: String(form.get("price") || "") || null,
    leverage: Number(form.get("leverage")),
    execution_mode: String(form.get("execution_mode")),
    reduce_only: form.get("reduce_only") === "on",
    request_id: `ui-${Date.now()}`,
  };
  if (aiDecisionRaw) {
    payload.ai_decision = JSON.parse(aiDecisionRaw);
  }

  try {
    const result = await apiFetch("/api/v1/orders", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    responseNode.textContent = pretty(result);
    bootstrap.orders = [result.order, ...(bootstrap.orders || [])].slice(0, 8);
    renderOrders(bootstrap.orders);
    if (result.violations && result.violations.length) {
      bootstrap.rejects = result.violations;
      renderRejects(bootstrap.rejects);
    }
  } catch (error) {
    responseNode.textContent = error.message;
    reloadRejects();
  }
});

document.getElementById("health-button").addEventListener("click", async () => {
  const payload = await apiFetch("/api/v1/health/exchange");
  opsOutputNode.textContent = pretty(payload);
});

document.getElementById("token-button").addEventListener("click", async () => {
  const payload = await apiFetch("/api/v1/ops/live-confirmation", {
    method: "POST",
    body: JSON.stringify({ account_id: "acct-demo" }),
  });
  opsOutputNode.textContent = pretty(payload);
});

document.getElementById("kill-switch-toggle").addEventListener("change", async (event) => {
  const payload = await apiFetch("/api/v1/ops/kill-switch", {
    method: "POST",
    body: JSON.stringify({ global_kill_switch: event.currentTarget.checked }),
  });
  bootstrap.policy = payload.policy;
  opsOutputNode.textContent = pretty(payload);
});

document.getElementById("kill-switch-toggle").checked = Boolean(bootstrap.policy.global_kill_switch);
opsOutputNode.textContent = pretty({ policy: bootstrap.policy, health: bootstrap.health });
refreshOrders();
