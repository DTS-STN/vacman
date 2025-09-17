import type React from 'react';
import type { ComponentProps, PropsWithChildren } from 'react';
import { createContext, useContext, useMemo } from 'react';

import { useSearchParams } from 'react-router';

import { useTranslation } from 'react-i18next';

import { Button } from '~/components/button';
import { clamp } from '~/utils/math-utils';
import { cn } from '~/utils/tailwind-utils';

type ButtonProps = ComponentProps<typeof Button>;

type PaginationContextValue = {
  // 1-based current page from URL
  currentPage: number;
  // total page count from props
  pageCount: number;
  // query string key to use (default: 'page')
  paramName: string;
  // navigate to a specific 1-based page, clamped to [1, pageCount]
  goTo: (pageOneBased: number) => void;
};

const PaginationContext = createContext<PaginationContextValue | null>(null);

function usePaginationContext(): PaginationContextValue {
  const ctx = useContext(PaginationContext);
  if (!ctx) throw new Error('Pagination subcomponents must be used within <Pagination>');
  return ctx;
}

export interface PaginationRootProps extends PropsWithChildren {
  pageCount: number;
  className?: string;
  paramName?: string; // default 'page'
}

function getCurrentPage(searchParams: URLSearchParams, paramName: string, pageCount: number) {
  const n = Number.parseInt(searchParams.get(paramName) ?? '1', 10) || 1;
  return clamp(n, 1, Math.max(1, pageCount));
}

function Root({ children, pageCount, className, paramName = 'page' }: PaginationRootProps) {
  const { t } = useTranslation(['gcweb', 'app']);
  const [searchParams, setSearchParams] = useSearchParams();

  const currentPage = useMemo(() => getCurrentPage(searchParams, paramName, pageCount), [searchParams, paramName, pageCount]);

  const ctx = useMemo<PaginationContextValue>(
    () => ({
      currentPage,
      pageCount,
      paramName,
      goTo: (pageOneBased) => {
        const next = new URLSearchParams(searchParams);
        next.set(paramName, String(clamp(pageOneBased, 1, Math.max(1, pageCount))));
        setSearchParams(next);
      },
    }),
    [currentPage, pageCount, paramName, searchParams, setSearchParams],
  );

  if (pageCount <= 1) return null;

  return (
    <PaginationContext.Provider value={ctx}>
      <nav
        aria-label={t('gcweb:data-table.pagination.label', { defaultValue: 'Pagination' })}
        className={cn('px-2', className)}
      >
        <p className="sr-only">{t('gcweb:data-table.pagination.page-info', { index: currentPage, count: pageCount })}</p>
        <ul className="flex items-center gap-2">{children}</ul>
      </nav>
    </PaginationContext.Provider>
  );
}

function Pages() {
  const { pageCount } = usePaginationContext();
  return (
    <>
      {Array.from({ length: pageCount }, (_, i) => (
        <Link key={i} page={i + 1} />
      ))}
    </>
  );
}

interface LinkProps extends Omit<ButtonProps, 'onClick'> {
  page: number; // 1-based target page
  onClick?: (page: number, event: React.MouseEvent<HTMLButtonElement>) => void;
}

function Link({ page, className, onClick, children, ...rest }: LinkProps) {
  const { currentPage, pageCount, goTo } = usePaginationContext();
  const { t } = useTranslation(['gcweb']);
  const clamped = clamp(page, 1, Math.max(1, pageCount));
  const isCurrent = currentPage === clamped;
  const label = isCurrent
    ? t('gcweb:data-table.pagination.page-button-current', { index: clamped })
    : t('gcweb:data-table.pagination.page-button-go-to', { index: clamped });

  return (
    <li>
      <Button
        type="button"
        variant="outline"
        className={cn('h-8 w-8 p-0 text-sm', isCurrent ? 'bg-slate-700 text-white' : 'border-hidden underline', className)}
        aria-current={isCurrent ? 'page' : undefined}
        aria-label={label}
        onClick={(e) => {
          onClick?.(clamped, e);
          if (!e.defaultPrevented) goTo(clamped);
        }}
        {...rest}
      >
        {children ?? clamped}
      </Button>
    </li>
  );
}

type NavButtonProps = Omit<ButtonProps, 'onClick'> & {
  onClick?: (nextPage: number, event: React.MouseEvent<HTMLButtonElement>) => void;
};

function Previous({ className, children, onClick, ...rest }: NavButtonProps) {
  const { currentPage, goTo } = usePaginationContext();
  const { t } = useTranslation(['gcweb', 'app']);
  const target = clamp(currentPage - 1, 1, Infinity);
  const disabled = currentPage <= 1;
  return (
    <li>
      <Button
        type="button"
        variant="ghost"
        disabled={disabled}
        aria-label={t('gcweb:data-table.pagination.previous-page', { defaultValue: 'Previous page' })}
        className={cn('h-8 border-hidden px-2 text-sm font-medium underline transition-colors duration-200', className)}
        onClick={(e) => {
          if (disabled) return;
          onClick?.(target, e);
          if (!e.defaultPrevented) goTo(target);
        }}
        {...rest}
      >
        {children ?? t('gcweb:data-table.pagination.previous-page', { defaultValue: 'Previous' })}
      </Button>
    </li>
  );
}

function Next({ className, children, onClick, ...rest }: NavButtonProps) {
  const { currentPage, pageCount, goTo } = usePaginationContext();
  const { t } = useTranslation(['gcweb', 'app']);
  const target = clamp(currentPage + 1, 1, pageCount);
  const disabled = currentPage >= pageCount;
  return (
    <li>
      <Button
        type="button"
        variant="ghost"
        disabled={disabled}
        aria-label={t('gcweb:data-table.pagination.next-page', { defaultValue: 'Next page' })}
        className={cn('h-8 border-hidden px-2 text-sm font-medium underline transition-colors duration-200', className)}
        onClick={(e) => {
          if (disabled) return;
          onClick?.(target, e);
          if (!e.defaultPrevented) goTo(target);
        }}
        {...rest}
      >
        {children ?? t('gcweb:data-table.pagination.next-page', { defaultValue: 'Next' })}
      </Button>
    </li>
  );
}

export const Pagination = Object.assign(Root, { Pages, Link, Previous, Next });

export default Pagination;
