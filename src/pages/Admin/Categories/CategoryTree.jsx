import { useEffect, useRef, useState } from "react";
import {
  ChevronRight,
  GripVertical,
  MoreVertical,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react";

function CategoryRowMenu({ onEdit, onAddSubcategory, onDelete }) {
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
          className="absolute top-full right-0 z-10 mt-1 w-44 border border-[#f0f1f3] bg-white py-1 shadow-[0px_12px_24px_rgba(16,24,40,0.12)]"
        >
          <button
            type="button"
            role="menuitem"
            onClick={() => act(onEdit)}
            className="flex w-full cursor-pointer items-center gap-2 px-3.5 py-2.5 text-left text-[13px] font-medium text-[#48505e] transition-colors hover:bg-[#f9fafb] hover:text-black"
          >
            <Pencil className="size-3.5" strokeWidth={2} />
            Edit
          </button>
          {onAddSubcategory && (
            <button
              type="button"
              role="menuitem"
              onClick={() => act(onAddSubcategory)}
              className="flex w-full cursor-pointer items-center gap-2 px-3.5 py-2.5 text-left text-[13px] font-medium text-[#48505e] transition-colors hover:bg-[#f9fafb] hover:text-black"
            >
              <Plus className="size-3.5" strokeWidth={2} />
              Add subcategory
            </button>
          )}
          <button
            type="button"
            role="menuitem"
            onClick={() => act(onDelete)}
            className="flex w-full cursor-pointer items-center gap-2 px-3.5 py-2.5 text-left text-[13px] font-medium text-[#cf251f] transition-colors hover:bg-[#fef3f2]"
          >
            <Trash2 className="size-3.5" strokeWidth={2} />
            Delete
          </button>
        </div>
      )}
    </div>
  );
}

// One row, shared by top-level categories and subcategories. The only
// differences are indent, whether the expand chevron and description show,
// and whether "Add subcategory" appears in the menu — the tree is only ever
// two levels deep, so a subcategory never gets one.
function CategoryRow({
  category,
  count,
  depth,
  isExpanded,
  onToggleExpand,
  dragProps,
  onEdit,
  onAddSubcategory,
  onDelete,
}) {
  const isTopLevel = depth === 0;

  return (
    <div
      {...dragProps}
      className={`flex items-start gap-3 border-b border-[#f0f1f3] px-4 py-3.5 last:border-0 ${
        isTopLevel ? "" : "bg-[#fcfcfc] pl-14"
      } ${dragProps.className}`}
    >
      <GripVertical
        className="mt-0.5 size-4 shrink-0 cursor-grab text-[#9fa5b2] active:cursor-grabbing"
        strokeWidth={2}
        aria-hidden="true"
      />

      {isTopLevel ? (
        <button
          type="button"
          onClick={onToggleExpand}
          aria-expanded={isExpanded}
          aria-label={isExpanded ? "Collapse" : "Expand"}
          disabled={category.children.length === 0}
          className="mt-0.5 flex size-5 shrink-0 cursor-pointer items-center justify-center text-[#48505e] transition-colors hover:text-black disabled:cursor-default disabled:opacity-0"
        >
          <ChevronRight
            className={`size-4 transition-transform ${isExpanded ? "rotate-90" : ""}`}
            strokeWidth={2}
          />
        </button>
      ) : null}

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span
            className={`truncate font-semibold text-[#262626] ${
              isTopLevel ? "text-[14px]" : "text-[13px]"
            }`}
          >
            {category.name}
          </span>
          <span className="shrink-0 rounded-[4px] bg-[#f0f1f3] px-2 py-0.5 font-mono text-[11px] text-[#667085]">
            /{category.slug}
          </span>
        </div>
        {isTopLevel && category.description && (
          <p className="truncate pt-0.5 text-[12px] text-[#9fa5b2]">
            {category.description}
          </p>
        )}
      </div>

      {isTopLevel ? (
        <span className="mt-0.5 shrink-0 rounded-full border border-[#f0f1f3] bg-white px-3 py-1 text-[12px] font-semibold text-[#48505e]">
          {count} product{count === 1 ? "" : "s"}
        </span>
      ) : (
        <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-[#f0f1f3] text-[12px] font-semibold text-[#575f71]">
          {count}
        </span>
      )}

      <CategoryRowMenu
        onEdit={onEdit}
        onAddSubcategory={isTopLevel ? onAddSubcategory : undefined}
        onDelete={onDelete}
      />
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
        tree.map((root) => (
          <div key={root.id}>
            <CategoryRow
              category={root}
              count={countsById.get(root.id) ?? 0}
              depth={0}
              isExpanded={expanded.has(root.id)}
              onToggleExpand={() => toggle(root.id)}
              dragProps={dragPropsFor(tree, null, root.id)}
              onEdit={() => onEdit(root)}
              onAddSubcategory={() => onAddSubcategory(root)}
              onDelete={() => onDelete(root)}
            />
            {expanded.has(root.id) &&
              root.children.map((child) => (
                <CategoryRow
                  key={child.id}
                  category={child}
                  count={countsById.get(child.id) ?? 0}
                  depth={1}
                  dragProps={dragPropsFor(root.children, root.id, child.id)}
                  onEdit={() => onEdit(child)}
                  onDelete={() => onDelete(child)}
                />
              ))}
          </div>
        ))
      )}
    </div>
  );
}

export default CategoryTree;
