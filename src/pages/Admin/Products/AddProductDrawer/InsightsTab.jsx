import { Banknote, ShoppingCart, Star, Wallet } from "lucide-react";
import { Card, StatCard } from "./fields";
import { unitsTotal } from "./product";
import { formatCurrency } from "../../../../utils/formatCurrency";

// Nothing here can have happened yet — the product doesn't exist until Create
// Product is pressed — so the totals are fixed at zero and the panels below
// show what they'll show once it has a history.
function InsightsTab({ variants }) {
  const total = unitsTotal(variants);
  const busiest = variants.reduce(
    (max, variant) => Math.max(max, Number(variant.stock) || 0),
    0,
  );

  return (
    <div className="flex w-full flex-col gap-4">
      <div className="flex flex-col gap-4 sm:flex-row">
        <StatCard
          label="Units sold"
          value="0"
          icon={Wallet}
          iconBg="#fdeddf"
          iconColor="#b54708"
        />
        <StatCard
          label="Revenue"
          value={formatCurrency(0)}
          icon={Banknote}
          iconBg="#eefeec"
          iconColor="#0f9959"
        />
        <StatCard
          label="Orders"
          value="0"
          icon={ShoppingCart}
          iconBg="#eff8ff"
          iconColor="#1570ef"
        />
      </div>

      <Card title="Stock by variant">
        {variants.length === 0 ? (
          <p className="px-5 py-10 text-center text-[12px] font-medium text-[#828a9b]">
            Add variants to see how stock is spread across them.
          </p>
        ) : (
          <ul className="flex flex-col gap-3 px-5 py-4">
            {variants.map((variant, index) => {
              const stock = Number(variant.stock) || 0;
              return (
                <li key={variant.id} className="flex items-center gap-4">
                  <span className="w-[150px] shrink-0 truncate text-[12px] font-medium text-[#48505e]">
                    {variant.name || `Variant ${index + 1}`}
                  </span>
                  {/* Bars are scaled against the largest variant, not the
                      total — otherwise a wide matrix flattens them all. */}
                  <span className="h-2 min-w-0 flex-1 rounded-full bg-[#f0f1f3]">
                    <span
                      className="block h-full rounded-full bg-(--primary-color)"
                      style={{
                        width: busiest ? `${(stock / busiest) * 100}%` : "0%",
                      }}
                    />
                  </span>
                  <span className="w-[52px] shrink-0 text-right text-[12px] font-semibold text-[#48505e]">
                    {stock} u
                  </span>
                </li>
              );
            })}
          </ul>
        )}

        <div className="border-t border-[#f0f1f3] bg-[#fcfcfc] px-5 py-3">
          <p className="text-[12px] font-medium text-[#48505e]">
            {total} units total
          </p>
        </div>
      </Card>

      {/* The frame labels this card "Visibility" — it holds reviews, and there's
          already a Visibility card on the SEO tab, so it's named for what's in
          it. */}
      <Card
        title="Reviews"
        action={
          <span className="flex items-center gap-2">
            <span className="flex items-center gap-0.5" aria-hidden="true">
              {Array.from({ length: 5 }, (_, index) => (
                <Star key={index} className="size-3.5 text-[#dadde2]" />
              ))}
            </span>
            <span className="text-[12px] font-medium text-[#48505e]">
              0.0 (0)
            </span>
          </span>
        }
      >
        <p className="px-5 py-4 text-[12px] font-medium text-[#48505e]">
          No reviews for this product yet.
        </p>
      </Card>
    </div>
  );
}

export default InsightsTab;
