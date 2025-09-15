import { useEffect, useMemo, useState } from 'react';
import type { JSX } from 'react';

import { useFetcher } from 'react-router';

import type { ColumnDef } from '@tanstack/react-table';
import { useTranslation } from 'react-i18next';

import type { LocalizedLookupModel, LookupModel, RequestReadModel, RequestStatus } from '~/.server/domain/models';
import { DataTable, DataTableColumnHeader, DataTableColumnHeaderWithOptions } from '~/components/data-table';
import { InlineLink } from '~/components/links';
import { LoadingButton } from '~/components/loading-button';
import { useFetcherState } from '~/hooks/use-fetcher-state';
import { formatDateTimeInZone } from '~/utils/date-utils';

interface RequestTablesProps {
  activeRequests: RequestReadModel[];
  archivedRequests: RequestReadModel[];
  activeRequestNames: string[];
  inactiveRequestNames: string[];
  baseTimeZone: string;
  lang: Language;
  view: 'hr-advisor' | 'hiring-manager';
}

export default function RequestsTables({
  activeRequests,
  archivedRequests,
  activeRequestNames,
  inactiveRequestNames,
  baseTimeZone,
  lang,
  view,
}: RequestTablesProps): JSX.Element {
  const fetcher = useFetcher();
  const fetcherState = useFetcherState(fetcher);
  const isSubmitting = fetcherState.submitting;
  const { t } = useTranslation('app');

  const [browserTZ, setBrowserTZ] = useState<string | null>(null);

  useEffect(() => {
    setBrowserTZ(Intl.DateTimeFormat().resolvedOptions().timeZone);
  }, []);

  const formatDateYMD = useMemo(
    () => (iso?: string) => (iso ? formatDateTimeInZone(iso, browserTZ ?? baseTimeZone, 'yyyy-MM-dd') : '0000-00-00'),
    [browserTZ, baseTimeZone],
  );

  function createColumns(
    isActive: boolean,
  ): ColumnDef<RequestReadModel & { classification?: LookupModel; requestStatus?: LocalizedLookupModel }>[] {
    return [
      {
        accessorKey: 'id',
        header: ({ column }) => <DataTableColumnHeader column={column} title={t('requests-tables.requestId')} />,
        cell: (info) => {
          const requestId = info.row.original.id.toString();
          return (
            <InlineLink
              className="text-sky-800 decoration-slate-400 decoration-2"
              file={`routes/${view}/request/index.tsx`}
              params={{ requestId }}
              aria-label={t('requests-tables.view-link', {
                requestId,
              })}
            >
              {info.getValue() as string}
            </InlineLink>
          );
        },
      },

      {
        accessorKey: 'classification.id',
        header: ({ column }) => <DataTableColumnHeader column={column} title={t('requests-tables.classification')} />,
        cell: (info) => <p>{info.row.original.classification?.code}</p>,
      },
      {
        accessorKey: 'dateUpdated',
        header: ({ column }) => <DataTableColumnHeader column={column} title={t('requests-tables.updated')} />,
        cell: (info) => {
          const lastModifiedDate = info.row.original.lastModifiedDate;
          const userUpdated = info.row.original.lastModifiedBy ?? 'Unknown User';
          const dateUpdated = formatDateYMD(lastModifiedDate);
          return <p className="text-neutral-600">{`${dateUpdated}: ${userUpdated}`}</p>;
        },
      },
      {
        accessorKey: 'requestStatus.id',
        accessorFn: (row) => row.requestStatus?.name,
        header: ({ column }) => (
          <DataTableColumnHeaderWithOptions
            column={column}
            title={t('requests-tables.status')}
            options={isActive ? activeRequestNames : inactiveRequestNames}
          />
        ),
        cell: (info) => {
          const status = info.row.original.status;
          return status && statusTag(status, lang, view);
        },
        filterFn: (row, columnId, filterValue: string[]) => {
          const status = row.getValue(columnId) as string;
          return filterValue.length === 0 || filterValue.includes(status);
        },
        enableColumnFilter: true,
      },
      {
        header: t('requests-tables.action'),
        id: 'action',
        cell: (info) => {
          const requestId = info.row.original.id.toString();
          return (
            <InlineLink
              className="text-sky-800 decoration-slate-400 decoration-2"
              file={`routes/${view}/request/index.tsx`}
              params={{ requestId }}
              aria-label={t('requests-tables.view-link', {
                requestId,
              })}
            >
              {t('requests-tables.view')}
            </InlineLink>
          );
        },
      },
    ];
  }

  return (
    <div className="mb-8 space-y-4">
      {view === 'hiring-manager' && (
        <fetcher.Form method="post" noValidate className="mb-8">
          <LoadingButton name="action" variant="primary" size="sm" disabled={isSubmitting} loading={isSubmitting}>
            {t('requests-tables.create-request')}
          </LoadingButton>
        </fetcher.Form>
      )}

      <section className="mb-8">
        <h2 className="font-lato text-xl font-bold">{t('requests-tables.active-requests')}</h2>
        {activeRequests.length === 0 ? (
          <div>{t('requests-tables.no-active-requests')}</div>
        ) : (
          <DataTable columns={createColumns(true)} data={activeRequests} />
        )}
      </section>

      <section>
        <h2 className="font-lato text-xl font-bold">{t('requests-tables.archived-requests')}</h2>
        {archivedRequests.length === 0 ? (
          <div>{t('requests-tables.no-archived-requests')}</div>
        ) : (
          <DataTable columns={createColumns(false)} data={archivedRequests} />
        )}
      </section>
    </div>
  );
}

function statusTag(status: RequestStatus, lang: Language, view: string): JSX.Element {
  const styleMap: Record<string, string> = {
    CLR_GRANTED: 'bg-gray-100 text-slate-700',
    PSC_GRANTED: 'bg-gray-100 text-slate-700',
    CANCELLED: 'bg-gray-100 text-slate-700',
    ...(view === 'hr-advisor'
      ? { FDBK_PENDING: 'bg-sky-100 text-sky-700', DEFAULT: 'bg-amber-100 text-yellow-900' }
      : {
          DRAFT: 'bg-amber-100 text-yellow-900',
          FDBK_PENDING: 'bg-amber-100 text-yellow-900',
          DEFAULT: 'bg-sky-100 text-sky-700',
        }),
  };
  const style = styleMap[status.code] ?? styleMap.DEFAULT;
  return (
    <div className={`${style} flex w-fit items-center gap-2 rounded-md px-3 py-1 text-sm font-semibold`}>
      <p>{lang === 'en' ? status.nameEn : status.nameFr}</p>
    </div>
  );
}
