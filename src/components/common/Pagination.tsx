import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '../../lib/utils';

export interface PaginationProps {
  currentPage: number;
  totalItems: number;
  pageSize: number;
  pageSizeOptions?: number[];
  onPageChange: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  itemLabel?: string;
}

export default function Pagination({
  currentPage,
  totalItems,
  pageSize,
  pageSizeOptions = [5, 10, 20, 50],
  onPageChange,
  onPageSizeChange,
  itemLabel = 'bản ghi',
}: PaginationProps) {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

  if (totalItems === 0) {
    return null;
  }

  const startIdx = (currentPage - 1) * pageSize + 1;
  const endIdx = Math.min(currentPage * pageSize, totalItems);

  const getVisiblePages = () => {
    const pages: (number | string)[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (currentPage <= 4) {
        pages.push(1, 2, 3, 4, 5, '...', totalPages);
      } else if (currentPage >= totalPages - 3) {
        pages.push(1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
      }
    }
    return pages;
  };

  const visiblePages = getVisiblePages();

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 p-4 bg-white border border-slate-100 rounded-2xl shadow-sm z-10 relative">
      {/* Information info */}
      <div className="text-slate-500 font-bold text-xs sm:text-sm">
        Hiển thị <span className="text-[#4EACAF]">{startIdx}–{endIdx}</span> trong tổng số <span className="text-slate-700">{totalItems}</span> {itemLabel}
      </div>

      {/* Pages Controls */}
      <div className="flex flex-wrap items-center gap-2 sm:gap-3">
        {/* Page Size Select */}
        {onPageSizeChange && (
          <div className="flex items-center gap-1.5 mr-2">
            <span className="text-[11px] text-gray-400 font-bold uppercase tracking-wider">Số dòng:</span>
            <select
              value={pageSize}
              onChange={(e) => {
                const newSize = Number(e.target.value);
                onPageSizeChange(newSize);
              }}
              className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 text-slate-700 font-bold text-xs rounded-xl outline-none focus:border-[#4EACAF] cursor-pointer"
            >
              {pageSizeOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => currentPage > 1 && onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className={cn(
              "w-8 h-8 rounded-xl flex items-center justify-center border border-slate-100 bg-white text-slate-650 transition-all shadow-xs shrink-0 select-none",
              currentPage === 1
                ? "opacity-40 cursor-not-allowed bg-slate-50"
                : "hover:bg-slate-50 hover:text-slate-800 cursor-pointer"
            )}
            title="Trang trước"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          {visiblePages.map((p, idx) => {
            if (p === '...') {
              return (
                <span
                  key={`ellipsis-${idx}`}
                  className="w-8 h-8 flex items-center justify-center text-slate-400 font-black text-xs select-none"
                >
                  ...
                </span>
              );
            }

            const pageNum = p as number;
            const isActive = pageNum === currentPage;

            return (
              <button
                type="button"
                key={`page-${pageNum}`}
                onClick={() => onPageChange(pageNum)}
                className={cn(
                  "w-8 h-8 rounded-xl flex items-center justify-center font-extrabold text-xs transition-all select-none",
                  isActive
                    ? "bg-[#4EACAF] text-white shadow-md shadow-[#4EACAF]/20"
                    : "border border-slate-100 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-850 cursor-pointer"
                )}
              >
                {pageNum}
              </button>
            );
          })}

          <button
            type="button"
            onClick={() => currentPage < totalPages && onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className={cn(
              "w-8 h-8 rounded-xl flex items-center justify-center border border-slate-100 bg-white text-slate-650 transition-all shadow-xs shrink-0 select-none",
              currentPage === totalPages
                ? "opacity-40 cursor-not-allowed bg-slate-50"
                : "hover:bg-slate-50 hover:text-slate-800 cursor-pointer"
            )}
            title="Trang sau"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
