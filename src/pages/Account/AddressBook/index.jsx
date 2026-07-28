import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Pencil, Plus, Trash2, X } from "lucide-react";

const ADDRESSES = [
  {
    id: 1,
    name: "Desmond Jumbo",
    street: "No. 64 Park Community,",
    city: "Bonny Island, Rivers State.",
    phone: "+234 xxx xxx xxxx",
    isDefault: true,
  },
  {
    id: 2,
    name: "Desmond Jumbo",
    street: "No. 64 Park Community,",
    city: "Bonny Island, Rivers State.",
    phone: "+234 xxx xxx xxxx",
  },
  {
    id: 3,
    name: "Desmond Jumbo",
    street: "No. 64 Park Community,",
    city: "Bonny Island, Rivers State.",
    phone: "+234 xxx xxx xxxx",
  },
  {
    id: 4,
    name: "Desmond Jumbo",
    street: "No. 64 Park Community,",
    city: "Bonny Island, Rivers State.",
    phone: "+234 xxx xxx xxxx",
  },
];

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

function AddressCard({ address, onMakeDefault, onDelete }) {
  return (
    <div className="flex flex-col gap-5 border border-[#dadde2] bg-white p-4 sm:px-5">
      <div className="flex flex-col gap-3">
        {/* Name + default state — wraps on narrow cards */}
        <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2">
          <p className="text-[14px] font-semibold text-black">{address.name}</p>
          {address.isDefault ? (
            <span className="flex h-8 shrink-0 items-center bg-[#f0f0f0] px-3 text-[12px] font-semibold tracking-[0.24px] text-[#bdc2cb]">
              DEFAULT ADDRESS
            </span>
          ) : (
            <button
              type="button"
              onClick={() => onMakeDefault(address.id)}
              className="flex h-8 shrink-0 cursor-pointer items-center bg-[#faf4eb] px-3 text-[12px] font-semibold tracking-[0.24px] text-(--primary-color) transition-colors hover:bg-[#f3e7d2]"
            >
              MAKE DEFAULT ADDRESS
            </button>
          )}
        </div>
        <span className="h-px w-full bg-[#dadde2]" />
      </div>

      <div className="flex items-end justify-between gap-4">
        <p className="text-[13px] font-medium leading-[1.4] text-[#48505e]">
          {address.street}
          <br />
          {address.city}
          <br />
          {address.phone}
        </p>
        <div className="flex shrink-0 items-center gap-3">
          <IconButton
            label="Delete address"
            icon={Trash2}
            danger
            onClick={() => onDelete(address.id)}
          />
          <IconButton label="Edit address" icon={Pencil} />
        </div>
      </div>
    </div>
  );
}

// Confirmation shown before an address is removed. Locks page scroll and
// closes on Escape, same as the cart drawer.
function DeleteDialog({ onCancel, onConfirm }) {
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
            className="flex h-10 w-full cursor-pointer items-center justify-center bg-[#f0f0f0] px-3 text-[13px] font-semibold tracking-[0.28px] text-[#bdc2cb] transition-colors hover:text-[#667085] sm:w-[133px]"
          >
            CANCEL
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="flex h-10 w-full cursor-pointer items-center justify-center bg-[#cf251f] px-3 text-[13px] font-semibold tracking-[0.28px] text-white transition-opacity hover:opacity-90 sm:w-[133px]"
          >
            CONFIRM
          </button>
        </div>
      </div>
    </div>
  );
}

function AddressBook() {
  const [addresses, setAddresses] = useState(ADDRESSES);
  const [pendingDeleteId, setPendingDeleteId] = useState(null);

  const makeDefault = (id) =>
    setAddresses((prev) =>
      prev.map((address) => ({ ...address, isDefault: address.id === id })),
    );

  const confirmDelete = () => {
    setAddresses((prev) =>
      prev.filter((address) => address.id !== pendingDeleteId),
    );
    setPendingDeleteId(null);
  };

  return (
    <div className="flex flex-col gap-6 lg:p-8">
      <Link
        to="/account/address-book/new"
        className="flex h-10 w-full cursor-pointer items-center justify-center gap-2 bg-(--primary-color) px-4 text-[13px] font-semibold tracking-[0.28px] text-white transition-opacity hover:opacity-90 sm:w-auto sm:self-end"
      >
        ADD NEW ADDRESS
        <Plus className="size-4 shrink-0" strokeWidth={2.5} />
      </Link>

      {/* Two per row only from xl — at lg the 300px account rail leaves each
          card too narrow for the name and the default-address button. */}
      {addresses.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2 xl:gap-6">
          {addresses.map((address) => (
            <AddressCard
              key={address.id}
              address={address}
              onMakeDefault={makeDefault}
              onDelete={setPendingDeleteId}
            />
          ))}
        </div>
      ) : (
        <p className="py-16 text-center text-[13px] font-medium text-[#667085]">
          No saved addresses yet.
        </p>
      )}

      {pendingDeleteId !== null && (
        <DeleteDialog
          onCancel={() => setPendingDeleteId(null)}
          onConfirm={confirmDelete}
        />
      )}
    </div>
  );
}

export default AddressBook;
