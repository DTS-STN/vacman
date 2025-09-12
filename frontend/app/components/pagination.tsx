import { useTranslation } from 'react-i18next';

import { Button } from '~/components/button';
import { cn } from '~/utils/tailwind-utils';

export interface PaginationProps {
  // 0-based current page index
  pageIndex: number;
  // total number of pages
  pageCount: number;
  // callback with next 0-based index
  onPageChange: (nextIndex: number) => void;
  className?: string;
}

/**
 * Presentation-only pagination control. This component renders page buttons and
 * next navigation, and delegates page changes to the caller.
 */
export function Pagination({ pageIndex, pageCount, onPageChange, className }: PaginationProps) {
  const { t } = useTranslation(['gcweb', 'app']);

  if (pageCount <= 1) return null;

  return (
    <div className={cn('flex items-center justify-between px-2', className)}>
      <div className="flex items-center space-x-6 lg:space-x-8">
        <div className="flex items-center space-x-2">
          {Array.from({ length: pageCount }, (_, i) => (
            <Button
              key={i}
              type="button"
              variant="outline"
              className={cn('h-8 w-8 p-0 text-sm', pageIndex === i ? 'bg-slate-700 text-white' : 'border-hidden underline')}
              onClick={() => onPageChange(i)}
              aria-current={pageIndex === i ? 'page' : undefined}
            >
              <span className="sr-only">{t('gcweb:data-table.pagination.first-page')}</span>
              {i + 1}
            </Button>
          ))}
          <Button
            type="button"
            variant="ghost"
            onClick={() => onPageChange(Math.min(pageIndex + 1, pageCount - 1))}
            disabled={pageIndex >= pageCount - 1}
            className={cn('h-8 border-hidden px-2 text-sm font-medium underline transition-colors duration-200')}
          >
            <span className="sr-only">{t('gcweb:data-table.pagination.next-page')}</span>
            {t('app:hr-advisor-employees-table.next-page')}
          </Button>
        </div>
      </div>
    </div>
  );
}

export default Pagination;
