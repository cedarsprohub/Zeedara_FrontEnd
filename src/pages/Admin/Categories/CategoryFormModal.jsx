import { useEffect, useRef, useState } from "react";
import { Layers, X } from "lucide-react";
import { useAdminAuth } from "../../../context/AdminAuthContext.js";
import {
  createAdminCategory,
  updateAdminCategory,
} from "../../../api/admin/categories";
import { Field, SelectInput, TextArea, TextInput } from "../Products/AddProductDrawer/fields";
import {
  buildCategoryPayload,
  categoryToForm,
  emptyCategoryForm,
  slugify,
} from "./category";

// Add/edit category. One small centred modal rather than a slide-in drawer —
// a category only ever carries a name, description and parent, nowhere near
// the tabbed product form's surface area.
function CategoryFormModal({ category, parentOptions, defaultParentId, onClose, onSaved }) {
  const { accessToken } = useAdminAuth();
  const isEdit = Boolean(category);
  const [form, setForm] = useState(() =>
    isEdit ? categoryToForm(category) : emptyCategoryForm(defaultParentId),
  );
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const closeButtonRef = useRef(null);

  useEffect(() => {
    closeButtonRef.current?.focus();
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const handleKeyDown = (event) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  const change = (patch) => {
    setForm((previous) => ({ ...previous, ...patch }));
    setSubmitError("");
    setErrors((previous) => {
      const keys = Object.keys(patch).filter((key) => key in previous);
      if (keys.length === 0) return previous;
      const next = { ...previous };
      keys.forEach((key) => delete next[key]);
      return next;
    });
  };

  const submit = async () => {
    const found = {};
    if (!form.name.trim()) found.name = "Category name is required.";
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    setIsSubmitting(true);
    setSubmitError("");
    try {
      const payload = buildCategoryPayload(form);
      if (isEdit) await updateAdminCategory(category.id, payload, accessToken);
      else await createAdminCategory(payload, accessToken);
      onSaved();
      onClose();
    } catch (error) {
      setSubmitError(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const slug = slugify(form.name);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="category-form-title"
        onClick={(event) => event.stopPropagation()}
        className="flex w-full max-w-[680px] flex-col overflow-hidden rounded-[4px] bg-white shadow-[0px_24px_24px_rgba(16,24,40,0.18)]"
      >
        <div className="flex items-start gap-3.5 px-6 py-5">
          <span className="flex size-[42px] shrink-0 items-center justify-center rounded-[4px] bg-[#faf4eb]">
            <Layers
              className="size-[21px] text-(--primary-color)"
              strokeWidth={1.75}
              aria-hidden="true"
            />
          </span>
          <div className="flex min-w-0 flex-1 flex-col">
            <p id="category-form-title" className="text-[14px] font-semibold text-black">
              {isEdit ? "Edit category" : "Add category"}
            </p>
            <p className="pt-[3px] text-[12px] font-medium text-[#828a9b]">
              {isEdit ? "Update this category's details" : "Create a new browsable group"}
            </p>
          </div>
          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="flex size-[38px] shrink-0 cursor-pointer items-center justify-center rounded-lg text-[#48505e] transition-colors hover:bg-[#f9fafb] hover:text-black"
          >
            <X className="size-5" strokeWidth={2} />
          </button>
        </div>

        <div className="flex flex-col gap-4 px-6 py-5">
          <div className="flex flex-col gap-4 sm:flex-row">
            <Field label="Category name" required htmlFor="category-name" error={errors.name}>
              <TextInput
                id="category-name"
                value={form.name}
                invalid={Boolean(errors.name)}
                onChange={(event) => change({ name: event.target.value })}
                placeholder="e.g. Frontal Wigs"
              />
            </Field>

            <Field label="URL" htmlFor="category-url" hint={`zeedara.com/${slug || "…"}`}>
              {/* Derived, not entered — disabled rather than hidden, so the shape
                  of the URL is visible while the name is being typed. Same
                  treatment as a product's URL field on the General tab. */}
              <TextInput
                id="category-url"
                value={slug}
                disabled
                placeholder="Auto-generated from the name"
              />
            </Field>
          </div>

          <Field label="Parent category" htmlFor="category-parent">
            <SelectInput
              id="category-parent"
              value={form.parentId}
              onChange={(event) => change({ parentId: event.target.value })}
              options={parentOptions}
            />
          </Field>

          <Field label="Description" htmlFor="category-description">
            <TextArea
              id="category-description"
              rows={4}
              value={form.description}
              onChange={(event) => change({ description: event.target.value })}
              placeholder="Shown on the category page."
            />
          </Field>
        </div>

        <div className="flex flex-col gap-2.5 border-t-[0.667px] border-[#f0f1f3] bg-[#fcfcfc] px-[22px] py-4">
          {submitError && (
            <p className="text-[12px] font-medium text-[#cf251f]">{submitError}</p>
          )}
          <div className="flex flex-wrap items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="flex h-10 cursor-pointer items-center justify-center rounded-[2px] border border-[#dadde2] bg-white px-3 text-[14px] font-semibold text-[#48505e] transition-colors hover:border-[#9fa5b2] hover:text-black"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={submit}
              disabled={isSubmitting}
              className="flex h-10 cursor-pointer items-center justify-center rounded-[2px] bg-(--primary-color) px-3 text-[14px] font-semibold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? "Saving…" : isEdit ? "Save changes" : "Create category"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CategoryFormModal;
