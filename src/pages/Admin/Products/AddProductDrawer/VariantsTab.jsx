import { useState } from "react";
import { Info, Layers, Plus, Trash2 } from "lucide-react";
import { Card, InfoBanner } from "./fields";
import { describeVariant, isPersistedVariantId, unitsTotal } from "./product";
import VariantModal from "./VariantModal";

const CELL_CLASS =
  "w-full border border-[#dadde2] bg-white px-3 py-2 text-[12px] font-medium text-black placeholder:text-[#9fa5b2] focus:border-(--primary-color) focus:outline-none";

const DISABLED_CELL_CLASS =
  "w-full border border-[#dadde2] bg-[#f0f1f3] px-3 py-2 text-[12px] font-medium text-[#9fa5b2]";

const GRID_COLUMNS =
  "grid-cols-[minmax(0,2.5fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_44px]";

function blankVariant(id) {
  return {
    id,
    length: "",
    texture: "",
    color: null,
    laceType: "",
    capSize: "",
    density: "",
    sizeShade: "",
    sku: "",
    price: "",
    stock: "",
    reorderPoint: "",
  };
}

function VariantsTab({ variants, onChange }) {
  // null when the modal is closed; otherwise which row it's editing and
  // whether that row is new or already in the matrix.
  const [editing, setEditing] = useState(null);

  const update = (id, patch) =>
    onChange(
      variants.map((variant) =>
        variant.id === id ? { ...variant, ...patch } : variant,
      ),
    );

  // Only counts locally-added rows — a persisted variant's id is the
  // server's uuid string, not a number, and would poison Math.max if it were
  // mixed into this reduction.
  const nextLocalId = () =>
    variants.reduce(
      (max, variant) =>
        isPersistedVariantId(variant.id) ? max : Math.max(max, variant.id),
      0,
    ) + 1;

  const openAdd = () =>
    setEditing({ mode: "add", variant: blankVariant(nextLocalId()) });

  const openEdit = (variant) => setEditing({ mode: "edit", variant });

  const saveVariant = (draft) => {
    const exists = variants.some((variant) => variant.id === draft.id);
    onChange(
      exists
        ? variants.map((variant) => (variant.id === draft.id ? draft : variant))
        : [...variants, draft],
    );
    setEditing(null);
  };

  // Copies the first row's figure down the column. Filling from a row that's
  // already on screen keeps this to one click, where a prompt would put the
  // value somewhere the user can't see it against the rest of the matrix.
  const setAll = (key) => {
    const [first] = variants;
    if (!first) return;
    onChange(variants.map((variant) => ({ ...variant, [key]: first[key] })));
  };

  return (
    <div className="flex w-full flex-col gap-4">
      <InfoBanner tone="amber" icon={Info} title="Variants drive stock and pricing">
        Each combination of length, colour, texture and cap size is stocked
        separately. Generate a matrix or add rows by hand.
      </InfoBanner>

      <Card
        title="Variant matrix"
        action={
          <button
            type="button"
            onClick={openAdd}
            className="flex h-10 cursor-pointer items-center gap-2 bg-(--primary-color) px-3 text-[14px] font-semibold text-white transition-opacity hover:opacity-90"
          >
            <Plus className="size-5" strokeWidth={2} />
            Add variant
          </button>
        }
      >
        {variants.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-1 px-5 py-16 text-center">
            <span className="mb-2 flex size-12 items-center justify-center rounded-full bg-[#f2f4f7]">
              <Layers
                className="size-5 text-[#667085]"
                strokeWidth={2}
                aria-hidden="true"
              />
            </span>
            <p className="text-[14px] font-semibold text-black">
              No variants yet
            </p>
            <p className="text-[12px] font-medium text-[#828a9b]">
              Add a variant or generate a matrix from lengths and colours.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-2 p-4">
            <div
              className={`grid ${GRID_COLUMNS} gap-2 bg-[#fcfcfc] px-3 py-2 text-[12px] font-semibold text-[#667085]`}
            >
              <span>Variant</span>
              <span>SKU</span>
              <span>Price</span>
              <span>Stock</span>
              <span />
            </div>

            <ul className="flex flex-col gap-2">
              {variants.map((variant) => {
                const { title, subtitle } = describeVariant(variant);
                return (
                  <li
                    key={variant.id}
                    className={`grid ${GRID_COLUMNS} items-center gap-2 border border-[#dadde2] p-2`}
                  >
                    <button
                      type="button"
                      onClick={() => openEdit(variant)}
                      className="flex min-w-0 cursor-pointer items-center gap-2 text-left"
                    >
                      {variant.color && (
                        <span
                          aria-hidden="true"
                          style={{ backgroundColor: variant.color.hex }}
                          className="size-4 shrink-0 border border-black/10"
                        />
                      )}
                      <span className="flex min-w-0 flex-col">
                        <span className="truncate text-[12px] font-semibold text-black">
                          {title}
                        </span>
                        {subtitle && (
                          <span className="truncate text-[12px] font-medium text-[#828a9b]">
                            {subtitle}
                          </span>
                        )}
                      </span>
                    </button>

                    {/* Server-generated, like a product's own base SKU — shown
                        for reference once assigned, never typed here. */}
                    <input
                      type="text"
                      value={variant.sku}
                      disabled
                      placeholder="Auto-generated on save"
                      className={DISABLED_CELL_CLASS}
                    />
                    <input
                      type="text"
                      inputMode="decimal"
                      value={variant.price}
                      onChange={(event) =>
                        update(variant.id, { price: event.target.value })
                      }
                      placeholder="0"
                      className={CELL_CLASS}
                    />
                    <input
                      type="text"
                      inputMode="numeric"
                      value={variant.stock}
                      onChange={(event) =>
                        update(variant.id, { stock: event.target.value })
                      }
                      placeholder="0"
                      className={`${CELL_CLASS} text-right`}
                    />

                    <button
                      type="button"
                      onClick={() =>
                        onChange(variants.filter((row) => row.id !== variant.id))
                      }
                      aria-label={`Remove ${title}`}
                      className="flex size-9 cursor-pointer items-center justify-center bg-[#fae9e9] text-[#cf251f] transition-opacity hover:opacity-80"
                    >
                      <Trash2 className="size-4" strokeWidth={2} />
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        )}

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#f0f1f3] bg-[#fcfcfc] px-5 py-3.5">
          <p className="text-[12px] font-medium text-[#48505e]">
            {variants.length} variant{variants.length === 1 ? "" : "(s)"} ·{" "}
            {unitsTotal(variants)} units total
          </p>
          <div className="flex items-center gap-5">
            {[
              { key: "stock", label: "Set all stock" },
              { key: "price", label: "Set all prices" },
            ].map(({ key, label }) => (
              <button
                key={key}
                type="button"
                onClick={() => setAll(key)}
                disabled={variants.length < 2}
                title="Copies the first variant's value to the rest"
                className="cursor-pointer text-[12px] font-semibold text-[#48505e] transition-colors hover:text-black disabled:cursor-not-allowed disabled:opacity-40"
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {editing && (
        <VariantModal
          key={editing.variant.id}
          mode={editing.mode}
          variant={editing.variant}
          onCancel={() => setEditing(null)}
          onSave={saveVariant}
        />
      )}
    </div>
  );
}

export default VariantsTab;
