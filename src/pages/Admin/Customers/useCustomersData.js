import { useCallback, useEffect, useState } from "react";
import { useAdminAuth } from "../../../context/AdminAuthContext.js";
import { listAdminCustomers } from "../../../api/admin/customers";

const EMPTY = {
  items: [],
  total: 0,
  summary: {
    customers: 0,
    ordered: 0,
    joined_last_30_days: 0,
    lifetime_value: "0",
    average_per_customer: "0",
    repeat_customers: 0,
  },
  segment_counts: { all: 0, vip: 0, repeat: 0, new: 0, lapsed: 0 },
  countries: [],
};

// One request per filter state, its answer stamped with the key it answers
// (the same pattern as useProductsData) so "loading" is derived rather than
// tracked: the data is fresh only when its key matches the current one.
export function useCustomersData({ q, segment, country, period, sort, limit, offset }) {
  const { accessToken } = useAdminAuth();
  const [reloadKey, setReloadKey] = useState(0);
  const [result, setResult] = useState(null);

  const key = [accessToken, q, segment, country, period, sort, limit, offset, reloadKey].join("|");
  const isFresh = result?.key === key;
  const reload = useCallback(() => setReloadKey((value) => value + 1), []);

  useEffect(() => {
    if (!accessToken) return undefined;
    let active = true;
    listAdminCustomers(
      {
        q: q || undefined,
        segment: segment === "all" ? undefined : segment,
        country: country || undefined,
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
            error: err.message || "Couldn't load customers. Please try again.",
          })),
      );
    return () => {
      active = false;
    };
    // `key` folds every input in; listing them again would be redundant.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  // Mid-request the rows clear (the table shows its loading row) but the
  // counts carry over, so the pager and tabs don't collapse to zero.
  const data = isFresh ? result.data : result ? { ...result.data, items: [] } : EMPTY;

  return {
    ...data,
    isLoading: Boolean(accessToken) && !isFresh,
    error: isFresh ? result.error : "",
    reload,
  };
}
