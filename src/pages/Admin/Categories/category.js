// The admin categories screen's own pure helpers — mirrors how
// AddProductDrawer/product.js keeps derivations out of the components.

// A category's URL is its slug, exactly like a product's — derived from the
// name and never typed. The real value shown in the tree (`category.slug`)
// still comes from the server, the same as a product's slug; this is only
// for the live preview in the form, before that round trip happens.
export function slugify(name) {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export function emptyCategoryForm(parentId = null) {
  return { name: "", description: "", parentId: parentId || "" };
}

export function categoryToForm(category) {
  if (!category) return emptyCategoryForm();
  return {
    name: category.name ?? "",
    description: category.description ?? "",
    parentId: category.parent_id ?? "",
  };
}

// No `slug` field here — like a product's base_sku-adjacent URL, it's
// server-derived from the name rather than sent by the client.
export function buildCategoryPayload(form) {
  return {
    name: form.name.trim(),
    description: form.description.trim() || null,
    parent_id: form.parentId || null,
  };
}

// Parents first, each carrying its own subcategories under `children` — the
// shape the tree view walks to render rows and nested rows without
// re-deriving the grouping at render time. Only two levels deep: a
// subcategory's own `children` is never read, since nothing here lets one be
// created under another.
export function buildCategoryTree(categories) {
  const byParent = new Map();
  categories.forEach((category) => {
    const key = category.parent_id || null;
    if (!byParent.has(key)) byParent.set(key, []);
    byParent.get(key).push(category);
  });

  const byOrder = (a, b) =>
    (a.display_order ?? 0) - (b.display_order ?? 0) ||
    a.name.localeCompare(b.name);

  const roots = (byParent.get(null) ?? []).sort(byOrder);
  return roots.map((root) => ({
    ...root,
    children: (byParent.get(root.id) ?? []).sort(byOrder),
  }));
}
