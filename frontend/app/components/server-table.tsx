import type { ReactElement } from 'react';
import React, { startTransition, useRef, useState } from 'react';

import type { SetURLSearchParams } from 'react-router';

import { faEllipsis, faSearch, faSliders, faSort, faSortDown, faSortUp, faSpinner } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import type { ColumnDef, SortingState, Column, ColumnFiltersState } from '@tanstack/react-table';
import { flexRender, getCoreRowModel, useReactTable } from '@tanstack/react-table';
import { useTranslation } from 'react-i18next';

import type { PageMetadata } from '~/.server/domain/models';
import { Button } from '~/components/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '~/components/dropdown-menu';
import { InputField } from '~/components/input-field';
import Pagination from '~/components/pagination';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '~/components/table';
import { useLanguage } from '~/hooks/use-language';
import { useFetchLoading } from '~/hooks/use-loading';
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
  const isLoading = useFetchLoading();

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
      startTransition(() => setSearchParams(paramsNext, { preventScrollReset: true }));
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
                    className={cn('px-5 text-left text-sm font-semibold', header.column.columnDef.meta?.headerClassName)}
                    aria-sort={ariaSortValue}
                  >
                    {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                );
              })}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody className={cn(isLoading ? 'pointer-events-none animate-pulse cursor-not-allowed select-none' : '')}>
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
                    className={cn(
                      'w-fit px-5 py-3 text-sm text-neutral-800',
                      isLoading ? 'opacity-50' : '',
                      cell.column.columnDef.meta?.cellClassName,
                    )}
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell
                colSpan={columns.length}
                className={cn('h-24 w-fit justify-items-center text-center', isLoading ? 'opacity-50' : '')}
              >
                {isLoading ? (
                  <FontAwesomeIcon className="h-10 w-10" icon={faSpinner} spin={true} />
                ) : (
                  t('gcweb:data-table.zero-records')
                )}
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

interface ColumnOptionsProps<TData, TValue> extends ColumnHeaderProps<TData, TValue> {
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
  onSelectionChange?: (selected: FilterOption[]) => void;
  showClearAll?: boolean;
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
  showClearAll = false,
}: ColumnOptionsProps<TData, TValue>) {
  const { t } = useTranslation(['gcweb']);
  const { currentLanguage } = useLanguage();
  const isLoading = useFetchLoading();
  const hasChanged = useRef(false);
  const [open, setOpen] = useState(false);
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
  const [selected, setSelected] = useState(
    filter === 'id'
      ? options.filter((option) =>
          option.id.some((id) =>
            searchParams
              .getAll(column.id)
              .flatMap((id) => parseCSVString(id))
              .includes(id.toString()),
          ),
        )
      : options.filter((option) => searchParams.getAll(column.id).includes(option[filter])),
  );

  const updateURLParams = () => {
    if (!hasChanged.current) return;
    const params = new URLSearchParams(searchParams.toString());
    if (page) params.delete(page);
    params.delete(column.id);
    selected
      .sort((a, b) => (a.id[0] ?? 0) - (b.id[0] ?? 0))
      .forEach((option) =>
        filter === 'id' ? params.append(column.id, option.id.join(',')) : params.append(column.id, option[filter]),
      );
    startTransition(() => setSearchParams(params, { preventScrollReset: true }));
  };

  const toggleOption = (option: FilterOption) => {
    hasChanged.current = true;
    const has = selected.some((v) => v.code === option.code);
    const next = has ? selected.filter((v) => v.code !== option.code) : [...selected, option];
    onSelectionChange?.(next);
    setSelected(next);
  };

  const selectedCount = selected.length;
  const ariaLabel =
    selectedCount > 0
      ? t('gcweb:data-table.filters.header-aria', {
          title,
          count: selectedCount,
        })
      : title;

  return (
    <div className={cn('flex items-center space-x-2', className)}>
      <DropdownMenu
        open={open}
        onOpenChange={(open) => {
          setOpen(open);
        }}
      >
        <DropdownMenuTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="-ml-3.5 h-8 data-[state=open]:bg-neutral-100"
            aria-label={ariaLabel}
          >
            <span className="text-left font-sans">{title}</span>
            {selectedCount > 0 &&
              (isLoading ? (
                <span
                  aria-hidden="true"
                  className="ml-1 inline-flex text-xs leading-none font-semibold whitespace-nowrap text-[#0535D2]"
                >
                  &#40;
                  <FontAwesomeIcon icon={faSpinner} spin={true} />
                  &#41;
                </span>
              ) : (
                <span aria-hidden="true" className="ml-1 text-xs font-semibold text-[#0535D2]">
                  ({selectedCount})
                </span>
              ))}
            <span className="ml-1 rounded-sm p-1 text-neutral-500 hover:bg-slate-300">
              <FontAwesomeIcon icon={faSliders} />
            </span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          onCloseAutoFocus={() => {
            updateURLParams();
          }}
          align="start"
          className="max-h-60 w-full overflow-y-auto p-2"
          role="menu"
        >
          {options.map((option) => (
            <DropdownMenuItem key={option.code} asChild>
              <div
                className="flex w-full cursor-pointer items-center gap-2 px-2 py-1.5"
                role="menuitemcheckbox"
                aria-checked={selected.some((v) => v.code === option.code)}
                onClick={(e) => {
                  e.preventDefault();
                  toggleOption(option);
                }}
                onKeyDown={(e) => {
                  switch (e.key) {
                    case 'Enter':
                    case ' ': {
                      e.preventDefault();
                      toggleOption(option);
                      break;
                    }
                    case 'Tab': {
                      e.preventDefault();
                      setOpen(false);
                      break;
                    }
                  }
                }}
                tabIndex={0}
              >
                <input
                  type="checkbox"
                  checked={selected.some((v) => v.code === option.code)}
                  onChange={(e) => {
                    e.preventDefault();
                    toggleOption(option);
                  }}
                  className="h-4 w-4"
                  aria-label={t('data-table.filters.filter-option', { value: option.value })}
                  tabIndex={-1}
                />
                <span className="text-sm capitalize">{option.value}</span>
              </div>
            </DropdownMenuItem>
          ))}
          {showClearAll && (
            <DropdownMenuItem asChild>
              <Button
                id="clear-all-button"
                variant="alternative"
                size="sm"
                aria-roledescription="button"
                onClick={() => setSelected([])}
                className="m-2"
              >
                {t('data-table.filters.clear-all')}
              </Button>
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

interface ColumnSearchProps<TData, TValue> extends ColumnHeaderProps<TData, TValue> {
  searchParams: URLSearchParams;
  setSearchParams: SetURLSearchParams;
  page?: string;
  onSearchChange?: (search: string) => void;
}

/**
 * Component for providing a search filter to `<Column/>`
 *
 * @example
 * ```tsx
 * <Column
 *   header={({ column }) => <ColumnSearch column={column} {...props} />
 *   {...columnProps}
 * />
 * ```
 */
export function ColumnSearch<TData, TValue>({
  column,
  title,
  searchParams,
  setSearchParams,
  page,
  className,
  onSearchChange,
}: ColumnSearchProps<TData, TValue>) {
  const { t } = useTranslation(['gcweb']);
  const [open, setOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const forceUpdate = useRef(false);
  const search = useRef('');
  const prevSearchValue = searchParams.get(column.id) ?? '';

  const updateURLParam = () => {
    if (search.current === prevSearchValue && !forceUpdate.current) return;
    onSearchChange?.(search.current);
    const params = new URLSearchParams(searchParams.toString());
    if (page) params.delete(page);
    params.delete(column.id);
    if (search.current !== '') params.append(column.id, search.current);
    startTransition(() => setSearchParams(params, { preventScrollReset: true }));
  };

  const setSearchValue = (force?: boolean) => {
    forceUpdate.current = force === true;
    search.current = inputRef.current?.value ?? '';
    setOpen(false);
  };

  return (
    <div className={cn('flex items-center space-x-2', className)}>
      <DropdownMenu
        open={open}
        onOpenChange={(open) => {
          setOpen(open);
        }}
      >
        <DropdownMenuTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="-ml-3.5 h-10 data-[state=open]:bg-neutral-100"
            aria-label={title}
          >
            <span className="w-full text-left font-sans">{title}</span>
            {prevSearchValue && (
              <span
                aria-hidden="true"
                className="ml-1 inline-flex text-xs leading-none font-semibold whitespace-nowrap text-[#0535D2]"
              >
                &#40;
                <FontAwesomeIcon icon={faEllipsis} />
                &#41;
              </span>
            )}
            <span className="ml-1 rounded-sm p-1 text-neutral-500 hover:bg-slate-300">
              <FontAwesomeIcon icon={faSearch} />
            </span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          onFocus={() => {
            inputRef.current?.focus();
          }}
          onCloseAutoFocus={() => {
            updateURLParam();
          }}
          onKeyDown={(e) => {
            switch (e.key) {
              case 'ArrowDown':
              case 'ArrowUp': {
                e.preventDefault();
                inputRef.current?.focus();
                break;
              }
              case 'Tab': {
                e.preventDefault();
                setSearchValue();
                break;
              }
            }
          }}
          align="start"
          className="flex w-full justify-center overflow-y-auto p-4"
          role="searchbox"
        >
          <InputField
            ref={inputRef}
            type="search"
            autoComplete="off"
            label={`${t('search-bar.search')} ${title}`}
            name="search"
            icon={faSearch}
            defaultValue={prevSearchValue}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                setSearchValue(true);
              }
            }}
            className="block h-10 w-75 rounded-lg border-gray-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-hidden"
          />
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

interface ColumnHeaderProps<TData, TValue> extends React.HTMLAttributes<HTMLElement> {
  column: Column<TData, TValue>;
  title: string;
}
/**
 * Component for providing a header and sort direction to `<Column/>`
 *
 * @example
 * ```tsx
 * <Column
 *   header={({ column }) => <ColumnHeader column={column} {...props} />
 *   {...columnProps}
 * />
 * ```
 */
export function ColumnHeader<TData, TValue>({ column, title, className }: ColumnHeaderProps<TData, TValue>) {
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
        <FontAwesomeIcon icon={sortDirection === 'desc' ? faSortDown : sortDirection === 'asc' ? faSortUp : faSort} />
      </span>
    </button>
  );
}

type ColumnProps<TData, TValue> = Omit<ColumnDef<TData, TValue>, 'filterFn'> & {
  accessorFn: (data: TData) => TValue;
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
