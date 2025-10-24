import type { ReactElement } from 'react';
import React, { startTransition, useMemo, useState } from 'react';

import type { SetURLSearchParams } from 'react-router';

import { faSortUp, faSortDown } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import type { ColumnDef, SortingState, Column, Table as ReactTable, ColumnFiltersState, Row } from '@tanstack/react-table';
import {
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { useTranslation } from 'react-i18next';

import type { PageMetadata } from '~/.server/domain/models';
import { Button } from '~/components/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '~/components/dropdown-menu';
import Pagination from '~/components/pagination';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '~/components/table';
import { useLanguage } from '~/hooks/use-language';
import { getCurrentPage, getPageItems, makePageClickHandler, nextPage, prevPage } from '~/utils/pagination-utils';
import { cn } from '~/utils/tailwind-utils';

type DropdownOption = Readonly<{
  id: number;
  code: string;
  nameEn: string;
  nameFr: string;
}>;

type LocalizedDropdownOption = Readonly<{
  id: number;
  code: string;
  name: string;
}>;

interface ServerTableProps<TData> {
  page: PageMetadata;
  pageParam?: string;
  data: TData[];
  children:
    | (ReactElement<ColumnProps<TData, unknown>> | false | undefined)
    | (ReactElement<ColumnProps<TData, unknown>> | false | undefined)[];
  onSortingChange?: (updater: SortingState) => void;
  searchParams: URLSearchParams;
  setSearchParams: SetURLSearchParams;
}

type DataRow<TData, TValue> = Omit<Row<TData>, 'getValue'> & {
  /**
   * Returns the value from the row for a given columnId.
   * @link [API Docs](https://tanstack.com/table/v8/docs/api/core/row#getvalue)
   * @link [Guide](https://tanstack.com/table/v8/docs/guide/rows)
   */
  getValue: (columnId: string) => TValue;
};

type ColumnProps<TData, TValue> = Omit<ColumnDef<TData, TValue>, 'filterFn'> & {
  accessorFn: (data: TData) => TValue;
  filterFn?: (row: DataRow<TData, TValue>, columnId: string, filterValue: LocalizedDropdownOption[]) => boolean;
} & (
    | {
        id?: string;
        accessorKey: string;
      }
    | {
        id: string;
        accessorKey?: never;
      }
  );

export function Column<TData, TValue>(_: ColumnProps<TData, TValue>): ReactElement<ColumnProps<TData, TValue>> {
  return <></>;
}

export function ServerTable<TData>({
  page,
  pageParam = 'page',
  data,
  children,
  onSortingChange,
  searchParams,
  setSearchParams,
}: ServerTableProps<TData>) {
  const { t } = useTranslation(['gcweb']);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const columns = React.Children.map(children, (column) => (column ? column.props : undefined)) ?? [];

  const totalPages = page.totalPages;
  const currentPage = getCurrentPage(searchParams, pageParam, totalPages);
  const pageItems = getPageItems(totalPages, currentPage, { threshold: 9, delta: 2 });
  const handlePageClick = (target: number) => makePageClickHandler(searchParams, setSearchParams, target, pageParam);

  const sorting = useMemo((): { id: string; desc: boolean }[] => {
    const sortParam = searchParams.get('sort');
    if (!sortParam) return [];
    const [param, direction] = sortParam.split(',');
    const columnId = (param ?? '').trim();
    const desc = (direction ?? 'asc').trim().toLowerCase() === 'desc';
    return [{ id: columnId, desc }];
  }, [searchParams]);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    autoResetPageIndex: true,
    onSortingChange: (updater) => {
      const sortState = typeof updater === 'function' ? updater(sorting) : updater;
      onSortingChange?.(sortState);
      const sort = sortState[0];
      const paramsNext = new URLSearchParams({ ...Object.fromEntries(searchParams.entries()) });
      paramsNext.delete('sort');
      if (sort) paramsNext.set('sort', `${sort.id},${sort.desc ? 'desc' : 'asc'}`);
      startTransition(() => setSearchParams(paramsNext));
    },
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      sorting,
      columnFilters,
    },
  });

  return (
    <>
      <Table className="rounded-md border-b border-neutral-300">
        <TableHeader className="bg-neutral-200">
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                const sortDirection = header.column.getIsSorted();
                const ariaSortValue = header.column.getCanSort()
                  ? sortDirection === 'asc'
                    ? 'ascending'
                    : sortDirection === 'desc'
                      ? 'descending'
                      : 'none'
                  : undefined;

                return (
                  <TableHead
                    key={header.id}
                    className={cn('text-left text-sm font-semibold', header.column.columnDef.meta?.headerClassName)}
                    aria-sort={ariaSortValue}
                  >
                    {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                );
              })}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                data-state={row.getIsSelected() && 'selected'}
                className="border-neutral-300 even:bg-neutral-50 hover:bg-slate-100"
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell
                    key={cell.id}
                    className={cn('w-fit px-4 py-3 text-sm text-neutral-800', cell.column.columnDef.meta?.cellClassName)}
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 w-fit text-center">
                {t('gcweb:data-table.zero-records')}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      {totalPages > 1 && (
        <>
          <Pagination className="my-4" aria-label={t('gcweb:data-table.pagination.label', { defaultValue: 'Pagination' })}>
            <p className="sr-only">
              {t('gcweb:data-table.pagination.page-info', {
                index: currentPage,
                count: totalPages,
              })}
            </p>
            <Pagination.Content>
              {/* Previous */}
              <Pagination.Item>
                <Pagination.Previous disabled={currentPage <= 1} onClick={handlePageClick(prevPage(currentPage))} />
              </Pagination.Item>

              {/* Page numbers */}
              {pageItems.map((item, idx) => {
                if (item === 'ellipsis') {
                  return (
                    <Pagination.Item key={`ellipsis-${idx}`}>
                      <Pagination.Ellipsis />
                    </Pagination.Item>
                  );
                }
                const p = item as number;
                const isActive = p === currentPage;
                return (
                  <Pagination.Item key={p}>
                    <Pagination.Link
                      isActive={isActive}
                      aria-label={
                        isActive
                          ? t('gcweb:data-table.pagination.page-button-current', { index: p })
                          : t('gcweb:data-table.pagination.page-button-go-to', { index: p })
                      }
                      onClick={handlePageClick(p)}
                    >
                      {p}
                    </Pagination.Link>
                  </Pagination.Item>
                );
              })}

              {/* Next */}
              <Pagination.Item>
                <Pagination.Next
                  disabled={currentPage >= totalPages}
                  onClick={handlePageClick(nextPage(currentPage, totalPages))}
                />
              </Pagination.Item>
            </Pagination.Content>
          </Pagination>
        </>
      )}
    </>
  );
}

interface ColumnOptionsProps<TData, TValue> {
  column: Column<TData, TValue>;
  title: string;
  className?: string;
  // Optional controlled selection of option values (e.g., status codes)
  selected?: LocalizedDropdownOption[];
  // Optional change notifier when selection updates
  onSelectionChange?: (selected: LocalizedDropdownOption[]) => void;
  searchParams: URLSearchParams;
  setSearchParams: SetURLSearchParams;
  options:
    | DropdownOption[]
    | readonly Readonly<{
        id: number;
        code: string;
        name?: string;
      }>[]
    | Readonly<{
        id: number;
        code: string;
        name?: string;
      }>[]
    | {
        id: number;
        code: string;
        name?: string;
      }[];
}

export function ColumnOptions<TData, TValue>({
  column,
  title,
  options: baseOptions,
  className,
  selected: controlledSelected,
  onSelectionChange,
  searchParams,
  setSearchParams,
}: ColumnOptionsProps<TData, TValue>) {
  const { t } = useTranslation(['gcweb']);
  const { currentLanguage } = useLanguage();
  // Source of truth: controlled 'selected' if provided, else column filter state
  const selectedValues = controlledSelected ?? (column.getFilterValue() as LocalizedDropdownOption[] | undefined) ?? [];

  const options = baseOptions.map((v) => {
    return {
      id: v.id,
      code: v.code,
      name: 'nameEn' in v ? (currentLanguage === 'en' ? v.nameEn : v.nameFr) : (v.name ?? v.code),
    };
  });
  const optionsByIds = new Map<string, number>(options.map((s) => [s.code, s.id]));

  const setSelectedValues = (selected: LocalizedDropdownOption[]) => {
    // Update internal column filter for local filtering/sorting UX
    column.setFilterValue(selected.length ? selected : undefined);
    // Notify parent when controlled handling is desired
    onSelectionChange?.(selected);
    // Map selected codes to IDs present in loaderData.statuses
    const ids = selected.map((option) => optionsByIds.get(option.code)).filter((n): n is number => typeof n === 'number');
    const params = new URLSearchParams({ ...Object.fromEntries(searchParams.entries()), page: '1' });
    params.delete(column.id);
    Array.from(new Set(ids))
      .sort((a, b) => a - b)
      .forEach((id) => params.append(column.id, String(id)));
    setSearchParams(params);
  };

  const toggleOption = (option: LocalizedDropdownOption) => {
    const has = selectedValues.some((v) => v.code === option.code);
    const next = has ? selectedValues.filter((v) => v.code !== option.code) : [...selectedValues, option];
    setSelectedValues(next);
  };

  const selectedCount = selectedValues.length;

  const ariaLabel =
    selectedCount > 0
      ? t('gcweb:data-table.filters.header-aria', {
          title,
          count: selectedCount,
        })
      : title;

  return (
    <div className={cn('flex items-center space-x-2', className)}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="-ml-3 h-8 font-sans font-medium data-[state=open]:bg-neutral-100"
            aria-label={ariaLabel}
          >
            {title}
            {selectedCount > 0 && (
              <span aria-hidden="true" className="ml-1 text-xs font-semibold text-[#0535D2]">
                ({selectedCount})
              </span>
            )}
            <span className="ml-1 rounded-sm p-1 text-neutral-500 hover:bg-slate-300">
              <FontAwesomeIcon icon={faSortDown} />
            </span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="max-h-60 w-full overflow-y-auto p-2">
          {options.map((option) => (
            <DropdownMenuItem key={option.name} asChild>
              <label className="flex w-full cursor-pointer items-center gap-2 px-2 py-1.5">
                <input
                  type="checkbox"
                  checked={selectedValues.some((v) => v.code === option.code)}
                  onChange={() => toggleOption(option)}
                  className="h-4 w-4"
                />
                <span className="text-sm capitalize">{option.name.replace('-', ' ')}</span>
              </label>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  // Whether to render the built-in pagination UI. If false, caller should render their own.
  showPagination?: boolean;
  // Optional controlled sorting props so parent can drive sorting (e.g., via URL params)
  sorting?: SortingState;
  onSortingChange?: (updater: SortingState) => void;
  // When true, table will not apply client-side sorting (server controls order)
  disableClientSorting?: boolean;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  showPagination = true,
  sorting: controlledSorting,
  onSortingChange,
  disableClientSorting = false,
}: DataTableProps<TData, TValue>) {
  const { t } = useTranslation(['gcweb']);
  const [uncontrolledSorting, setUncontrolledSorting] = useState<SortingState>([]);
  const sorting = controlledSorting ?? uncontrolledSorting;
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    // Only enable local pagination when the pagination UI is shown.
    ...(showPagination ? { getPaginationRowModel: getPaginationRowModel() } : {}),
    autoResetPageIndex: true,
    onSortingChange: (updater) => {
      // Resolve Updater<SortingState> to concrete value
      const next = typeof updater === 'function' ? updater(sorting) : updater;
      // Update local state for uncontrolled usage
      setUncontrolledSorting(next);
      // Bubble up for controlled scenarios
      onSortingChange?.(next);
    },
    // Apply client-side sorting only if not disabled
    ...(disableClientSorting ? {} : { getSortedRowModel: getSortedRowModel() }),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      sorting,
      columnFilters,
    },
  });

  return (
    <>
      <Table className="rounded-md border-b border-neutral-300">
        <TableHeader className="bg-neutral-200">
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                const sortDirection = header.column.getIsSorted();
                const ariaSortValue = header.column.getCanSort()
                  ? sortDirection === 'asc'
                    ? 'ascending'
                    : sortDirection === 'desc'
                      ? 'descending'
                      : 'none'
                  : undefined;

                return (
                  <TableHead
                    key={header.id}
                    className={cn('text-left text-sm font-semibold', header.column.columnDef.meta?.headerClassName)}
                    aria-sort={ariaSortValue}
                  >
                    {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                );
              })}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                data-state={row.getIsSelected() && 'selected'}
                className="border-neutral-300 even:bg-neutral-50 hover:bg-slate-100"
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell
                    key={cell.id}
                    className={cn('w-fit px-4 py-3 text-sm text-neutral-800', cell.column.columnDef.meta?.cellClassName)}
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 w-fit text-center">
                {t('gcweb:data-table.zero-records')}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      {showPagination && (
        <div className="my-4">
          <DataTablePagination table={table} />
        </div>
      )}
    </>
  );
}

interface DataTablePaginationProps<TData> {
  table: ReactTable<TData>;
}

export function DataTablePagination<TData>({ table }: DataTablePaginationProps<TData>) {
  const { t } = useTranslation(['gcweb', 'app']);
  const pageCount = table.getPageCount();
  const pageIndex = table.getState().pagination.pageIndex;

  return (
    <div className="flex items-center justify-between px-2">
      <div className="flex items-center space-x-6 lg:space-x-8">
        <div className="flex items-center space-x-2">
          {/* Render page number buttons dynamically based on pageCount */}
          {Array.from({ length: pageCount }, (_, i) => (
            <Button
              key={i}
              type="button"
              variant="outline"
              className={cn('h-8 w-8 p-0 text-sm', pageIndex === i ? 'bg-slate-700 text-white' : 'border-hidden underline')}
              onClick={() => table.setPageIndex(i)}
            >
              <span className="sr-only">{t('gcweb:data-table.pagination.first-page')}</span>
              {i + 1}
            </Button>
          ))}
          {table.getCanNextPage() && (
            <Button
              type="button"
              variant="ghost"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              className={cn('h-8 border-hidden px-2 text-sm font-medium underline transition-colors duration-200')}
            >
              <span className="sr-only">{t('gcweb:data-table.pagination.next-page')}</span>
              {t('app:hr-advisor-employees-table.next-page')}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

interface DataTableColumnHeaderProps<TData, TValue> extends React.HTMLAttributes<HTMLDivElement> {
  column: Column<TData, TValue>;
  title: string;
}

interface DataTableColumnHeaderWithOptionsProps<TData, TValue> {
  column: Column<TData, TValue>;
  title: string;
  options: string[];
  className?: string;
  // Optional controlled selection of option values (e.g., status codes)
  selected?: string[];
  // Optional change notifier when selection updates
  onSelectionChange?: (selected: string[]) => void;
}

export function DataTableColumnHeaderWithOptions<TData, TValue>({
  column,
  title,
  options,
  className,
  selected: controlledSelected,
  onSelectionChange,
}: DataTableColumnHeaderWithOptionsProps<TData, TValue>) {
  const { t } = useTranslation(['gcweb']);
  // Source of truth: controlled 'selected' if provided, else column filter state
  const selectedValues: string[] = controlledSelected ?? (column.getFilterValue() as string[] | undefined) ?? [];

  const setSelectedValues = (next: string[]) => {
    // Update internal column filter for local filtering/sorting UX
    column.setFilterValue(next.length ? next : undefined);
    // Notify parent when controlled handling is desired
    onSelectionChange?.(next);
  };

  const toggleOption = (value: string) => {
    const has = selectedValues.includes(value);
    const next = has ? selectedValues.filter((v) => v !== value) : [...selectedValues, value];
    setSelectedValues(next);
  };

  const selectedCount = selectedValues.length;

  const ariaLabel =
    selectedCount > 0
      ? t('gcweb:data-table.filters.header-aria', {
          title,
          count: selectedCount,
        })
      : title;

  return (
    <div className={cn('flex items-center space-x-2', className)}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="-ml-3 h-8 font-sans font-medium data-[state=open]:bg-neutral-100"
            aria-label={ariaLabel}
          >
            {title}
            {selectedCount > 0 && (
              <span aria-hidden="true" className="ml-1 text-xs font-semibold text-[#0535D2]">
                ({selectedCount})
              </span>
            )}
            <span className="ml-1 rounded-sm p-1 text-neutral-500 hover:bg-slate-300">
              <FontAwesomeIcon icon={faSortDown} />
            </span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="max-h-60 w-48 overflow-y-auto p-2">
          {options.map((option) => (
            <DropdownMenuItem key={option} asChild>
              <label className="flex w-full cursor-pointer items-center gap-2 px-2 py-1.5">
                <input
                  type="checkbox"
                  checked={selectedValues.includes(option)}
                  onChange={() => toggleOption(option)}
                  className="h-4 w-4"
                />
                <span className="text-sm capitalize">{option.replace('-', ' ')}</span>
              </label>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

export function DataTableColumnHeader<TData, TValue>({ column, title, className }: DataTableColumnHeaderProps<TData, TValue>) {
  const { t } = useTranslation(['gcweb']);

  if (!column.getCanSort()) {
    return <div className={cn('flex items-center', className)}>{title}</div>;
  }

  const sortDirection = column.getIsSorted();

  // Create accessible label that describes the current state and action
  const getAriaLabel = () => {
    if (sortDirection === 'asc') {
      return t('gcweb:data-table.sorting.sorted-ascending', { column: title });
    } else if (sortDirection === 'desc') {
      return t('gcweb:data-table.sorting.sorted-descending', { column: title });
    }
    return t('gcweb:data-table.sorting.not-sorted', { column: title });
  };

  return (
    <button
      onClick={() => column.toggleSorting()}
      className={cn('flex items-center gap-1 text-left text-sm font-semibold hover:underline', className)}
      aria-label={getAriaLabel()}
    >
      {title}
      <span className="rounded-sm p-1 text-neutral-500 hover:bg-slate-300" aria-hidden="true">
        <FontAwesomeIcon icon={sortDirection === 'desc' ? faSortDown : faSortUp} />
      </span>
    </button>
  );
}
