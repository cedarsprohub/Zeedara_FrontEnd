import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Layers, X } from "lucide-react";
import { CurrencyInput, Field, SelectInput, TextInput } from "./fields";
import {
  VARIANT_CAP_SIZES,
  VARIANT_COLORS,
  VARIANT_DENSITIES,
  VARIANT_LACE_TYPES,
  VARIANT_LENGTHS,
  VARIANT_TEXTURES,
} from "../data";

// The floating editor behind both "Add variant" and clicking a variant's name
// in the matrix — same fields either way, just seeded with a blank row or the
// row being edited. Mounted with `key={variant.id}` by the caller, so a fresh
// draft is what re-renders it rather than an effect syncing props to state.
function VariantModal({ mode, variant, onCancel, onSave }) {
  const [draft, setDraft] = useState(variant);
  const isEdit = mode === "edit";

  const patch = (fields) => setDraft((previous) => ({ ...previous, ...fields }));

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape") onCancel();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onCancel]);

  // Portalled to the body — nesting a second role="dialog" inside the drawer's
  // own dialog element hides this one from the accessibility tree, since the
  // drawer's aria-modal treats its subtree as a single modal.
  return createPortal(
    <div className="fixed inset-0 z-[60] flex items-center justify-center px-4 py-8">
      <div
        onClick={onCancel}
        aria-hidden="true"
        className="absolute inset-0 bg-black/30"
      />
      <div
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={isEdit ? "Edit variant" : "Add variant"}
        className="relative flex max-h-full w-full max-w-[680px] flex-col overflow-hidden bg-white shadow-[0px_24px_24px_rgba(16,24,40,0.18)]"
      >
        <div className="flex shrink-0 items-start gap-3.5 px-6 py-5">
          <span className="flex size-[42px] shrink-0 items-center justify-center bg-[#faf4eb]">
            <Layers
              className="size-[21px] text-(--primary-color)"
              strokeWidth={2}
              aria-hidden="true"
            />
          </span>
          <div className="flex min-w-0 flex-1 flex-col">
            <p className="text-[14px] font-semibold text-black">
              {isEdit ? "Edit variant" : "Add variant"}
            </p>
            <p className="pt-[3px] text-[12px] font-medium text-[#828a9b]">
              {isEdit
                ? draft.sku || "Untitled variant"
                : "Define a new stock-and-price combination"}
            </p>
          </div>
          <button
            type="button"
            onClick={onCancel}
            aria-label="Close"
            className="flex size-[38px] shrink-0 cursor-pointer items-center justify-center rounded-lg text-[#48505e] transition-colors hover:bg-[#f9fafb] hover:text-black"
          >
            <X className="size-5" strokeWidth={2} />
          </button>
        </div>

        <div className="flex min-h-0 flex-col gap-4 overflow-y-auto px-6 py-5">
          <div className="flex flex-col gap-4 sm:flex-row">
            <Field label="Length" htmlFor="variant-length">
              <SelectInput
                id="variant-length"
                value={draft.length}
                onChange={(event) => patch({ length: event.target.value })}
                placeholder="Select length"
                options={VARIANT_LENGTHS}
              />
            </Field>
            <Field label="Texture" htmlFor="variant-texture">
              <SelectInput
                id="variant-texture"
                value={draft.texture}
                onChange={(event) => patch({ texture: event.target.value })}
                placeholder="Select texture"
                options={VARIANT_TEXTURES}
              />
            </Field>
          </div>

          <Field label="Color">
            <div className="flex flex-wrap gap-2">
              {VARIANT_COLORS.map((swatch) => {
                const isSelected = draft.color?.hex === swatch.hex;
                return (
                  <button
                    key={swatch.hex}
                    type="button"
                    onClick={() => patch({ color: swatch })}
                    aria-pressed={isSelected}
                    aria-label={swatch.name}
                    title={swatch.name}
                    style={{ backgroundColor: swatch.hex }}
                    className={`size-7 shrink-0 cursor-pointer border-2 transition-colors ${
                      isSelected ? "border-[#bdc2cb]" : "border-[#faf4eb]"
                    }`}
                  />
                );
              })}
            </div>
          </Field>

          <div className="flex flex-col gap-4 sm:flex-row">
            <Field label="Lace type" htmlFor="variant-lace-type">
              <SelectInput
                id="variant-lace-type"
                value={draft.laceType}
                onChange={(event) => patch({ laceType: event.target.value })}
                placeholder="Select lace type"
                options={VARIANT_LACE_TYPES}
              />
            </Field>
            <Field label="Cap size" htmlFor="variant-cap-size">
              <SelectInput
                id="variant-cap-size"
                value={draft.capSize}
                onChange={(event) => patch({ capSize: event.target.value })}
                placeholder="Select cap size"
                options={VARIANT_CAP_SIZES}
              />
            </Field>
            <Field label="Density" htmlFor="variant-density">
              <SelectInput
                id="variant-density"
                value={draft.density}
                onChange={(event) => patch({ density: event.target.value })}
                placeholder="Select density"
                options={VARIANT_DENSITIES}
              />
            </Field>
          </div>

          <div className="flex flex-col gap-4 sm:flex-row">
            <Field label="Size / shade" htmlFor="variant-size-shade">
              <TextInput
                id="variant-size-shade"
                value={draft.sizeShade}
                onChange={(event) => patch({ sizeShade: event.target.value })}
                placeholder="e.g. 100ml, Medium"
              />
            </Field>
            <Field label="Base SKU" htmlFor="variant-sku" hint="Assigned by the server once saved">
              <TextInput
                id="variant-sku"
                value={draft.sku}
                disabled
                placeholder="Auto-generated on save"
              />
            </Field>
            <Field label="Price" htmlFor="variant-price">
              <CurrencyInput
                id="variant-price"
                value={draft.price}
                onChange={(event) => patch({ price: event.target.value })}
                placeholder="0"
              />
            </Field>
          </div>

          <div className="flex flex-col gap-4 sm:flex-row">
            <Field label="Stock on hand" htmlFor="variant-stock">
              <TextInput
                id="variant-stock"
                inputMode="numeric"
                value={draft.stock}
                onChange={(event) => patch({ stock: event.target.value })}
                placeholder="0"
              />
            </Field>
            <Field
              label="Reorder point"
              htmlFor="variant-reorder-point"
              hint="Triggers a low-stock alert at or below this level"
            >
              <TextInput
                id="variant-reorder-point"
                inputMode="numeric"
                value={draft.reorderPoint}
                onChange={(event) => patch({ reorderPoint: event.target.value })}
                placeholder="e.g. 5"
              />
            </Field>
          </div>
        </div>

        <div className="flex shrink-0 items-center justify-end gap-2.5 border-t border-[#f0f1f3] bg-[#fcfcfc] px-[22px] py-4">
          <button
            type="button"
            onClick={onCancel}
            className="flex h-10 cursor-pointer items-center justify-center border border-[#dadde2] bg-white px-3 text-[14px] font-semibold text-[#48505e] transition-colors hover:border-[#9fa5b2] hover:text-black"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => onSave(draft)}
            className="flex h-10 cursor-pointer items-center justify-center bg-(--primary-color) px-3 text-[14px] font-semibold text-white transition-opacity hover:opacity-90"
          >
            {isEdit ? "Save variant" : "Add variant"}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}

export default VariantModal;
