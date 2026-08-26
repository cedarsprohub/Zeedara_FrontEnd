import { useEffect, useRef, useState } from "react";
import {
  ChevronRight,
  GripVertical,
  MoreVertical,
  Package,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react";

// Matches the Figma "Top category dropdown" component exactly: same panel
// (rounded-lg, the navbar's own drop-shadow token), same four items, same
// divider before the destructive one. A subcategory gets the same list minus
// "Add subcategory" — the tree is only ever two levels deep.
function CategoryRowMenu({ onEdit, onViewProducts, onAddSubcategory, onDelete }) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!isOpen) return undefined;
    const handleClickOutside = (event) => {
      if (ref.current && !ref.current.contains(event.target)) setIsOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const act = (action) => {
    setIsOpen(false);
    action();
  };

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setIsOpen((value) => !value)}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        aria-label="Category actions"
        className="flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-md text-[#828a9b] transition-colors hover:bg-[#f9fafb] hover:text-black"
      >
        <MoreVertical className="size-4" strokeWidth={2} />
      </button>
      {isOpen && (
        <div
          role="menu"
          className="absolute top-full right-0 z-10 mt-1 flex w-52 flex-col gap-1 rounded-lg bg-white p-3 shadow-[-2px_-9px_43.9px_rgba(0,0,0,0.05)]"
        >
          <button
            type="button"
            role="menuitem"
            onClick={() => act(onEdit)}
            className="flex w-full cursor-pointer items-center gap-2 rounded-md px-2 py-3 text-left text-[14px] font-medium text-[#667085] transition-colors hover:bg-[#f9fafb] hover:text-black"
          >
            <Pencil className="size-5" strokeWidth={1.75} />
            Edit category
          </button>
          <button
            type="button"
            role="menuitem"
            onClick={() => act(onViewProducts)}
            className="flex w-full cursor-pointer items-center gap-2 rounded-md px-2 py-3 text-left text-[14px] font-medium text-[#667085] transition-colors hover:bg-[#f9fafb] hover:text-black"
          >
            <Package className="size-5" strokeWidth={1.75} />
            View products
          </button>
          {onAddSubcategory && (
            <button
              type="button"
              role="menuitem"
              onClick={() => act(onAddSubcategory)}
              className="flex w-full cursor-pointer items-center gap-2 rounded-md px-2 py-3 text-left text-[14px] font-medium text-[#667085] transition-colors hover:bg-[#f9fafb] hover:text-black"
            >
              <Plus className="size-5" strokeWidth={1.75} />
              Add subcategory
            </button>
          )}
          <div className="my-1 border-t border-[#f0f1f3]" />
          <button
            type="button"
            role="menuitem"
            onClick={() => act(onDelete)}
            className="flex w-full cursor-pointer items-center gap-2 rounded-md px-2 py-3 text-left text-[14px] font-medium text-[#cf251f] transition-colors hover:bg-[#fef3f2]"
          >
            <Trash2 className="size-5" strokeWidth={1.75} />
            Delete category
          </button>
        </div>
      )}
    </div>
  );
}

// A top-level row is its own bordered, rounded card — the chevron is its drag
// affordance (the whole row is still draggable; see `dragProps`). A
// subcategory row instead gets an explicit grip handle, no chevron (it has no
// children of its own), and sits in the flatter, ungrouped-card style below.
function CategoryRow({
  category,
  count,
  isExpanded,
  onToggleExpand,
  dragProps,
  onEdit,
  onViewProducts,
  onAddSubcategory,
  onDelete,
}) {
  return (
    <div
      {...dragProps}
      className={`flex items-center gap-3 rounded-[10px] border border-[#eaecf0] bg-white p-3 ${dragProps.className}`}
    >
      <button
        type="button"
        onClick={onToggleExpand}
        aria-expanded={isExpanded}
        aria-label={isExpanded ? "Collapse" : "Expand"}
        className="flex size-5 shrink-0 cursor-pointer items-center justify-center text-[#48505e] transition-colors hover:text-black"
      >
        <ChevronRight
          className={`size-4 transition-transform ${isExpanded ? "rotate-90" : ""}`}
          strokeWidth={2}
        />
      </button>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="truncate text-[14px] font-medium text-[#101828]">
            {category.name}
          </span>
          <span className="shrink-0 rounded-[4px] border border-dashed border-[#d0d5dd] bg-[#f2f4f7] px-2 py-0.5 font-mono text-[12px] text-[#344054]">
            /{category.slug}
          </span>
        </div>
        {category.description && (
          <p className="truncate pt-0.5 text-[12px] text-[#828a9b]">
            {category.description}
          </p>
        )}
      </div>

      <span className="shrink-0 rounded-[4px] border border-[#eaecf0] bg-[#f2f4f7] px-2.5 py-1 text-[12px] font-semibold text-[#575f71]">
        {count} product{count === 1 ? "" : "s"}
      </span>

      <CategoryRowMenu
        onEdit={onEdit}
        onViewProducts={onViewProducts}
        onAddSubcategory={onAddSubcategory}
        onDelete={onDelete}
      />
    </div>
  );
}

function SubcategoryRow({ category, count, dragProps, onEdit, onViewProducts, onDelete }) {
  return (
    <div
      {...dragProps}
      className={`flex items-center gap-3 rounded-[10px] bg-[#fcfcfc] px-3 py-2.5 ${dragProps.className}`}
    >
      <GripVertical
        className="size-4 shrink-0 cursor-grab text-[#9fa5b2] active:cursor-grabbing"
        strokeWidth={2}
        aria-hidden="true"
      />

      <div className="flex min-w-0 flex-1 items-center gap-3">
        <span className="truncate text-[14px] font-medium text-[#101828]">
          {category.name}
        </span>
        <span className="shrink-0 rounded-[4px] border border-dashed border-[#dadde2] bg-[#f0f1f3] px-2 py-0.5 font-mono text-[10px] text-[#48505e]">
          /{category.slug}
        </span>
      </div>

      <span className="flex size-6 shrink-0 items-center justify-center rounded-full border border-[#dadde2] bg-[#f0f1f3] text-[12px] font-semibold text-[#575f71]">
        {count}
      </span>

      <CategoryRowMenu onEdit={onEdit} onViewProducts={onViewProducts} onDelete={onDelete} />
    </div>
  );
}

// Reorders `list` so the dragged id sits where the drop-target id was.
function reorderIds(list, fromId, toId) {
  const ids = list.map((item) => item.id);
  const fromIndex = ids.indexOf(fromId);
  const toIndex = ids.indexOf(toId);
  if (fromIndex === -1 || toIndex === -1 || fromIndex === toIndex) return null;
  const next = [...ids];
  next.splice(toIndex, 0, next.splice(fromIndex, 1)[0]);
  return next;
}

function CategoryTree({
  tree,
  countsById,
  onReorderRoots,
  onReorderChildren,
  onEdit,
  onViewProducts,
  onAddSubcategory,
  onDelete,
}) {
  const [expanded, setExpanded] = useState(() => new Set(tree.map((root) => root.id)));
  const [dragging, setDragging] = useState(null); // { parentId, id }

  const toggle = (id) =>
    setExpanded((previous) => {
      const next = new Set(previous);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const dragPropsFor = (list, parentId, categoryId) => ({
    draggable: true,
    onDragStart: () => setDragging({ parentId, id: categoryId }),
    onDragOver: (event) => {
      if (dragging?.parentId === parentId) event.preventDefault();
    },
    onDrop: (event) => {
      event.preventDefault();
      if (!dragging || dragging.parentId !== parentId || dragging.id === categoryId) {
        return;
      }
      const nextIds = reorderIds(list, dragging.id, categoryId);
      if (nextIds) {
        if (parentId) onReorderChildren(parentId, nextIds);
        else onReorderRoots(nextIds);
      }
      setDragging(null);
    },
    onDragEnd: () => setDragging(null),
    className: dragging?.id === categoryId ? "opacity-40" : "",
  });

  return (
    <div className="border border-[#f0f1f3] bg-white">
      <div className="border-b border-[#f0f1f3] px-[18px] py-4">
        <h2 className="text-[14px] font-bold text-[#262626]">Category tree</h2>
        <p className="text-[12px] font-medium text-[#828a9b]">
          Drag the handle to reorder how categories appear on the storefront
        </p>
      </div>

      {tree.length === 0 ? (
        <p className="px-4 py-16 text-center text-[14px] text-[#828a9b]">
          No categories yet — add one to get started.
        </p>
      ) : (
        <div className="flex flex-col gap-3 p-[18px]">
          {tree.map((root) => (
            <div key={root.id} className="flex flex-col gap-2">
              <CategoryRow
                category={root}
                count={countsById.get(root.id) ?? 0}
                isExpanded={expanded.has(root.id)}
                onToggleExpand={() => toggle(root.id)}
                dragProps={dragPropsFor(tree, null, root.id)}
                onEdit={() => onEdit(root)}
                onViewProducts={() => onViewProducts(root)}
                onAddSubcategory={() => onAddSubcategory(root)}
                onDelete={() => onDelete(root)}
              />
              {expanded.has(root.id) && root.children.length > 0 && (
                <div className="ml-6 flex flex-col gap-2 border-l-2 border-[#f0f1f3] pl-4">
                  {root.children.map((child) => (
                    <SubcategoryRow
                      key={child.id}
                      category={child}
                      count={countsById.get(child.id) ?? 0}
                      dragProps={dragPropsFor(root.children, root.id, child.id)}
                      onEdit={() => onEdit(child)}
                      onViewProducts={() => onViewProducts(child)}
                      onDelete={() => onDelete(child)}
                    />
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default CategoryTree;
