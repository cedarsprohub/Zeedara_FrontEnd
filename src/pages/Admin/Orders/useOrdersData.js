import { useCallback, useEffect, useState } from "react";
import { useAdminAuth } from "../../../context/AdminAuthContext.js";
import { listAdminOrderTable } from "../../../api/admin/orders";

const EMPTY = {
  items: [],
  total: 0,
  summary: {
    all_time: 0,
    awaiting_fulfilment_all_time: 0,
    gross_revenue: "0",
    orders: 0,
    units: 0,
    awaiting_fulfilment: 0,
    unpaid: 0,
  },
  tab_counts: { all: 0, pending: 0, confirmed: 0, processing: 0, shipped: 0, delivered: 0, cancelled: 0 },
};

// Same key-stamped pattern as useCustomersData: loading is derived from
// whether the answer on hand belongs to the current filters.
export function useOrdersData({ q, tab, payment, period, sort, limit, offset }) {
  const { accessToken } = useAdminAuth();
  const [reloadKey, setReloadKey] = useState(0);
  const [result, setResult] = useState(null);

  const key = [accessToken, q, tab, payment, period, sort, limit, offset, reloadKey].join("|");
  const isFresh = result?.key === key;
  const reload = useCallback(() => setReloadKey((value) => value + 1), []);

  useEffect(() => {
    if (!accessToken) return undefined;
    let active = true;
    listAdminOrderTable(
      {
        q: q || undefined,
        tab: tab === "all" ? undefined : tab,
        payment: payment || undefined,
        period: period === "all" ? undefined : period,
        sort,
        limit,
        offset,
      },
      accessToken,
    )
      .then((data) => active && setResult({ key, data: { ...EMPTY, ...data }, error: "" }))
      .catch(
        (err) =>
          active &&
          setResult((previous) => ({
            key,
            data: previous?.data ?? EMPTY,
            error: err.message || "Couldn't load orders. Please try again.",
          })),
      );
    return () => {
      active = false;
    };
    // `key` folds every input in.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  const data = isFresh ? result.data : result ? { ...result.data, items: [] } : EMPTY;
  return { ...data, isLoading: Boolean(accessToken) && !isFresh, error: isFresh ? result.error : "", reload };
}
