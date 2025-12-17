import type { ComponentType, HTMLAttributes, JSX, ReactElement } from 'react';
import { Children, isValidElement, startTransition, useCallback, useMemo, useRef, useState } from 'react';

import type { SetURLSearchParams } from 'react-router';

import { faEllipsis, faSearch, faSliders, faSort, faSortDown, faSortUp, faSpinner } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Popover } from '@radix-ui/react-popover';
import type {
  ColumnDef,
  SortingState,
  Column,
  ColumnFiltersState,
  Table as TableType,
  Header,
  ColumnDefTemplate,
  HeaderContext,
} from '@tanstack/react-table';
import { flexRender, getCoreRowModel, useReactTable } from '@tanstack/react-table';
import { useTranslation } from 'react-i18next';

import type { PageMetadata } from '~/.server/domain/models';
import { Button } from '~/components/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '~/components/dropdown-menu';
import { InputField } from '~/components/input-field';
import Pagination from '~/components/pagination';
import { PopoverContent, PopoverTrigger } from '~/components/popover';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '~/components/table';
import { useLanguage } from '~/hooks/use-language';
import { useFetchLoading } from '~/hooks/use-loading';
import {
  getCurrentPage,
  getPageItems,
  getPageItemsRange,
  makePageClickHandler,
  nextPage,
  prevPage,
} from '~/utils/pagination-utils';
import { parseCSVString } from '~/utils/string-utils';
import { cn } from '~/utils/tailwind-utils';

//#region Utility Hook

/**
 * Hook to handle URL parameter updates with pagination reset
 * @param searchParams Current URL search parameters
 * @param setSearchParams Function to update URL search parameters
 * @param pageParam Name of the page parameter to reset
 * @returns Function that takes an updater callback to modify URL params
 */
function useURLParamUpdater(searchParams: URLSearchParams, setSearchParams: SetURLSearchParams, pageParam: string) {
  return useCallback(
    (updater: (params: URLSearchParams) => void) => {
      const params = new URLSearchParams(searchParams.toString());
      params.delete(pageParam);
      updater(params);
      startTransition(() => setSearchParams(params, { preventScrollReset: true }));
    },
    [searchParams, setSearchParams, pageParam],
  );
}

/**
 * Parses and validates sort parameters from URL search params
 * @param params Array of sort parameter strings from URL
 * @param columns Array of column definitions to validate against
 * @returns Array of validated SortingState objects
 */
function parseSortParams<TData>(params: string[], columns: (InternalColumnProps<TData, unknown> | undefined)[]): SortingState {
  try {
    return params
      .map(parseCSVString)
      .filter((param) => {
        if (param.length !== 2) return false;
        if (!['asc', 'desc'].includes(param[1] ?? '')) return false;
        return columns.some((column) => (column?.accessorKey ?? column?.id) === param[0]);
      })
      .map(([id, desc]) => ({ id: id ?? '', desc: desc === 'desc' }));
  } catch (error) {
    console.warn('Invalid sort parameters:', error);
    return [];
  }
}

//#endregion

//#region Server Table

interface ServerTableProps<TData> {
  /** `PageMetadata` for server-sided pagination. */
  page: PageMetadata;
  /** The data to display in the table. */
  data: TData[];
  /** The columns `<Column/>` to use for the table. */
  children:
    | (ReactElement<InternalColumnProps<TData, unknown>> | false | undefined)
    | (ReactElement<InternalColumnProps<TData, unknown>> | false | undefined)[];
  /** `URLSearchParams` from `useSearchParams(...)` */
  searchParams: URLSearchParams;
  /** `SetURLSearchParams` from `useSearchParams(...)` */
  setSearchParams: SetURLSearchParams;
  /** Optional title used in displaying results */
  resultsTitle?: string;
  /** Optional URL parameters override. */
  urlParams?: {
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
 * @param resultsTitle `Optional title used in displaying results`
 * @param urlParams `Optional` URL parameters override.
 * @param onSortingChange `Optional` Change notifier when sorting updates
 *
 */
export function ServerTable<TData>({
  children: baseColumns,
  page,
  data,
  searchParams,
  setSearchParams,
  resultsTitle,
  urlParams = {},
  onSortingChange,
}: ServerTableProps<TData>) {
  const { t } = useTranslation(['gcweb']);
  const { currentLanguage } = useLanguage();
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const { page: pageParam = 'page', sort: sortParam = 'sort' } = urlParams;
  const columns = Children.map(baseColumns, (column) => (column ? column.props : undefined)) ?? [];
  const [sorting, setSorting] = useState<SortingState>(() => parseSortParams(searchParams.getAll(sortParam), columns));
  const totalPages = page.totalPages;
  const currentPage = getCurrentPage(searchParams, pageParam, totalPages);
  const pageItems = getPageItems(totalPages, currentPage, { threshold: 9, delta: 2 });
  const handlePageClick = (target: number) => makePageClickHandler(searchParams, setSearchParams, target, pageParam);
  const isLoading = useFetchLoading();
  const isSinglePage = totalPages <= 1;
  const { start, end } = getPageItemsRange(data.length, page);

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
      {/* ARIA live region for screen reader announcements */}
      <div aria-live="polite" role="status" className="my-2 font-medium">
        {t('gcweb:data-table.pagination.showing-result', {
          count: page.totalElements,
          start: start,
          end: end,
          total: page.totalElements,
          title: resultsTitle?.toLocaleLowerCase(currentLanguage) ?? t('gcweb:data-table.pagination.results'),
        })}
      </div>
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
                const baseContext = header.getContext();
                const headerContext: ColumnHeaderContext<TData, unknown> = {
                  ColumnHeader: (props: ColumnHeaderProps) => (
                    <InternalColumnHeader
                      {...baseContext}
                      {...props}
                      filterParam={baseContext.column.id}
                      searchParams={searchParams}
                      setSearchParams={setSearchParams}
                      urlParams={{
                        page: pageParam,
                        sort: sortParam,
                      }}
                    />
                  ),
                  ...header.getContext(),
                };
                return (
                  <TableHead
                    key={header.id}
                    className={cn('px-5 text-left text-sm font-semibold', header.column.columnDef.meta?.headerClassName)}
                    aria-sort={ariaSortValue}
                  >
                    {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, headerContext)}
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
                  <FontAwesomeIcon className="mx-auto h-10 w-10" icon={faSpinner} spin={true} />
                ) : (
                  t('gcweb:data-table.zero-records')
                )}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
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
                  disabled={isSinglePage}
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
  );
}

//#endregion

//#region Column Options

type FilterOption = Readonly<{
  id: number[];
  code: string;
  value: string;
}>;

interface ColumnOptionsProps extends BaseHeaderComponent {
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
  filter?: 'id' | 'code' | 'value';
  onSelectionChange?: (selected: FilterOption[]) => void;
  showClearAll?: boolean;
}

/**
 * @see InternalColumnOptions for implementation
 * @see ColumnOptions for export
 */
const ColumnOptionsFC = (_: ColumnOptionsProps) => <></>;
ColumnOptionsFC.displayName = 'ColumnOptions';

/**
 * Component for providing filter options to `<Column/>`
 * @see InternalColumnOptions for implementation
 * @see HEADER_COMPONENTS_MAP for `ColumnOptions` -> `InternalColumnOptions`
 *
 * @example
 * ```tsx
 * <Column
 *   header={({ ColumnHeader }) => (
 *     <ColumnHeader {...headerProps}>
 *       <ColumnOptions options={options} {...props} />
 *     </ColumnHeader>
 *   )}
 *   {...columnProps}
 * />
 * ```
 */
export const ColumnOptions = ColumnOptionsFC as FunctionTypeOf<typeof ColumnOptionsFC>;

type InternalColumnOptionsProps<TData, TValue> = InternalHeaderProps<TData, TValue> & ColumnOptionsProps;
function InternalColumnOptions<TData, TValue>({
  title,
  options: baseOptions,
  searchParams,
  setSearchParams,
  filter = 'id',
  urlParams,
  onSelectionChange,
  showClearAll = false,
  className,
  id,
  withTitle,
  filterParam,
}: InternalColumnOptionsProps<TData, TValue>) {
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
  const [selected, setSelected] = useState(() => {
    try {
      return filter === 'id'
        ? options.filter((option) =>
            option.id.some((id) =>
              searchParams
                .getAll(filterParam)
                .flatMap((id) => parseCSVString(id))
                .includes(id.toString()),
            ),
          )
        : options.filter((option) => searchParams.getAll(filterParam).includes(option[filter]));
    } catch (error) {
      console.warn('Invalid filter parameters:', error);
      return [];
    }
  });

  const updateURLParams = useURLParamUpdater(searchParams, setSearchParams, urlParams.page);

  const applyFilters = () => {
    if (!hasChanged.current) return;
    updateURLParams((params) => {
      params.delete(filterParam);
      selected
        .sort((a, b) => (a.id[0] ?? 0) - (b.id[0] ?? 0))
        .forEach((option) =>
          filter === 'id' ? params.append(filterParam, option.id.join(',')) : params.append(filterParam, option[filter]),
        );
    });
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
            id={id}
            role="button"
            type="button"
            variant="ghost"
            size="sm"
            className={cn('data-[state=open]:bg-neutral-100', withTitle ? '-ml-3.5 pr-0' : 'p-0')}
            aria-label={ariaLabel}
          >
            {withTitle ? (
              <>
                <span className="text-left font-sans">{title}</span>
                {selectedCount > 0 &&
                  (isLoading ? (
                    <span
                      aria-hidden="true"
                      className="ml-1 inline-flex text-xs leading-none font-semibold whitespace-nowrap text-blue-700"
                    >
                      &#40;
                      <FontAwesomeIcon icon={faSpinner} spin={true} />
                      &#41;
                    </span>
                  ) : (
                    <span aria-hidden="true" className="ml-1 text-xs font-semibold text-blue-700">
                      ({selectedCount})
                    </span>
                  ))}
                <span className="ml-1 rounded-sm p-1 text-neutral-500 hover:bg-slate-300">
                  <FontAwesomeIcon icon={faSliders} />
                </span>
              </>
            ) : (
              <span className="rounded-sm px-0.5 py-3 text-neutral-500 hover:bg-slate-300">
                <FontAwesomeIcon icon={faSliders} />
              </span>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          onCloseAutoFocus={() => {
            applyFilters();
          }}
          onEscapeKeyDown={() => setOpen(false)}
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
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    toggleOption(option);
                  }
                }}
                tabIndex={0}
              >
                <input
                  type="checkbox"
                  checked={selected.some((v) => v.code === option.code)}
                  readOnly
                  className="pointer-events-none h-4 w-4"
                  aria-label={t('data-table.filters.filter-option', { value: option.value })}
                />
                <span className="text-sm capitalize">{option.value}</span>
              </div>
            </DropdownMenuItem>
          ))}
          {showClearAll && (
            <DropdownMenuItem asChild>
              <Button
                role="button"
                id="clear-all-button"
                variant="alternative"
                size="sm"
                aria-roledescription="button"
                onClick={() => {
                  hasChanged.current = true; // to trigger the updateParams
                  setSelected([]);
                }}
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

//#endregion

//#region Column Search

interface ColumnSearchProps extends BaseHeaderComponent {
  onSearchChange?: (search: string) => void;
}

/**
 * @see InternalColumnSearch for implementation
 * @see ColumnSearch for export
 */
const ColumnSearchFC = (_: ColumnSearchProps) => <></>;
ColumnSearchFC.displayName = 'ColumnSearch';

/**
 * Component for providing a search filter to `<Column/>`
 * @see InternalColumnSearch for implementation
 * @see HEADER_COMPONENTS_MAP for `ColumnSearch` -> `InternalColumnSearch`
 *
 * @example
 * ```tsx
 * <Column
 *   header={({ ColumnHeader }) => (
 *     <ColumnHeader {...headerProps}>
 *       <ColumnSearch {...props} />
 *     </ColumnHeader>
 *   )}
 *   {...columnProps}
 * />
 * ```
 */
export const ColumnSearch = ColumnSearchFC as FunctionTypeOf<typeof ColumnSearchFC>;

type InternalColumnSearchProps<TData, TValue> = InternalHeaderProps<TData, TValue> & ColumnSearchProps;
function InternalColumnSearch<TData, TValue>({
  title,
  searchParams,
  setSearchParams,
  urlParams,
  className,
  onSearchChange,
  withTitle,
  filterParam,
}: InternalColumnSearchProps<TData, TValue>) {
  const { t } = useTranslation(['gcweb']);
  const [open, setOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const prevSearchValue = searchParams.get(filterParam) ?? '';
  const search = useRef(prevSearchValue);

  const updateURLParams = useURLParamUpdater(searchParams, setSearchParams, urlParams.page);

  const applySearch = () => {
    if (search.current === prevSearchValue) return;
    onSearchChange?.(search.current);
    updateURLParams((params) => {
      params.delete(filterParam);
      if (search.current !== '') params.append(filterParam, search.current);
    });
  };

  return (
    <div className={cn('flex items-center space-x-2', className)}>
      <Popover
        open={open}
        onOpenChange={(open) => {
          setOpen(open);
        }}
      >
        <PopoverTrigger asChild>
          <Button
            role="button"
            type="button"
            variant="ghost"
            size="sm"
            className={cn('data-[state=open]:bg-neutral-100', withTitle ? '-ml-3.5 h-10 pr-0' : 'p-0')}
            aria-label={title}
            title={prevSearchValue ? `${t('search-bar.search')}: ${prevSearchValue}` : undefined}
          >
            {withTitle ? (
              <>
                <span className="w-full text-left font-sans">{title}</span>
                {prevSearchValue && (
                  <span
                    aria-hidden="true"
                    className="ml-1 inline-flex text-xs leading-none font-semibold whitespace-nowrap text-blue-700"
                  >
                    &#40;
                    <FontAwesomeIcon icon={faEllipsis} />
                    &#41;
                  </span>
                )}
                <span className="ml-1 rounded-sm p-1 text-neutral-500 hover:bg-slate-300">
                  <FontAwesomeIcon icon={faSearch} />
                </span>
              </>
            ) : (
              <span className="rounded-sm px-0.5 py-3 text-neutral-500 hover:bg-slate-300">
                <FontAwesomeIcon icon={faSearch} />
              </span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent
          onCloseAutoFocus={() => {
            applySearch();
          }}
          onOpenAutoFocus={() => {
            inputRef.current?.focus();
          }}
          onEscapeKeyDown={() => setOpen(false)}
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
            onChange={(e) => {
              search.current = e.target.value;
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                setOpen(false);
              }
            }}
            className="block h-10 w-75 rounded-lg border-gray-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-hidden"
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}

//#endregion

//#region Column Sort

interface ColumnSortProps extends BaseHeaderComponent {}

/**
 * @see InternalColumnSort for implementation
 * @see ColumnSort for export
 */
const ColumnSortFC = (_: ColumnSortProps) => <></>;
ColumnSortFC.displayName = 'ColumnSort';

/**
 * Component for providing a header and sort direction to `<Column/>`
 * @see InternalColumnSort for implementation
 * @see HEADER_COMPONENTS_MAP for `ColumnSort` -> `InternalColumnSort`
 *
 * @example
 * ```tsx
 * <Column
 *   header={({ ColumnHeader }) => (
 *     <ColumnHeader {...headerProps}>
 *       <ColumnSort {...props} />
 *     </ColumnHeader>
 *   )}
 *   {...columnProps}
 * />
 * ```
 */
export const ColumnSort = ColumnSortFC as FunctionTypeOf<typeof ColumnSortFC>;

type InternalColumnSortProps<TData, TValue> = InternalHeaderProps<TData, TValue> & ColumnSortProps;
function InternalColumnSort<TData, TValue>({
  column,
  title,
  className,
  withTitle,
  searchParams,
  setSearchParams,
  urlParams,
  filterParam,
}: InternalColumnSortProps<TData, TValue>) {
  const { t } = useTranslation(['gcweb']);
  if (!column.getCanSort()) {
    return <div className={cn('flex items-center', className)}>{title}</div>;
  }
  const sortParams = searchParams.getAll(urlParams.sort);
  const sortDirection = useMemo(() => {
    for (const sortParam of sortParams) {
      const [key, value] = sortParam.split(',');
      if (key !== filterParam) continue;
      if (value !== 'asc' && value !== 'desc') break;
      return value;
    }
    return null;
  }, [sortParams, filterParam]);

  // Create accessible label that describes the current state and action
  const getAriaLabel = () => {
    if (sortDirection === 'asc') {
      return t('gcweb:data-table.sorting.sorted-ascending', { column: title });
    } else if (sortDirection === 'desc') {
      return t('gcweb:data-table.sorting.sorted-descending', { column: title });
    }
    return t('gcweb:data-table.sorting.not-sorted', { column: title });
  };

  const updateURLParams = useURLParamUpdater(searchParams, setSearchParams, urlParams.page);

  const toggleSorting = () => {
    updateURLParams((params) => {
      const sorts = params.getAll(urlParams.sort);
      params.delete(urlParams.sort);
      sorts.forEach((sort) => {
        const [key] = sort.split(',');
        if (key !== filterParam) {
          params.append(urlParams.sort, sort);
        }
      });
      switch (sortDirection) {
        default:
          params.set(urlParams.sort, `${filterParam},asc`);
          break;
        case 'asc':
          params.set(urlParams.sort, `${filterParam},desc`);
          break;
        case 'desc':
          break;
      }
    });
  };

  return (
    <Button
      role="button"
      type="button"
      variant="ghost"
      size="sm"
      className={cn('hover:underline data-[state=open]:bg-neutral-100', withTitle ? '-ml-3.5 h-10 pr-0' : 'p-0')}
      aria-label={getAriaLabel()}
      onClick={() => toggleSorting()}
    >
      {withTitle && <>{title}</>}
      <span
        className={cn('rounded-sm text-neutral-500 hover:bg-slate-300', withTitle ? 'ml-2 py-1' : 'px-0.5 py-3')}
        aria-hidden="true"
      >
        <FontAwesomeIcon icon={sortDirection === 'desc' ? faSortDown : sortDirection === 'asc' ? faSortUp : faSort} />
      </span>
    </Button>
  );
}

//#endregion

//#region Column Header

interface ColumnHeaderProps extends HTMLAttributes<HTMLElement> {
  title: string;
}

type ColumnHeaderContext<TData, TValue> = HeaderContext<TData, TValue> & {
  /**
   * Component for providing a header to a `<Column/>`.
   */
  ColumnHeader: (props: ColumnHeaderProps) => JSX.Element; /** @see InternalColumnHeader */
};

/**
 * Internal component for providing a header to a `<Column/>`.
 * Replaces any header components passed in with their internal counterpart, allowing the header components to use the table's props
 *
 * @see HEADER_COMPONENTS_MAP for the internal mapping
 */
function InternalColumnHeader<TData, TValue>({
  className,
  id,
  children: baseChildren,
  ...internalProps
}: InternalHeaderProps<TData, TValue>) {
  const { title } = internalProps;
  const renderedTitle = useRef(false);
  const children = useMemo(() => {
    renderedTitle.current = false;
    return Children.map(baseChildren, (baseChild) => {
      if (!isValidElement(baseChild)) return baseChild;
      if (typeof baseChild.type !== 'function') return baseChild;
      const childType = baseChild.type as typeof baseChild.type & { displayName: unknown };
      if (typeof childType.displayName !== 'string') return baseChild;
      const InternalComponent = HEADER_COMPONENTS_MAP.get(childType.displayName) as
        | InternalHeaderComponentType<TData, TValue, object>
        | undefined;
      if (InternalComponent === undefined) return baseChild;
      const { key, ...child } = baseChild;
      const withTitle = renderedTitle.current === false;
      if (!renderedTitle.current) renderedTitle.current = true;
      const props: BaseHeaderComponent = child.props ?? {};
      return <InternalComponent key={key} {...internalProps} {...props} withTitle={withTitle} />;
    });
  }, [baseChildren, internalProps]);
  return (
    <div id={id} className={cn('flex items-center space-x-0.5', className)}>
      {!renderedTitle.current && title}
      {children}
    </div>
  );
}

//#endregion

//#region Column

type ColumnProps<TData, TValue> = Omit<InternalColumnProps<TData, TValue>, 'header'> & {
  header: ColumnHeaderTemplate<TData, TValue>;
};

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
 *     header={({ ColumnHeader }) => <ColumnHeader {...headerProps} />}
 *     cell={(info) => ...}
 *     {...props}
 *   />
 * </ServerTable>
 * ```
 */
export function Column<TData, TValue>(_: ColumnProps<TData, TValue>): ReactElement<InternalColumnProps<TData, TValue>> {
  return <></>;
}

//#endregion

//#region Helper Types

// Header props for internal components
interface InternalHeaderProps<TData, TValue> extends ColumnHeaderProps {
  column: Column<TData, TValue>;
  header: Header<TData, TValue>;
  table: TableType<TData>;
  title: string;
  searchParams: URLSearchParams;
  setSearchParams: SetURLSearchParams;
  urlParams: {
    [K in keyof NonNullable<ServerTableProps<TData>['urlParams']>]-?: NonNullable<
      NonNullable<ServerTableProps<TData>['urlParams']>[K]
    >;
  };
  filterParam: string;
  withTitle?: boolean;
}

// Type for the custom implementation of tanstack's StringOrTemplateHeader
type ColumnHeaderTemplate<TData, TValue> = string | ColumnDefTemplate<ColumnHeaderContext<TData, TValue>>;

// Internal type that doesn't omit the header, avoids a type error with useReactTable's columns
type InternalColumnProps<TData, TValue> = Omit<ColumnDef<TData, TValue>, 'filterFn'> & {
  header: ColumnHeaderTemplate<TData, TValue>;
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

// Type for the base props of exported header components
type BaseHeaderComponent = HTMLAttributes<HTMLElement> & {
  /** Overrides the url param for filtering the Column. */
  filterParam?: string;
};

// Types for internal components that implement InternalHeaderProps
type InternalHeaderComponentType<TData, TValue, TProps = object> = ComponentType<InternalHeaderProps<TData, TValue> & TProps>;
type UnknownInternalHeaderComponentType<TProps> = InternalHeaderComponentType<unknown, unknown, TProps>;

// Type for extracting the function signature from a function component type
type FunctionTypeOf<T> = T extends (props: infer P) => infer R ? (props: P) => R : never;

//#endregion

/**
 * Maps all header components to their internal counterparts
 *
 * @see InternalColumnHeader
 */
const HEADER_COMPONENTS_MAP = new Map<
  string | undefined,
  | UnknownInternalHeaderComponentType<ColumnSearchProps>
  | UnknownInternalHeaderComponentType<ColumnSortProps>
  | UnknownInternalHeaderComponentType<ColumnOptionsProps>
>([
  [ColumnSearchFC.displayName, InternalColumnSearch],
  [ColumnSortFC.displayName, InternalColumnSort],
  [ColumnOptionsFC.displayName, InternalColumnOptions],
]);
