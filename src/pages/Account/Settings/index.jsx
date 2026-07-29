import { ChevronRight, ShieldCheck, User } from "lucide-react";

// Settings landing — each entry opens its own screen. Items without a `to` are
// placeholders until those screens are built, same convention as the rail in
// `AccountLayout`.
const settingsItems = [
  { label: "Profile", icon: User },
  { label: "Security", icon: ShieldCheck },
];

function SettingsRow({ item }) {
  const { label, icon: Icon } = item;

  return (
    <button
      type="button"
      className="flex w-full cursor-pointer items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-[#faf4eb]"
    >
      <Icon className="size-5 shrink-0 text-black" strokeWidth={2} />
      <span className="flex-1 text-[13px] font-medium text-black">{label}</span>
      <ChevronRight className="size-5 shrink-0 text-black" strokeWidth={2} />
    </button>
  );
}

function Settings() {
  return (
    <div className="flex flex-col gap-6 lg:p-8">
      <div className="flex w-full flex-col gap-3 lg:max-w-[495px]">
        {settingsItems.map((item, index) => (
          <div key={item.label} className="flex flex-col gap-3">
            {index > 0 && <span className="h-px w-full bg-[#dadde2]" />}
            <SettingsRow item={item} />
          </div>
        ))}
      </div>
    </div>
  );
}

export default Settings;
