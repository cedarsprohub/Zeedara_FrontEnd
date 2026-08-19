import { useState } from "react";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  Plus,
  Search,
  ShieldCheck,
} from "lucide-react";
import Seo from "../../../components/shared/Seo";
import {
  initialsFor,
  MEMBERS_WITHOUT_2FA,
  PAGE_SIZE,
  STAFF_MEMBERS,
  TABS,
} from "./data";

const COLUMNS = [
  { key: "name", label: "Name" },
  { key: "role", label: "Role" },
  { key: "lastActive", label: "Last active" },
  { key: "joined", label: "Joined" },
];

function StaffRoles() {
  const [tab, setTab] = useState("team");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);

  const roleCount = new Set(STAFF_MEMBERS.map((member) => member.role)).size;
  const twoFactorCount = STAFF_MEMBERS.length - MEMBERS_WITHOUT_2FA.length;

  const filtered = STAFF_MEMBERS.filter((member) => {
    const q = query.trim().toLowerCase();
    if (!q) return true;
    return (
      member.name.toLowerCase().includes(q) ||
      member.email.toLowerCase().includes(q)
    );
  });

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const start = (page - 1) * PAGE_SIZE;
  const items = filtered.slice(start, start + PAGE_SIZE);

  const changeQuery = (value) => {
    setQuery(value);
    setPage(1);
  };

  return (
    <div className="flex min-w-0 flex-col gap-5">
      <Seo title="Staff Roles" description="Zeedara admin staff and roles." noindex />

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-[24px] font-bold text-[#262626]">Staff Roles</h1>
          <p className="text-[12px] font-medium text-[#667085]">
            {STAFF_MEMBERS.length} active members · {roleCount} roles ·{" "}
            {twoFactorCount} with two-factor enabled
          </p>
        </div>

        <button
          type="button"
          className="flex cursor-pointer items-center gap-2 bg-(--primary-color) px-4 py-2.5 text-[14px] font-bold text-white transition-opacity hover:opacity-90"
        >
          <Plus className="size-[17px]" strokeWidth={2.5} />
          Add user
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-1 border-b border-[#eaecf0]">
        {TABS.map((option) => {
          const isActive = option.key === tab;
          const count =
            option.key === "team"
              ? STAFF_MEMBERS.length
              : option.key === "roles"
                ? 0
                : 0;
          return (
            <button
              key={option.key}
              type="button"
              onClick={() => setTab(option.key)}
              aria-pressed={isActive}
              className={`flex cursor-pointer items-center gap-2 border-b-2 px-4 py-2.5 text-[14px] transition-colors ${
                isActive
                  ? "border-(--primary-color) font-bold text-(--primary-color)"
                  : "border-transparent font-medium text-[#575f71] hover:text-[#262626]"
              }`}
            >
              {option.label}
              <span
                className={`flex size-[18px] items-center justify-center rounded text-[12px] font-semibold ${
                  isActive
                    ? "bg-[#fdf3e2] text-(--primary-color)"
                    : "bg-[#f0f1f3] text-[#667085]"
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {tab !== "team" ? (
        <div className="border border-[#f0f1f3] bg-white px-4 py-16 text-center text-[14px] text-[#828a9b]">
          {tab === "roles" ? "No custom roles yet." : "No activity recorded yet."}
        </div>
      ) : (
        <>
          {MEMBERS_WITHOUT_2FA.length > 0 && (
            <div className="flex items-start gap-3 rounded-[4px] border border-[#efe0c8] bg-[#fff9f0] px-[15px] py-3">
              <ShieldCheck
                className="mt-0.5 size-5 shrink-0 text-(--primary-color)"
                strokeWidth={1.75}
              />
              <p className="text-[12px] leading-[1.4]">
                <span className="font-bold text-(--primary-color)">
                  {MEMBERS_WITHOUT_2FA.length} active member
                  {MEMBERS_WITHOUT_2FA.length === 1 ? "" : "s"} without
                  two-factor authentication
                </span>
                <br />
                <span className="font-medium text-[#667085]">
                  {MEMBERS_WITHOUT_2FA.join(", ")} — require 2FA under
                  Settings → Security for anyone who can refund or export
                  data.
                </span>
              </p>
            </div>
          )}

          <div className="min-w-0 border border-[#f0f1f3] bg-white">
            <div className="flex items-center border-b border-[#f0f1f3] p-4">
              <div className="flex h-[39px] w-full max-w-[245px] items-center gap-2 border border-[#f0f1f3] bg-white px-3 focus-within:border-[#dadde2]">
                <Search className="size-4 shrink-0 text-[#9fa5b2]" strokeWidth={2} />
                <input
                  type="search"
                  aria-label="Search by name or email"
                  placeholder="Search by name or email"
                  value={query}
                  onChange={(event) => changeQuery(event.target.value)}
                  className="min-w-0 flex-1 bg-transparent text-[14px] text-[#262626] placeholder:text-[#9fa5b2] focus:outline-none"
                />
              </div>
            </div>

            {items.length === 0 ? (
              <p className="px-4 py-16 text-center text-[14px] text-[#828a9b]">
                No staff match this search.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[860px] border-collapse text-left">
                  <thead>
                    <tr className="border-b border-[#f0f1f3] bg-[#fcfcfc]">
                      {COLUMNS.map((column) => (
                        <th key={column.key} scope="col" className="px-4 py-3">
                          <span className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-[#667085]">
                            {column.label}
                            <ChevronDown className="size-3.5 text-[#9fa5b2]" strokeWidth={2} />
                          </span>
                        </th>
                      ))}
                      <th scope="col" className="w-12 px-4 py-3">
                        <input
                          type="checkbox"
                          aria-label="Select all staff on this page"
                          className="size-4 cursor-pointer accent-(--primary-color)"
                        />
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((member) => (
                      <tr
                        key={member.id}
                        className="border-b border-[#f0f1f3] last:border-0 hover:bg-[#fcfcfc]"
                      >
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-(--primary-color) text-[12px] font-bold text-white">
                              {initialsFor(member.name)}
                            </span>
                            <div className="min-w-0">
                              <span className="flex items-center gap-1.5">
                                <span className="truncate text-[14px] font-semibold text-[#262626]">
                                  {member.name}
                                </span>
                                {member.isCurrentUser && (
                                  <span className="shrink-0 rounded-full border border-[#efe0c8] bg-[#fff9f0] px-2 py-0.5 text-[11px] font-semibold text-(--primary-color)">
                                    You
                                  </span>
                                )}
                              </span>
                              <p className="truncate text-[12px] text-[#828a9b]">
                                {member.email}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-[14px] font-semibold text-[#262626]">
                          {member.role}
                        </td>
                        <td className="px-4 py-3 text-[14px] text-[#667085]">
                          {member.lastActive}
                        </td>
                        <td className="px-4 py-3 text-[14px] text-[#667085]">
                          {member.joined}
                        </td>
                        <td className="px-4 py-3">
                          <button
                            type="button"
                            aria-label={`More actions for ${member.name}`}
                            className="cursor-pointer p-1 text-[#828a9b] transition-colors hover:text-black"
                          >
                            <MoreVertical className="size-4" strokeWidth={2} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <div className="flex flex-wrap items-center justify-between gap-4 border-t border-[#f0f1f3] px-4 py-4">
              <p className="text-[14px] text-[#667085]">
                Showing{" "}
                <span className="font-semibold text-[#262626]">
                  {filtered.length === 0 ? 0 : start + 1}–
                  {Math.min(start + PAGE_SIZE, filtered.length)}
                </span>{" "}
                of{" "}
                <span className="font-semibold text-[#262626]">
                  {filtered.length}
                </span>
              </p>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setPage(page - 1)}
                  disabled={page === 1}
                  aria-label="Previous page"
                  className="cursor-pointer p-2 text-[#48505e] transition-colors hover:text-black disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <ChevronLeft className="size-4" strokeWidth={2} />
                </button>

                {Array.from({ length: pageCount }, (_, index) => index + 1).map(
                  (number) => (
                    <button
                      key={number}
                      type="button"
                      onClick={() => setPage(number)}
                      aria-current={number === page ? "page" : undefined}
                      className={`size-8 cursor-pointer text-[14px] transition-colors ${
                        number === page
                          ? "bg-(--primary-color) font-bold text-white"
                          : "text-[#48505e] hover:bg-[#f9fafb]"
                      }`}
                    >
                      {number}
                    </button>
                  ),
                )}

                <button
                  type="button"
                  onClick={() => setPage(page + 1)}
                  disabled={page === pageCount}
                  aria-label="Next page"
                  className="cursor-pointer p-2 text-[#48505e] transition-colors hover:text-black disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <ChevronRight className="size-4" strokeWidth={2} />
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default StaffRoles;
