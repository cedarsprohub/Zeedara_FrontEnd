import { useCallback, useEffect, useState } from "react";
import { useAdminAuth } from "../../../context/AdminAuthContext.js";
import {
  getDashboardKpis,
  getLowStock,
  getOrderStatusBreakdown,
  getRecentOrders,
  getRevenueByCategory,
  getRevenueTrend,
  getTopProducts,
} from "../../../api/admin/dashboard";

// The range selector's labels mapped to the `days` query the API takes.
export const RANGE_DAYS = {
  "7 days": 7,
  "30 days": 30,
  "90 days": 90,
  "12 months": 365,
};

const EMPTY = {
  kpis: null,
  revenueTrend: [],
  categories: [],
  topProducts: [],
  lowStock: [],
  recentOrders: [],
  statusCounts: [],
};

export function useDashboardData(range) {
  const { accessToken } = useAdminAuth();
  const days = RANGE_DAYS[range] ?? 365;

  // Everything hangs off one result object stamped with the request it answers.
  // Loading and error are derived from it rather than being separate flags —
  // those would have to be flipped synchronously inside the effect, which is
  // the cascading-render pattern React warns about.
  const requestKey = `${accessToken ?? ""}|${days}|`;
  const [result, setResult] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);

  const currentKey = `${requestKey}${reloadKey}`;
  const isFresh = result?.key === currentKey;

  const reload = useCallback(() => setReloadKey((key) => key + 1), []);

  useEffect(() => {
    if (!accessToken) return undefined;

    let active = true;

    // One panel failing shouldn't blank the others, so these settle
    // independently and each falls back to an empty result.
    Promise.allSettled([
      getDashboardKpis(days, accessToken),
      getRevenueTrend(days, accessToken),
      getRevenueByCategory(accessToken),
      getTopProducts(5, accessToken),
      getLowStock(4, accessToken),
      getRecentOrders({ limit: 4 }, accessToken),
      getOrderStatusBreakdown(accessToken),
    ]).then((results) => {
      if (!active) return;
      const [kpis, trend, categories, top, low, orders, statuses] = results;
      const value = (settled, fallback) =>
        settled.status === "fulfilled" ? (settled.value ?? fallback) : fallback;

      setResult({
        key: `${accessToken}|${days}|${reloadKey}`,
        data: {
          kpis: value(kpis, null),
          revenueTrend: value(trend, []),
          categories: value(categories, []),
          topProducts: value(top, []),
          lowStock: value(low, []),
          recentOrders: value(orders, []),
          statusCounts: value(statuses, []),
        },
        // Only a total failure is worth an error banner — a partial one shows
        // as empty panels alongside the ones that did load.
        error: results.every((settled) => settled.status === "rejected")
          ? results[0].reason?.message ||
            "Couldn't load dashboard data. Please try again."
          : "",
      });
    });

    return () => {
      active = false;
    };
  }, [accessToken, days, reloadKey]);

  return {
    ...(isFresh ? result.data : EMPTY),
    isLoading: Boolean(accessToken) && !isFresh,
    error: isFresh ? result.error : "",
    reload,
  };
}
