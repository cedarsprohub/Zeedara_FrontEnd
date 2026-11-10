import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext.js";
import { changePassword } from "../../../api/auth";
import { ApiError } from "../../../api/client";
import NavIcon from "../NavIcon";
import { PasswordField, StrengthMeter } from "./PasswordParts";
import { passwordStrength } from "./passwordRules";
import SuccessPanel from "./SuccessPanel";

const MESSAGES = {
  wrongOld: "The current password you entered is incorrect.",
  unmetRules: "Your password does not meet the requirements.",
  mismatch: "The passwords do not match.",
};

const noErrors = { old: [], confirm: [] };

function ChangePassword() {
  const navigate = useNavigate();
  const { accessToken, logout } = useAuth();

  const [oldPassword, setOldPassword] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [errors, setErrors] = useState(noErrors);
  const [failure, setFailure] = useState("");
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState(false);

  const { allMet } = passwordStrength(password);

  // Enabled once all three fields have something in them — the rule and match
  // checks report as inline errors on submit rather than blocking the button.
  const canSubmit =
    Boolean(oldPassword) && Boolean(password) && Boolean(confirm) && !busy;

  const handleSubmit = async (event) => {
    event.preventDefault();

    // Collect every applicable message — the design shows the unmet-rules and
    // mismatch errors stacked together.
    const confirmErrors = [];
    if (!allMet) confirmErrors.push(MESSAGES.unmetRules);
    if (password !== confirm) confirmErrors.push(MESSAGES.mismatch);

    if (confirmErrors.length) {
      setErrors({ old: [], confirm: confirmErrors });
      return;
    }

    setErrors(noErrors);
    setFailure("");
    setBusy(true);
    try {
      await changePassword(oldPassword, password, accessToken);
      setOldPassword("");
      setPassword("");
      setConfirm("");
      setSaved(true);
    } catch (err) {
      if (!(err instanceof ApiError)) {
        setFailure("Something went wrong. Please try again.");
        return;
      }
      // A rejected current password is the one failure the design gives a field
      // slot to; 422 is the backend re-running its own rules on the new one.
      if (err.status === 422) {
        setErrors({ old: [], confirm: [err.message] });
      } else if ([400, 401, 403].includes(err.status)) {
        setErrors({ old: [MESSAGES.wrongOld], confirm: [] });
      } else {
        setFailure(err.message);
      }
    } finally {
      setBusy(false);
    }
  };

  // The design replaces the whole form with a confirmation panel on success.
  // The backend revokes every refresh token on a password change, so this
  // session is spent — end it here rather than letting it die mid-browse.
  if (saved) {
    return (
      <SuccessPanel
        message="Password updated successfully. Please sign in again with your new password."
        closeLabel="SIGN IN"
        onClose={() => {
          logout();
          navigate("/login", { replace: true });
        }}
      />
    );
  }

  return (
    <div className="flex flex-col gap-6 lg:p-8">
      {/* Back to the settings list (desktop — mobile uses the layout's back) */}
      <button
        type="button"
        onClick={() => navigate("/account/settings")}
        className="hidden h-8 cursor-pointer items-center gap-2 self-start px-3 text-[12px] font-semibold leading-[1.4] text-(--primary-color) lg:flex"
      >
        <NavIcon name="back" box={16} glyphClassName="-rotate-90 -scale-x-100" />
        Back
      </button>

      {failure && (
        <p role="alert" className="max-w-[699px] bg-[#fae9e9] px-4 py-3 text-[14px] font-medium text-[#cf251f]">
          {failure}
        </p>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-9">
        <div className="flex flex-col gap-3">
          <h1 className="text-[20px] font-semibold leading-[1.4] text-black lg:text-[24px]">
            Change Password
          </h1>
          <p className="max-w-[466px] text-[14px] font-medium leading-[1.4] text-black">
            Enter your current password, then create a new one.
          </p>
          {/* Resets from inside the account, as designed, rather than the
              signed-out forgot-password pages. */}
          <Link
            to="/account/settings/reset-password"
            className="w-fit text-[14px] font-semibold text-(--primary-color) hover:underline"
          >
            Forgot Password?
          </Link>
        </div>

        <PasswordField
          id="old-password"
          label="Current Password"
          value={oldPassword}
          onChange={setOldPassword}
          disabled={busy}
          errors={errors.old}
        />

        <div className="flex w-full max-w-[421px] flex-col gap-5">
          <PasswordField
            id="new-password"
            label="New Password"
            value={password}
            onChange={setPassword}
            disabled={busy}
          />
          <PasswordField
            id="confirm-password"
            label="Confirm Password"
            value={confirm}
            onChange={setConfirm}
            disabled={busy}
            errors={errors.confirm}
          />

          <StrengthMeter password={password} />
        </div>

        <button
          type="submit"
          disabled={!canSubmit}
          className="flex h-10 w-full cursor-pointer items-center justify-center bg-(--primary-color) px-4 text-[14px] font-semibold tracking-[0.28px] text-white transition-colors hover:bg-[#a06e1c] disabled:cursor-not-allowed disabled:bg-[#f0f0f0] disabled:text-[#bdc2cb] disabled:opacity-100 sm:w-[263px]"
        >
          {busy ? "UPDATING…" : "UPDATE PASSWORD"}
        </button>
      </form>
    </div>
  );
}

export default ChangePassword;
