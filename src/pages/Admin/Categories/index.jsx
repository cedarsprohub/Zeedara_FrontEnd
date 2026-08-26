import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus } from "lucide-react";
import Seo from "../../../components/shared/Seo";
import { useAdminAuth } from "../../../context/AdminAuthContext.js";
import { deleteAdminCategory, reorderAdminCategories } from "../../../api/admin/categories";
import { useCategoriesData } from "./useCategoriesData";
import CategoryTree from "./CategoryTree";
import CategoryFormModal from "./CategoryFormModal";
import DeleteCategoryDialog from "./DeleteCategoryDialog";
import ProductsPerCategory from "./ProductsPerCategory";
import UncategorisedCheck from "./UncategorisedCheck";

function Categories() {
  const navigate = useNavigate();
  const { accessToken } = useAdminAuth();
  const {
    tree,
    countsById,
    totalProducts,
    topLevelCount,
    subCount,
    uncategorisedCount,
    emptyCategories,
    isLoading,
    error,
    reload,
  } = useCategoriesData();

  // null when closed; { category, defaultParentId } when open — `category`
  // null means create, set means edit, same convention as the product drawer.
  const [modalState, setModalState] = useState(null);
  const [deletingCategory, setDeletingCategory] = useState(null);
  const [actionError, setActionError] = useState("");

  const parentOptions = [
    { value: "", label: "No parent — top-level category" },
    ...tree
      .filter((root) => root.id !== modalState?.category?.id)
      .map((root) => ({ value: root.id, label: root.name })),
  ];

  const openCreate = () => setModalState({ category: null, defaultParentId: null });
  const openEdit = (category) => setModalState({ category, defaultParentId: null });
  const openAddSubcategory = (parent) =>
    setModalState({ category: null, defaultParentId: parent.id });
  const closeModal = () => setModalState(null);

  const viewProducts = (category) =>
    navigate(`/admin/products?category=${encodeURIComponent(category.id)}`);

  const persistOrder = async (items) => {
    setActionError("");
    try {
      await reorderAdminCategories(items, accessToken);
      reload();
    } catch (err) {
      setActionError(err.message);
    }
  };

  const reorderRoots = (orderedIds) =>
    persistOrder(
      orderedIds.map((id, index) => ({ id, parent_id: null, display_order: index })),
    );

  const reorderChildren = (parentId, orderedIds) =>
    persistOrder(
      orderedIds.map((id, index) => ({ id, parent_id: parentId, display_order: index })),
    );

  const confirmDelete = async () => {
    setActionError("");
    try {
      await deleteAdminCategory(deletingCategory.id, accessToken);
      setDeletingCategory(null);
      reload();
    } catch (err) {
      setActionError(err.message);
    }
  };

  const productsPerCategory = tree.map((root) => ({
    id: root.id,
    name: root.name,
    count: countsById.get(root.id) ?? 0,
  }));

  const deletingHasChildren =
    Boolean(deletingCategory) &&
    tree.some((root) => root.id === deletingCategory.id && root.children.length > 0);

  return (
    <div className="flex min-w-0 flex-col gap-5">
      <Seo title="Categories" description="Zeedara admin category tree." noindex />

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-[24px] font-bold text-[#262626]">Categories</h1>
          <p className="text-[12px] font-medium text-[#828a9b]">
            {topLevelCount} top-level categor{topLevelCount === 1 ? "y" : "ies"} ·{" "}
            {subCount} subcategor{subCount === 1 ? "y" : "ies"} · {totalProducts} products
          </p>
        </div>

        <button
          type="button"
          onClick={openCreate}
          className="flex cursor-pointer items-center gap-2 bg-(--primary-color) px-4 py-2.5 text-[14px] font-bold text-white transition-opacity hover:opacity-90"
        >
          <Plus className="size-[17px]" strokeWidth={2.5} />
          Add category
        </button>
      </div>

      {(error || actionError) && (
        <p className="bg-[#fae9e9] px-4 py-3 text-[13px] font-medium text-[#cf251f]">
          {error || actionError}
        </p>
      )}

      <div className="grid gap-5 lg:grid-cols-[1fr_331px]">
        {isLoading ? (
          <div className="border border-[#f0f1f3] bg-white px-4 py-16 text-center text-[14px] text-[#828a9b]">
            Loading categories…
          </div>
        ) : (
          <CategoryTree
            tree={tree}
            countsById={countsById}
            onReorderRoots={reorderRoots}
            onReorderChildren={reorderChildren}
            onEdit={openEdit}
            onViewProducts={viewProducts}
            onAddSubcategory={openAddSubcategory}
            onDelete={setDeletingCategory}
          />
        )}

        <div className="flex flex-col gap-5">
          <ProductsPerCategory categories={productsPerCategory} />
          <UncategorisedCheck
            uncategorisedCount={uncategorisedCount}
            emptyCategories={emptyCategories}
          />
        </div>
      </div>

      {modalState && (
        <CategoryFormModal
          category={modalState.category}
          parentOptions={parentOptions}
          defaultParentId={modalState.defaultParentId}
          onClose={closeModal}
          onSaved={reload}
        />
      )}

      {deletingCategory && (
        <DeleteCategoryDialog
          category={deletingCategory}
          hasChildren={deletingHasChildren}
          onCancel={() => setDeletingCategory(null)}
          onConfirm={confirmDelete}
        />
      )}
    </div>
  );
}

export default Categories;
