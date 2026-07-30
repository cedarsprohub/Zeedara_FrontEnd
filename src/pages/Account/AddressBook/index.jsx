import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Pencil, Plus, Trash2, X } from "lucide-react";
import { useAuth } from "../../../context/AuthContext.js";
import { updateMe } from "../../../api/auth";

function IconButton({ label, icon: Icon, onClick, danger = false }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className={`flex cursor-pointer items-center justify-center p-1 text-[#48505e] transition-colors ${
        danger ? "hover:text-[#cf251f]" : "hover:text-(--primary-color)"
      }`}
    >
      <Icon className="size-[18px] shrink-0" strokeWidth={2} />
    </button>
  );
}

// The account carries a single address string (see NewAddress's
// `composeAddress`), so the first line is the recipient and the rest is the
// address itself. It's the only address on file, hence always the default.
function AddressCard({ lines, onDelete }) {
  const [name, ...rest] = lines;

  return (
    <div className="flex flex-col gap-5 border border-[#dadde2] bg-white p-4 sm:px-5">
      <div className="flex flex-col gap-3">
        {/* Name + default state — wraps on narrow cards */}
        <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2">
          <p className="text-[14px] font-semibold text-black">{name}</p>
          <span className="flex h-8 shrink-0 items-center bg-[#f0f0f0] px-3 text-[10px] font-semibold tracking-[0.24px] text-[#bdc2cb]">
            DEFAULT ADDRESS
          </span>
        </div>
        <span className="h-px w-full bg-[#dadde2]" />
      </div>

      <div className="flex items-end justify-between gap-4">
        <p className="text-[13px] font-medium leading-[1.4] text-[#48505e]">
          {rest.map((line, index) => (
            <span key={index} className="block">
              {line}
            </span>
          ))}
        </p>
        <div className="flex shrink-0 items-center gap-3">
          <IconButton
            label="Delete address"
            icon={Trash2}
            danger
            onClick={onDelete}
          />
          {/* Editing replaces the one stored address, so it reuses the form */}
          <Link
            to="/account/address-book/new"
            aria-label="Edit address"
            title="Edit address"
            className="flex cursor-pointer items-center justify-center p-1 text-[#48505e] transition-colors hover:text-(--primary-color)"
          >
            <Pencil className="size-[18px] shrink-0" strokeWidth={2} />
          </Link>
        </div>
      </div>
    </div>
  );
}

// Confirmation shown before an address is removed. Locks page scroll and
// closes on Escape, same as the cart drawer.
function DeleteDialog({ busy, onCancel, onConfirm }) {
  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event) => {
      if (event.key === "Escape") onCancel();
    };
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [onCancel]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4"
      onClick={onCancel}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Delete this Address?"
        onClick={(e) => e.stopPropagation()}
        className="flex w-full max-w-[541px] flex-col gap-6 bg-white px-5 py-6"
      >
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between gap-4">
            <p className="text-[14px] font-semibold text-black">
              Delete this Address?
            </p>
            <button
              type="button"
              onClick={onCancel}
              aria-label="Close"
              className="flex cursor-pointer items-center justify-center p-1 text-[#48505e] transition-colors hover:text-black"
            >
              <X className="size-5 shrink-0" strokeWidth={2} />
            </button>
          </div>
          <p className="text-[13px] font-medium text-black">
            This address will be permanently deleted
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end sm:gap-6">
          <button
            type="button"
            onClick={onCancel}
            disabled={busy}
            className="flex h-10 w-full cursor-pointer items-center justify-center bg-[#f0f0f0] px-3 text-[13px] font-semibold tracking-[0.28px] text-[#bdc2cb] transition-colors hover:text-[#667085] disabled:cursor-not-allowed disabled:opacity-60 sm:w-[133px]"
          >
            CANCEL
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={busy}
            className="flex h-10 w-full cursor-pointer items-center justify-center bg-[#cf251f] px-3 text-[13px] font-semibold tracking-[0.28px] text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60 sm:w-[133px]"
          >
            {busy ? "DELETING…" : "CONFIRM"}
          </button>
        </div>
      </div>
    </div>
  );
}

function AddressBook() {
  // `RequireAuth` gates this route, so `user` is already loaded by now.
  const { user, accessToken, setUser } = useAuth();

  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  const lines = (user?.address ?? "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  const confirmDelete = async () => {
    setError(null);
    setBusy(true);
    try {
      const updated = await updateMe({ address: null }, accessToken);
      setUser(updated);
      setConfirmingDelete(false);
    } catch (err) {
      setError(err.message);
      setConfirmingDelete(false);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 lg:p-8">
      <Link
        to="/account/address-book/new"
        className="flex h-10 w-full cursor-pointer items-center justify-center gap-2 bg-(--primary-color) px-4 text-[12px] font-semibold tracking-[0.28px] text-white transition-opacity hover:opacity-90 sm:w-auto sm:self-end"
      >
        {lines.length ? "CHANGE ADDRESS" : "ADD NEW ADDRESS"}
        <Plus className="size-4 shrink-0" strokeWidth={2.5} />
      </Link>

      {error && (
        <p className="bg-[#fae9e9] px-4 py-3 text-[13px] font-medium text-[#cf251f]">
          {error}
        </p>
      )}

      {/* Two per row only from xl — at lg the 300px account rail leaves each
          card too narrow for the name and the default-address button. */}
      {lines.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2 xl:gap-6">
          <AddressCard
            lines={lines}
            onDelete={() => setConfirmingDelete(true)}
          />
        </div>
      ) : (
        <p className="py-16 text-center text-[13px] font-medium text-[#667085]">
          No saved addresses yet.
        </p>
      )}

      {confirmingDelete && (
        <DeleteDialog
          busy={busy}
          onCancel={() => setConfirmingDelete(false)}
          onConfirm={confirmDelete}
        />
      )}
    </div>
  );
}

export default AddressBook;
