import { adminRequest } from "./client";
import { buildQuery } from "../client";

// Money arrives as decimal strings ("51400000.00") so no precision is lost in
// transit — same convention as the storefront's toAmount().

// DashboardKPIs: period_days, total_revenue_ngn, total_orders,
// average_order_value_ngn, gross_profit_ngn, total_customers, new_customers,
// low_stock_products, conversion_rate_pct.
export function getDashboardKpis(days, token) {
  return adminRequest(`/api/v1/admin/dashboard/kpis${buildQuery({ days })}`, {
    token,
  });
}

// TrendPoint[]: { date, value }
export function getRevenueTrend(days, token) {
  return adminRequest(
    `/api/v1/admin/dashboard/charts/revenue-trend${buildQuery({ days })}`,
    { token },
  );
}

// NamedValue[]: { label, value }
export function getRevenueByCategory(token) {
  return adminRequest("/api/v1/admin/dashboard/charts/revenue-by-category", {
    token,
  });
}

// TopProduct[]: { product_name, units_sold, revenue_ngn }
export function getTopProducts(limit, token) {
  return adminRequest(
    `/api/v1/admin/reports/products/top${buildQuery({ limit })}`,
    { token },
  );
}

// LowStockItem[]: { sku, variant_name, stock_quantity, low_stock_threshold }
export function getLowStock(limit, token) {
  return adminRequest(
    `/api/v1/admin/reports/inventory/low-stock${buildQuery({ limit })}`,
    { token },
  );
}

// StatusCount[]: { status, count }. Statuses are the OrderStatus enum values
// (pending_payment, paid, processing, packed, shipped, …).
export function getOrderStatusBreakdown(token) {
  return adminRequest("/api/v1/admin/reports/orders/status-breakdown", {
    token,
  });
}

// OrderListItem[]: { id, order_number, status, customer_name, customer_email,
// total_ngn, created_at }
export function getRecentOrders({ limit, offset, orderStatus } = {}, token) {
  return adminRequest(
    `/api/v1/admin/orders${buildQuery({
      limit,
      offset,
      order_status: orderStatus,
    })}`,
    { token },
  );
}
