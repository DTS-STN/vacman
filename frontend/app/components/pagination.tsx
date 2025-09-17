import type { ComponentProps } from 'react';

import { faEllipsis } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useTranslation } from 'react-i18next';

import { Button } from '~/components/button';
import { cn } from '~/utils/tailwind-utils';

// Pagination (nav)
function PaginationNav({ className, ...props }: ComponentProps<'nav'>) {
  return <nav role="navigation" aria-label="pagination" data-slot="pagination" className={cn('px-2', className)} {...props} />;
}

// Container for items (ul)
function PaginationContent({ className, ...props }: ComponentProps<'ul'>) {
  return <ul data-slot="pagination-content" className={cn('flex items-center gap-2', className)} {...props} />;
}

// Each item (li)
function PaginationItem(props: ComponentProps<'li'>) {
  return <li data-slot="pagination-item" {...props} />;
}

// Link/button for a page number
type PaginationLinkProps = {
  isActive?: boolean;
} & ComponentProps<typeof Button>;

function PaginationLink({ className, isActive, children, ...props }: PaginationLinkProps) {
  return (
    <Button
      type="button"
      variant="outline"
      aria-current={isActive ? 'page' : undefined}
      className={cn('h-8 w-8 p-0 text-sm', isActive ? 'bg-slate-700 text-white' : 'border-hidden underline', className)}
      {...props}
    >
      {children}
    </Button>
  );
}

// Previous page button (uses FontAwesome left chevron)
function PaginationPrevious({ className, children, ...props }: ComponentProps<typeof Button>) {
  return (
    <Button
      type="button"
      variant="ghost"
      aria-label="Go to previous page"
      className={cn('h-8 border-hidden px-2 text-sm font-medium underline transition-colors duration-200', className)}
      {...props}
    >
      <span className="hidden sm:inline">{children ?? 'Previous'}</span>
    </Button>
  );
}

// Next page button (uses FontAwesome right chevron)
function PaginationNext({ className, children, ...props }: ComponentProps<typeof Button>) {
  return (
    <Button
      type="button"
      variant="ghost"
      aria-label="Go to next page"
      className={cn('h-8 border-hidden px-2 text-sm font-medium underline transition-colors duration-200', className)}
      {...props}
    >
      <span className="hidden sm:inline">{children ?? 'Next'}</span>
    </Button>
  );
}

// Ellipsis indicator
function PaginationEllipsis({ className, ...props }: ComponentProps<'span'>) {
  const { t } = useTranslation(['gcweb']);
  return (
    <span
      aria-hidden
      data-slot="pagination-ellipsis"
      className={cn('flex h-9 w-9 items-center justify-center', className)}
      {...props}
    >
      <FontAwesomeIcon icon={faEllipsis} className="h-4 w-4" />
      <span className="sr-only">{t('gcweb:data-table.pagination.more-pages', { defaultValue: 'More pages' })}</span>
    </span>
  );
}

// Named exports
export { PaginationContent, PaginationItem, PaginationLink, PaginationPrevious, PaginationNext, PaginationEllipsis };

// Backwards-compatible composite export (Pagination.Subcomponents)
export const Pagination = Object.assign(PaginationNav, {
  Content: PaginationContent,
  Item: PaginationItem,
  Link: PaginationLink,
  Previous: PaginationPrevious,
  Next: PaginationNext,
  Ellipsis: PaginationEllipsis,
});

export default Pagination;
