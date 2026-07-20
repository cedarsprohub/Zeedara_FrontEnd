import { ChevronsLeft, ChevronsRight } from "lucide-react";

function getPageNumbers(currentPage, totalPages) {
  const pages = new Set([1, totalPages, currentPage - 1, currentPage, currentPage + 1]);
  return [...pages]
    .filter((page) => page >= 1 && page <= totalPages)
    .sort((a, b) => a - b);
}

function Pagination({ currentPage, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;

  const pageNumbers = getPageNumbers(currentPage, totalPages);

  return (
    <nav
      aria-label="Product pagination"
      className="flex flex-wrap items-center justify-center gap-2 pt-8"
    >
      <button
        type="button"
        onClick={() => onPageChange(1)}
        disabled={currentPage === 1}
        aria-label="First page"
        className="flex size-9 cursor-pointer items-center justify-center border border-gray-300 text-gray-600 transition-colors hover:border-(--primary-color) hover:text-(--primary-color) disabled:cursor-not-allowed disabled:opacity-40"
      >
        <ChevronsLeft className="size-4" />
      </button>
      <button
        type="button"
        onClick={() => onPageChange(Math.max(1, currentPage - 1))}
        disabled={currentPage === 1}
        className="flex h-9 cursor-pointer items-center justify-center border border-gray-300 px-3 text-sm text-gray-600 transition-colors hover:border-(--primary-color) hover:text-(--primary-color) disabled:cursor-not-allowed disabled:opacity-40"
      >
        Prev
      </button>

      {pageNumbers.map((page, index) => {
        const previousPage = pageNumbers[index - 1];
        const showEllipsis = previousPage && page - previousPage > 1;
        return (
          <span key={page} className="flex items-center gap-2">
            {showEllipsis && <span className="text-sm text-gray-400">...</span>}
            <button
              type="button"
              onClick={() => onPageChange(page)}
              aria-current={page === currentPage ? "page" : undefined}
              className={`flex size-9 cursor-pointer items-center justify-center border text-sm font-medium transition-colors ${
                page === currentPage
                  ? "border-(--primary-color) bg-(--primary-color) text-white"
                  : "border-gray-300 text-gray-600 hover:border-(--primary-color) hover:text-(--primary-color)"
              }`}
            >
              {page}
            </button>
          </span>
        );
      })}

      <button
        type="button"
        onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
        disabled={currentPage === totalPages}
        className="flex h-9 cursor-pointer items-center justify-center border border-gray-300 px-3 text-sm text-gray-600 transition-colors hover:border-(--primary-color) hover:text-(--primary-color) disabled:cursor-not-allowed disabled:opacity-40"
      >
        Next
      </button>
      <button
        type="button"
        onClick={() => onPageChange(totalPages)}
        disabled={currentPage === totalPages}
        aria-label="Last page"
        className="flex size-9 cursor-pointer items-center justify-center border border-gray-300 text-gray-600 transition-colors hover:border-(--primary-color) hover:text-(--primary-color) disabled:cursor-not-allowed disabled:opacity-40"
      >
        <ChevronsRight className="size-4" />
      </button>
    </nav>
  );
}

export default Pagination;
