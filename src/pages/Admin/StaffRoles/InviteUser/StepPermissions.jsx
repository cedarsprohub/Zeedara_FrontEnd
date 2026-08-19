import { PERMISSIONS } from "./data";

function StepPermissions({ role, permissions, onTogglePermission }) {
  const grantedCount = PERMISSIONS.filter((permission) => permissions[permission.key]).length;

  return (
    <div className="flex flex-col gap-4 border border-[#e5e7eb] bg-white p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex flex-col gap-0.5">
          <p className="text-[14px] font-semibold text-black">
            {role.label} permissions
          </p>
          <p className="text-[12px] font-medium text-[#667085]">
            {role.locked
              ? "Super admin includes every permission and can't be customised."
              : "Toggle any key permission on or off for this member."}
          </p>
        </div>
        <span className="rounded-[4px] border border-[#e3caa1] bg-[#faf4eb] px-2.5 py-1 text-[12px] font-semibold text-(--primary-color)">
          {grantedCount} of {PERMISSIONS.length} key permissions enabled
        </span>
      </div>

      <div className="flex flex-col divide-y divide-[#f0f1f3] border-t border-[#f0f1f3]">
        {PERMISSIONS.map((permission) => {
          const isGranted = Boolean(permissions[permission.key]);
          return (
            <div
              key={permission.key}
              className="flex items-center justify-between gap-4 py-3"
            >
              <span className="text-[13px] font-medium text-[#262626]">
                {permission.label}
              </span>
              <button
                type="button"
                role="switch"
                aria-checked={isGranted}
                aria-label={permission.label}
                disabled={role.locked}
                onClick={() => onTogglePermission(permission.key)}
                className={`flex h-6 w-11 shrink-0 items-center rounded-full p-0.5 transition-colors ${
                  role.locked ? "cursor-not-allowed" : "cursor-pointer"
                } ${isGranted ? "bg-(--primary-color)" : "bg-[#dadde2]"}`}
              >
                <span
                  className={`size-5 rounded-full bg-white shadow transition-transform ${
                    isGranted ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default StepPermissions;
