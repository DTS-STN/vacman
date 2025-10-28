import type { ReactElement } from 'react';
import React, { startTransition, useEffect, useState } from 'react';

import type { SetURLSearchParams } from 'react-router';

import { faSortDown } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import type { ColumnDef, SortingState, Column, ColumnFiltersState, Row } from '@tanstack/react-table';
import { flexRender, getCoreRowModel, useReactTable } from '@tanstack/react-table';
import { useTranslation } from 'react-i18next';

import type { PageMetadata } from '~/.server/domain/models';
import { Button } from '~/components/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '~/components/dropdown-menu';
import Pagination from '~/components/pagination';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '~/components/table';
import { useLanguage } from '~/hooks/use-language';
import { getCurrentPage, getPageItems, makePageClickHandler, nextPage, prevPage } from '~/utils/pagination-utils';
import { parseCSVString } from '~/utils/string-utils';
import { cn } from '~/utils/tailwind-utils';

interface ServerTableProps<TData> {
  /** `PageMetadata` for server-sided pagination. */
  page: PageMetadata;
  /** The data to display in the table. */
  data: TData[];
  /** The columns `<Column/>` to use for the table. */
  children:
    | (ReactElement<ColumnProps<TData, unknown>> | false | undefined)
    | (ReactElement<ColumnProps<TData, unknown>> | false | undefined)[];
  /** `URLSearchParams` from `useSearchParams(...)` */
  searchParams: URLSearchParams;
  /** `SetURLSearchParams` from `useSearchParams(...)` */
  setSearchParams: SetURLSearchParams;
  /** Optional URL parameters override. */
  urlParam?: {
    /** Pagination parameter, defaults to `'page'`. */
    page?: string;
    /** Column sort parameter, defaults to `'sort'`. */
    sort?: string;
  };
  /** Optional change notifier when sorting updates */
  onSortingChange?: (updater: SortingState) => void;
}

/**
 * An opinionated implementation of TanStack React Table, designed specifically for server-side pagination and sorting.
 * @param children The columns `<Column/>` to use for the table.
 * @param page `PageMetadata` for server-sided pagination.
 * @param data The data to display in the table.
 * @param searchParams `URLSearchParams` from `useSearchParams(...)`
 * @param setSearchParams `SetURLSearchParams` from `useSearchParams(...)`
 * @param urlParam `Optional` URL parameters override.
 * @param onSortingChange `Optional` Change notifier when sorting updates
 *
 */
export function ServerTable<TData>({
  children: baseColumns,
  page,
  data,
  searchParams,
  setSearchParams,
  urlParam = {},
  onSortingChange,
}: ServerTableProps<TData>) {
  const { t } = useTranslation(['gcweb']);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const { page: pageParam = 'page', sort: sortParam = 'sort' } = urlParam;
  const columns = React.Children.map(baseColumns, (column) => (column ? column.props : undefined)) ?? [];
  const [sorting, setSorting] = useState<SortingState>(
    searchParams
      .getAll(sortParam)
      .map(parseCSVString)
      .filter((param) => param.length === 2)
      .filter((param) => param[1] === 'desc' || param[1] === 'asc')
      .filter((param) => columns.some((column) => (column.accessorKey ?? column.id) === param[0]))
      .map((param) => {
        return {
          id: param[0] ?? '',
          desc: param[1] === 'desc',
        };
      }),
  );
  const totalPages = page.totalPages;
  const currentPage = getCurrentPage(searchParams, pageParam, totalPages);
  const pageItems = getPageItems(totalPages, currentPage, { threshold: 9, delta: 2 });
  const handlePageClick = (target: number) => makePageClickHandler(searchParams, setSearchParams, target, pageParam);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    autoResetPageIndex: true,
    onSortingChange: (updater) => {
      const sortState = typeof updater === 'function' ? updater(sorting) : updater;
      setSorting(sortState);
      onSortingChange?.(sortState);
      const sort = sortState[0];
      const paramsNext = new URLSearchParams(searchParams.toString());
      paramsNext.delete(sortParam);
      if (sort) paramsNext.set(sortParam, `${sort.id},${sort.desc ? 'desc' : 'asc'}`);
      startTransition(() => setSearchParams(paramsNext));
    },
    onColumnFiltersChange: setColumnFilters,
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

type FilterOption = Readonly<{
  id: number[];
  code: string;
  value: string;
}>;

interface ColumnOptionsProps<TData, TValue> {
  column: Column<TData, TValue>;
  title: string;
  options:
    | Readonly<{
        id: number;
        code: string;
        nameEn: string;
        nameFr: string;
      }>[]
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
      }[]
    | Map<
        Readonly<{
          id: number;
          code: string;
          name?: string;
        }>,
        number[]
      >;
  searchParams: URLSearchParams;
  setSearchParams: SetURLSearchParams;
  filter?: 'id' | 'code' | 'value';
  page?: string;
  className?: string;
  onSelectionChange?: (selected: FilterOption[]) => void;
}

/**
 * Component for providing filter options to `<Column/>`
 *
 * @example
 * ```tsx
 * <Column
 *   header={({ column }) => <ColumnOptions column={column} {...props} />
 *   {...columnProps}
 * />
 * ```
 */
export function ColumnOptions<TData, TValue>({
  column,
  title,
  options: baseOptions,
  searchParams,
  setSearchParams,
  filter = 'id',
  page,
  className,
  onSelectionChange,
}: ColumnOptionsProps<TData, TValue>) {
  const { t } = useTranslation(['gcweb']);
  const { currentLanguage } = useLanguage();
  const options =
    baseOptions instanceof Map
      ? baseOptions
          .entries()
          .map(([option, ids]) => {
            return {
              id: ids.sort((a, b) => a - b),
              code: option.code,
              value: (option.name ?? option.code).replace('-', ' '),
            };
          })
          .toArray()
      : baseOptions.map((v) => {
          const name = 'nameEn' in v ? (currentLanguage === 'en' ? v.nameEn : v.nameFr) : (v.name ?? v.code);
          return {
            id: [v.id],
            code: v.code,
            value: name.replace('-', ' '),
          };
        });
  const selectedValues =
    filter === 'id'
      ? options.filter((option) =>
          option.id.some((id) =>
            searchParams
              .getAll(column.id)
              .flatMap((id) => parseCSVString(id))
              .includes(id.toString()),
          ),
        )
      : options.filter((option) => searchParams.getAll(column.id).includes(option[filter]));

  useEffect(() => {
    if (!column.getFilterValue()) {
      column.setFilterValue(selectedValues);
    }
  }, []);

  const setSelectedValues = (selected: FilterOption[]) => {
    column.setFilterValue(selected);
    onSelectionChange?.(selected);
    const params = new URLSearchParams(searchParams.toString());
    if (page) params.delete(page);
    params.delete(column.id);
    selected
      .sort((a, b) => (a.id[0] ?? 0) - (b.id[0] ?? 0))
      .forEach((option) =>
        filter === 'id' ? params.append(column.id, option.id.join(',')) : params.append(column.id, option[filter]),
      );
    setSearchParams(params);
  };

  const toggleOption = (option: FilterOption) => {
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
            <DropdownMenuItem key={option.code} asChild>
              <label className="flex w-full cursor-pointer items-center gap-2 px-2 py-1.5">
                <input
                  type="checkbox"
                  checked={selectedValues.some((v) => v.code === option.code)}
                  onChange={() => toggleOption(option)}
                  className="h-4 w-4"
                />
                <span className="text-sm capitalize">{option.value}</span>
              </label>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

type ColumnProps<TData, TValue> = Omit<ColumnDef<TData, TValue>, 'filterFn'> & {
  accessorFn: (data: TData) => TValue;
  filterFn?: (row: Row<TData>, columnId: string, selectedFilters: FilterOption[]) => boolean;
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

/**
 * Component for creating `<ServerTable/>` columns
 * @link [API Docs](https://tanstack.com/table/latest/docs/api/core/column-def)
 * @link [Guide](https://tanstack.com/table/latest/docs/guide/columns)
 *
 * @example
 * ```tsx
 * <ServerTable {...tableProps}>
 *   <Column
 *     accessorKey="key"
 *     accessorFn={(data: TData) => ...}
 *     header={({ column }) => ...}
 *     cell={(info) => ...}
 *     {...props}
 *   />
 * </ServerTable>
 * ```
 */
export function Column<TData, TValue>(_: ColumnProps<TData, TValue>): ReactElement<ColumnProps<TData, TValue>> {
  return <></>;
}
