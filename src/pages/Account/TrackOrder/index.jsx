import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Check } from "lucide-react";
import productImg from "../../../assets/ui/sampleImg.png";

const STEPS = ["Order Confirmed", "Processing", "Packed", "Shipped", "Delivered"];

// Everything that changes between the order states. `showTracking: false`
// hides the progress stepper (cancelled orders have no tracking).
const STATUS_CONFIG = {
  shipped: {
    reached: 3, // Shipped
    showTracking: true,
    badge: { label: "SHIPPED", bg: "bg-[#fbf4e8]", text: "text-[#b87b13]" },
    heading: "YOUR ORDER IS ON THE WAY",
    headingColor: "text-[#206f16]",
    subtext: "Estimated delivery: 15–17 June",
    actions: [{ label: "CONTACT SUPPORT", variant: "solid" }],
    itemAction: { label: "VIEW PRODUCT", variant: "solid", to: "/products/1" },
  },
  delivered: {
    reached: 4, // Delivered
    showTracking: true,
    badge: { label: "DELIVERED", bg: "bg-[#eefeec]", text: "text-[#298d1c]" },
    heading: "DELIVERED",
    headingColor: "text-[#206f16]",
    subtext: "…on 17 June 2026.",
    actions: [
      { label: "LEAVE REVIEW", variant: "soft" },
      { label: "ORDER AGAIN", variant: "solid" },
    ],
    itemAction: { label: "LEAVE REVIEW", variant: "soft" },
  },
  cancelled: {
    showTracking: false,
    badge: { label: "CANCELLED", bg: "bg-[#fae9e9]", text: "text-[#cf251f]" },
    heading: "ORDER WAS CANCELLED",
    headingColor: "text-[#cf251f]",
    subtext: "Estimated delivery: 15–17 June",
    actions: [
      { label: "CONTACT SUPPORT", variant: "soft" },
      { label: "BUY AGAIN", variant: "solid" },
    ],
    itemAction: { label: "BUY AGAIN", variant: "soft" },
  },
};

const ITEMS = [
  { name: "Bare Lace 13X6 Wig Lacefrontal", color: "Black", size: "30ml", qty: 1, price: "122,000" },
  { name: "Bare Lace 13X6 Wig Lacefrontal", color: "Black", size: "30ml", qty: 1, price: "122,000" },
  { name: "Bare Lace 13X6 Wig Lacefrontal", color: "Black", size: "30ml", qty: 1, price: "122,000" },
];

const PAYMENT = [
  { label: "Items subtotal", value: "₦95,000" },
  { label: "Discount", value: "-₦5,000" },
  { label: "Delivery", value: "₦2,500" },
  { label: "Total paid", value: "₦92,500" },
];

function PillButton({ label, variant, to, className }) {
  const styles =
    variant === "soft"
      ? "bg-[#faf4eb] text-(--primary-color) hover:bg-[#f3e7d2]"
      : "bg-(--primary-color) text-white hover:opacity-90";
  const cls = `flex items-center justify-center whitespace-nowrap font-semibold transition-colors ${styles} ${className}`;
  return to ? (
    <Link to={to} className={cls}>
      {label}
    </Link>
  ) : (
    <button type="button" className={cls}>
      {label}
    </button>
  );
}

function Stepper({ reached }) {
  return (
    <div className="overflow-x-auto pb-6">
      <div className="flex min-w-[560px] items-start">
        {STEPS.map((label, i) => {
          const done = i <= reached;
          const leftGreen = i <= reached; // segment entering this step
          const rightGreen = i + 1 <= reached; // segment leaving this step
          const isFirst = i === 0;
          const isLast = i === STEPS.length - 1;
          return (
            <div key={label} className="flex flex-1 flex-col items-center">
              <div className="flex w-full items-center">
                <span
                  className={`h-1 flex-1 rounded ${
                    isFirst ? "opacity-0" : leftGreen ? "bg-[#0f9959]" : "bg-[#dadde2]"
                  }`}
                />
                <span
                  className={`flex size-8 shrink-0 items-center justify-center rounded-full ${
                    done ? "bg-[#0f9959]" : "bg-[#dadde2]"
                  }`}
                >
                  {done && <Check className="size-4 text-white" strokeWidth={3} />}
                </span>
                <span
                  className={`h-1 flex-1 rounded ${
                    isLast ? "opacity-0" : rightGreen ? "bg-[#0f9959]" : "bg-[#dadde2]"
                  }`}
                />
              </div>
              <span className="mt-2 w-[81px] text-center text-[14px] font-medium text-[#575f71]">
                {label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ItemRow({ item, action }) {
  return (
    <div className="flex items-stretch bg-[#f5f5f5]">
      <div className="w-[108px] shrink-0 overflow-hidden">
        <img src={productImg} alt={item.name} className="size-full object-cover" />
      </div>
      <div className="flex flex-1 items-center justify-between gap-4 p-4">
        <div className="flex min-w-0 flex-col gap-2">
          <h4 className="text-[16px] font-semibold text-black">{item.name}</h4>
          <div className="flex flex-wrap gap-2 whitespace-nowrap text-[14px] font-medium text-[#9fa5b2]">
            <span>
              Color: {item.color}/Size: {item.size}
            </span>
            <span>Qty: {item.qty}</span>
          </div>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-2">
          <p className="text-[16px] font-semibold text-black">&#8358;{item.price}</p>
          <PillButton
            {...action}
            className="h-7 w-[149px] px-4 text-[12px] tracking-[0.24px]"
          />
        </div>
      </div>
    </div>
  );
}

function TrackOrder({ status = "shipped" }) {
  const navigate = useNavigate();
  const config = STATUS_CONFIG[status] ?? STATUS_CONFIG.shipped;

  return (
    <div className="flex flex-col gap-6 lg:px-8 lg:py-5">
      {/* Back (desktop — on mobile the layout provides it) */}
      <button
        type="button"
        onClick={() => navigate("/account/orders")}
        className="hidden cursor-pointer items-center gap-2 self-start p-2 text-[12px] font-semibold text-(--primary-color) lg:flex"
      >
        <ArrowLeft className="size-4 shrink-0" strokeWidth={2} />
        Back
      </button>

      {/* Order header */}
      <div className="flex flex-col gap-3">
        <div className="flex items-start justify-between gap-4 text-[14px] font-medium text-[#48505e]">
          <p>Order ID: 241344</p>
          <p className="text-right">Ordered on 02 July 2026</p>
        </div>
        <span className="h-px w-full bg-[#dadde2]" />
      </div>

      {/* Status */}
      <div className="flex flex-col gap-3">
        <span
          className={`inline-flex w-fit items-center px-3 py-1 text-[14px] font-semibold ${config.badge.bg} ${config.badge.text}`}
        >
          {config.badge.label}
        </span>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex flex-col gap-2">
            <h2
              className={`text-[24px] font-semibold leading-[1.4] ${config.headingColor}`}
            >
              {config.heading}
            </h2>
            <p className="text-[14px] font-medium text-[#575f71]">{config.subtext}</p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:justify-end">
            {config.actions.map((action) => (
              <PillButton
                key={action.label}
                {...action}
                className="h-10 w-full px-4 text-[14px] tracking-[0.28px] sm:w-auto sm:min-w-[150px]"
              />
            ))}
          </div>
        </div>
      </div>

      {/* Tracking (hidden for cancelled orders) */}
      {config.showTracking && (
        <div className="flex flex-col gap-4 rounded border border-[#dadde2] bg-[#fcfcfc] px-5 py-4">
          <h3 className="text-[16px] font-semibold text-black">Tracking Details</h3>
          <Stepper reached={config.reached} />
        </div>
      )}

      {/* Items + Address/Payment */}
      <div className="flex flex-col gap-6 lg:flex-row lg:items-stretch">
        <div className="flex flex-1 flex-col gap-4 border border-[#dadde2] p-4">
          <h3 className="text-[16px] font-semibold text-black">Items in this order</h3>
          <div className="flex flex-col gap-3">
            {ITEMS.map((item, i) => (
              <ItemRow key={i} item={item} action={config.itemAction} />
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-3 lg:w-[482px]">
          {/* Address */}
          <div className="flex flex-col gap-4 border border-[#dadde2] p-4">
            <h3 className="text-[16px] font-semibold text-black">Address</h3>
            <div className="text-[#575f71]">
              <p className="mb-3.5 text-[14px] font-semibold text-[#48505e]">
                Desmond Jumbo
              </p>
              <p className="text-[14px] font-medium leading-[1.4]">
                No. 64 Park Community,
                <br />
                Bonny Island, Rivers State.
                <br />
                +234 xxx xxx xxxx
              </p>
            </div>
          </div>

          {/* Payment Summary */}
          <div className="flex flex-1 flex-col gap-4 border border-[#dadde2] p-4">
            <h3 className="text-[16px] font-semibold text-black">Payment Summary</h3>
            <div className="flex flex-col gap-4 text-[14px] font-medium text-[#575f71]">
              {PAYMENT.map((row) => (
                <div key={row.label} className="flex items-center justify-between gap-4">
                  <span>{row.label}</span>
                  <span className="text-right">{row.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TrackOrder;
