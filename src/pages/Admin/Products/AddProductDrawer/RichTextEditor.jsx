import { useEffect, useRef, useState } from "react";
import { Bold, Italic, Link2, List, ListOrdered } from "lucide-react";
import { sanitizeDescriptionHtml } from "../../../../utils/sanitizeHtml";

const TOOLBAR_BUTTONS = [
  { command: "bold", label: "Bold", icon: Bold },
  { command: "italic", label: "Italic", icon: Italic },
  { command: "insertUnorderedList", label: "Bullet list", icon: List },
  { command: "insertOrderedList", label: "Numbered list", icon: ListOrdered },
];

// A small toolbar over a contentEditable div rather than a library — the
// formatting surface this needs (bold, italic, two list types, a link) is
// narrow enough that `execCommand` covers it without taking on a dependency
// sized for a full document editor.
//
// Seeded from `value` once on mount only — after that the DOM is the source
// of truth, same as any other contentEditable. The caller forces a fresh
// instance (and a fresh seed) with `key` when the underlying record changes,
// rather than this re-syncing on every parent re-render, which would fight
// the user's cursor position on every keystroke elsewhere in the form.
function RichTextEditor({ id, value, onChange, placeholder, invalid }) {
  const editorRef = useRef(null);
  const [isEmpty, setIsEmpty] = useState(() => !value);

  useEffect(() => {
    if (editorRef.current) editorRef.current.innerHTML = value || "";
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const emitChange = () => {
    const node = editorRef.current;
    if (!node) return;
    setIsEmpty(node.textContent.trim() === "");
    onChange(sanitizeDescriptionHtml(node.innerHTML));
  };

  // onMouseDown with preventDefault, not onClick — a plain click on a
  // button blurs the contentEditable (and collapses its selection) before
  // the handler runs, so the format would apply to nothing. Preventing the
  // mousedown's default keeps focus and the selection right where the user
  // left it.
  const runCommand = (event, command, commandValue) => {
    event.preventDefault();
    editorRef.current?.focus();
    document.execCommand(command, false, commandValue);
    emitChange();
  };

  const insertLink = (event) => {
    event.preventDefault();
    const url = window.prompt("Link URL (e.g. https://example.com)");
    if (!url) return;
    editorRef.current?.focus();
    document.execCommand("createLink", false, url);
    emitChange();
  };

  return (
    <div
      className={`w-full border bg-white ${invalid ? "border-[#cf251f]" : "border-[#dadde2]"}`}
    >
      <div className="flex items-center gap-1 border-b border-[#dadde2] bg-[#fcfcfc] px-2 py-1.5">
        {TOOLBAR_BUTTONS.map(({ command, label, icon: Icon }) => (
          <button
            key={command}
            type="button"
            aria-label={label}
            title={label}
            onMouseDown={(event) => runCommand(event, command)}
            className="flex size-7 cursor-pointer items-center justify-center rounded text-[#48505e] transition-colors hover:bg-[#f0f1f3] hover:text-black"
          >
            <Icon className="size-4" strokeWidth={2} />
          </button>
        ))}
        <span className="mx-1 h-4 w-px bg-[#dadde2]" aria-hidden="true" />
        <button
          type="button"
          aria-label="Insert link"
          title="Insert link"
          onMouseDown={insertLink}
          className="flex size-7 cursor-pointer items-center justify-center rounded text-[#48505e] transition-colors hover:bg-[#f0f1f3] hover:text-black"
        >
          <Link2 className="size-4" strokeWidth={2} />
        </button>
      </div>

      <div className="relative">
        {isEmpty && (
          <span className="pointer-events-none absolute top-[13px] left-[17px] text-[14px] font-medium text-[#9fa5b2]">
            {placeholder}
          </span>
        )}
        <div
          ref={editorRef}
          id={id}
          role="textbox"
          aria-multiline="true"
          aria-invalid={invalid || undefined}
          contentEditable
          onInput={emitChange}
          className="min-h-[160px] px-[17px] py-[13px] text-[14px] font-medium text-black [&_a]:text-(--primary-color) [&_a]:underline [&_ol]:list-decimal [&_ol]:pl-5 [&_ul]:list-disc [&_ul]:pl-5 focus:outline-none"
        />
      </div>
    </div>
  );
}

export default RichTextEditor;
