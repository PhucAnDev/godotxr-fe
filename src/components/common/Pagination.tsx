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
    const pages: Array<number | string> = [];

    if (totalPages <= 7) {
      for (let index = 1; index <= totalPages; index += 1) {
        pages.push(index);
      }
      return pages;
    }

    if (currentPage <= 4) {
      return [1, 2, 3, 4, 5, '...', totalPages];
    }

    if (currentPage >= totalPages - 3) {
      return [
        1,
        '...',
        totalPages - 4,
        totalPages - 3,
        totalPages - 2,
        totalPages - 1,
        totalPages,
      ];
    }

    return [1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages];
  };

  const visiblePages = getVisiblePages();

  return (
    <div className="relative z-10 mt-6 flex flex-col items-center justify-between gap-4 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm sm:flex-row">
      <div className="text-xs font-bold text-slate-500 sm:text-sm">
        Hiển thị <span className="text-[#4EACAF]">{startIdx}-{endIdx}</span> trong
        tổng số <span className="text-slate-700">{totalItems}</span> {itemLabel}
      </div>

      <div className="flex flex-wrap items-center gap-2 sm:gap-3">
        {onPageSizeChange && (
          <div className="mr-2 flex items-center gap-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
              Số dòng:
            </span>
            <select
              value={pageSize}
              onChange={(event) => {
                onPageSizeChange(Number(event.target.value));
              }}
              className="cursor-pointer rounded-xl border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs font-bold text-slate-700 outline-none focus:border-[#4EACAF]"
            >
              {pageSizeOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
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
              'flex h-8 w-8 shrink-0 select-none items-center justify-center rounded-xl border border-slate-100 bg-white text-slate-600 transition-all shadow-xs',
              currentPage === 1
                ? 'cursor-not-allowed bg-slate-50 opacity-40'
                : 'cursor-pointer hover:bg-slate-50 hover:text-slate-800'
            )}
            title="Trang trước"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>

          {visiblePages.map((page, index) => {
            if (page === '...') {
              return (
                <span
                  key={`ellipsis-${index}`}
                  className="flex h-8 w-8 select-none items-center justify-center text-xs font-black text-slate-400"
                >
                  ...
                </span>
              );
            }

            const pageNumber = page as number;
            const isActive = pageNumber === currentPage;

            return (
              <button
                type="button"
                key={`page-${pageNumber}`}
                onClick={() => onPageChange(pageNumber)}
                className={cn(
                  'flex h-8 w-8 select-none items-center justify-center rounded-xl text-xs font-extrabold transition-all',
                  isActive
                    ? 'bg-[#4EACAF] text-white shadow-md shadow-[#4EACAF]/20'
                    : 'cursor-pointer border border-slate-100 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-800'
                )}
              >
                {pageNumber}
              </button>
            );
          })}

          <button
            type="button"
            onClick={() => currentPage < totalPages && onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className={cn(
              'flex h-8 w-8 shrink-0 select-none items-center justify-center rounded-xl border border-slate-100 bg-white text-slate-600 transition-all shadow-xs',
              currentPage === totalPages
                ? 'cursor-not-allowed bg-slate-50 opacity-40'
                : 'cursor-pointer hover:bg-slate-50 hover:text-slate-800'
            )}
            title="Trang sau"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
