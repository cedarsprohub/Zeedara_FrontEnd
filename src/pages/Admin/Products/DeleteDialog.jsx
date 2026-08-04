import { useEffect, useRef } from "react";
import { TriangleAlert, X } from "lucide-react";

// Confirmation for the bulk delete in the selection bar. Locks page scroll and
// closes on Escape, same as the account address dialog.
function DeleteDialog({ count, onCancel, onConfirm }) {
  const cancelButtonRef = useRef(null);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    // Focus lands on Cancel rather than the destructive button, so a stray
    // Enter on an unread dialog backs out instead of deleting the selection.
    cancelButtonRef.current?.focus();

    const handleKeyDown = (event) => {
      if (event.key === "Escape") onCancel();
    };
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [onCancel]);

  // The design writes "product(s)"; the count is known here, so it reads as
  // the sentence it stands in for — matching how the table itself pluralises
  // its variant counts.
  const isOne = count === 1;
  const title = `Delete ${count} ${isOne ? "product" : "products"}?`;

  return (
    // Above the sidebar's z-40, so the scrim covers it as the design shows.
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4"
      onClick={onCancel}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="delete-products-title"
        aria-describedby="delete-products-description"
        onClick={(event) => event.stopPropagation()}
        className="flex w-full max-w-[520px] flex-col overflow-hidden rounded-[4px] bg-white shadow-[0px_24px_24px_rgba(16,24,40,0.18)]"
      >
        <div className="flex items-start gap-3 border-b border-[#f0f1f3] px-[22px] py-7">
          <span className="flex size-[42px] shrink-0 items-center justify-center rounded-[4px] bg-[#fef3f2]">
            <TriangleAlert
              className="size-[21px] text-[#cf251f]"
              strokeWidth={2}
              aria-hidden="true"
            />
          </span>

          <div className="flex min-w-0 flex-1 flex-col gap-1.5">
            <p
              id="delete-products-title"
              className="text-[14px] font-semibold text-black"
            >
              {title}
            </p>
            <p
              id="delete-products-description"
              className="text-[12px] font-medium text-[#828a9b]"
            >
              This permanently removes {isOne ? "it and its" : "them and their"}{" "}
              variants from the catalogue. Existing orders keep their line
              items.
            </p>
          </div>

          <button
            type="button"
            onClick={onCancel}
            aria-label="Close"
            className="flex size-[38px] shrink-0 cursor-pointer items-center justify-center rounded-lg text-[#48505e] transition-colors hover:bg-[#f9fafb] hover:text-black"
          >
            <X className="size-5" strokeWidth={2} />
          </button>
        </div>

        <div className="flex items-center justify-end gap-2.5 bg-[#f0f1f3] px-[22px] py-4">
          <button
            ref={cancelButtonRef}
            type="button"
            onClick={onCancel}
            className="flex h-10 cursor-pointer items-center justify-center rounded-[2px] border border-[#dadde2] bg-white px-3 text-[14px] font-semibold text-[#48505e] transition-colors hover:border-[#9fa5b2] hover:text-black"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="flex h-10 cursor-pointer items-center justify-center rounded-[2px] bg-[#cf251f] px-3 text-[14px] font-semibold text-white transition-opacity hover:opacity-90"
          >
            Delete permanently
          </button>
        </div>
      </div>
    </div>
  );
}

export default DeleteDialog;
