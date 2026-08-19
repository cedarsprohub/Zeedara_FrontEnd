import { useState } from "react";
import { Copy, Check } from "lucide-react";
import { ROLES } from "./data";

function Field({ label, required, value, onChange, error, type = "text", placeholder }) {
  return (
    <label className="flex flex-1 flex-col gap-2">
      <span className="flex items-center gap-1 text-[12px] font-semibold text-[#48505e]">
        {label}
        {required && <span className="text-[#cf251f]">*</span>}
      </span>
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className={`w-full border px-[17px] py-[13px] text-[14px] text-[#262626] placeholder:text-[#9fa5b2] focus:outline-none ${
          error ? "border-[#cf251f]" : "border-[#dadde2] focus:border-(--primary-color)"
        }`}
      />
      {error && <span className="text-[11px] font-medium text-[#cf251f]">{error}</span>}
    </label>
  );
}

function RoleOption({ role, isSelected, onSelect }) {
  return (
    <button
      type="button"
      disabled={role.locked}
      onClick={() => onSelect(role.key)}
      className={`flex flex-1 items-start gap-2.5 border px-3.5 py-4 text-left transition-colors ${
        isSelected
          ? "border-2 border-(--primary-color)"
          : role.locked
            ? "cursor-not-allowed border-[#e5e7eb] opacity-60"
            : "cursor-pointer border-[#e5e7eb] hover:border-[#dadde2]"
      }`}
    >
      <span
        className={`mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full border ${
          isSelected ? "border-4 border-(--primary-color)" : "border-[#e5e7eb]"
        }`}
      />
      <span className="flex flex-1 flex-col gap-1">
        <span className="flex items-center gap-1.5">
          <span className="text-[13px] font-semibold text-[#101828]">{role.label}</span>
          {role.locked && (
            <span className="rounded-[4px] border border-[#e3caa1] bg-[#faf4eb] px-1.5 py-0.5 text-[10px] font-semibold text-(--primary-color)">
              Locked
            </span>
          )}
        </span>
        <span className="text-[11px] font-medium text-[#667085]">{role.description}</span>
        <span className="text-[11px] font-semibold text-[#575f71]">
          {role.grantedCount} of {role.totalPermissions} permissions
        </span>
      </span>
    </button>
  );
}

function StepDetails({
  firstName,
  lastName,
  email,
  password,
  errors,
  onFirstNameChange,
  onLastNameChange,
  onEmailChange,
  roleKey,
  onSelectRole,
}) {
  const [copied, setCopied] = useState(false);

  const copyPassword = async () => {
    await navigator.clipboard.writeText(password);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      <div className="flex flex-col gap-5 border border-[#e5e7eb] bg-white p-5">
        <p className="text-[14px] font-semibold text-[#101828]">Member details</p>

        <div className="flex flex-col gap-4 sm:flex-row">
          <Field
            label="First Name"
            required
            value={firstName}
            onChange={onFirstNameChange}
            error={errors.firstName}
          />
          <Field
            label="Last Name"
            required
            value={lastName}
            onChange={onLastNameChange}
            error={errors.lastName}
          />
        </div>

        <div className="flex flex-col gap-4 sm:flex-row">
          <Field
            label="Email address"
            required
            type="email"
            value={email}
            onChange={onEmailChange}
            error={errors.email}
          />

          <div className="flex flex-1 flex-col gap-2">
            <span className="text-[12px] font-semibold text-[#48505e]">Password</span>
            <div className="flex items-stretch gap-1">
              <div className="flex flex-1 items-center border border-[#dadde2] bg-[#f0f1f3] px-[17px] py-[13px]">
                <p className="truncate text-[14px] font-medium text-[#667085]">{password}</p>
              </div>
              <button
                type="button"
                onClick={copyPassword}
                aria-label="Copy password"
                className="flex shrink-0 cursor-pointer items-center justify-center bg-white p-3 text-[#141b34] transition-colors hover:text-(--primary-color)"
              >
                {copied ? (
                  <Check className="size-5 text-[#0f9959]" strokeWidth={2} />
                ) : (
                  <Copy className="size-5" strokeWidth={1.75} />
                )}
              </button>
            </div>
            <span className="text-[12px] font-medium text-[#9fa5b2]">
              Auto-generated password
            </span>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-4 border border-[#e5e7eb] bg-white p-5">
        <div className="flex flex-col gap-0.5">
          <p className="text-[14px] font-semibold text-black">Choose a role</p>
          <p className="text-[12px] font-medium text-[#667085]">
            The role sets a starting permission set. You can adjust it on the next step.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          {ROLES.map((role) => (
            <RoleOption
              key={role.key}
              role={role}
              isSelected={roleKey === role.key}
              onSelect={onSelectRole}
            />
          ))}
        </div>

        <div className="border border-[#efe0c8] bg-[#fff9f0] px-[15px] py-3">
          <p className="text-[12px] font-medium text-(--primary-color)">
            Super admin grants unrestricted access and cannot be customised or restricted
            later. Two-factor authentication is mandatory for this role.
          </p>
        </div>
      </div>
    </>
  );
}

export default StepDetails;
