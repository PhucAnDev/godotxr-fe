import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '../../lib/utils';
import CustomSelect from './CustomSelect';

export interface PaginationProps {
  currentPage: number;
  totalItems: number;
  pageSize: number;
  pageSizeOptions?: number[];
  onPageChange: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  itemLabel?: string;
  className?: string;
  compact?: boolean;
}

export default function Pagination({
  currentPage,
  totalItems,
  pageSize,
  pageSizeOptions = [5, 10, 20, 50],
  onPageChange,
  onPageSizeChange,
  itemLabel = 'bản ghi',
  className,
  compact = false,
}: PaginationProps) {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

  if (totalItems === 0) {
    return null;
  }

  const startIdx = (currentPage - 1) * pageSize + 1;
  const endIdx = Math.min(currentPage * pageSize, totalItems);

  const getVisiblePages = () => {
    const pages: Array<number | string> = [];

    if (compact) {
      if (totalPages <= 4) {
        for (let index = 1; index <= totalPages; index += 1) {
          pages.push(index);
        }
        return pages;
      }

      if (currentPage <= 2) {
        return [1, 2, '...', totalPages];
      }

      if (currentPage >= totalPages - 1) {
        return [1, '...', totalPages - 1, totalPages];
      }

      return [1, '...', currentPage, '...', totalPages];
    }

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
    <div
      className={cn(
        'relative z-10 flex items-center justify-between gap-3 rounded-2xl border border-slate-100 bg-white shadow-xs select-none',
        compact
          ? 'mt-3 px-3.5 py-2.5 flex-row flex-nowrap'
          : 'mt-6 p-4 flex-col sm:flex-row sm:flex-nowrap gap-4',
        className
      )}
    >
      <div
        className={cn(
          'text-slate-500 whitespace-nowrap shrink-0',
          compact ? 'text-xs font-medium' : 'text-xs font-bold sm:text-sm'
        )}
      >
        {compact ? (
          <>
            Hiển thị <span className="text-[#4EACAF] font-semibold">{startIdx}–{endIdx}</span> / <span className="text-slate-700 font-semibold">{totalItems}</span> {itemLabel}
          </>
        ) : (
          <>
            Hiển thị <span className="text-[#4EACAF]">{startIdx}-{endIdx}</span> trong tổng số{' '}
            <span className="text-slate-700">{totalItems}</span> {itemLabel}
          </>
        )}
      </div>

      <div className="flex items-center gap-2 sm:gap-2.5 shrink-0 flex-nowrap">
        {onPageSizeChange && (
          <div className="flex items-center gap-1.5 shrink-0">
            <span
              className={cn(
                'font-bold uppercase tracking-wider text-gray-400 whitespace-nowrap',
                compact ? 'text-[10px]' : 'text-[11px] mr-1'
              )}
            >
              Số dòng:
            </span>
            <CustomSelect
              value={String(pageSize)}
              onChange={(val) => onPageSizeChange(Number(val))}
              options={pageSizeOptions.map((opt) => ({
                value: String(opt),
                label: String(opt),
              }))}
              variant="filter"
              className={compact ? 'w-16' : 'w-20'}
              placement="auto"
            />
          </div>
        )}

        <div className="flex items-center gap-1 shrink-0 flex-nowrap">
          <button
            type="button"
            onClick={() => currentPage > 1 && onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className={cn(
              'flex shrink-0 select-none items-center justify-center rounded-xl border border-slate-100 bg-white text-slate-600 transition-all shadow-xs',
              compact ? 'h-7 w-7' : 'h-8 w-8',
              currentPage === 1
                ? 'cursor-not-allowed bg-slate-50 opacity-40'
                : 'cursor-pointer hover:bg-slate-50 hover:text-slate-800'
            )}
            title="Trang trước"
          >
            <ChevronLeft className={compact ? 'h-3.5 w-3.5' : 'h-4 w-4'} />
          </button>

          {visiblePages.map((page, index) => {
            if (page === '...') {
              return (
                <span
                  key={`ellipsis-${index}`}
                  className={cn(
                    'flex shrink-0 select-none items-center justify-center font-black text-slate-400',
                    compact ? 'h-7 w-5 text-[11px]' : 'h-8 w-8 text-xs'
                  )}
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
                  'flex shrink-0 select-none items-center justify-center rounded-xl font-extrabold transition-all',
                  compact ? 'h-7 w-7 text-xs' : 'h-8 w-8 text-xs',
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
              'flex shrink-0 select-none items-center justify-center rounded-xl border border-slate-100 bg-white text-slate-600 transition-all shadow-xs',
              compact ? 'h-7 w-7' : 'h-8 w-8',
              currentPage === totalPages
                ? 'cursor-not-allowed bg-slate-50 opacity-40'
                : 'cursor-pointer hover:bg-slate-50 hover:text-slate-800'
            )}
            title="Trang sau"
          >
            <ChevronRight className={compact ? 'h-3.5 w-3.5' : 'h-4 w-4'} />
          </button>
        </div>
      </div>
    </div>
  );
}
