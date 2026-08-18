import { useCallback, useEffect, useState } from "react";
import { useAdminAuth } from "../../../context/AdminAuthContext.js";
import { listCategories } from "../../../api/catalog";
import { listAdminProducts } from "../../../api/admin/products";
import { buildCategoryTree } from "./category";

const EMPTY = { categories: [], countsById: new Map(), totalProducts: 0 };

// One count-only `listAdminProducts` call per category — the same idiom
// useProductsData uses for the status tab badges — plus one unfiltered call
// for the catalogue-wide total. Categories themselves come from the public,
// cached `listCategories()`: identical for every visitor, so there's no
// separate admin list endpoint to fetch it from. Everything hangs off one
// result object stamped with the request it answers, same pattern as
// useProductsData and the dashboard's useDashboardData.
export function useCategoriesData() {
  const { accessToken } = useAdminAuth();
  const [result, setResult] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);

  const currentKey = `${accessToken ?? ""}|${reloadKey}`;
  const isFresh = result?.key === currentKey;

  const reload = useCallback(() => setReloadKey((key) => key + 1), []);

  useEffect(() => {
    let active = true;

    listCategories()
      .then((rows) => {
        const list = Array.isArray(rows) ? rows : [];
        // The counts need a token; without one the tree still renders, just
        // with every count reading as zero rather than blocking on sign-in.
        if (!accessToken) {
          return { categories: list, countsById: new Map(), totalProducts: 0 };
        }
        return Promise.allSettled([
          listAdminProducts({ limit: 1 }, accessToken),
          ...list.map((category) =>
            listAdminProducts({ categoryId: category.id, limit: 1 }, accessToken),
          ),
        ]).then((results) => {
          const [totalResult, ...countResults] = results;
          return {
            categories: list,
            totalProducts:
              totalResult.status === "fulfilled" ? (totalResult.value?.total ?? 0) : 0,
            countsById: new Map(
              list.map((category, index) => [
                category.id,
                countResults[index]?.status === "fulfilled"
                  ? (countResults[index].value?.total ?? 0)
                  : 0,
              ]),
            ),
          };
        });
      })
      .then((data) => {
        if (active) setResult({ key: currentKey, data, error: "" });
      })
      .catch((err) => {
        if (active) {
          setResult({
            key: currentKey,
            data: EMPTY,
            error: err.message || "Couldn't load categories.",
          });
        }
      });

    return () => {
      active = false;
    };
  }, [accessToken, currentKey]);

  const data = isFresh ? result.data : EMPTY;
  const { categories, countsById, totalProducts } = data;

  const tree = buildCategoryTree(categories);
  const topLevelCount = tree.length;
  const subCount = categories.length - topLevelCount;

  // A product carries exactly one category_id, so summing every category's
  // own (non-rollup) count double-counts nothing — each product is caught by
  // at most one of these calls, whether that's a top-level category or a
  // subcategory.
  const categorisedCount = categories.reduce(
    (sum, category) => sum + (countsById.get(category.id) ?? 0),
    0,
  );
  const uncategorisedCount = Math.max(0, totalProducts - categorisedCount);

  // A leaf is a subcategory, or a top-level category with none of its own —
  // that's what actually renders as a bare page on the storefront. A parent
  // with subcategories isn't "empty" just for having no products of its own,
  // since its children still give it something to show.
  const leaves = tree.flatMap((root) =>
    root.children.length > 0 ? root.children : [root],
  );
  const emptyCategories = leaves.filter(
    (category) => (countsById.get(category.id) ?? 0) === 0,
  );

  return {
    tree,
    flat: categories,
    countsById,
    totalProducts,
    topLevelCount,
    subCount,
    uncategorisedCount,
    emptyCategories,
    isLoading: !isFresh,
    error: isFresh ? result.error : "",
    reload,
  };
}
