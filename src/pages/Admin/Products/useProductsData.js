import { useCallback, useEffect, useState } from "react";
import { useAdminAuth } from "../../../context/AdminAuthContext.js";
import { listAdminProducts } from "../../../api/admin/products";
import { fromApiStatus, toApiStatus } from "./data";

// The table, selection, and every mutation below key off `id` — the server's
// real identifier. The rest of the table's shape stays camelCase, matching
// what it rendered before this page had a real backend, so the JSX barely
// had to change for it. `categoryNameById` turns the row's real category_id
// (a uuid, not a name) into something the table can actually print — applied
// outside the fetch effect (see the return statement below) so a category
// list that arrives after the products already have doesn't need the whole
// list re-fetched just to pick up the name.
function toRow(item, categoryNameById) {
  return {
    id: item.id,
    sku: item.base_sku,
    name: item.name,
    category: categoryNameById.get(item.category_id) ?? "—",
    price: item.min_price,
    compareAt: item.compare_at_price,
    stock: item.stock,
    sold: item.sold_count,
    variants: item.variant_count,
    status: fromApiStatus(item.status),
  };
}

// The three real statuses a product can carry — "All" isn't one of them,
// it's the tab that means "no status filter."
const STATUS_KEYS = ["Active", "Draft", "Archived"];

const EMPTY = {
  rawItems: [],
  total: 0,
  summary: { total: 0, variantsTotal: 0, unitsTotal: 0 },
  statusCounts: { All: 0, Active: 0, Draft: 0, Archived: 0 },
};

// Every fetch cycle asks for three things in parallel: the current filtered
// page (for the table and the "Showing X–Y of Z" footer), an unfiltered
// count-only call (for the header's catalogue-wide totals), and one
// count-only call per status (for the tab badges — which, like the header,
// ignore whatever category/search is currently narrowing the table, same as
// before this page had a real backend behind it).
export function useProductsData({
  q,
  category,
  status,
  sort,
  direction,
  limit,
  offset,
  categories,
}) {
  const { accessToken } = useAdminAuth();
  const apiStatus = status && status !== "All" ? toApiStatus(status) : undefined;
  const sortParam = sort ? `${direction === "desc" ? "-" : ""}${sort}` : undefined;

  // Everything hangs off one result object stamped with the request it
  // answers, same pattern as the dashboard's useDashboardData.
  const requestKey = `${accessToken ?? ""}|${q}|${category}|${apiStatus}|${sortParam}|${limit}|${offset}`;
  const [result, setResult] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);

  const currentKey = `${requestKey}|${reloadKey}`;
  const isFresh = result?.key === currentKey;

  const reload = useCallback(() => setReloadKey((key) => key + 1), []);

  useEffect(() => {
    if (!accessToken) return undefined;

    let active = true;

    Promise.allSettled([
      listAdminProducts(
        { q: q || undefined, categoryId: category || undefined, status: apiStatus, sort: sortParam, limit, offset },
        accessToken,
      ),
      listAdminProducts({ limit: 1 }, accessToken),
      ...STATUS_KEYS.map((key) =>
        listAdminProducts({ status: toApiStatus(key), limit: 1 }, accessToken),
      ),
    ]).then((results) => {
      if (!active) return;
      const [listResult, summaryResult, ...statusResults] = results;
      const value = (settled, fallback) =>
        settled.status === "fulfilled" ? (settled.value ?? fallback) : fallback;

      const list = value(listResult, {});
      const summary = value(summaryResult, {});
      const statusCounts = { All: summary.total ?? 0 };
      STATUS_KEYS.forEach((key, index) => {
        statusCounts[key] = value(statusResults[index], {}).total ?? 0;
      });

      setResult({
        key: `${accessToken}|${q}|${category}|${apiStatus}|${sortParam}|${limit}|${offset}|${reloadKey}`,
        data: {
          rawItems: list.items ?? [],
          total: list.total ?? 0,
          summary: {
            total: summary.total ?? 0,
            variantsTotal: summary.variants_total ?? 0,
            unitsTotal: summary.units_total ?? 0,
          },
          statusCounts,
        },
        // Only the main list failing blocks the page — a status-count or
        // summary panel failing just shows a 0 rather than an error banner.
        error:
          listResult.status === "rejected"
            ? listResult.reason?.message ||
              "Couldn't load products. Please try again."
            : "",
      });
    });

    return () => {
      active = false;
    };
  }, [accessToken, q, category, apiStatus, sortParam, limit, offset, reloadKey]);

  const data = isFresh ? result.data : EMPTY;
  const categoryNameById = new Map(categories.map((cat) => [cat.id, cat.name]));

  return {
    ...data,
    items: data.rawItems.map((item) => toRow(item, categoryNameById)),
    isLoading: Boolean(accessToken) && !isFresh,
    error: isFresh ? result.error : "",
    reload,
  };
}
