import { useState } from "react";
import { PERMISSION_GROUPS } from "./data";

function InviteeSummary({ firstName, lastName, email, role }) {
  const initials = `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase() || "?";
  return (
    <div className="flex items-center gap-3 border border-[#e5e7eb] bg-white px-4 py-3.5">
      <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[#faf4eb] text-[12px] font-bold text-(--primary-color)">
        {initials}
      </span>
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <p className="truncate text-[14px] font-semibold text-black">
          {firstName} {lastName}
        </p>
        <p className="truncate text-[11px] font-medium text-[#667085]">{email}</p>
      </div>
      <span className="shrink-0 border border-[#e3caa1] bg-[#faf4eb] px-2.5 py-1.5 text-[12px] font-semibold text-(--primary-color)">
        Role: {role.label}
      </span>
    </div>
  );
}

function CustomiseToggle({ checked, onChange }) {
  return (
    <button
      type="button"
      onClick={onChange}
      className={`flex w-full cursor-pointer items-center gap-3 border px-4 py-3.5 text-left transition-colors ${
        checked
          ? "border-[#e3caa1] bg-[#faf4eb]"
          : "border-[#e5e7eb] bg-[#f9fafb]"
      }`}
    >
      <span
        role="switch"
        aria-checked={checked}
        className={`flex h-5 w-9 shrink-0 items-center rounded-full p-0.5 transition-colors ${
          checked ? "bg-(--primary-color)" : "bg-[#dadde2]"
        }`}
      >
        <span
          className={`size-4 rounded-full bg-white shadow transition-transform ${
            checked ? "translate-x-4" : "translate-x-0"
          }`}
        />
      </span>
      <span
        className={`text-[12px] font-semibold ${
          checked ? "text-(--primary-color)" : "text-[#667085]"
        }`}
      >
        Customise permissions for this member
      </span>
    </button>
  );
}

function PermissionRow({ permission, checked, disabled, onToggle }) {
  return (
    <label
      className={`flex items-center gap-3 border-b border-[#e5e7eb] px-4 py-2.5 last:border-0 ${
        disabled ? "" : "cursor-pointer hover:bg-[#fcfcfc]"
      }`}
    >
      <input
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={onToggle}
        className="sr-only"
      />
      <span
        aria-hidden="true"
        className={`flex size-4 shrink-0 items-center justify-center rounded border ${
          checked
            ? "border-(--primary-color) bg-(--primary-color)"
            : "border-[#e5e7eb] bg-white"
        }`}
      >
        {checked && (
          <svg viewBox="0 0 10 8" className="h-2 w-2.5">
            <path
              d="M1 4l2.5 2.5L9 1"
              stroke="white"
              strokeWidth="1.6"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
      </span>
      <div className="flex min-w-0 flex-1 flex-col gap-px">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-[12px] font-medium text-[#101828]">
            {permission.label}
          </span>
          {permission.needs2fa && (
            <span className="border border-[#e3caa1] bg-[#faf4eb] px-1.5 py-px text-[9px] font-semibold text-(--primary-color)">
              Needs 2FA
            </span>
          )}
        </div>
        <span className="text-[10px] text-[#667085]">{permission.key}</span>
      </div>
    </label>
  );
}

function PermissionGroup({ group, permissions, disabled, onTogglePermission }) {
  const grantedCount = group.permissions.filter((p) => permissions[p.key]).length;

  return (
    <div>
      <div className="border-b border-[#e5e7eb] bg-[#f9fafb] px-4 py-2.5">
        <p className="text-[11px] font-semibold tracking-wide text-[#575f71] uppercase">
          {group.label} · {grantedCount} of {group.permissions.length} granted
        </p>
      </div>
      {group.permissions.map((permission) => (
        <PermissionRow
          key={permission.key}
          permission={permission}
          checked={Boolean(permissions[permission.key])}
          disabled={disabled}
          onToggle={() => onTogglePermission(permission.key)}
        />
      ))}
    </div>
  );
}

function StepPermissions({ firstName, lastName, email, role, permissions, onTogglePermission }) {
  const [customize, setCustomize] = useState(true);
  const disabled = role.locked || !customize;

  return (
    <div className="flex flex-col gap-4">
      <InviteeSummary firstName={firstName} lastName={lastName} email={email} role={role} />

      {!role.locked && (
        <CustomiseToggle checked={customize} onChange={() => setCustomize((v) => !v)} />
      )}

      <div className="border border-[#e5e7eb] bg-white">
        {role.locked ? (
          <p className="px-4 py-12 text-center text-[13px] font-medium text-[#667085]">
            Super admin grants every permission and can&apos;t be customised.
          </p>
        ) : (
          PERMISSION_GROUPS.map((group) => (
            <PermissionGroup
              key={group.key}
              group={group}
              permissions={permissions}
              disabled={disabled}
              onTogglePermission={onTogglePermission}
            />
          ))
        )}
      </div>
    </div>
  );
}

export default StepPermissions;
