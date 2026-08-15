import { useEffect, useState } from "react";
import { listCategories } from "../../../api/catalog";

// Categories are public and identical for every visitor, so this reuses the
// storefront's own (cached, tokenless) endpoint rather than standing up a
// separate admin one — the admin console just needs the real ids, which the
// public list already carries.
export function useCategories() {
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    let active = true;
    listCategories()
      .then((rows) => {
        if (active) setCategories(Array.isArray(rows) ? rows : []);
      })
      .catch(() => {
        // Filters and the category select just show nothing to pick — no
        // banner, since a category name failing to load isn't worth
        // blocking the rest of the page over.
      });
    return () => {
      active = false;
    };
  }, []);

  return categories;
}
