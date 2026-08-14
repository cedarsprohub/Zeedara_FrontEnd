import { useEffect, useRef, useState } from "react";
import { Save, X } from "lucide-react";
import GeneralTab from "./GeneralTab";
import PricingTab from "./PricingTab";
import VariantsTab from "./VariantsTab";
import { productToForm, toAmount, unitsTotal } from "./product";
import MediaTab from "./MediaTab";
import SeoTab from "./SeoTab";
import InsightsTab from "./InsightsTab";

const TABS = [
  "General",
  "Pricing",
  "Variants",
  "Media",
  "SEO & visibility",
  "Insights",
];

// Only the four fields the design marks with an asterisk block submission.
// `currentSku` excludes the product being edited from its own duplicate
// check — without it, saving an edit without touching the SKU field would
// flag the row against itself.
function validate(form, existingSkus, currentSku) {
  const errors = {};
  if (!form.name.trim()) errors.name = "Product name is required.";
  if (!form.sku.trim()) errors.sku = "Base SKU is required.";
  else if (form.sku.trim() !== currentSku && existingSkus.includes(form.sku.trim()))
    errors.sku = `SKU ${form.sku.trim()} already exists.`;
  if (!form.category) errors.category = "Pick a category.";
  if (!form.description.trim()) errors.description = "Description is required.";
  return errors;
}

// `product` is null to create, or the catalogue row being edited. Passing a
// single `onSubmit` rather than separate create/update callbacks keeps the
// distinction where it belongs — with the caller, which already knows which
// one it opened the drawer for.
function AddProductDrawer({ isOpen, product, categories, existingSkus, onClose, onSubmit }) {
  const [form, setForm] = useState(() => productToForm(product));
  const [tab, setTab] = useState(TABS[0]);
  const [errors, setErrors] = useState({});
  const [wasOpen, setWasOpen] = useState(isOpen);
  const closeButtonRef = useRef(null);

  const change = (patch) => {
    setForm((previous) => ({ ...previous, ...patch }));
    // A field stops being wrong the moment it's edited, so its message goes
    // then rather than waiting for the next attempt at Create.
    setErrors((previous) => {
      const keys = Object.keys(patch).filter((key) => key in previous);
      if (keys.length === 0) return previous;
      const next = { ...previous };
      keys.forEach((key) => delete next[key]);
      return next;
    });
  };

  // Cleared as it opens rather than as it closes, so nothing is torn down while
  // the panel is still sliding out. Adjusted during render instead of in an
  // effect — an effect here would render the stale form once before resetting.
  if (isOpen !== wasOpen) {
    setWasOpen(isOpen);
    if (isOpen) {
      setForm(productToForm(product));
      setTab(TABS[0]);
      setErrors({});
    }
  }

  useEffect(() => {
    if (isOpen) closeButtonRef.current?.focus();
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return undefined;

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
  }, [isOpen, onClose]);

  const submit = () => {
    const found = validate(form, existingSkus, product?.sku);
    setErrors(found);
    if (Object.keys(found).length > 0) {
      // Every required field lives on General, so that's where the messages are.
      setTab(TABS[0]);
      return;
    }

    // toAmount reports "nothing entered" as null; the table needs a number.
    const price = toAmount(form.price) ?? 0;
    const compareAt = toAmount(form.compareAt);
    // The catalogue never carried per-variant rows to begin with, so an edit
    // that never opens the Variants tab has nothing to recompute from — stock
    // and the variant count fall back to the row's existing figures instead
    // of collapsing to 0/1.
    const touchedVariants = form.variants.length > 0;
    onSubmit({
      sku: form.sku.trim(),
      name: form.name.trim(),
      category: form.category,
      price,
      // Only a compare-at above the selling price is a real "was" price.
      compareAt: compareAt !== null && compareAt > price ? compareAt : null,
      stock: touchedVariants ? unitsTotal(form.variants) : product?.stock ?? 0,
      sold: product?.sold ?? 0,
      variants: touchedVariants ? Math.max(1, form.variants.length) : product?.variants ?? 1,
      // The toggle is binary, so an archived row keeps that status unless
      // explicitly republished — otherwise every edit would quietly restore it.
      status: form.isPublished
        ? "Active"
        : product?.status === "Archived"
          ? "Archived"
          : "Draft",
    });
  };

  const panels = {
    General: (
      <GeneralTab
        form={form}
        errors={errors}
        onChange={change}
        categories={categories}
      />
    ),
    Pricing: <PricingTab form={form} onChange={change} />,
    Variants: (
      <VariantsTab
        variants={form.variants}
        onChange={(variants) => change({ variants })}
      />
    ),
    Media: (
      <MediaTab images={form.images} onChange={(images) => change({ images })} />
    ),
    "SEO & visibility": <SeoTab form={form} onChange={change} />,
    Insights: <InsightsTab variants={form.variants} />,
  };

  return (
    // Kept mounted so the panel has somewhere to slide from — rendered only
    // while open, it would appear already in place with no transition to run.
    <div
      className={`fixed inset-0 z-50 transition-opacity duration-300 ${
        isOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
      }`}
      aria-hidden={isOpen ? undefined : "true"}
    >
      <div
        onClick={onClose}
        aria-hidden="true"
        className="absolute inset-0 bg-black/30"
      />

      {/* Sits to the right of the sidebar at lg and above, matching the frames;
          below that the sidebar is an overlay drawer, so this takes the width. */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label={product ? "Edit product" : "Add product"}
        className={`absolute inset-y-0 right-0 flex w-full flex-col bg-white shadow-[0px_24px_24px_rgba(16,24,40,0.18)] transition-transform duration-300 ease-out lg:w-[calc(100%-287px)] ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex shrink-0 items-start gap-3.5 px-6 py-5">
          <div className="flex min-w-0 flex-1 flex-col">
            <p className="text-[14px] font-semibold text-black">
              {product ? "Edit product" : "Add product"}
            </p>
            <p className="pt-[3px] text-[12px] font-medium text-[#828a9b]">
              {product ? "Update this catalogue item" : "Create a new catalogue item"}
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

        {/* The strip stays put while the panel below it scrolls — it's how you
            move between tabs, so scrolling it away would strand you. shrink-0
            because a column flex item shrinks to nothing once the panel
            overflows, which collapses the strip to its bottom border. */}
        <div className="shrink-0 px-6">
          <div
            role="tablist"
            aria-label="Product details"
            className="flex items-end overflow-x-auto border-b-[0.667px] border-[#eaecf0]"
          >
            {TABS.map((name) => {
              const isActive = name === tab;
              return (
                <button
                  key={name}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => setTab(name)}
                  className={`flex cursor-pointer items-center justify-center gap-2 border-b-2 px-[15px] py-2 text-[12px] font-semibold whitespace-nowrap transition-colors ${
                    isActive
                      ? "border-(--primary-color) text-(--primary-color)"
                      : "border-transparent text-[#667085] hover:text-[#262626]"
                  }`}
                >
                  {name}
                  {name === "Variants" && (
                    <span className="flex size-[18px] items-center justify-center rounded-full bg-[#f0f1f3] text-[12px] font-semibold text-[#575f71]">
                      {form.variants.length}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-4">
          {panels[tab]}
        </div>

        <div className="flex shrink-0 flex-wrap items-center justify-end gap-2.5 border-t-[0.667px] border-[#f0f1f3] bg-[#fcfcfc] px-[22px] py-4">
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
            className="flex h-10 cursor-pointer items-center justify-center gap-2 rounded-[2px] bg-(--primary-color) px-3 text-[14px] font-semibold text-white transition-opacity hover:opacity-90"
          >
            <Save className="size-5" strokeWidth={2} />
            {product ? "Save changes" : "Create Product"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default AddProductDrawer;
