import { adminRequest } from "./client";
import { buildQuery } from "../client";

// The Orders page in one call: { items, total, limit, offset,
// summary: { all_time, awaiting_fulfilment_all_time, gross_revenue, orders,
//            units, awaiting_fulfilment, unpaid },
// tab_counts: { all, pending, confirmed, processing, shipped, delivered, cancelled } }
//   tab:     all | pending | confirmed | processing | shipped | delivered | cancelled
//   payment: paid | unpaid | refunded | voided      period: all | 7d | 30d | 90d
//   sort:    number | customer | placed | fulfilment | payment | total ("-" = desc)
export function listAdminOrderTable({ q, tab, payment, period, sort, limit, offset } = {}, token) {
  return adminRequest(
    `/api/v1/admin/orders/table${buildQuery({ q, tab, payment, period, sort, limit, offset })}`,
    { token },
  );
}

// Same filters, every matching row, as CSV text.
export function exportAdminOrders({ q, tab, payment, period, sort } = {}, token) {
  return adminRequest(
    `/api/v1/admin/orders/export${buildQuery({ q, tab, payment, period, sort })}`,
    { token },
  );
}

// Full order for the order panel: items, totals, payment method/reference,
// staff note, `next_status` for the Advance button, `allowed_transitions`
// for the fulfilment select, and the customer's lifetime roll-up.
export function getAdminOrderDetail(id, token) {
  return adminRequest(`/api/v1/admin/orders/${encodeURIComponent(id)}/detail`, { token });
}

// { delivery_method, admin_note } — either or both. Returns the detail.
export function updateAdminOrder(id, patch, token) {
  return adminRequest(`/api/v1/admin/orders/${encodeURIComponent(id)}`, {
    method: "PATCH",
    body: patch,
    token,
  });
}

// One hop of the order state machine; the server rejects illegal moves.
export function setAdminOrderState(id, toState, token, reason) {
  return adminRequest(`/api/v1/admin/orders/${encodeURIComponent(id)}/state`, {
    method: "PATCH",
    body: { to_state: toState, reason },
    token,
  });
}
