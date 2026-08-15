import { useEffect, useRef, useState } from "react";
import { Save, X } from "lucide-react";
import { useAdminAuth } from "../../../../context/AdminAuthContext.js";
import {
  createAdminProduct,
  deleteProductMedia,
  getAdminProduct,
  publishAdminProduct,
  updateAdminProduct,
  uploadProductMedia,
} from "../../../../api/admin/products";
import GeneralTab from "./GeneralTab";
import PricingTab from "./PricingTab";
import VariantsTab from "./VariantsTab";
import {
  buildCreatePayload,
  buildUpdatePayload,
  emptyProductForm,
  hasVisibleText,
  productToForm,
} from "./product";
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

// Only the three fields the design marks with an asterisk block submission —
// Base SKU is generated from the name (see GeneralTab), not user-required.
// SKU uniqueness itself is enforced server-side now — the server is what
// actually knows the whole catalogue, not whatever page of it happens to be
// loaded — so a duplicate surfaces as a submit-time error instead of inline.
function validate(form) {
  const errors = {};
  if (!form.name.trim()) errors.name = "Product name is required.";
  if (!form.category) errors.category = "Pick a category.";
  if (!hasVisibleText(form.description))
    errors.description = "Description is required.";
  return errors;
}

// `productId` is null to create, or the id of the row being edited — the
// drawer fetches its own full detail from GET /admin/products/{id} rather
// than being handed the table's summary row, which has no description, tags,
// images, or per-variant detail to prefill from.
function AddProductDrawer({ isOpen, productId, categories, onClose, onSaved }) {
  const { accessToken } = useAdminAuth();
  const [product, setProduct] = useState(null);
  const [form, setForm] = useState(emptyProductForm);
  const [tab, setTab] = useState(TABS[0]);
  const [errors, setErrors] = useState({});
  const [wasOpen, setWasOpen] = useState(isOpen);
  const [isLoadingProduct, setIsLoadingProduct] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  // Bumped each time the drawer opens, so the description editor (an
  // uncontrolled contentEditable) fully remounts and re-seeds instead of
  // carrying the previous session's content into a new one.
  const [formKey, setFormKey] = useState(0);
  const closeButtonRef = useRef(null);

  const isEdit = Boolean(productId);

  const change = (patch) => {
    setForm((previous) => ({ ...previous, ...patch }));
    // Stale the moment anything changes — a "fill in the required fields"
    // prompt (or a rejected SKU) shouldn't sit there once you've started
    // acting on it, ahead of the next submit attempt confirming it either way.
    setSubmitError("");
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

  // Cleared/fetched as it opens rather than as it closes, so nothing is torn
  // down while the panel is still sliding out. Adjusted during render instead
  // of in an effect — an effect here would render the stale form once before
  // resetting.
  if (isOpen !== wasOpen) {
    setWasOpen(isOpen);
    if (isOpen) {
      setTab(TABS[0]);
      setErrors({});
      setSubmitError("");
      setLoadError("");
      // Cleared even when opening to edit — otherwise the previous session's
      // form would flash on screen for a frame before the fetch below
      // replaces it. Marking it as loading right here, rather than waiting
      // for the effect, closes that same gap for the loading state itself.
      setProduct(null);
      setForm(emptyProductForm());
      setIsLoadingProduct(Boolean(productId));
      setFormKey((key) => key + 1);
    }
  }

  // Fetches the full record for an edit. Runs off `productId`/`accessToken`
  // rather than the render-time branch above, so it can be async — that
  // block already set the loading flag and cleared the previous error
  // synchronously, for the render this effect is reacting to.
  useEffect(() => {
    if (!isOpen || !productId || !accessToken) return undefined;

    let active = true;

    getAdminProduct(productId, accessToken)
      .then((fetched) => {
        if (!active) return;
        setProduct(fetched);
        setForm(productToForm(fetched));
      })
      .catch((error) => {
        if (active) setLoadError(error.message);
      })
      .finally(() => {
        if (active) setIsLoadingProduct(false);
      });

    return () => {
      active = false;
    };
  }, [isOpen, productId, accessToken]);

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

  // Media isn't sent as part of the product payload — it's synced separately
  // once the product itself has an id, by diffing against what the product
  // actually had on the server. `is_primary`/`display_order` come from the
  // image's position in the form's own array (position 0 is always the
  // primary thumbnail, per MediaTab's own copy) — reordering already-uploaded
  // images isn't wired up beyond that, since MediaTab has no drag control yet.
  const syncMedia = async (id) => {
    const originalIds = new Set((product?.media ?? []).map((item) => item.id));
    const currentPersistedIds = new Set(
      form.images.filter((image) => image.isPersisted).map((image) => image.id),
    );
    const toDelete = [...originalIds].filter((id_) => !currentPersistedIds.has(id_));

    await Promise.all([
      ...toDelete.map((mediaId) => deleteProductMedia(id, mediaId, accessToken)),
      ...form.images
        .map((image, index) => ({ image, index }))
        .filter(({ image }) => !image.isPersisted && image.file)
        .map(({ image, index }) =>
          uploadProductMedia(
            id,
            image.file,
            { isPrimary: index === 0, displayOrder: index },
            accessToken,
          ),
        ),
    ]);
  };

  const submit = async () => {
    const found = validate(form);
    setErrors(found);
    if (Object.keys(found).length > 0) {
      // Every required field lives on General, so that's where the prompt
      // sends you — a banner alone, with the tab left wherever it was,
      // would leave the actual fields to fill in off-screen.
      setTab(TABS[0]);
      setSubmitError("Please fill in the required fields before continuing.");
      return;
    }

    setIsSubmitting(true);
    setSubmitError("");

    try {
      let saved;
      if (isEdit) {
        const payload = buildUpdatePayload(form, { originalStatus: product?.status });
        saved = await updateAdminProduct(productId, payload, accessToken);
      } else {
        // Created products always start as a draft — the create endpoint has
        // no status field — so publishing is a second call, made only when
        // the toggle asks for it.
        saved = await createAdminProduct(buildCreatePayload(form), accessToken);
        if (form.isPublished) saved = await publishAdminProduct(saved.id, accessToken);
      }
      await syncMedia(saved?.id ?? productId);
      onSaved();
      onClose();
    } catch (error) {
      // The generated SKU collided — the field itself is no longer
      // user-editable, so the fix is changing the name, not the SKU
      // directly. Surfaced as a banner rather than a field error for
      // exactly that reason.
      if (/sku/i.test(error.message)) {
        setTab(TABS[0]);
        setSubmitError(
          `${error.message} Try adjusting the product name to generate a different one.`,
        );
      } else {
        setSubmitError(error.message);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const panels = {
    General: (
      <GeneralTab
        form={form}
        errors={errors}
        onChange={change}
        categories={categories}
        isEditing={isEdit}
        formKey={formKey}
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
        aria-label={isEdit ? "Edit product" : "Add product"}
        className={`absolute inset-y-0 right-0 flex w-full flex-col bg-white shadow-[0px_24px_24px_rgba(16,24,40,0.18)] transition-transform duration-300 ease-out lg:w-[calc(100%-287px)] ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex shrink-0 items-start gap-3.5 px-6 py-5">
          <div className="flex min-w-0 flex-1 flex-col">
            <p className="text-[14px] font-semibold text-black">
              {isEdit ? "Edit product" : "Add product"}
            </p>
            <p className="pt-[3px] text-[12px] font-medium text-[#828a9b]">
              {isEdit ? "Update this catalogue item" : "Create a new catalogue item"}
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

        {isLoadingProduct ? (
          <div className="flex flex-1 items-center justify-center">
            <p className="text-[13px] font-medium text-[#828a9b]">
              Loading product…
            </p>
          </div>
        ) : loadError ? (
          <div className="flex flex-1 items-center justify-center px-6 text-center">
            <p className="text-[13px] font-medium text-[#cf251f]">{loadError}</p>
          </div>
        ) : (
          <>
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
          </>
        )}

        <div className="flex shrink-0 flex-col gap-2.5 border-t-[0.667px] border-[#f0f1f3] bg-[#fcfcfc] px-[22px] py-4">
          {submitError && (
            <p className="text-[12px] font-medium text-[#cf251f]">
              {submitError}
            </p>
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
              disabled={isSubmitting || isLoadingProduct}
              className="flex h-10 cursor-pointer items-center justify-center gap-2 rounded-[2px] bg-(--primary-color) px-3 text-[14px] font-semibold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Save className="size-5" strokeWidth={2} />
              {isSubmitting
                ? "Saving…"
                : isEdit
                  ? "Save changes"
                  : "Create Product"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AddProductDrawer;
