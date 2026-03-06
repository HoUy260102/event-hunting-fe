import { useMemo } from "react";
import { Link } from "react-router-dom";

function Pagination({
  currentPage,
  pageSize,
  totalPage,
  totalElements,
  handlePagination,
}) {
  const paginationRange = useMemo(() => {
    const siblings = 1;
    const totalPageNumbers = siblings * 2 + 5;

    if (totalPageNumbers >= totalPage) {
      return Array.from({ length: totalPage }, (_, i) => i + 1);
    }

    const leftSiblingIndex = Math.max(currentPage - siblings, 1);
    const rightSiblingIndex = Math.min(currentPage + siblings, totalPage);

    const showLeftDots = leftSiblingIndex > 2;
    const showRightDots = rightSiblingIndex < totalPage - 2;

    if (!showLeftDots && showRightDots) {
      let leftItemCount = 3 + 2 * siblings;
      let leftRange = Array.from({ length: leftItemCount }, (_, i) => i + 1);
      return [...leftRange, "...", totalPage];
    }

    if (showLeftDots && !showRightDots) {
      let rightItemCount = 3 + 2 * siblings;
      let rightRange = Array.from(
        { length: rightItemCount },
        (_, i) => totalPage - rightItemCount + 1 + i,
      );
      return [1, "...", ...rightRange];
    }

    if (showLeftDots && showRightDots) {
      let middleRange = Array.from(
        { length: rightSiblingIndex - leftSiblingIndex + 1 },
        (_, i) => leftSiblingIndex + i,
      );
      return [1, "...", ...middleRange, "...", totalPage];
    }
    return [];
  }, [currentPage, totalPage]);
  const from = totalElements === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const to = Math.min(currentPage * pageSize, totalElements);
  return (
    <>
      <div className="mt-2 rounded-xl flex items-center justify-between border-t border-[#e5e7eb] dark:border-[#2a4225] bg-white dark:bg-[#1c2e18] px-4 py-3 md:px-6">
        <div className="hidden md:flex md:flex-1 md:items-center md:justify-between">
          <div>
            <p className="text-sm text-[#6b7280] dark:text-[#a1aebf]">
              Showing{" "}
              <span className="font-bold text-[#111b0d] dark:text-white">
                {from}
              </span>{" "}
              to{" "}
              <span className="font-bold text-[#111b0d] dark:text-white">
                {to}
              </span>{" "}
              of{" "}
              <span className="font-bold text-[#111b0d] dark:text-white">
                {totalElements}
              </span>{" "}
              results
            </p>
          </div>
          <div>
            <nav
              aria-label="Pagination"
              className="isolate inline-flex -space-x-px rounded-md shadow-sm"
            >
              <Link
                to="#"
                onClick={(e) => {
                  e.preventDefault();
                  if (currentPage === 1) return;
                  handlePagination(currentPage - 1);
                }}
                className="relative inline-flex items-center rounded-l-md px-2 py-2 text-[#6b7280] dark:text-[#a1aebf] ring-1 ring-inset ring-[#e5e7eb] dark:ring-[#2a4225] hover:bg-gray-50 dark:hover:bg-white/5 focus:z-20 focus:outline-offset-0"
              >
                <span className="sr-only">Previous</span>
                <span className="material-symbols-outlined text-[20px]">
                  chevron_left
                </span>
              </Link>
              {paginationRange.map((page, index) => {
                if (page === "...") {
                  return (
                    <span
                      className="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-[#111b0d] dark:text-white ring-1 ring-inset ring-[#e5e7eb] dark:ring-[#2a4225] hover:bg-gray-50 dark:hover:bg-white/5 focus:z-20 focus:outline-offset-0"
                      key={index}
                    >
                      ...
                    </span>
                  );
                }

                return (
                  <Link
                    key={index}
                    aria-current="page"
                    onClick={(e) => {
                      e.preventDefault();
                      if (page === "...") return;
                      handlePagination(parseInt(page));
                    }}
                    className={
                      currentPage === page
                        ? "relative z-10 inline-flex items-center bg-[#46ec13] px-4 py-2 text-sm font-bold text-black focus:z-20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#46ec13]"
                        : "relative inline-flex items-center px-4 py-2 text-sm font-semibold text-[#111b0d] dark:text-white ring-1 ring-inset ring-[#e5e7eb] dark:ring-[#2a4225] hover:bg-gray-50 dark:hover:bg-white/5 focus:z-20 focus:outline-offset-0"
                    }
                  >
                    {page}
                  </Link>
                );
              })}
              <Link
                to="#"
                onClick={(e) => {
                  e.preventDefault();
                  if (currentPage >= totalPage) return;
                  handlePagination(currentPage + 1);
                }}
                className="relative inline-flex items-center rounded-r-md px-2 py-2 text-[#6b7280] dark:text-[#a1aebf] ring-1 ring-inset ring-[#e5e7eb] dark:ring-[#2a4225] hover:bg-gray-50 dark:hover:bg-white/5 focus:z-20 focus:outline-offset-0"
              >
                <span className="sr-only">Next</span>
                <span className="material-symbols-outlined text-[20px]">
                  chevron_right
                </span>
              </Link>
            </nav>
          </div>
        </div>

        <div className="flex flex-1 justify-between md:hidden">
          <Link
            to="#"
            onClick={(e) => {
              e.preventDefault();
              if (currentPage === 1) return;
              handlePagination(currentPage - 1);
            }}
            className="relative inline-flex items-center rounded-md border border-[#e5e7eb] dark:border-[#2a4225] bg-white dark:bg-[#1c2e18] px-4 py-2 text-sm font-medium text-[#111b0d] dark:text-white hover:bg-gray-50 dark:hover:bg-white/5"
          >
            Previous
          </Link>
          <Link
            to="#"
            onClick={(e) => {
              e.preventDefault();
              if (currentPage >= totalPage) return;
              handlePagination(currentPage + 1);
            }}
            className="relative ml-3 inline-flex items-center rounded-md border border-[#e5e7eb] dark:border-[#2a4225] bg-white dark:bg-[#1c2e18] px-4 py-2 text-sm font-medium text-[#111b0d] dark:text-white hover:bg-gray-50 dark:hover:bg-white/5"
          >
            Next
          </Link>
        </div>
      </div>
    </>
  );
}
export default Pagination;
