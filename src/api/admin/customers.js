import { adminRequest } from "./client";
import { buildQuery } from "../client";

// Admin Customers. The list returns an envelope carrying everything the page
// needs in one trip: the page of rows, `total` for the pager, `summary` for
// the header line and KPI cards, `segment_counts` for the tab badges and
// `countries` for the country filter.
//   segment: vip | repeat | new | lapsed     period: all | 7d | 30d | 90d
//   sort:    name | location | orders | spend | aov | last_order | joined,
//            prefixed with "-" for descending
export function listAdminCustomers(
  { q, segment, country, period, sort, limit, offset } = {},
  token,
) {
  return adminRequest(
    `/api/v1/admin/customers${buildQuery({ q, segment, country, period, sort, limit, offset })}`,
    { token },
  );
}

// Same filters as the list, every matching row — returned as CSV text.
export function exportAdminCustomers({ q, segment, country, period, sort } = {}, token) {
  return adminRequest(
    `/api/v1/admin/customers/export${buildQuery({ q, segment, country, period, sort })}`,
    { token },
  );
}

export function getAdminCustomer(id, token) {
  return adminRequest(`/api/v1/admin/customers/${encodeURIComponent(id)}`, { token });
}

// { first_name, last_name, phone_number } — any subset. Returns the row.
export function updateAdminCustomer(id, patch, token) {
  return adminRequest(`/api/v1/admin/customers/${encodeURIComponent(id)}`, {
    method: "PATCH",
    body: patch,
    token,
  });
}

// Blocking signs the customer out everywhere and stops them signing in.
export function setAdminCustomerBlocked(id, blocked, token) {
  return adminRequest(
    `/api/v1/admin/customers/${encodeURIComponent(id)}/${blocked ? "block" : "unblock"}`,
    { method: "POST", token },
  );
}

// Clears the profile and frees the email; their orders stay on record.
export function deleteAdminCustomer(id, token) {
  return adminRequest(`/api/v1/admin/customers/${encodeURIComponent(id)}`, {
    method: "DELETE",
    token,
  });
}

// Everything the Customer details panel shows, in one call:
// { customer, whatsapp_number, currency, last_seen_at, default_address,
//   counts: { orders, clinic, custom_wigs, reviews },
//   orders, clinic, custom_wigs, reviews, timeline }
export function getAdminCustomerProfile(id, token) {
  return adminRequest(`/api/v1/admin/customers/${encodeURIComponent(id)}/profile`, { token });
}
