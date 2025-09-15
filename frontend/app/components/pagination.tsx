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
    <nav aria-label={t('gcweb:data-table.pagination.label', { defaultValue: 'Pagination' })} className={cn('px-2', className)}>
      {/* Current page and total for screen readers */}
      <p className="sr-only">{t('gcweb:data-table.pagination.page-status', { index: pageIndex + 1, count: pageCount })}</p>
      <ul className="flex items-center gap-2">
        {Array.from({ length: pageCount }, (_, i) => {
          const isCurrent = pageIndex === i;
          const label = isCurrent
            ? t('gcweb:data-table.pagination.page-button-current', { index: i + 1 })
            : t('gcweb:data-table.pagination.page-button-go-to', { index: i + 1 });
          return (
            <li key={i}>
              <Button
                type="button"
                variant="outline"
                className={cn('h-8 w-8 p-0 text-sm', isCurrent ? 'bg-slate-700 text-white' : 'border-hidden underline')}
                onClick={() => onPageChange(i)}
                aria-current={isCurrent ? 'page' : undefined}
                aria-label={label}
              >
                {i + 1}
              </Button>
            </li>
          );
        })}
        <li>
          <Button
            type="button"
            variant="ghost"
            onClick={() => onPageChange(Math.min(pageIndex + 1, pageCount - 1))}
            disabled={pageIndex >= pageCount - 1}
            aria-label={t('gcweb:data-table.pagination.next-page', { defaultValue: 'Next page' })}
            className={cn('h-8 border-hidden px-2 text-sm font-medium underline transition-colors duration-200')}
          >
            {t('app:hr-advisor-employees-table.next-page')}
          </Button>
        </li>
      </ul>
    </nav>
  );
}

export default Pagination;
