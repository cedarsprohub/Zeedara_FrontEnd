import { ShieldCheck, Pencil } from "lucide-react";
import { initialsFor } from "./data";

function RoleCard({ role }) {
  const percent = Math.round((role.grantedCount / role.totalCount) * 100);

  return (
    <div className="flex flex-col gap-4 rounded-xl border-[0.8px] border-[#f0f1f3] bg-white p-4 shadow-[0px_1px_1px_rgba(16,24,40,0.05)]">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <span className="flex size-[38px] shrink-0 items-center justify-center rounded-full border border-[#efe0c8] bg-[#faf4eb]">
            <ShieldCheck className="size-5 text-(--primary-color)" strokeWidth={1.75} />
          </span>
          <div className="flex flex-col gap-0.5 pt-1.5">
            <p className="text-[14px] font-semibold text-black">{role.name}</p>
            {role.description && (
              <p className="text-[12px] font-medium text-[#828a9b]">
                {role.description}
              </p>
            )}
          </div>
        </div>
        <button
          type="button"
          aria-label={`Rename ${role.name}`}
          className="flex size-[38px] shrink-0 cursor-pointer items-center justify-center text-[#828a9b] transition-colors hover:text-black"
        >
          <Pencil className="size-4" strokeWidth={1.75} />
        </button>
      </div>

      <div className="flex flex-col gap-3 border-t border-[#f0f1f3] pt-4">
        <div className="flex items-center justify-between gap-3">
          <p className="text-[12px] font-medium text-[#828a9b]">Members</p>
          <div className="flex flex-1 flex-wrap justify-end gap-2">
            {role.members.map((member, index) => (
              <span
                key={`${member}-${index}`}
                className="flex items-center gap-1.5 text-[14px] font-semibold text-[#262626]"
              >
                <span className="flex size-6 shrink-0 items-center justify-center rounded-md bg-(--primary-color) text-[10px] font-bold text-white">
                  {initialsFor(member)}
                </span>
                {member}
              </span>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between gap-3">
            <p className="text-[12px] font-medium text-[#828a9b]">Permissions</p>
            <div className="flex items-center gap-2">
              <span className="text-[14px] font-semibold text-black">
                {role.grantedCount} of {role.totalCount}
              </span>
              {role.fullAccess && (
                <span className="rounded-[4px] border border-[#efe0c8] bg-[#faf4eb] px-2 py-0.5 text-[12px] font-semibold text-(--primary-color)">
                  Full access
                </span>
              )}
            </div>
          </div>
          <div className="h-[5px] w-full rounded-full bg-[#f0f1f3]">
            <div
              className="h-full rounded-full bg-(--primary-color)"
              style={{ width: `${percent}%` }}
            />
          </div>
        </div>
      </div>

      {role.categories ? (
        <div className="flex flex-wrap gap-2">
          {role.categories.map((category) => (
            <span
              key={category.label}
              className="rounded-md border border-[#f0f1f3] bg-white px-2.5 py-1.5 text-[12px] font-semibold text-[#48505e]"
            >
              {category.label} {category.granted}/{category.total}
            </span>
          ))}
        </div>
      ) : (
        <span className="w-fit rounded-[4px] border border-[#efe0c8] bg-[#faf4eb] px-2.5 py-1 text-[12px] font-semibold text-(--primary-color)">
          All Permissions
        </span>
      )}

      <button
        type="button"
        className="cursor-pointer border border-[#f0f1f3] bg-white py-2.5 text-[14px] font-semibold text-[#48505e] transition-colors hover:border-[#dadde2] hover:text-black"
      >
        Edit permissions
      </button>
    </div>
  );
}

function RolesTab({ roles }) {
  if (roles.length === 0) {
    return (
      <div className="border border-[#f0f1f3] bg-white px-4 py-16 text-center text-[14px] text-[#828a9b]">
        No custom roles yet.
      </div>
    );
  }

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {roles.map((role) => (
        <RoleCard key={role.id} role={role} />
      ))}
    </div>
  );
}

export default RolesTab;
