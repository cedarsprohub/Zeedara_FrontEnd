import { useState } from "react";
import { Link } from "react-router-dom";
import { ChevronRight, ShieldCheck, User } from "lucide-react";

// Settings groups. Selecting one opens its `items` in the detail column beside
// the list (below it on mobile). Items without a `to` — and groups with no
// items — are placeholders until their screens are designed.
const settingsGroups = [
  {
    label: "Profile",
    icon: User,
    items: [
      { label: "Basic Details", to: "/account/settings/basic-details" },
      {
        label: "Change Email Address",
        to: "/account/settings/change-email",
      },
    ],
  },
  { label: "Security", icon: ShieldCheck, items: [] },
];

// Shared row shape for both columns: optional leading icon, label, chevron.
// Group rows (left column) take the amber label plus the primary-1 tint when
// open; detail rows (right column) just turn amber on hover, since they
// navigate away rather than holding a selected state.
function SettingsRow({
  label,
  icon: Icon,
  active = false,
  onClick,
  to,
  detail = false,
}) {
  const Element = to ? Link : "button";
  const elementProps = to ? { to } : { type: "button", onClick };

  const tint = detail
    ? ""
    : active
      ? "bg-[#faf4eb]"
      : "hover:bg-[#faf4eb]";

  const ink = active
    ? "text-(--primary-color)"
    : detail
      ? "text-black group-hover:text-(--primary-color)"
      : "text-black";

  return (
    <Element
      {...elementProps}
      className={`group flex w-full cursor-pointer items-center gap-3 px-4 py-3 text-left transition-colors ${tint}`}
    >
      {Icon && <Icon className={`size-5 shrink-0 ${ink}`} strokeWidth={2} />}
      <span className={`flex-1 text-[13px] font-medium ${ink}`}>{label}</span>
      <ChevronRight className={`size-5 shrink-0 ${ink}`} strokeWidth={2} />
    </Element>
  );
}

function Settings() {
  const [openGroup, setOpenGroup] = useState(null);

  const activeGroup = settingsGroups.find((g) => g.label === openGroup) ?? null;

  const toggleGroup = (label) =>
    setOpenGroup((current) => (current === label ? null : label));

  return (
    <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:gap-[25px] lg:p-8">
      {/* Group list — full width until a group opens, then it shares the row */}
      <div className="flex w-full flex-col gap-3 lg:max-w-[495px]">
        {settingsGroups.map((group, index) => (
          <div key={group.label} className="flex flex-col gap-3">
            {/* Figma drops the separator once a group is open, so the tint on
                the active row reads as one block */}
            {index > 0 && !activeGroup && (
              <span className="h-px w-full bg-[#dadde2]" />
            )}
            <SettingsRow
              label={group.label}
              icon={group.icon}
              active={group.label === openGroup}
              onClick={() => toggleGroup(group.label)}
            />
          </div>
        ))}
      </div>

      {activeGroup && (
        <>
          {/* Divider runs horizontally when the columns stack on mobile */}
          <span className="h-px w-full shrink-0 bg-[#dadde2] lg:h-[495px] lg:w-px" />

          <div className="flex w-full flex-col gap-3 lg:max-w-[495px]">
            {activeGroup.items.length > 0 ? (
              activeGroup.items.map((item, index) => (
                <div key={item.label} className="flex flex-col gap-3">
                  {index > 0 && <span className="h-px w-full bg-[#dadde2]" />}
                  <SettingsRow label={item.label} to={item.to} detail />
                </div>
              ))
            ) : (
              <p className="px-4 py-3 text-[13px] font-medium text-[#667085]">
                {activeGroup.label} settings are coming soon.
              </p>
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default Settings;
