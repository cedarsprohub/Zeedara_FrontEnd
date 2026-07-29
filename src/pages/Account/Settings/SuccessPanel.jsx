import successImage from "../../../assets/account/success_check.svg";

// Shared confirmation panel for the settings flows — the change-email and
// change-password designs use the same illustration, heading and CLOSE button,
// differing only in the message.
function SuccessPanel({ message, onClose, closeLabel = "CLOSE" }) {
  return (
    <div className="flex flex-col items-center gap-8 py-16">
      <img
        src={successImage}
        alt=""
        className="h-[181px] w-[260px] max-w-full"
      />
      <p className="max-w-[296px] text-center text-[16px] font-semibold leading-[1.4] text-black">
        {message}
      </p>
      <button
        type="button"
        onClick={onClose}
        className="flex h-10 w-full cursor-pointer items-center justify-center bg-(--primary-color) px-4 text-[12px] font-semibold tracking-[0.28px] text-white transition-opacity hover:opacity-90 sm:w-[247px]"
      >
        {closeLabel}
      </button>
    </div>
  );
}

export default SuccessPanel;
