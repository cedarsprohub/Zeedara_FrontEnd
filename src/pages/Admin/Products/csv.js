// CSV handling for the product importer. The dialog states the contract it
// accepts — name, sku, category, price, stock, status, tags — so the parser is
// written against that list rather than against whatever a spreadsheet exports.

import { STATUSES } from "./data";

export const TEMPLATE_COLUMNS = [
  "name",
  "sku",
  "category",
  "price",
  "stock",
  "status",
  "tags",
];

// Statuses a row may carry. "All" is a filter tab, not a product state.
const IMPORTABLE_STATUSES = STATUSES.filter((option) => option !== "All");

// Where a row lands when its category doesn't match an existing one — stated
// in the dialog, so it belongs next to the matching that produces it.
export const FALLBACK_CATEGORY = "Wigs";

const DEFAULT_STATUS = "Draft";

// Quoting a field only matters when it contains a delimiter or a quote of its
// own; anything else is written bare so the template stays readable.
function quoteField(value) {
  const text = String(value ?? "");
  if (!/[",\r\n]/.test(text)) return text;
  return `"${text.replace(/"/g, '""')}"`;
}

export function buildTemplateCsv() {
  const example = {
    name: "Bare Lace 13x6 Wig Lacefront",
    sku: "ZD-100",
    category: "Wigs",
    price: "385000",
    stock: "12",
    status: "Active",
    tags: "lacefront,hd",
  };

  return [
    TEMPLATE_COLUMNS.join(","),
    TEMPLATE_COLUMNS.map((column) => quoteField(example[column])).join(","),
  ].join("\r\n");
}

// Splits CSV text into records of fields. Quoted fields are honoured, so a
// product name holding a comma survives the trip — the naive split(",") that
// would otherwise do here breaks on the first one.
function splitRecords(text) {
  const records = [];
  let record = [];
  let field = "";
  let inQuotes = false;
  let index = 0;

  while (index < text.length) {
    const char = text[index];

    if (inQuotes) {
      if (char !== '"') {
        field += char;
      } else if (text[index + 1] === '"') {
        // "" inside a quoted field is a literal quote, not the end of it.
        field += '"';
        index += 1;
      } else {
        inQuotes = false;
      }
      index += 1;
      continue;
    }

    if (char === '"') {
      inQuotes = true;
    } else if (char === ",") {
      record.push(field);
      field = "";
    } else if (char === "\n" || char === "\r") {
      // A CRLF terminates one record, not two.
      if (char === "\r" && text[index + 1] === "\n") index += 1;
      record.push(field);
      records.push(record);
      record = [];
      field = "";
    } else {
      field += char;
    }

    index += 1;
  }

  // A file that doesn't end in a newline still has a final record to close.
  if (field !== "" || record.length > 0) {
    record.push(field);
    records.push(record);
  }

  // Blank lines carry no row — trailing newlines are normal in exported files.
  return records.filter((entry) => entry.some((value) => value.trim() !== ""));
}

// Numbers arrive formatted for people — "₦385,000", "385000.00" — so anything
// that isn't part of the number is stripped before parsing.
function parseNumber(value) {
  const cleaned = String(value ?? "").replace(/[^\d.-]/g, "");
  const parsed = Number.parseFloat(cleaned);
  return Number.isFinite(parsed) ? parsed : null;
}

function matchOption(value, options) {
  const term = String(value ?? "")
    .trim()
    .toLowerCase();
  return options.find((option) => option.toLowerCase() === term) ?? null;
}

/**
 * Parses an uploaded CSV into rows the products table can hold.
 *
 * Returns every row it could read plus a message for each one it couldn't, so
 * a single bad line doesn't cost the user the rest of the file.
 */
export function parseProductsCsv(text, { categories = [], existingSkus = [] }) {
  const records = splitRecords(text);
  if (records.length === 0) {
    return { products: [], errors: ["The file is empty."] };
  }

  const header = records[0].map((column) => column.trim().toLowerCase());
  const missing = ["name", "sku"].filter((column) => !header.includes(column));
  if (missing.length > 0) {
    return {
      products: [],
      errors: [
        `Missing required column${missing.length === 1 ? "" : "s"}: ${missing.join(", ")}. Expected ${TEMPLATE_COLUMNS.join(", ")}.`,
      ],
    };
  }

  const columnAt = (row, column) => {
    const position = header.indexOf(column);
    return position === -1 ? "" : (row[position] ?? "").trim();
  };

  const products = [];
  const errors = [];
  // Rows key off the SKU, both for React and for the selection set, so a
  // duplicate has to be turned away rather than quietly shadowing a row.
  const seenSkus = new Set(existingSkus);

  records.slice(1).forEach((row, offset) => {
    // The header is line 1 and slice dropped it, so a row's own line is +2.
    const line = offset + 2;
    const name = columnAt(row, "name");
    const sku = columnAt(row, "sku");

    if (!name || !sku) {
      errors.push(`Line ${line}: name and sku are both required.`);
      return;
    }

    if (seenSkus.has(sku)) {
      errors.push(`Line ${line}: SKU ${sku} already exists.`);
      return;
    }
    seenSkus.add(sku);

    const price = parseNumber(columnAt(row, "price"));
    const stock = parseNumber(columnAt(row, "stock"));

    products.push({
      sku,
      name,
      // Unmatched categories fall back rather than creating a new one — the
      // filter dropdown is built from the categories that already exist.
      category:
        matchOption(columnAt(row, "category"), categories) ?? FALLBACK_CATEGORY,
      price: price ?? 0,
      compareAt: null,
      stock: stock === null ? 0 : Math.max(0, Math.round(stock)),
      sold: 0,
      variants: 1,
      status:
        matchOption(columnAt(row, "status"), IMPORTABLE_STATUSES) ??
        DEFAULT_STATUS,
      tags: columnAt(row, "tags"),
    });
  });

  if (products.length === 0 && errors.length === 0) {
    errors.push("The file has a header but no rows.");
  }

  return { products, errors };
}
