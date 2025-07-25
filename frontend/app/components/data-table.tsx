import { useState } from 'react';

import { faSortUp, faSortDown } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import type { ColumnDef, SortingState, Column, Table as ReactTable, ColumnFiltersState } from '@tanstack/react-table';
import {
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { useTranslation } from 'react-i18next';

import { Button } from '~/components/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '~/components/dropdown-menu';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '~/components/table';
import { cn } from '~/utils/tailwind-utils';

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
}

export function DataTable<TData, TValue>({ columns, data }: DataTableProps<TData, TValue>) {
  const { t } = useTranslation(['gcweb']);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
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
                return (
                  <TableHead
                    key={header.id}
                    className={cn('text-left text-sm font-semibold', header.column.columnDef.meta?.headerClassName)}
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
                className="border-neutral-300 even:bg-neutral-50 hover:bg-neutral-100"
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
      <div className="my-4">
        <DataTablePagination table={table} />
      </div>
    </>
  );
}

interface DataTablePaginationProps<TData> {
  table: ReactTable<TData>;
}

export function DataTablePagination<TData>({ table }: DataTablePaginationProps<TData>) {
  const { t } = useTranslation(['gcweb']);
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
          <Button
            type="button"
            variant="ghost"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className={cn('h-8 border-hidden px-2 text-sm font-medium underline transition-colors duration-200')}
          >
            <span className="sr-only">{t('gcweb:data-table.pagination.next-page')}</span>
            Next
          </Button>
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
}

export function DataTableColumnHeaderWithOptions<TData, TValue>({
  column,
  title,
  options,
  className,
}: DataTableColumnHeaderWithOptionsProps<TData, TValue>) {
  const selected = column.getFilterValue() as string[] | undefined;

  const toggleOption = (value: string) => {
    let next: string[];

    if (selected?.includes(value)) {
      next = selected.filter((v) => v !== value);
    } else {
      next = [...(selected ?? []), value];
    }

    column.setFilterValue(next.length ? next : undefined);
  };

  return (
    <div className={cn('flex items-center space-x-2', className)}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="-ml-3 h-8 font-sans font-medium data-[state=open]:bg-neutral-100"
          >
            {title}
            <span className="ml-1 rounded-sm p-1 text-neutral-500 hover:bg-slate-300">
              <FontAwesomeIcon icon={faSortDown} />
            </span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-48 p-2">
          {options.map((option) => (
            <DropdownMenuItem key={option} asChild>
              <label className="flex w-full cursor-pointer items-center gap-2 px-2 py-1.5">
                <input
                  type="checkbox"
                  checked={selected?.includes(option) ?? false}
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
  if (!column.getCanSort()) {
    return <div className={cn('flex items-center', className)}>{title}</div>;
  }

  const sortDirection = column.getIsSorted();

  return (
    <button
      onClick={() => column.toggleSorting()}
      className={cn('flex items-center gap-1 text-left text-sm font-semibold hover:underline', className)}
    >
      {title}
      <span className="rounded-sm p-1 text-neutral-500 hover:bg-slate-300">
        <FontAwesomeIcon icon={sortDirection === 'desc' ? faSortDown : faSortUp} />
      </span>
    </button>
  );
}
