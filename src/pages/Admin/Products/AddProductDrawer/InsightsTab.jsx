import { Banknote, ShoppingCart, Star, Wallet } from "lucide-react";
import { Card } from "./fields";
import { describeVariant } from "./product";
import { formatCurrency } from "../../../../utils/formatCurrency";

// Sized and coloured to the Figma frame directly rather than through the
// shared StatCard — that component's type is smaller and used by Pricing's
// margin figures, which weren't part of this pass.
function MetricTile({ label, value, icon: Icon, iconBg, iconColor }) {
  return (
    <div className="flex h-[121px] flex-1 flex-col justify-between border border-[#f0f1f3] bg-white p-[17px]">
      <div className="flex items-start justify-between gap-3">
        <p className="text-[14px] font-medium text-[#667085]">{label}</p>
        <span
          className="flex size-9 shrink-0 items-center justify-center"
          style={{ backgroundColor: iconBg }}
        >
          <Icon
            className="size-6"
            strokeWidth={2}
            style={{ color: iconColor }}
            aria-hidden="true"
          />
        </span>
      </div>
      <p className="text-[24px] font-bold text-[#262626]">{value}</p>
    </div>
  );
}

// Nothing here can have happened yet — the product doesn't exist until Create
// Product is pressed — so the totals are fixed at zero and the panels below
// show what they'll show once it has a history.
function InsightsTab({ variants }) {
  const busiest = variants.reduce(
    (max, variant) => Math.max(max, Number(variant.stock) || 0),
    0,
  );

  return (
    <div className="flex w-full flex-col gap-8">
      <div className="flex flex-col gap-4 sm:flex-row">
        <MetricTile
          label="Units sold"
          value="0"
          icon={Wallet}
          iconBg="rgba(255,105,0,0.1)"
          iconColor="#ff6900"
        />
        <MetricTile
          label="Revenue"
          value={formatCurrency(0)}
          icon={Banknote}
          iconBg="#ecfdf3"
          iconColor="#0f9959"
        />
        <MetricTile
          label="Orders"
          value="0"
          icon={ShoppingCart}
          iconBg="rgba(43,127,255,0.1)"
          iconColor="#2b7fff"
        />
      </div>

      <Card title="Stock by variant">
        {variants.length === 0 ? (
          <p className="px-4 py-6 text-center text-[12px] font-medium text-[#828a9b]">
            Add variants to see how stock is spread across them.
          </p>
        ) : (
          <ul className="flex flex-col px-[16px] py-[24px]">
            {variants.map((variant) => {
              const stock = Number(variant.stock) || 0;
              const { title } = describeVariant(variant);
              return (
                <li key={variant.id} className="flex items-center gap-4 py-1.5">
                  <span className="w-[160px] shrink-0 truncate text-[12px] font-semibold text-[#667085]">
                    {title}
                  </span>
                  {/* Bars are scaled against the largest variant, not the
                      total — otherwise a wide matrix flattens them all. */}
                  <span className="h-[7px] min-w-0 flex-1 rounded-full bg-[#f5f5f5]">
                    <span
                      className="block h-full rounded-full bg-(--primary-color)"
                      style={{
                        width: busiest ? `${(stock / busiest) * 100}%` : "0%",
                      }}
                    />
                  </span>
                  <span className="min-w-[56px] shrink-0 text-right text-[12px] font-semibold text-black">
                    {stock} u
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </Card>

      {/* The frame labels this card "Visibility" — it holds reviews, and there's
          already a Visibility card on the SEO tab, so it's named for what's in
          it. */}
      <Card
        title="Reviews"
        action={
          <span className="flex items-center gap-2">
            <span className="flex items-center gap-[1.5px]" aria-hidden="true">
              {Array.from({ length: 5 }, (_, index) => (
                <Star key={index} className="size-[18px] text-[#dadde2]" />
              ))}
            </span>
            <span className="text-[14px] font-medium text-black">0.0</span>
            <span className="text-[14px] font-medium text-black">(0)</span>
          </span>
        }
      >
        <p className="px-[16px] py-[24px] text-[14px] font-medium text-[#575f71]">
          No reviews for this product yet.
        </p>
      </Card>
    </div>
  );
}

export default InsightsTab;
