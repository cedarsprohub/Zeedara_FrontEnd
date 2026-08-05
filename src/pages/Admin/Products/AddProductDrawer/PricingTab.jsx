import { Info } from "lucide-react";
import { CurrencyInput, Field, InfoBanner, StatCard } from "./fields";
import { formatCurrency } from "../../../../utils/formatCurrency";
import { pricingSummary } from "./product";

const asPercent = (value) =>
  value === null ? "—" : `${value.toFixed(1).replace(/\.0$/, "")}%`;

function PricingTab({ form, onChange }) {
  const { margin, profit, discount } = pricingSummary(form);

  return (
    <div className="flex w-full flex-col gap-4">
      <p className="text-[14px] font-semibold text-black">Selling price</p>

      <div className="flex flex-col gap-4 sm:flex-row">
        <Field label="Selling price" htmlFor="product-price">
          <CurrencyInput
            id="product-price"
            value={form.price}
            onChange={(event) => onChange({ price: event.target.value })}
            placeholder="0"
          />
        </Field>

        <Field
          label="Compare-at price"
          htmlFor="product-compare-at"
          hint={'Shows as a struck-through “was” price'}
        >
          <CurrencyInput
            id="product-compare-at"
            value={form.compareAt}
            onChange={(event) => onChange({ compareAt: event.target.value })}
            placeholder="0"
          />
        </Field>

        <Field
          label="Unit cost"
          htmlFor="product-unit-cost"
          hint="Used to work out margin — never shown on the storefront"
        >
          <CurrencyInput
            id="product-unit-cost"
            value={form.unitCost}
            onChange={(event) => onChange({ unitCost: event.target.value })}
            placeholder="0"
          />
        </Field>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row">
        <StatCard label="Margin" value={asPercent(margin)} />
        <StatCard
          label="Profit per unit"
          value={profit === null ? "—" : formatCurrency(profit)}
        />
        <StatCard label="Discount vs compare-at" value={asPercent(discount)} />
      </div>

      <InfoBanner tone="amber" icon={Info} title="Multi-currency">
        Prices are held in Nigerian Naira and converted at checkout using the
        rates in Currencies. Current display: NGN.
      </InfoBanner>
    </div>
  );
}

export default PricingTab;
