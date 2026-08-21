import { CheckCircle2, Info } from "lucide-react";

// Two-row status card: a clean catalogue shows only the green row, an admin
// who's just added a category with nothing in it yet sees the amber one too,
// naming which category to fix.
function UncategorisedCheck({ uncategorisedCount, emptyCategories }) {
  const isClean = uncategorisedCount === 0;

  return (
    <div className="border border-[#f0f1f3] bg-white">
      <div className="border-b border-[#f0f1f3] px-[18px] py-4">
        <h2 className="text-[14px] font-bold text-[#262626]">Uncategorised check</h2>
      </div>
      <div className="flex flex-col gap-3 p-[18px]">
        <div
          className="flex items-start gap-3 rounded-[4px] border-[0.667px] px-[15px] py-3"
          style={{
            backgroundColor: isClean ? "#eefeec" : "#fdf2f2",
            borderColor: isClean ? "#c5e7d7" : "#f3d3d2",
          }}
        >
          <CheckCircle2
            className="mt-px size-[18px] shrink-0"
            strokeWidth={2}
            style={{ color: isClean ? "#0f9959" : "#cf251f" }}
            aria-hidden="true"
          />
          <div
            className="flex min-w-0 flex-1 flex-col text-[12px]"
            style={{ color: isClean ? "#0f9959" : "#cf251f" }}
          >
            <p className="pb-0.5 font-bold">
              {isClean
                ? "Every product is categorised"
                : `${uncategorisedCount} uncategorised product${uncategorisedCount === 1 ? "" : "s"}`}
            </p>
            <p className="font-medium">
              {isClean
                ? "No orphaned catalogue items."
                : "These won't appear in any category listing until assigned."}
            </p>
          </div>
        </div>

        {emptyCategories.length > 0 && (
          <div className="flex items-start gap-3 rounded-[4px] border-[0.667px] border-[#f6e5c7] bg-[#fffaf2] px-[15px] py-3">
            <Info
              className="mt-px size-[18px] shrink-0 text-[#a06e1c]"
              strokeWidth={2}
              aria-hidden="true"
            />
            <div className="flex min-w-0 flex-1 flex-col text-[12px] text-[#a06e1c]">
              <p className="pb-0.5 font-bold">
                {emptyCategories.length} empty categor{emptyCategories.length === 1 ? "y" : "ies"}
              </p>
              <p className="font-medium">
                {emptyCategories.map((category) => category.name).join(", ")} — these show
                as empty pages on the storefront.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default UncategorisedCheck;
