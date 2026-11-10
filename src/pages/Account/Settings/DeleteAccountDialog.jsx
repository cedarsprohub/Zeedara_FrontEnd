import { useEffect, useId, useRef, useState } from "react";
import { useAuth } from "../../../context/AuthContext.js";
import { deleteAccount } from "../../../api/auth";
import { ApiError } from "../../../api/client";
import { PasswordField } from "./PasswordParts";

// Confirmation for Delete Account. The design has the row but no dialog, so
// this follows the settings screens' own styling. Accounts with a password
// confirm with it; Google-only accounts type DELETE.
function DeleteAccountDialog({ onClose }) {
  const { user, accessToken, logout } = useAuth();
  const hasPassword = user?.has_password !== false;
  const titleId = useId();
  const dialogRef = useRef(null);

  const [password, setPassword] = useState("");
  const [typed, setTyped] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  // Escape closes (unless mid-request), and focus starts inside the dialog.
  useEffect(() => {
    dialogRef.current?.querySelector("input")?.focus();
    const onKey = (event) => {
      if (event.key === "Escape" && !busy) onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [busy, onClose]);

  const ready = hasPassword ? Boolean(password) : typed.trim().toUpperCase() === "DELETE";

  const submit = async (event) => {
    event.preventDefault();
    if (!ready || busy) return;
    setError("");
    setBusy(true);
    try {
      await deleteAccount(
        hasPassword ? { currentPassword: password } : { confirm: typed.trim() },
        accessToken,
      );
      // The server has already revoked every session; clear this one too.
      // A full load to home rather than navigate(): the guarded account route
      // would otherwise see the logout first and bounce to /login, and it
      // drops anything still held in memory for the deleted account.
      logout();
      window.location.replace("/");
    } catch (err) {
      setError(
        err instanceof ApiError && err.status === 401
          ? "The password you entered is incorrect."
          : err instanceof ApiError
            ? err.message
            : "Something went wrong. Please try again.",
      );
      setBusy(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-0 sm:items-center sm:p-4"
      onClick={(event) => {
        if (event.target === event.currentTarget && !busy) onClose();
      }}
    >
      <form
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onSubmit={submit}
        className="flex max-h-[90vh] w-full flex-col gap-5 overflow-y-auto bg-white p-5 sm:max-w-[480px] sm:p-8"
      >
        <h2 id={titleId} className="text-[20px] font-semibold leading-[1.4] text-black">
          Delete your account?
        </h2>
        <div className="flex flex-col gap-2 text-[14px] font-medium leading-[1.4] text-[#48505e]">
          <p>This can&rsquo;t be undone. Deleting your account will:</p>
          <ul className="list-disc space-y-1 pl-5">
            <li>remove your name, phone number and saved addresses</li>
            <li>sign you out on every device</li>
            <li>free up {user?.email ? <strong className="break-all text-black">{user.email}</strong> : "your email"} so it can be used again</li>
          </ul>
          <p>
            Orders you&rsquo;ve placed are kept for our records and any returns
            or refunds in progress.
          </p>
        </div>

        {hasPassword ? (
          <PasswordField
            id="delete-password"
            label="Enter your password to confirm"
            value={password}
            onChange={setPassword}
            disabled={busy}
          />
        ) : (
          <label className="flex flex-col gap-2">
            <span className="text-[14px] font-medium text-[#667085]">
              Type <strong className="text-black">DELETE</strong> to confirm
            </span>
            <input
              type="text"
              value={typed}
              onChange={(event) => setTyped(event.target.value)}
              disabled={busy}
              autoComplete="off"
              className="h-[58px] w-full border border-[#dadde2] px-[17px] text-[14px] font-medium text-black focus:border-(--primary-color) focus:outline-none"
            />
          </label>
        )}

        {error && (
          <p role="alert" className="bg-[#fae9e9] px-4 py-3 text-[14px] font-medium text-[#cf251f]">
            {error}
          </p>
        )}

        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            disabled={busy}
            className="flex h-10 w-full cursor-pointer items-center justify-center bg-[#f0f1f3] px-4 text-[14px] font-semibold tracking-[0.28px] text-[#48505e] transition-colors hover:text-black disabled:cursor-not-allowed sm:w-[160px]"
          >
            CANCEL
          </button>
          <button
            type="submit"
            disabled={!ready || busy}
            className="flex h-10 w-full cursor-pointer items-center justify-center bg-[#cf251f] px-4 text-[14px] font-semibold tracking-[0.28px] text-white transition-colors hover:bg-[#b01f1a] disabled:cursor-not-allowed disabled:opacity-50 sm:w-[200px]"
          >
            {busy ? "DELETING…" : "DELETE ACCOUNT"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default DeleteAccountDialog;
