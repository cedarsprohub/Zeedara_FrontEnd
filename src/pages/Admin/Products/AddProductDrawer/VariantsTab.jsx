import { Info, Layers, Plus, Trash2 } from "lucide-react";
import { Card, InfoBanner } from "./fields";
import { unitsTotal } from "./product";

const CELL_CLASS =
  "w-full border border-[#dadde2] bg-white px-3 py-2 text-[12px] font-medium text-black placeholder:text-[#9fa5b2] focus:border-(--primary-color) focus:outline-none";

function VariantsTab({ variants, onChange }) {
  const update = (id, patch) =>
    onChange(
      variants.map((variant) =>
        variant.id === id ? { ...variant, ...patch } : variant,
      ),
    );

  const add = () =>
    onChange([
      ...variants,
      // Ids come off a counter rather than Date.now(), so two rows added in the
      // same tick can't collide on a key.
      {
        id: variants.reduce((max, variant) => Math.max(max, variant.id), 0) + 1,
        name: "",
        stock: "",
        price: "",
      },
    ]);

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
            onClick={add}
            className="flex h-9 cursor-pointer items-center gap-2 bg-(--primary-color) px-3 text-[14px] font-semibold text-white transition-opacity hover:opacity-90"
          >
            <Plus className="size-4" strokeWidth={2.5} />
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
          // The populated matrix isn't in the Figma frames — this is the
          // smallest shape that makes the footer totals and the two "set all"
          // actions mean something.
          <ul className="flex flex-col">
            {variants.map((variant) => (
              <li
                key={variant.id}
                className="flex flex-wrap items-end gap-3 border-b border-[#f0f1f3] px-5 py-3 last:border-0"
              >
                <label className="min-w-0 flex-1">
                  <span className="mb-1 block text-[12px] font-semibold text-[#48505e]">
                    Variant
                  </span>
                  <input
                    type="text"
                    value={variant.name}
                    onChange={(event) =>
                      update(variant.id, { name: event.target.value })
                    }
                    placeholder='e.g. 20" Natural Black 1B'
                    className={CELL_CLASS}
                  />
                </label>
                <label className="w-[100px]">
                  <span className="mb-1 block text-[12px] font-semibold text-[#48505e]">
                    Stock
                  </span>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={variant.stock}
                    onChange={(event) =>
                      update(variant.id, { stock: event.target.value })
                    }
                    placeholder="0"
                    className={CELL_CLASS}
                  />
                </label>
                <label className="w-[120px]">
                  <span className="mb-1 block text-[12px] font-semibold text-[#48505e]">
                    Price
                  </span>
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
                </label>
                <button
                  type="button"
                  onClick={() =>
                    onChange(variants.filter((row) => row.id !== variant.id))
                  }
                  aria-label={`Remove variant ${variant.name || variant.id}`}
                  className="flex size-9 cursor-pointer items-center justify-center bg-[#fae9e9] text-[#cf251f] transition-opacity hover:opacity-80"
                >
                  <Trash2 className="size-4" strokeWidth={2} />
                </button>
              </li>
            ))}
          </ul>
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
    </div>
  );
}

export default VariantsTab;
