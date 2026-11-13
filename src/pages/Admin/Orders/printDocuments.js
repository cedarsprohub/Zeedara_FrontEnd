import logo from "../../../assets/navbar/zeedara_logo.png";
import { formatAmount } from "../../../utils/formatCurrency";
import { STORE } from "./data";

const escape = (value) =>
  String(value ?? "").replace(/[&<>"']/g, (ch) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[ch]);

const longDate = (value) =>
  new Date(value).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });

const STYLES = `
  * { box-sizing: border-box; }
  body { margin: 0; padding: 32px; font: 500 12px/1.4 Montserrat, "Segoe UI", Arial, sans-serif; color: #000; }
  h1 { font-size: 16px; margin: 0 0 16px; }
  .head { display: flex; justify-content: space-between; gap: 24px; padding-bottom: 16px; border-bottom: 1px solid #d4a24c; }
  .head img { height: 34px; }
  .muted { color: #48505e; }
  .right { text-align: right; }
  .meta { display: flex; justify-content: space-between; gap: 24px; padding: 16px 0; border-bottom: 1px solid #d4a24c; }
  .label { color: #bf8322; font-weight: 600; text-transform: uppercase; }
  .name { font-size: 14px; font-weight: 600; margin: 4px 0; }
  table { width: 100%; border-collapse: collapse; margin-top: 16px; }
  th { background: #fcfcfc; color: #667085; font-weight: 600; text-align: left; padding: 10px 14px; }
  td { padding: 12px 14px; border-bottom: 1px solid #f0f1f3; vertical-align: top; }
  .num { text-align: right; white-space: nowrap; }
  .sub { color: #828a9b; }
  .totals { margin-left: auto; width: 280px; margin-top: 8px; }
  .totals div { display: flex; justify-content: space-between; padding: 8px 14px; border-bottom: 1px solid #f0f1f3; }
  .totals .grand { font-size: 14px; font-weight: 600; border-top: 1px solid #000; border-bottom: 0; }
  .grand span:last-child { color: #bf8322; }
  .foot { margin-top: 24px; padding-top: 12px; border-top: 1px solid #f0f1f3; text-align: center; color: #48505e; }
  .tick { display: inline-block; width: 14px; height: 14px; border: 1px solid #9fa5b2; }
  @page { margin: 12mm; }
  @media print { body { padding: 0; } }
`;

function storeBlock() {
  return `
    <div><img src="${escape(new URL(logo, window.location.href).href)}" alt="${STORE.name}">
      <div class="muted">${escape(STORE.tagline)}</div></div>
    <div class="right muted">${STORE.address.map(escape).join("<br>")}<br>${escape(STORE.email)}</div>`;
}

function billedTo(order) {
  return `
    <div><div class="label">Billed to</div>
      <div class="name">${escape(order.customer_name)}</div>
      <div class="muted">${escape(order.delivery_address)}<br>
        ${escape([order.delivery_city, order.delivery_state].filter(Boolean).join(", "))}<br>
        ${escape(order.customer_phone)}<br>${escape(order.customer_email)}</div></div>`;
}

export function invoiceHtml(order, { paymentLabel, methodLabel }) {
  const rows = order.items
    .map(
      (item) => `<tr><td><strong>${escape(item.product_name)}</strong><div class="sub">${escape(item.variant_name)} · ${escape(item.sku)}</div></td>
        <td class="num">${item.quantity}</td><td class="num">${formatAmount(item.unit_price_ngn)}</td><td class="num">${formatAmount(item.line_total_ngn)}</td></tr>`,
    )
    .join("");
  const discount = Number(order.discount_ngn) > 0
    ? `<div><span>Discount${order.coupon_code ? ` (${escape(order.coupon_code)})` : ""}</span><span>−${formatAmount(order.discount_ngn)}</span></div>`
    : "";
  return `<!doctype html><html><head><meta charset="utf-8"><title>Invoice ${escape(order.order_number)}</title><style>${STYLES}</style></head><body>
    <h1>Invoice ${escape(order.order_number)}</h1>
    <div class="head">${storeBlock()}</div>
    <div class="meta">${billedTo(order)}
      <div class="right">Invoice <strong>${escape(order.order_number)}</strong><br>
        Date <strong>${longDate(order.created_at)}</strong><br>
        Payment <strong>${escape(methodLabel || "—")}</strong><br>
        Status <strong>${escape(paymentLabel)}</strong></div></div>
    <table><thead><tr><th>Item</th><th class="num">Qty</th><th class="num">Unit price</th><th class="num">Total</th></tr></thead><tbody>${rows}</tbody></table>
    <div class="totals">
      <div><span>Subtotal</span><span>${formatAmount(order.subtotal_ngn)}</span></div>${discount}
      <div><span>Shipping${order.delivery_method ? ` · ${escape(order.delivery_method)}` : ""}</span><span>${formatAmount(order.delivery_fee_ngn)}</span></div>
      <div class="grand"><span>Total</span><span>${formatAmount(order.total_ngn)}</span></div></div>
    <div class="foot">Thank you for shopping with Zeedara.<br>
      Questions about this invoice? Email ${escape(STORE.supportEmail)} or WhatsApp ${escape(STORE.whatsapp)}.</div>
  </body></html>`;
}

export function packingSlipHtml(order) {
  const rows = order.items
    .map(
      (item) => `<tr><td><span class="tick"></span></td><td><strong>${escape(item.product_name)}</strong><div class="sub">${escape(item.variant_name)}</div></td>
        <td>${escape(item.sku)}</td><td class="num">${item.quantity}</td></tr>`,
    )
    .join("");
  const units = order.items.reduce((sum, item) => sum + item.quantity, 0);
  return `<!doctype html><html><head><meta charset="utf-8"><title>Packing slip ${escape(order.order_number)}</title><style>${STYLES}</style></head><body>
    <h1>Packing slip ${escape(order.order_number)}</h1>
    <div class="head">${storeBlock()}</div>
    <div class="meta">${billedTo(order).replace("Billed to", "Ship to")}
      <div class="right">Order <strong>${escape(order.order_number)}</strong><br>
        Placed <strong>${longDate(order.created_at)}</strong><br>
        Shipping <strong>${escape(order.delivery_method || "—")}</strong><br>
        Units <strong>${units}</strong></div></div>
    <table><thead><tr><th style="width:32px"></th><th>Item</th><th>SKU</th><th class="num">Qty</th></tr></thead><tbody>${rows}</tbody></table>
    ${order.customer_note ? `<p><strong>Customer note:</strong> ${escape(order.customer_note)}</p>` : ""}
  </body></html>`;
}

// Prints a standalone document through a hidden iframe, so the admin page
// itself never has to carry print styles. "Save as PDF" is the browser's own
// print destination.
export function printHtml(html) {
  const frame = document.createElement("iframe");
  frame.setAttribute("aria-hidden", "true");
  frame.style.cssText = "position:fixed;right:0;bottom:0;width:0;height:0;border:0;";
  document.body.appendChild(frame);
  const doc = frame.contentDocument;
  doc.open();
  doc.write(html);
  doc.close();
  const run = () => {
    frame.contentWindow.focus();
    frame.contentWindow.print();
    // Give the print dialog time to take its snapshot before cleaning up.
    setTimeout(() => frame.remove(), 1000);
  };
  const image = doc.querySelector("img");
  if (image && !image.complete) {
    image.addEventListener("load", run, { once: true });
    image.addEventListener("error", run, { once: true });
  } else {
    run();
  }
}

// Line items as CSV — the invoice dialog's "Download CSV".
export function invoiceCsv(order) {
  const cell = (value) => {
    const text = String(value ?? "");
    return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
  };
  const lines = [
    ["Order", "Item", "Variant", "SKU", "Qty", "Unit price", "Line total"],
    ...order.items.map((item) => [
      order.order_number, item.product_name, item.variant_name, item.sku,
      item.quantity, item.unit_price_ngn, item.line_total_ngn,
    ]),
    [],
    ["", "", "", "", "", "Subtotal", order.subtotal_ngn],
    ["", "", "", "", "", "Discount", order.discount_ngn],
    ["", "", "", "", "", "Shipping", order.delivery_fee_ngn],
    ["", "", "", "", "", "Total", order.total_ngn],
  ];
  return lines.map((line) => line.map(cell).join(",")).join("\n");
}

export function downloadText(text, filename, type = "text/csv;charset=utf-8") {
  const url = URL.createObjectURL(new Blob([text], { type }));
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}
