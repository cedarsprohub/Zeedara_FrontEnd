import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Banknote,
  CalendarCheck,
  ChartLine,
  Check,
  Clock,
  Copy,
  Mail,
  MessageCircle,
  Scissors,
  ShoppingCart,
  Star,
} from "lucide-react";
import { formatAmount, toAmount } from "../../../../utils/formatCurrency";
import { Pill } from "../../../../components/admin/AdminUi";
import { formatNairaShort } from "../../Dashboard/formatNairaShort";
import { BUDGETS, HAIR_PREFERENCES, labelFor } from "../../../Account/CustomHair/options";
import { CONCERNS } from "../../../Account/Skincare/options";
import { formatDate, fullName, relativeTime } from "../data";
import { clinicStatus, orderStatus, paymentStatus, TONES, wigStatus } from "./statusStyles";

const cardCls = "min-w-0 rounded-[4px] border border-[#f0f1f3] bg-white shadow-[0px_1px_1px_rgba(16,24,40,0.05)]";
const cardHeadCls = "border-b border-[#f0f1f3] px-4 py-3 text-[12px] font-semibold leading-[1.4] text-black";


function Stat({ label, value, icon: Icon, iconBg, iconColor }) {
  return (
    <div className="flex min-w-0 flex-col justify-between gap-3 border border-[#f0f1f3] bg-white p-[17px] sm:min-h-[126px]">
      <div className="flex items-start justify-between gap-3">
        <p className="text-[14px] font-medium leading-[1.4] text-[#667085]">{label}</p>
        <span
          className="flex size-9 shrink-0 items-center justify-center shadow-[inset_0px_3.333px_6.667px_0px_rgba(0,0,0,0.05)]"
          style={{ backgroundColor: iconBg, color: iconColor }}
        >
          <Icon className="size-6" strokeWidth={1.5} aria-hidden="true" />
        </span>
      </div>
      <p className="text-[20px] font-bold leading-[1.25] text-[#262626] sm:text-[24px] sm:leading-[1.4]">{value}</p>
    </div>
  );
}

// Term/definition rows — the Contact card and each custom-wig card.
function DefinitionList({ rows, termWidth = "minmax(90px,0.8fr)" }) {
  return (
    <dl className="grid" style={{ gridTemplateColumns: `${termWidth} minmax(0,1fr)` }}>
      {rows.map(([term, value]) => (
        <div key={term} className="contents">
          <dt className="border-b border-[#eaecf0] py-[10px] pr-3 text-[12px] font-semibold leading-[1.4] text-[#667085]">
            {term}
          </dt>
          <dd className="min-w-0 break-words border-b border-[#eaecf0] py-[10px] text-[12px] font-medium leading-[1.4] text-[#3a404c]">
            {value ?? "—"}
          </dd>
        </div>
      ))}
    </dl>
  );
}

function addressLines(address) {
  return [
    address.delivery_address,
    [address.city, address.state].filter(Boolean).join(", "),
    address.country !== "Nigeria" ? address.country : null,
    address.phone,
  ].filter(Boolean);
}

function CopyAddressButton({ address }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText([address.recipient_name, ...addressLines(address)].join("\n"));
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // Clipboard can be blocked (insecure origin, permissions) — nothing to do.
    }
  };
  return (
    <button
      type="button"
      onClick={copy}
      className="flex h-[34px] w-full shrink-0 cursor-pointer items-center justify-center gap-[7px] rounded-[4px] border-[0.8px] border-[#dadde2] bg-white px-3 text-[12px] font-medium text-[#3a404c] shadow-[0px_1px_1px_rgba(16,24,40,0.05)] transition-colors hover:border-[#9fa5b2] sm:w-[136px]"
    >
      {copied ? <Check className="size-4 text-[#0f9959]" strokeWidth={2} /> : <Copy className="size-4" strokeWidth={1.75} />}
      {copied ? "Copied" : "Copy"}
    </button>
  );
}

// "wa.me" wants digits only, country code first.
const whatsappLink = (number) => `https://wa.me/${number.replace(/\D/g, "")}`;

export function OverviewTab({ profile }) {
  const { customer, default_address: address, timeline } = profile;
  const contactNumber = profile.whatsapp_number || customer.phone_number;
  const status = customer.is_active
    ? { label: "Active", ...TONES.green }
    : { label: "Blocked", ...TONES.red };

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="Lifetime spend" value={formatNairaShort(toAmount(customer.lifetime_spend))} icon={Banknote} iconBg="rgba(255,105,0,0.1)" iconColor="#ff6900" />
        <Stat label="Orders" value={customer.orders} icon={ShoppingCart} iconBg="#eff8ff" iconColor="#2e90fa" />
        <Stat label="Average order" value={formatNairaShort(toAmount(customer.aov))} icon={ChartLine} iconBg="#f4f3ff" iconColor="#7a5af8" />
        <Stat label="Last order" value={customer.last_order_at ? relativeTime(customer.last_order_at) : "—"} icon={Clock} iconBg="#f0f1f3" iconColor="#48505e" />
      </div>

      <div className="grid items-start gap-4 md:grid-cols-2">
        <section className={cardCls}>
          <h3 className={cardHeadCls}>Contact</h3>
          <div className="flex flex-col gap-[26px] p-4">
            <DefinitionList
              rows={[
                ["Email", customer.email],
                ["Phone", customer.phone_number],
                ["WhatsApp", profile.whatsapp_number],
                ["Currency", profile.currency === "NGN" ? "Nigerian Naira (₦)" : profile.currency],
                ["Status", <Pill key="s" {...status} />],
                ["Last seen", profile.last_seen_at ? relativeTime(profile.last_seen_at) : "—"],
              ]}
            />
            <div className="flex gap-2">
              <a
                href={`mailto:${customer.email}`}
                className="flex h-10 min-w-0 flex-1 items-center justify-center gap-2 rounded-[4px] bg-[#faf4eb] px-3 text-[14px] font-semibold text-(--primary-color) transition-colors hover:bg-[#f3e7d2]"
              >
                <Mail className="size-5 shrink-0" strokeWidth={1.5} />
                Email
              </a>
              {contactNumber ? (
                <a
                  href={whatsappLink(contactNumber)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-10 min-w-0 flex-1 items-center justify-center gap-2 rounded-[4px] bg-(--primary-color) px-3 text-[14px] font-semibold text-white transition-opacity hover:opacity-90"
                >
                  <MessageCircle className="size-5 shrink-0" strokeWidth={1.5} />
                  Whatsapp
                </a>
              ) : (
                <span
                  title="No phone or WhatsApp number on file"
                  className="flex h-10 min-w-0 flex-1 cursor-not-allowed items-center justify-center gap-2 rounded-[4px] bg-[#f0f0f0] px-3 text-[14px] font-semibold text-[#bdc2cb]"
                >
                  <MessageCircle className="size-5 shrink-0" strokeWidth={1.5} />
                  Whatsapp
                </span>
              )}
            </div>
          </div>
        </section>

        <section className={`${cardCls} flex flex-col shadow-none`}>
          <h3 className="border-b border-[#f0f1f3] p-4 text-[12px] font-semibold leading-[1.4] text-black">
            Default Delivery Address
          </h3>
          {address ? (
            <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-end">
              <div className="min-w-0 flex-1 text-[14px] leading-[1.4]">
                <p className="mb-[14px] font-semibold text-[#48505e]">{address.recipient_name}</p>
                {addressLines(address).map((line) => (
                  <p key={line} className="break-words font-medium text-[#667085]">
                    {line}
                  </p>
                ))}
              </div>
              <CopyAddressButton address={address} />
            </div>
          ) : (
            <p className="p-4 text-[14px] font-medium text-[#828a9b]">No saved address yet.</p>
          )}
        </section>
      </div>

      <section className={cardCls}>
        <h3 className="border-b border-[#f0f1f3] p-4 text-[12px] font-semibold leading-[1.4] text-black">
          Activity
        </h3>
        <ol className="relative mx-4 my-[18px] border-l-4 border-[#eaecf0] pl-5">
          {timeline.map((event, index) => {
            const isJoined = event.kind === "joined";
            return (
              <li key={`${event.kind}-${event.at}-${index}`} className="relative pb-5 last:pb-0">
                <span
                  className={`absolute top-1 -left-[27px] size-2.5 rounded-[5px] border-2 ${
                    isJoined
                      ? "border-(--primary-color) bg-(--primary-color) shadow-[0px_0px_0px_4px_#f1e5d2]"
                      : "border-[#12b76a] bg-[#12b76a]"
                  }`}
                />
                <p className="truncate text-[14px] font-semibold leading-[1.4] text-black">{event.title}</p>
                {event.detail && (
                  <p className="pt-0.5 text-[12px] font-medium leading-[1.4] text-[#828a9b]">{event.detail}</p>
                )}
                <p className="pt-[3px] text-[10px] font-medium leading-[1.4] text-[#9fa5b2]">
                  {new Date(event.at).toLocaleString("en-GB", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </li>
            );
          })}
        </ol>
      </section>
    </div>
  );
}

export function EmptyState({ icon: Icon, title, name, action }) {
  return (
    <div className="flex flex-col items-center px-4 py-16 text-center">
      <span className="mb-3 flex size-[52px] items-center justify-center rounded-full bg-[#f0f1f3] text-[#667085]">
        <Icon className="size-6" strokeWidth={1.5} aria-hidden="true" />
      </span>
      <p className="text-[14px] font-semibold text-black">{title}</p>
      <p className="text-[12px] font-medium text-[#828a9b]">
        <span className="font-semibold text-[#667085]">{name}</span> {action}
      </p>
    </div>
  );
}

// Shared table chrome for the Orders and Clinic tabs; scrolls sideways on a
// phone (`relative` keeps it from widening the page — see the list table).
function Table({ columns, children, minWidth = 640 }) {
  return (
    <div className="relative overflow-x-auto">
      <table className="w-full border-collapse text-left" style={{ minWidth }}>
        <thead>
          <tr className="border-b border-[#f0f1f3] bg-[#fcfcfc]">
            {columns.map(({ label, align }) => (
              <th
                key={label}
                scope="col"
                className={`px-4 py-[11px] text-[12px] font-semibold leading-[1.4] whitespace-nowrap text-[#667085] ${
                  align === "right" ? "text-right" : ""
                }`}
              >
                {label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="text-[12px] font-semibold leading-[1.4] text-[#575f71]">{children}</tbody>
      </table>
    </div>
  );
}

// "Yesterday" / "3 days ago" for the last week, the date after that — as the
// design mixes them.
const WEEK = 7 * 24 * 60 * 60 * 1000;
const placed = (value) =>
  Date.now() - new Date(value).getTime() < WEEK ? relativeTime(value) : formatDate(value);

export function OrdersTab({ profile }) {
  if (!profile.orders.length) {
    return <EmptyState icon={ShoppingCart} title="No orders yet" name={fullName(profile.customer)} action="has not placed an order." />;
  }
  return (
    <Table
      columns={[
        { label: "Order" }, { label: "Placed" }, { label: "Items" },
        { label: "Status" }, { label: "Payment" }, { label: "Total", align: "right" },
      ]}
    >
      {profile.orders.map((order) => (
        <tr key={order.id} className="border-b border-[#f0f1f3]">
          <td className="px-4 py-3 whitespace-nowrap">{order.order_number}</td>
          <td className="px-4 py-3 whitespace-nowrap">{placed(order.placed_at)}</td>
          <td className="px-4 py-3 whitespace-nowrap">
            {order.item_count} item{order.item_count === 1 ? "" : "s"}
          </td>
          <td className="px-4 py-3"><Pill {...orderStatus(order.status)} /></td>
          <td className="px-4 py-3"><Pill {...paymentStatus(order.payment_status)} /></td>
          <td className="px-4 py-3 text-right whitespace-nowrap text-[#262626]">{formatAmount(order.total_ngn)}</td>
        </tr>
      ))}
    </Table>
  );
}

export function ClinicTab({ profile }) {
  if (!profile.clinic.length) {
    return <EmptyState icon={CalendarCheck} title="No clinic bookings yet" name={fullName(profile.customer)} action="has not booked a consultation." />;
  }
  return (
    <Table
      minWidth={680}
      columns={[
        { label: "Service" }, { label: "Date" }, { label: "Concerns" },
        { label: "Status" }, { label: "Fee", align: "right" },
      ]}
    >
      {profile.clinic.map((booking) => (
        <tr key={booking.id} className="border-b border-[#f0f1f3]">
          <td className="px-4 py-3">
            <span className="block whitespace-nowrap">{booking.service}</span>
            <span className="font-medium text-[#9fa5b2]">{booking.consultation_number}</span>
          </td>
          <td className="px-4 py-3 whitespace-nowrap">
            {booking.is_scheduled ? formatDate(booking.date) : <span title="Requested — not scheduled yet">{placed(booking.date)}</span>}
          </td>
          <td className="max-w-[220px] px-4 py-3">
            {booking.concerns.map((key) => labelFor(CONCERNS, key)).join(", ") || "—"}
          </td>
          <td className="px-4 py-3"><Pill {...clinicStatus(booking.status)} /></td>
          <td className="px-4 py-3 text-right whitespace-nowrap text-[#262626]">{formatAmount(booking.fee_ngn)}</td>
        </tr>
      ))}
    </Table>
  );
}

export function CustomWigsTab({ profile }) {
  if (!profile.custom_wigs.length) {
    return <EmptyState icon={Scissors} title="No custom wig requests" name={fullName(profile.customer)} action="has not requested a custom unit." />;
  }
  return (
    <div className="flex flex-col gap-4">
      {profile.custom_wigs.map((request) => (
        <section key={request.id} className={cardCls}>
          <div className="flex flex-wrap items-start justify-between gap-3 border-b border-[#f0f1f3] px-4 py-3 text-[12px] font-semibold leading-[1.4]">
            <div>
              <p className="text-black">{request.request_number}</p>
              <p className="text-[#667085]">{labelFor(HAIR_PREFERENCES, request.hair_preference)}</p>
            </div>
            <Pill {...wigStatus(request.status)} />
          </div>
          <div className="p-4">
            <DefinitionList
              termWidth="minmax(90px,0.4fr)"
              rows={[
                ["Specification", labelFor(HAIR_PREFERENCES, request.hair_preference)],
                ["Budget", labelFor(BUDGETS, request.budget_range)],
                ["Quote", request.quote_amount_ngn ? formatAmount(request.quote_amount_ngn) : "Not quoted yet"],
                ["Notes", request.notes],
                ["Requested", formatDate(request.created_at)],
                ["Last updated", relativeTime(request.updated_at)],
              ]}
            />
          </div>
        </section>
      ))}
    </div>
  );
}

function Stars({ rating }) {
  return (
    <span className="flex shrink-0 gap-[1.5px]" aria-label={`${rating} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          className="size-3.5"
          strokeWidth={0}
          fill={n <= rating ? "#d4a24c" : "#dadde2"}
          aria-hidden="true"
        />
      ))}
    </span>
  );
}

const REVIEW_STATUS = {
  pending: { label: "Awaiting approval", ...TONES.amber },
  rejected: { label: "Rejected", ...TONES.red },
  hidden: { label: "Hidden", ...TONES.grey },
};

export function ReviewsTab({ profile }) {
  if (!profile.reviews.length) {
    return <EmptyState icon={Star} title="No reviews yet" name={fullName(profile.customer)} action="has not reviewed a product." />;
  }
  return (
    <div className="flex flex-col gap-2">
      {profile.reviews.map((review) => (
        <article key={review.id} className="flex flex-col gap-3 border border-[#f0f1f3] px-4 py-5">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <div className="flex min-w-0 items-center gap-2.5">
                <Stars rating={review.rating} />
                {review.title && (
                  <p className="truncate text-[14px] font-semibold leading-[1.4] text-[#575f71]">{review.title}</p>
                )}
              </div>
              <span className="h-px min-w-4 flex-1 bg-[#dadde2]" />
              <span className="shrink-0 text-[12px] font-medium text-[#575f71]">{formatDate(review.created_at)}</span>
            </div>
            <p className="text-[12px] font-medium leading-[1.4] text-[#575f71]">{review.body}</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {review.product_slug ? (
              <Link
                to={`/products/${review.product_slug}`}
                target="_blank"
                className="text-[12px] font-semibold text-(--primary-color) underline"
              >
                {review.product_name}
              </Link>
            ) : (
              <span className="text-[12px] font-semibold text-[#667085]">{review.product_name ?? "Removed product"}</span>
            )}
            {REVIEW_STATUS[review.status] && <Pill {...REVIEW_STATUS[review.status]} />}
          </div>
        </article>
      ))}
    </div>
  );
}
