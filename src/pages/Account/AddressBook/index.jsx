import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Pencil, Plus, Trash2, X } from "lucide-react";
import { useAuth } from "../../../context/AuthContext.js";
import {
  deleteAddress,
  listAddresses,
  updateAddress,
} from "../../../api/addresses";
import { MAX_SAVED_ADDRESSES } from "../../../utils/deliveryOptions";

function IconButton({ label, icon: Icon, onClick, danger = false, disabled }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      className={`flex cursor-pointer items-center justify-center p-1 text-[#48505e] transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${
        danger ? "hover:text-[#cf251f]" : "hover:text-(--primary-color)"
      }`}
    >
      <Icon className="size-[18px] shrink-0" strokeWidth={2} />
    </button>
  );
}

function AddressCard({ address, onMakeDefault, onDelete, disabled }) {
  const region = [address.city, address.state, address.country]
    .filter(Boolean)
    .join(", ");

  return (
    <div className="flex flex-col gap-5 border border-[#dadde2] bg-white p-4 sm:px-5">
      <div className="flex flex-col gap-3">
        {/* Name + default state — wraps on narrow cards */}
        <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2">
          <p className="text-[14px] font-semibold text-black">
            {address.recipient_name}
          </p>
          {address.is_default ? (
            <span className="flex h-8 shrink-0 items-center bg-[#f0f0f0] px-3 text-[10px] font-semibold tracking-[0.24px] text-[#bdc2cb]">
              DEFAULT ADDRESS
            </span>
          ) : (
            <button
              type="button"
              onClick={() => onMakeDefault(address.id)}
              disabled={disabled}
              className="flex h-8 shrink-0 cursor-pointer items-center bg-[#faf4eb] px-3 text-[10px] font-semibold tracking-[0.24px] text-(--primary-color) transition-colors hover:bg-[#f3e7d2] disabled:cursor-not-allowed disabled:opacity-60"
            >
              MAKE DEFAULT ADDRESS
            </button>
          )}
        </div>
        <span className="h-px w-full bg-[#dadde2]" />
      </div>

      <div className="flex items-end justify-between gap-4">
        <p className="text-[13px] font-medium leading-[1.4] text-[#48505e]">
          <span className="block">{address.delivery_address}</span>
          {region && <span className="block">{region}</span>}
          <span className="block">{address.phone}</span>
        </p>
        <div className="flex shrink-0 items-center gap-3">
          <IconButton
            label="Delete address"
            icon={Trash2}
            danger
            disabled={disabled}
            onClick={() => onDelete(address)}
          />
          <Link
            to={`/account/address-book/${address.id}/edit`}
            aria-label={`Edit address for ${address.recipient_name}`}
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

/**
 * Saved addresses, backed by `/api/v1/addresses` — the same collection the
 * checkout address picker reads, so anything saved here is selectable at
 * checkout.
 */
function AddressBook() {
  const { accessToken } = useAuth();

  // Addresses are held with the token they were fetched for, so "loading" is
  // derived rather than tracked separately.
  const [loaded, setLoaded] = useState({
    token: null,
    addresses: [],
    error: null,
  });
  const [pendingDelete, setPendingDelete] = useState(null);
  const [busy, setBusy] = useState(false);

  const isLoading = Boolean(accessToken) && loaded.token !== accessToken;
  const addresses = isLoading ? [] : loaded.addresses;
  const error = isLoading ? null : loaded.error;

  useEffect(() => {
    if (!accessToken) return undefined;
    let active = true;

    listAddresses(accessToken)
      .then((rows) => {
        if (!active) return;
        setLoaded({
          token: accessToken,
          addresses: Array.isArray(rows) ? rows : [],
          error: null,
        });
      })
      .catch((err) => {
        if (!active) return;
        setLoaded({ token: accessToken, addresses: [], error: err.message });
      });

    return () => {
      active = false;
    };
  }, [accessToken]);

  // Both mutations re-read the list afterwards: the server decides what the
  // default is now, and only one address can hold it.
  const reload = async () => {
    const rows = await listAddresses(accessToken);
    setLoaded({
      token: accessToken,
      addresses: Array.isArray(rows) ? rows : [],
      error: null,
    });
  };

  const makeDefault = async (addressId) => {
    setBusy(true);
    try {
      await updateAddress(addressId, { is_default: true }, accessToken);
      await reload();
    } catch (err) {
      setLoaded((prev) => ({ ...prev, error: err.message }));
    } finally {
      setBusy(false);
    }
  };

  const confirmDelete = async () => {
    setBusy(true);
    try {
      await deleteAddress(pendingDelete.id, accessToken);
      setPendingDelete(null);
      await reload();
    } catch (err) {
      setLoaded((prev) => ({ ...prev, error: err.message }));
      setPendingDelete(null);
    } finally {
      setBusy(false);
    }
  };

  const atCapacity = addresses.length >= MAX_SAVED_ADDRESSES;

  return (
    <div className="flex flex-col gap-6 lg:p-8">
      {/* Up to four saved addresses; past that, one has to be edited or freed
          up before another can be added. */}
      <div className="flex flex-col items-stretch gap-2 sm:items-end">
        {atCapacity ? (
          <span className="flex h-10 w-full items-center justify-center gap-2 bg-[#f0f0f0] px-4 text-[12px] font-semibold tracking-[0.28px] text-[#bdc2cb] sm:w-auto">
            ADD NEW ADDRESS
            <Plus className="size-4 shrink-0" strokeWidth={2.5} />
          </span>
        ) : (
          <Link
            to="/account/address-book/new"
            className="flex h-10 w-full cursor-pointer items-center justify-center gap-2 bg-(--primary-color) px-4 text-[12px] font-semibold tracking-[0.28px] text-white transition-opacity hover:opacity-90 sm:w-auto"
          >
            ADD NEW ADDRESS
            <Plus className="size-4 shrink-0" strokeWidth={2.5} />
          </Link>
        )}
        {!isLoading && (
          <p className="text-[12px] font-medium text-[#667085]">
            {addresses.length} of {MAX_SAVED_ADDRESSES} addresses saved
            {atCapacity && " — delete one to add another"}
          </p>
        )}
      </div>

      {error && (
        <p className="bg-[#fae9e9] px-4 py-3 text-[13px] font-medium text-[#cf251f]">
          {error}
        </p>
      )}

      {/* Two per row only from xl — at lg the 300px account rail leaves each
          card too narrow for the name and the default-address button. */}
      {isLoading ? (
        <p className="py-16 text-center text-[13px] font-medium text-[#667085]">
          Loading your addresses…
        </p>
      ) : addresses.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2 xl:gap-6">
          {addresses.map((address) => (
            <AddressCard
              key={address.id}
              address={address}
              onMakeDefault={makeDefault}
              onDelete={setPendingDelete}
              disabled={busy}
            />
          ))}
        </div>
      ) : (
        <p className="py-16 text-center text-[13px] font-medium text-[#667085]">
          No saved addresses yet.
        </p>
      )}

      {pendingDelete && (
        <DeleteDialog
          busy={busy}
          onCancel={() => setPendingDelete(null)}
          onConfirm={confirmDelete}
        />
      )}
    </div>
  );
}

export default AddressBook;
