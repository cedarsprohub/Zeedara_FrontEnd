import { PERMISSIONS } from "./data";

function SummaryField({ label, value }) {
  return (
    <div className="flex flex-1 flex-col gap-0.5 bg-[#f9fafb] px-3.5 py-3">
      <p className="text-[10px] font-semibold text-[#828a9b]">{label}</p>
      <p className="truncate text-[14px] text-black">{value}</p>
    </div>
  );
}

function PermissionList({ title, subtitle, items, dotColor }) {
  return (
    <div className="flex flex-1 flex-col gap-2.5 border border-[#dadde2] p-5">
      <div className="flex flex-col gap-0.5">
        <p className="text-[14px] font-semibold text-black">{title}</p>
        <p className="text-[11px] font-medium text-[#667085]">{subtitle}</p>
      </div>
      <div className="flex flex-col gap-1.5">
        {items.length === 0 ? (
          <p className="text-[11px] font-medium text-[#9fa5b2]">None.</p>
        ) : (
          items.map((item) => (
            <div key={item.key} className="flex items-center gap-2">
              <span
                className="size-1.5 shrink-0 rounded-full"
                style={{ backgroundColor: dotColor }}
              />
              <p className="text-[11px] font-medium text-[#575f71]">{item.label}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function StepReview({ firstName, lastName, email, role, permissions }) {
  const name = `${firstName} ${lastName}`.trim();
  const granted = PERMISSIONS.filter((permission) => permissions[permission.key]);
  const restricted = PERMISSIONS.filter((permission) => !permissions[permission.key]);

  return (
    <>
      <div className="flex flex-col gap-3.5 border border-[#e5e7eb] bg-white p-5">
        <p className="text-[14px] font-semibold text-[#101828]">Invitation summary</p>
        <div className="flex flex-col gap-4 sm:flex-row">
          <SummaryField label="Member" value={name} />
          <SummaryField label="Work email" value={email} />
          <SummaryField label="Role" value={role.label} />
        </div>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row">
        <PermissionList
          title={`${firstName || "This member"} will be able to`}
          // Counted straight from the list below it, so it can never drift out
          // of sync with what's actually shown (as the "12 permissions
          // granted" copy that shipped alongside 8 bullets once did).
          subtitle={`${granted.length} permission${granted.length === 1 ? "" : "s"} granted`}
          items={granted}
          dotColor="#bf8322"
        />
        <PermissionList
          title={`${firstName || "This member"} will not be able to`}
          subtitle="Key restrictions for this role"
          items={restricted}
          dotColor="#cf251f"
        />
      </div>
    </>
  );
}

export default StepReview;
