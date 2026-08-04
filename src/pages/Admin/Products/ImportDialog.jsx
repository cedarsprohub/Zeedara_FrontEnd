import { useEffect, useRef, useState } from "react";
import { Download, FileText, Info, TriangleAlert, Upload, X } from "lucide-react";
import {
  buildTemplateCsv,
  FALLBACK_CATEGORY,
  parseProductsCsv,
  TEMPLATE_COLUMNS,
} from "./csv";

// Kicks off a download of the blank template. Revoking the URL straight after
// the click is what lets the blob be collected — it outlives the element.
function downloadTemplate() {
  const blob = new Blob([buildTemplateCsv()], {
    type: "text/csv;charset=utf-8",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "zeedara-products-template.csv";
  link.click();
  URL.revokeObjectURL(url);
}

// CSV importer behind the page header's Import button. Locks page scroll and
// closes on Escape, same as the delete confirmation.
function ImportDialog({ categories, existingSkus, onCancel, onImport }) {
  const inputRef = useRef(null);
  const closeButtonRef = useRef(null);

  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus();

    const handleKeyDown = (event) => {
      if (event.key === "Escape") onCancel();
    };
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [onCancel]);

  // Parsed on selection rather than on Import, so the row count and any bad
  // lines are visible while there's still a chance to swap the file out.
  const acceptFile = (candidate) => {
    if (!candidate) return;
    setFile(candidate);
    setResult(null);

    candidate
      .text()
      .then((text) =>
        setResult(parseProductsCsv(text, { categories, existingSkus })),
      )
      .catch(() => setResult({ products: [], errors: ["Couldn't read that file."] }));
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setIsDragging(false);
    acceptFile(event.dataTransfer.files?.[0]);
  };

  const readyCount = result?.products.length ?? 0;
  const problems = result?.errors ?? [];

  return (
    // Above the sidebar's z-40, so the scrim covers it as the design shows.
    <div
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/30 p-4"
      onClick={onCancel}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="import-products-title"
        aria-describedby="import-products-description"
        onClick={(event) => event.stopPropagation()}
        className="flex w-full max-w-[680px] flex-col overflow-hidden rounded-[4px] bg-white shadow-[0px_24px_24px_rgba(16,24,40,0.18)]"
      >
        <div className="flex items-start gap-3.5 px-6 py-5">
          <span className="flex size-[42px] shrink-0 items-center justify-center rounded-[4px] bg-[#faf4eb]">
            <Upload
              className="size-[21px] text-(--primary-color)"
              strokeWidth={2}
              aria-hidden="true"
            />
          </span>

          <div className="flex min-w-0 flex-1 flex-col">
            <p
              id="import-products-title"
              className="text-[14px] font-semibold text-black"
            >
              Import products
            </p>
            <p
              id="import-products-description"
              className="pt-[3px] text-[12px] font-medium text-[#828a9b]"
            >
              Upload a CSV to bulk-create catalogue items.
            </p>
          </div>

          <button
            ref={closeButtonRef}
            type="button"
            onClick={onCancel}
            aria-label="Close"
            className="flex size-[38px] shrink-0 cursor-pointer items-center justify-center rounded-lg text-[#48505e] transition-colors hover:bg-[#f9fafb] hover:text-black"
          >
            <X className="size-5" strokeWidth={2} />
          </button>
        </div>

        <div className="flex flex-col gap-4 px-6 py-5">
          {/* The whole zone is the control: it takes a drop, and clicking it
              opens the same picker the inner button would. */}
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            onDragOver={(event) => {
              event.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            className={`flex w-full cursor-pointer flex-col items-center justify-center gap-1 rounded-[4px] border-[1.333px] border-dashed px-[22px] py-3 transition-colors ${
              isDragging
                ? "border-(--primary-color) bg-[#faf4eb]"
                : "border-[#b2ddff] bg-[#fcfcfc]"
            }`}
          >
            <span className="flex size-10 items-center justify-center rounded-full bg-[#f2f4f7]">
              <FileText
                className="size-[19px] text-[#667085]"
                strokeWidth={2}
                aria-hidden="true"
              />
            </span>

            <span className="pt-[3px] text-[12px] font-semibold">
              {file ? (
                <span className="text-[#48505e]">{file.name}</span>
              ) : (
                <>
                  <span className="text-(--primary-color)">
                    Choose a CSV file
                  </span>{" "}
                  <span className="text-[#48505e]">or drag it here</span>
                </>
              )}
            </span>
            <span className="text-[12px] font-medium text-[#828a9b]">
              {file && result
                ? `${readyCount} row${readyCount === 1 ? "" : "s"} ready to import`
                : `Expected columns: ${TEMPLATE_COLUMNS.join(", ")}`}
            </span>
          </button>

          <input
            ref={inputRef}
            type="file"
            accept=".csv,text/csv"
            className="hidden"
            onChange={(event) => acceptFile(event.target.files?.[0])}
          />

          <hr className="border-[#f0f1f3]" />

          {/* Beyond the frames: a CSV import that drops rows without saying
              which ones leaves the user nothing to correct. Same shape as the
              note below it, in the palette the table already uses for errors. */}
          {problems.length > 0 && (
            <div className="flex items-start gap-3 rounded-[4px] border-[0.667px] border-[#f3d3d2] bg-[#fdf2f2] px-[15px] py-3">
              <TriangleAlert
                className="mt-px size-[18px] shrink-0 text-[#cf251f]"
                strokeWidth={2}
                aria-hidden="true"
              />
              <div className="flex min-w-0 flex-1 flex-col text-[12px] text-[#cf251f]">
                <p className="pb-0.5 font-bold">
                  {problems.length} row{problems.length === 1 ? "" : "s"} will
                  be skipped
                </p>
                {problems.slice(0, 4).map((problem) => (
                  <p key={problem} className="font-medium">
                    {problem}
                  </p>
                ))}
                {problems.length > 4 && (
                  <p className="font-medium">
                    …and {problems.length - 4} more.
                  </p>
                )}
              </div>
            </div>
          )}

          <div className="flex items-start gap-3 rounded-[4px] border-[0.667px] border-[#d1e9ff] bg-[#f5faff] px-[15px] py-3">
            <Info
              className="mt-px size-[18px] shrink-0 text-[#1570ef]"
              strokeWidth={2}
              aria-hidden="true"
            />
            <div className="flex min-w-0 flex-1 flex-col text-[12px] text-[#1570ef]">
              <p className="pb-0.5 font-bold">Category matching</p>
              <p className="font-medium">
                Rows are matched to existing categories by name. Unmatched rows
                fall back to {FALLBACK_CATEGORY}.
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-end gap-2.5 border-t-[0.667px] border-[#f0f1f3] bg-[#fcfcfc] px-[22px] py-4">
          <button
            type="button"
            onClick={onCancel}
            className="flex h-10 cursor-pointer items-center justify-center rounded-[2px] border border-[#dadde2] bg-white px-3 text-[14px] font-semibold text-[#48505e] transition-colors hover:border-[#9fa5b2] hover:text-black"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={downloadTemplate}
            className="flex h-10 cursor-pointer items-center justify-center gap-2 rounded-[2px] border border-[#dadde2] bg-white pr-2 pl-4 text-[14px] font-semibold text-[#48505e] transition-colors hover:border-[#9fa5b2] hover:text-black"
          >
            Download Template
            <Download className="size-5" strokeWidth={2} />
          </button>
          <button
            type="button"
            onClick={() => onImport(result.products)}
            disabled={readyCount === 0}
            className="flex h-10 cursor-pointer items-center justify-center rounded-[2px] bg-(--primary-color) px-3 text-[14px] font-semibold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Import
          </button>
        </div>
      </div>
    </div>
  );
}

export default ImportDialog;
