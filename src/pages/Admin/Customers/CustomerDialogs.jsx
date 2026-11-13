import { useEffect, useId, useRef, useState } from "react";
import { TriangleAlert, X } from "lucide-react";
import { fullName } from "./data";

// Scrim + panel shared by both dialogs: locks page scroll, Escape closes
// (unless a request is in flight), clicking the scrim closes.
function DialogShell({ titleId, busy, onClose, children }) {
  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKeyDown = (event) => {
      if (event.key === "Escape" && !busy) onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previous;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [busy, onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/30 sm:items-center sm:p-4"
      onClick={() => !busy && onClose()}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onClick={(event) => event.stopPropagation()}
        className="flex max-h-[90vh] w-full flex-col overflow-y-auto rounded-t-[4px] bg-white shadow-[0px_24px_24px_rgba(16,24,40,0.18)] sm:max-w-[520px] sm:rounded-[4px]"
      >
        {children}
      </div>
    </div>
  );
}

function CloseButton({ onClick, disabled }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label="Close"
      className="flex size-[38px] shrink-0 cursor-pointer items-center justify-center rounded-lg text-[#48505e] transition-colors hover:bg-[#f9fafb] hover:text-black disabled:cursor-not-allowed"
    >
      <X className="size-5" strokeWidth={2} />
    </button>
  );
}

const footerCls = "flex flex-col-reverse gap-2.5 bg-[#f0f1f3] px-[22px] py-4 sm:flex-row sm:justify-end";
const cancelCls =
  "flex h-10 cursor-pointer items-center justify-center rounded-[2px] border border-[#dadde2] bg-white px-3 text-[14px] font-semibold text-[#48505e] transition-colors hover:border-[#9fa5b2] hover:text-black disabled:cursor-not-allowed";

function ErrorNote({ message }) {
  if (!message) return null;
  return (
    <p role="alert" className="bg-[#fae9e9] px-4 py-3 text-[13px] font-medium text-[#cf251f]">
      {message}
    </p>
  );
}

// "Edit details": the fields an admin can correct on a customer's behalf.
// Email isn't here — changing it needs the customer to verify the new inbox.
export function EditCustomerDialog({ customer, onClose, onSave }) {
  const titleId = useId();
  const firstRef = useRef(null);
  const [form, setForm] = useState({
    first_name: customer.first_name ?? "",
    last_name: customer.last_name ?? "",
    phone_number: customer.phone_number ?? "",
  });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => firstRef.current?.focus(), []);

  const submit = async (event) => {
    event.preventDefault();
    const patch = {};
    for (const [key, value] of Object.entries(form)) {
      const next = value.trim() || null;
      if (next !== (customer[key] ?? null)) patch[key] = next;
    }
    if (!Object.keys(patch).length) return onClose();
    setBusy(true);
    setError("");
    try {
      await onSave(patch);
    } catch (err) {
      setError(err.message || "Couldn't save the changes.");
      setBusy(false);
    }
  };

  const field = (key, label, props = {}) => (
    <label className="flex flex-col gap-1.5">
      <span className="text-[12px] font-medium text-[#667085]">{label}</span>
      <input
        value={form[key]}
        onChange={(event) => setForm((previous) => ({ ...previous, [key]: event.target.value }))}
        disabled={busy}
        className="h-[41px] w-full border border-[#dadde2] px-3 text-[14px] font-medium text-black focus:border-(--primary-color) focus:outline-none disabled:bg-[#f9fafb]"
        {...props}
      />
    </label>
  );

  return (
    <DialogShell titleId={titleId} busy={busy} onClose={onClose}>
      <form onSubmit={submit} noValidate>
        <div className="flex items-start gap-3 border-b border-[#f0f1f3] px-[22px] py-6">
          <div className="flex min-w-0 flex-1 flex-col gap-1">
            <p id={titleId} className="text-[16px] font-semibold text-black">
              Edit details
            </p>
            <p className="truncate text-[12px] font-medium text-[#828a9b]">{customer.email}</p>
          </div>
          <CloseButton onClick={onClose} disabled={busy} />
        </div>

        <div className="flex flex-col gap-4 px-[22px] py-6">
          <ErrorNote message={error} />
          <div className="grid gap-4 sm:grid-cols-2">
            {field("first_name", "First name", { ref: firstRef, autoComplete: "off" })}
            {field("last_name", "Last name", { autoComplete: "off" })}
          </div>
          {field("phone_number", "Phone number", { type: "tel", autoComplete: "off" })}
        </div>

        <div className={footerCls}>
          <button type="button" onClick={onClose} disabled={busy} className={cancelCls}>
            Cancel
          </button>
          <button
            type="submit"
            disabled={busy}
            className="flex h-10 cursor-pointer items-center justify-center rounded-[2px] bg-(--primary-color) px-4 text-[14px] font-semibold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {busy ? "Saving…" : "Save changes"}
          </button>
        </div>
      </form>
    </DialogShell>
  );
}

const CONFIRM_COPY = {
  block: (name) => ({
    title: `Block ${name}?`,
    body: "They'll be signed out everywhere and won't be able to sign in or check out until you unblock them. Their orders and history stay as they are.",
    action: "Block customer",
  }),
  unblock: (name) => ({
    title: `Unblock ${name}?`,
    body: "They'll be able to sign in and place orders again.",
    action: "Unblock customer",
  }),
  delete: (name) => ({
    title: `Delete ${name}?`,
    body: "This clears their name, phone number and saved addresses, frees their email for a new sign-up and signs them out everywhere. It can't be undone. Orders they've placed are kept for your records.",
    action: "Delete customer",
  }),
};

// Block / Unblock / Delete confirmation.
export function ConfirmCustomerDialog({ kind, customer, onClose, onConfirm }) {
  const titleId = useId();
  const cancelRef = useRef(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const copy = CONFIRM_COPY[kind](fullName(customer));
  const destructive = kind !== "unblock";

  // Focus starts on Cancel so a stray Enter backs out.
  useEffect(() => cancelRef.current?.focus(), []);

  const confirm = async () => {
    setBusy(true);
    setError("");
    try {
      await onConfirm();
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
      setBusy(false);
    }
  };

  return (
    <DialogShell titleId={titleId} busy={busy} onClose={onClose}>
      <div className="flex items-start gap-3 border-b border-[#f0f1f3] px-[22px] py-7">
        <span
          className={`flex size-[42px] shrink-0 items-center justify-center rounded-[4px] ${
            destructive ? "bg-[#fef3f2] text-[#cf251f]" : "bg-[#eefeec] text-[#0f9959]"
          }`}
        >
          <TriangleAlert className="size-[21px]" strokeWidth={2} aria-hidden="true" />
        </span>
        <div className="flex min-w-0 flex-1 flex-col gap-1.5">
          <p id={titleId} className="break-words text-[14px] font-semibold text-black">
            {copy.title}
          </p>
          <p className="text-[12px] font-medium text-[#828a9b]">{copy.body}</p>
          <ErrorNote message={error} />
        </div>
        <CloseButton onClick={onClose} disabled={busy} />
      </div>
      <div className={footerCls}>
        <button ref={cancelRef} type="button" onClick={onClose} disabled={busy} className={cancelCls}>
          Cancel
        </button>
        <button
          type="button"
          onClick={confirm}
          disabled={busy}
          className={`flex h-10 cursor-pointer items-center justify-center rounded-[2px] px-3 text-[14px] font-semibold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60 ${
            destructive ? "bg-[#cf251f]" : "bg-[#0f9959]"
          }`}
        >
          {busy ? "Working…" : copy.action}
        </button>
      </div>
    </DialogShell>
  );
}
