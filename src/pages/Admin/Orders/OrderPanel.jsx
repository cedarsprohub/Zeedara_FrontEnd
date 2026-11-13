import { useCallback, useEffect, useId, useRef, useState } from "react";
import { Link, useNavigate, useOutletContext, useParams } from "react-router-dom";
import {
  Check,
  ChevronDown,
  ChevronRight,
  Copy,
  Download,
  FileText,
  Mail,
  MessageCircle,
  Printer,
  Save,
  TriangleAlert,
  X,
} from "lucide-react";
import { useAdminAuth } from "../../../context/AdminAuthContext.js";
import logo from "../../../assets/navbar/zeedara_logo.png";
import { Pill } from "../../../components/admin/AdminUi";
import { formatAmount, toAmount } from "../../../utils/formatCurrency";
import { formatNairaShort } from "../Dashboard/formatNairaShort";
import { getAdminOrderDetail, setAdminOrderState, updateAdminOrder } from "../../../api/admin/orders";
import {
  ADVANCE_LABEL,
  STEPS,
  STORE,
  methodLabel,
  paymentPill,
  statusLabel,
  statusPill,
  stepOf,
} from "./data";
import { downloadText, invoiceCsv, invoiceHtml, packingSlipHtml, printHtml } from "./printDocuments";

const cardCls = "min-w-0 rounded-[4px] border border-[#f0f1f3] bg-white shadow-[0px_1px_1px_rgba(16,24,40,0.05)]";
const headCls = "flex items-center justify-between gap-3 border-b border-[#f0f1f3] px-4 py-3 text-[12px] font-semibold leading-[1.4] text-black";
const outlineBtn =
  "flex h-10 cursor-pointer items-center justify-center gap-2 rounded-[2px] border border-[#dadde2] bg-white px-3 text-[14px] font-semibold text-[#48505e] transition-colors hover:border-[#9fa5b2] hover:text-black disabled:cursor-not-allowed disabled:opacity-60";
const primaryBtn =
  "flex h-10 cursor-pointer items-center justify-center gap-2 rounded-[2px] bg-(--primary-color) px-4 text-[14px] font-semibold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60";

const placedAt = (value) =>
  new Date(value).toLocaleString("en-GB", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });

const whatsappLink = (number) => `https://wa.me/${number.replace(/\D/g, "")}`;

function Stepper({ status }) {
  const current = stepOf(status);
  if (current === null) {
    return (
      <div className={`${cardCls} flex items-center gap-2 px-4 py-4 text-[12px] font-semibold text-[#cf251f]`}>
        <TriangleAlert className="size-4" strokeWidth={2} /> This order is {statusLabel(status).toLowerCase()} and has left the fulfilment flow.
      </div>
    );
  }
  return (
    <ol className={`${cardCls} flex items-center gap-2 overflow-x-auto px-4 py-4 [scrollbar-width:none]`} aria-label="Fulfilment progress">
      {STEPS.map((step, index) => {
        const done = index < current;
        const active = index === current;
        return (
          <li key={step} className="flex shrink-0 items-center gap-2" aria-current={active ? "step" : undefined}>
            {index > 0 && <span className={`h-px w-6 sm:w-8 ${index <= current ? "bg-(--primary-color)" : "bg-[#dadde2]"}`} />}
            <span
              className={`flex size-6 items-center justify-center rounded-full text-[11px] font-semibold ${
                done ? "bg-[#0f9959] text-white" : active ? "bg-(--primary-color) text-white" : "bg-[#f0f1f3] text-[#667085]"
              }`}
            >
              {done ? <Check className="size-3.5" strokeWidth={3} /> : index + 1}
            </span>
            <span className={`text-[12px] font-medium ${active ? "font-semibold text-(--primary-color)" : done ? "text-black" : "text-[#667085]"}`}>
              {step}
            </span>
          </li>
        );
      })}
    </ol>
  );
}

function Row({ label, value, strong }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-[#f0f1f3] py-[10px] text-[12px] leading-[1.4]">
      <span className={strong ? "text-[14px] font-semibold text-black" : "font-medium text-[#575f71]"}>{label}</span>
      <span className={strong ? "text-[14px] font-semibold text-(--primary-color)" : "font-semibold text-black"}>{value}</span>
    </div>
  );
}

function ItemsCard({ order }) {
  return (
    <section className={cardCls}>
      <h3 className={headCls}>
        Items <span className="font-medium text-[#575f71]">{order.units} unit{order.units === 1 ? "" : "s"}</span>
      </h3>
      <div className="relative overflow-x-auto">
        <table className="w-full border-collapse text-left text-[12px] leading-[1.4]">
          <thead>
            <tr className="border-b border-[#f0f1f3] bg-[#fcfcfc] text-[#667085]">
              <th className="px-4 py-2 font-semibold">Item</th>
              <th className="px-2 py-2 text-center font-semibold">Qty</th>
              <th className="hidden px-2 py-2 text-right font-semibold sm:table-cell">Unit price</th>
              <th className="px-4 py-2 text-right font-semibold">Total</th>
            </tr>
          </thead>
          <tbody>
            {order.items.map((item) => (
              <tr key={item.id ?? `${item.sku}-${item.variant_name}`} className="border-b border-[#f0f1f3]">
                <td className="px-4 py-3">
                  <p className="font-semibold text-black">{item.product_name}</p>
                  <p className="font-medium text-[#828a9b]">
                    {item.variant_name} · {item.sku}
                  </p>
                </td>
                <td className="px-2 py-3 text-center font-medium text-black">{item.quantity}</td>
                <td className="hidden px-2 py-3 text-right font-semibold whitespace-nowrap text-black sm:table-cell">{formatAmount(item.unit_price_ngn)}</td>
                <td className="px-4 py-3 text-right font-semibold whitespace-nowrap text-black">{formatAmount(item.line_total_ngn)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="ml-auto w-full max-w-[300px] px-4 pb-2">
        <Row label="Subtotal" value={formatAmount(order.subtotal_ngn)} />
        {toAmount(order.discount_ngn) > 0 && (
          <Row label={`Discount${order.coupon_code ? ` (${order.coupon_code})` : ""}`} value={`−${formatAmount(order.discount_ngn)}`} />
        )}
        <Row label={order.delivery_method || "Shipping"} value={formatAmount(order.delivery_fee_ngn)} />
        <Row label="Total" value={formatAmount(order.total_ngn)} strong />
      </div>
    </section>
  );
}

function CustomerCard({ order }) {
  const initials = order.customer_name
    .split(/\s+/)
    .map((part) => part.charAt(0))
    .join("")
    .slice(0, 2)
    .toUpperCase();
  const rows = [
    ["Phone", order.customer_phone],
    ["Lifetime orders", order.customer ? order.customer.orders : "Guest checkout"],
    ["Lifetime spend", order.customer ? formatNairaShort(toAmount(order.customer.lifetime_spend)) : "—"],
    ["Currency", order.currency],
  ];
  return (
    <section className={cardCls}>
      <h3 className={headCls}>
        Customer
        {order.customer && (
          <Link to={`/admin/customers/${order.customer.id}`} className="flex items-center gap-1 font-medium text-[#575f71] hover:text-(--primary-color)">
            Profile <ChevronRight className="size-4" strokeWidth={2} />
          </Link>
        )}
      </h3>
      <div className="flex flex-col gap-4 p-4">
        <div className="flex items-center gap-[11px]">
          <span
            className="flex size-8 shrink-0 items-center justify-center rounded-[2px] text-[12px] font-bold text-white"
            style={{ backgroundImage: "linear-gradient(145deg, #cb9b4a 6%, #a66f17 94%)" }}
          >
            {initials}
          </span>
          <div className="min-w-0 text-[12px] leading-[1.4]">
            <p className="truncate font-semibold text-black">{order.customer_name}</p>
            <p className="truncate font-medium text-[#828a9b]">{order.customer_email}</p>
          </div>
        </div>
        <dl className="grid grid-cols-[minmax(100px,0.7fr)_minmax(0,1fr)]">
          {rows.map(([term, value]) => (
            <div key={term} className="contents">
              <dt className="border-b border-[#eaecf0] py-[10px] text-[12px] font-semibold text-[#667085]">{term}</dt>
              <dd className="min-w-0 break-words border-b border-[#eaecf0] py-[10px] text-[12px] font-medium text-[#3a404c]">{value}</dd>
            </div>
          ))}
        </dl>
        <div className="flex gap-2">
          <a href={`mailto:${order.customer_email}?subject=${encodeURIComponent(`Your Zeedara order ${order.order_number}`)}`} className={`${outlineBtn} h-9 flex-1 text-[12px] font-medium`}>
            <Mail className="size-4" strokeWidth={1.75} /> Email
          </a>
          <a href={whatsappLink(order.customer_phone)} target="_blank" rel="noopener noreferrer" className={`${outlineBtn} h-9 flex-1 text-[12px] font-medium`}>
            <MessageCircle className="size-4" strokeWidth={1.75} /> WhatsApp
          </a>
        </div>
      </div>
    </section>
  );
}

function AddressCard({ order }) {
  const [copied, setCopied] = useState(false);
  const lines = [order.delivery_address, [order.delivery_city, order.delivery_state].filter(Boolean).join(", "), order.customer_phone].filter(Boolean);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText([order.customer_name, ...lines].join("\n"));
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // Clipboard blocked — nothing to do.
    }
  };
  return (
    <section className={`${cardCls} shadow-none`}>
      <h3 className="border-b border-[#f0f1f3] p-4 text-[12px] font-semibold text-black">Delivery Address</h3>
      <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-end">
        <div className="min-w-0 flex-1 text-[14px] leading-[1.4]">
          <p className="mb-[14px] font-semibold text-[#48505e]">{order.customer_name}</p>
          {lines.map((line) => (
            <p key={line} className="break-words font-medium text-[#667085]">{line}</p>
          ))}
        </div>
        <button type="button" onClick={copy} className={`${outlineBtn} h-[34px] w-full text-[12px] font-medium sm:w-[120px]`}>
          {copied ? <Check className="size-4 text-[#0f9959]" strokeWidth={2} /> : <Copy className="size-4" strokeWidth={1.75} />}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      {order.customer_note && (
        <p className="border-t border-[#f0f1f3] px-4 py-3 text-[12px] font-medium text-[#575f71]">
          <span className="font-semibold text-black">Customer note: </span>
          {order.customer_note}
        </p>
      )}
    </section>
  );
}

function FulfilmentCard({ order, onSave, onPackingSlip }) {
  const [status, setStatus] = useState(order.status);
  const [method, setMethod] = useState(order.delivery_method ?? "");
  const [note, setNote] = useState(order.admin_note ?? "");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState(null);

  const dirty =
    status !== order.status || method.trim() !== (order.delivery_method ?? "") || note.trim() !== (order.admin_note ?? "");

  const save = async (event) => {
    event.preventDefault();
    setBusy(true);
    setMessage(null);
    try {
      await onSave({
        status: status !== order.status ? status : null,
        fields: {
          ...(method.trim() !== (order.delivery_method ?? "") ? { delivery_method: method } : {}),
          ...(note.trim() !== (order.admin_note ?? "") ? { admin_note: note } : {}),
        },
      });
      setMessage({ tone: "ok", text: "Changes saved." });
    } catch (err) {
      setMessage({ tone: "error", text: err.message || "Couldn't save the changes." });
    } finally {
      setBusy(false);
    }
  };

  const labelCls = "flex flex-col gap-1.5 text-[12px] font-semibold text-[#667085]";
  const boxCls = "h-10 w-full border border-[#dadde2] bg-white px-[15px] text-[14px] font-medium text-black focus:border-(--primary-color) focus:outline-none disabled:bg-[#f9fafb] disabled:text-[#9fa5b2]";

  return (
    <form onSubmit={save} className={cardCls}>
      <h3 className={headCls}>Fulfilment &amp; shipping</h3>
      <div className="flex flex-col gap-4 p-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <label className={labelCls}>
            Payment status
            <span className="relative">
              <select disabled value={order.payment_status} className={`${boxCls} appearance-none pr-10`} title="Payment status follows the payment provider">
                <option value={order.payment_status}>{paymentPill(order.payment_status).label}</option>
              </select>
              <ChevronDown className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-[#9fa5b2]" />
            </span>
          </label>
          <label className={labelCls}>
            Fulfilment status
            <span className="relative">
              <select value={status} onChange={(event) => setStatus(event.target.value)} disabled={busy || !order.allowed_transitions.length} className={`${boxCls} cursor-pointer appearance-none pr-10`}>
                <option value={order.status}>{statusLabel(order.status)}</option>
                {order.allowed_transitions.map((next) => (
                  <option key={next} value={next}>
                    → {statusLabel(next)}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-[#48505e]" />
            </span>
          </label>
        </div>
        <label className={labelCls}>
          Shipping method
          <input value={method} onChange={(event) => setMethod(event.target.value)} disabled={busy} maxLength={120} placeholder="e.g. Nationwide GIG Logistics" className={boxCls} />
        </label>
        <label className={labelCls}>
          Internal note
          <textarea
            value={note}
            onChange={(event) => setNote(event.target.value)}
            disabled={busy}
            rows={4}
            maxLength={4000}
            placeholder="Only staff can see this."
            className="w-full resize-y border border-[#dadde2] px-[15px] py-2.5 text-[14px] font-medium text-black focus:border-(--primary-color) focus:outline-none"
          />
        </label>
        {message && (
          <p role={message.tone === "ok" ? "status" : "alert"} className={`px-3 py-2 text-[12px] font-medium ${message.tone === "ok" ? "bg-[#eefeec] text-[#0f9959]" : "bg-[#fae9e9] text-[#cf251f]"}`}>
            {message.text}
          </p>
        )}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <button type="submit" disabled={busy || !dirty} className={`${primaryBtn} h-9 text-[12px]`}>
            <Save className="size-4" strokeWidth={1.75} /> {busy ? "Saving…" : "Save changes"}
          </button>
          <button type="button" onClick={onPackingSlip} className={`${outlineBtn} h-9 text-[12px] font-medium`}>
            <Printer className="size-4" strokeWidth={1.75} /> Packing slip
          </button>
        </div>
      </div>
    </form>
  );
}

// Escape + scroll lock + initial focus for a modal layer.
function useModal(onClose, enabled = true) {
  const ref = useRef(null);
  useEffect(() => {
    if (!enabled) return undefined;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    ref.current?.focus();
    const onKeyDown = (event) => {
      if (event.key === "Escape") {
        event.stopImmediatePropagation();
        onClose();
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previous;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [onClose, enabled]);
  return ref;
}

export function InvoiceDialog({ order, onClose }) {
  const titleId = useId();
  const closeRef = useModal(onClose);
  const payment = paymentPill(order.payment_status).label;
  const method = methodLabel(order.payment_method);
  const totals = [
    ["Subtotal", formatAmount(order.subtotal_ngn)],
    ...(toAmount(order.discount_ngn) > 0 ? [[`Discount${order.coupon_code ? ` (${order.coupon_code})` : ""}`, `−${formatAmount(order.discount_ngn)}`]] : []),
    [order.delivery_method ? `Shipping · ${order.delivery_method}` : "Shipping", formatAmount(order.delivery_fee_ngn)],
  ];
  return (
    <div className="fixed inset-0 z-[55] flex items-end justify-center bg-black/30 sm:items-center sm:p-4" onClick={onClose}>
      <div role="dialog" aria-modal="true" aria-labelledby={titleId} onClick={(event) => event.stopPropagation()} className="flex max-h-[92vh] w-full max-w-[676px] flex-col rounded-t-[4px] bg-white shadow-[0px_24px_24px_rgba(16,24,40,0.18)] sm:rounded-[4px]">
        <div className="flex items-center justify-between gap-3 px-4 pt-5 sm:px-[14px]">
          <h2 id={titleId} className="text-[14px] font-semibold text-black">Invoice {order.order_number}</h2>
          <button ref={closeRef} type="button" onClick={onClose} aria-label="Close invoice" className="flex size-[34px] cursor-pointer items-center justify-center rounded-lg text-[#48505e] hover:bg-[#f9fafb]">
            <X className="size-5" strokeWidth={2} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-4 pb-4 text-[12px] leading-[1.4] sm:px-[14px]">
          <div className="flex flex-col gap-4 border-b border-[#d4a24c] py-4 sm:flex-row sm:justify-between">
            <div>
              <img src={logo} alt="Zeedara" className="mb-1 h-[34px] w-auto" />
              <p className="font-medium text-[#48505e]">{STORE.tagline}</p>
            </div>
            <p className="font-medium text-[#48505e] sm:text-right">
              {STORE.address.map((line) => (
                <span key={line} className="block">{line}</span>
              ))}
              {STORE.email}
            </p>
          </div>
          <div className="flex flex-col gap-4 border-b border-[#d4a24c] py-4 sm:flex-row sm:justify-between">
            <div className="min-w-0 font-medium text-[#000]">
              <p className="font-semibold text-(--primary-color)">BILLED TO</p>
              <p className="my-1 text-[14px] font-semibold">{order.customer_name}</p>
              <p>{order.delivery_address}</p>
              <p>{[order.delivery_city, order.delivery_state].filter(Boolean).join(", ")}</p>
              <p className="break-all">{order.customer_email}</p>
            </div>
            <dl className="grid shrink-0 grid-cols-[auto_auto] gap-x-1.5 gap-y-1 self-start font-medium text-[#48505e] sm:justify-end sm:text-right">
              <dt>Invoice</dt><dd className="font-semibold text-black">{order.order_number}</dd>
              <dt>Date</dt><dd className="font-semibold text-black">{new Date(order.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}</dd>
              <dt>Payment</dt><dd className="font-semibold text-black">{method || "—"}</dd>
              <dt>Status</dt><dd className="font-semibold text-black">{payment}</dd>
            </dl>
          </div>
          <div className="relative overflow-x-auto">
            <table className="mt-4 w-full min-w-[420px] border-collapse text-left">
              <thead>
                <tr className="bg-[#fcfcfc] text-[#667085]">
                  <th className="px-[14px] py-2.5 font-semibold">Item</th>
                  <th className="px-2 py-2.5 text-center font-semibold">Qty</th>
                  <th className="px-2 py-2.5 text-right font-semibold">Unit price</th>
                  <th className="px-[14px] py-2.5 text-right font-semibold">Total</th>
                </tr>
              </thead>
              <tbody>
                {order.items.map((item) => (
                  <tr key={item.id ?? item.sku} className="border-b border-[#f0f1f3]">
                    <td className="px-[14px] py-3"><p className="font-semibold text-black">{item.product_name}</p><p className="font-medium text-[#828a9b]">{item.variant_name} · {item.sku}</p></td>
                    <td className="px-2 py-3 text-center font-medium">{item.quantity}</td>
                    <td className="px-2 py-3 text-right font-medium whitespace-nowrap text-[#48505e]">{formatAmount(item.unit_price_ngn)}</td>
                    <td className="px-[14px] py-3 text-right font-semibold whitespace-nowrap">{formatAmount(item.line_total_ngn)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="ml-auto w-full max-w-[270px]">
            {totals.map(([label, value]) => (
              <div key={label} className="flex justify-between gap-4 border-b border-[#f0f1f3] px-[14px] py-2.5">
                <span className="font-medium text-[#48505e]">{label}</span>
                <span className="font-semibold">{value}</span>
              </div>
            ))}
            <div className="flex justify-between gap-4 border-t border-black px-[14px] py-3 text-[14px] font-semibold">
              <span>Total</span>
              <span className="text-(--primary-color)">{formatAmount(order.total_ngn)}</span>
            </div>
          </div>
          <p className="mt-4 border-t border-[#f0f1f3] pt-3 text-center font-medium text-[#48505e]">
            Thank you for shopping with Zeedara.
            <br />
            Questions about this invoice? Email {STORE.supportEmail} or WhatsApp {STORE.whatsapp}.
          </p>
        </div>
        <div className="flex flex-col-reverse gap-2 border-t border-[#f0f1f3] px-4 py-3 sm:flex-row sm:justify-end sm:px-[14px]">
          <button type="button" onClick={onClose} className={`${outlineBtn} text-[12px]`}>Close</button>
          <button type="button" onClick={() => downloadText(invoiceCsv(order), `invoice-${order.order_number}.csv`)} className={`${outlineBtn} text-[12px]`}>
            <Download className="size-4" strokeWidth={1.75} /> Download CSV
          </button>
          <button type="button" onClick={() => printHtml(invoiceHtml(order, { paymentLabel: payment, methodLabel: method }))} className={`${primaryBtn} text-[12px]`}>
            <Printer className="size-4" strokeWidth={1.75} /> Print / Save as PDF
          </button>
        </div>
      </div>
    </div>
  );
}

export function CancelOrderDialog({ order, onClose, onConfirm }) {
  const titleId = useId();
  const cancelRef = useModal(onClose);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const confirm = async () => {
    setBusy(true);
    setError("");
    try {
      await onConfirm();
    } catch (err) {
      setError(err.message || "Couldn't cancel this order.");
      setBusy(false);
    }
  };
  return (
    <div className="fixed inset-0 z-[55] flex items-end justify-center bg-black/30 sm:items-center sm:p-4" onClick={() => !busy && onClose()}>
      <div role="alertdialog" aria-modal="true" aria-labelledby={titleId} onClick={(event) => event.stopPropagation()} className="w-full max-w-[520px] overflow-hidden rounded-t-[4px] bg-white shadow-[0px_24px_24px_rgba(16,24,40,0.18)] sm:rounded-[4px]">
        <div className="flex items-start gap-3 border-b border-[#f0f1f3] px-[22px] py-7">
          <span className="flex size-[42px] shrink-0 items-center justify-center rounded-[4px] bg-[#fef3f2] text-[#cf251f]">
            <TriangleAlert className="size-[21px]" strokeWidth={2} />
          </span>
          <div className="flex min-w-0 flex-1 flex-col gap-1.5">
            <p id={titleId} className="text-[14px] font-semibold text-black">Cancel order {order.order_number}?</p>
            <p className="text-[12px] font-medium text-[#828a9b]">
              {order.paid_at
                ? "Stock goes back on the shelf and the customer is notified. The payment isn't refunded automatically — raise the refund separately."
                : "The order hasn't been paid, so nothing needs refunding. The customer is notified."}
            </p>
            {error && <p role="alert" className="bg-[#fae9e9] px-3 py-2 text-[12px] font-medium text-[#cf251f]">{error}</p>}
          </div>
        </div>
        <div className="flex flex-col-reverse gap-2.5 bg-[#f0f1f3] px-[22px] py-4 sm:flex-row sm:justify-end">
          <button ref={cancelRef} type="button" onClick={onClose} disabled={busy} className={outlineBtn}>Keep order</button>
          <button type="button" onClick={confirm} disabled={busy} className="flex h-10 cursor-pointer items-center justify-center rounded-[2px] bg-[#cf251f] px-3 text-[14px] font-semibold text-white hover:opacity-90 disabled:opacity-60">
            {busy ? "Cancelling…" : "Cancel order"}
          </button>
        </div>
      </div>
    </div>
  );
}

// The order panel at /admin/orders/:orderId, opened over the list. `?view=invoice`
// opens straight onto the invoice (the row menu's "Print invoice").
function OrderPanel() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { reload: reloadList } = useOutletContext() ?? {};
  const { accessToken } = useAdminAuth();
  const titleId = useId();

  const [result, setResult] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [showInvoice, setShowInvoice] = useState(() => new URLSearchParams(window.location.search).get("view") === "invoice");
  const [confirmCancel, setConfirmCancel] = useState(false);
  const [advancing, setAdvancing] = useState(false);
  const [actionError, setActionError] = useState("");
  const key = `${orderId}|${reloadKey}`;
  const isFresh = result?.key === key;
  // Keep showing the last answer for this order while a refresh is in flight.
  const order = result?.id === orderId ? result.order : null;

  useEffect(() => {
    if (!accessToken) return undefined;
    let active = true;
    getAdminOrderDetail(orderId, accessToken)
      .then((data) => active && setResult({ key, id: orderId, order: data, error: "" }))
      .catch(
        (err) =>
          active &&
          setResult({ key, id: orderId, order: null, error: err.status === 404 || err.status === 422 ? "This order doesn't exist." : err.message || "Couldn't load this order." }),
      );
    return () => {
      active = false;
    };
  }, [key, orderId, accessToken]);

  const refresh = () => {
    setReloadKey((value) => value + 1);
    reloadList?.();
  };

  const close = useCallback(() => navigate("/admin/orders"), [navigate]);
  const modalOpen = showInvoice || confirmCancel;
  const closeRef = useModal(close, !modalOpen);

  const advance = async () => {
    setAdvancing(true);
    setActionError("");
    try {
      await setAdminOrderState(order.id, order.next_status, accessToken);
      refresh();
    } catch (err) {
      setActionError(err.message);
    } finally {
      setAdvancing(false);
    }
  };

  const saveFulfilment = async ({ status, fields }) => {
    if (status) await setAdminOrderState(order.id, status, accessToken);
    if (Object.keys(fields).length) await updateAdminOrder(order.id, fields, accessToken);
    refresh();
  };

  const cancelOrder = async () => {
    await setAdminOrderState(order.id, "cancelled", accessToken);
    setConfirmCancel(false);
    refresh();
  };

  const canCancel = order?.allowed_transitions.includes("cancelled");

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/30 lg:pl-[287px]" onClick={close}>
      <div role="dialog" aria-modal="true" aria-labelledby={titleId} onClick={(event) => event.stopPropagation()} className="relative mx-auto flex min-h-full w-full max-w-[992px] flex-col bg-white shadow-[0px_24px_24px_rgba(16,24,40,0.18)] sm:min-h-0 sm:rounded-b-[4px]">
        <header className="flex flex-wrap items-start gap-3 px-4 py-5 sm:px-6">
          <div className="min-w-0 flex-1 leading-[1.4]">
            <h2 id={titleId} className="text-[14px] font-semibold text-black">{order?.order_number ?? (isFresh ? "Order" : "Loading…")}</h2>
            {order && (
              <p className="pt-[3px] text-[12px] font-medium text-[#828a9b]">
                {placedAt(order.created_at)}
                {order.payment_method && ` · ${methodLabel(order.payment_method)}`}
              </p>
            )}
          </div>
          {order && (
            <div className="flex items-center gap-2">
              <Pill {...statusPill(order.status)} />
              <Pill {...paymentPill(order.payment_status)} />
            </div>
          )}
          <button ref={closeRef} type="button" onClick={close} aria-label="Close order" className="flex size-[38px] shrink-0 cursor-pointer items-center justify-center rounded-lg text-[#48505e] hover:bg-[#f9fafb] hover:text-black">
            <X className="size-5" strokeWidth={2} />
          </button>
        </header>

        <div className="flex flex-1 flex-col gap-4 px-4 pb-5 sm:px-6">
          {!order ? (
            <p role={result?.error ? "alert" : undefined} className={`py-16 text-center text-[14px] ${result?.error ? "text-[#cf251f]" : "text-[#828a9b]"}`}>
              {result?.id === orderId && result.error ? result.error : "Loading order…"}
            </p>
          ) : (
            <>
              <Stepper status={order.status} />
              {actionError && <p role="alert" className="bg-[#fae9e9] px-4 py-3 text-[13px] font-medium text-[#cf251f]">{actionError}</p>}
              <div className="grid items-start gap-4 lg:grid-cols-2">
                <div className="flex min-w-0 flex-col gap-4">
                  <ItemsCard order={order} />
                  <FulfilmentCard key={order.status} order={order} onSave={saveFulfilment} onPackingSlip={() => printHtml(packingSlipHtml(order))} />
                </div>
                <div className="flex min-w-0 flex-col gap-4">
                  <CustomerCard order={order} />
                  <AddressCard order={order} />
                </div>
              </div>
            </>
          )}
        </div>

        {order && (
          <footer className="sticky bottom-0 flex flex-wrap items-center justify-end gap-2.5 border-t-[0.667px] border-[#f0f1f3] bg-[#fcfcfc] px-4 py-4 sm:px-[22px]">
            {canCancel && (
              <button type="button" onClick={() => setConfirmCancel(true)} className="mr-auto cursor-pointer text-[14px] font-semibold text-[#cf251f] hover:underline">
                Cancel order
              </button>
            )}
            <button type="button" onClick={() => setShowInvoice(true)} className={outlineBtn}>
              <FileText className="size-5" strokeWidth={1.5} /> Invoice
            </button>
            {order.next_status ? (
              <button type="button" onClick={advance} disabled={advancing} className={primaryBtn}>
                <Save className="size-5" strokeWidth={1.5} /> {advancing ? "Updating…" : ADVANCE_LABEL[order.next_status]}
              </button>
            ) : order.status === "pending_payment" ? (
              <span className="text-[12px] font-medium text-[#828a9b]">Awaiting payment — confirms automatically once Paystack verifies it.</span>
            ) : null}
          </footer>
        )}
      </div>

      {showInvoice && order && <InvoiceDialog order={order} onClose={() => setShowInvoice(false)} />}
      {confirmCancel && order && <CancelOrderDialog order={order} onClose={() => setConfirmCancel(false)} onConfirm={cancelOrder} />}
    </div>
  );
}

export default OrderPanel;
