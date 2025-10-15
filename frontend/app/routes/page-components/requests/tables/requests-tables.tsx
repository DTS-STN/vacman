import { useEffect, useMemo, useState } from 'react';
import type { JSX } from 'react';

import { useFetcher } from 'react-router';

import type { ColumnDef } from '@tanstack/react-table';
import { useTranslation } from 'react-i18next';

import type { LocalizedLookupModel, LookupModel, RequestReadModel } from '~/.server/domain/models';
import { DataTable, DataTableColumnHeader, DataTableColumnHeaderWithOptions } from '~/components/data-table';
import { InputSelect } from '~/components/input-select';
import { InlineLink } from '~/components/links';
import { LoadingButton } from '~/components/loading-button';
import { RequestStatusTag } from '~/components/status-tag';
import { useFetcherState } from '~/hooks/use-fetcher-state';
import { useLanguage } from '~/hooks/use-language';
import { formatDateTimeInZone } from '~/utils/date-utils';
import { formatId } from '~/utils/string-utils';

interface RequestTablesProps {
  userId: number;
  activeRequests: RequestReadModel[];
  inactiveRequests: RequestReadModel[];
  activeRequestNames: string[];
  inactiveRequestNames: string[];
  baseTimeZone: string;
  lang: Language;
  view: 'hr-advisor' | 'hiring-manager';
}

export default function RequestsTables({
  userId,
  activeRequests,
  inactiveRequests,
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
  const enableRequestsFilter = view === 'hr-advisor' && (activeRequests.length > 0 || inactiveRequests.length > 0);
  const { currentLanguage } = useLanguage();
  const [browserTZ, setBrowserTZ] = useState<string | null>(null);
  const [srAnnouncement, setSrAnnouncement] = useState('');
  const [requestsFilter, setRequestsFilter] = useState<string>('all');

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
    const columns: ColumnDef<RequestReadModel & { classification?: LookupModel; requestStatus?: LocalizedLookupModel }>[] = [
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
              aria-label={t('requests-tables.view-link', { requestId })}
            >
              {formatId(info.row.original.id, [4, 4, 2])} {/* display request id in format ####-####-## */}
            </InlineLink>
          );
        },
      },
      {
        accessorKey: 'classification.id',
        header: ({ column }) => <DataTableColumnHeader column={column} title={t('requests-tables.classification')} />,
        cell: (info) => <p>{info.row.original.classification?.code}</p>,
      },
    ];

    // Insert workUnit column only for HR Advisor
    if (view === 'hr-advisor') {
      columns.push({
        accessorKey: 'workUnit',
        header: ({ column }) => <DataTableColumnHeader column={column} title={t('requests-tables.work-unit')} />,
        cell: (info) => (
          <p>
            {lang === 'en'
              ? (info.row.original.workUnit?.parent?.nameEn ?? '-')
              : (info.row.original.workUnit?.parent?.nameFr ?? '-')}
          </p>
        ),
      });
    }

    // Continue with the rest of the columns
    columns.push(
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
        accessorKey: 'status.code',
        accessorFn: (row) => (currentLanguage === 'en' ? row.status?.nameEn : row.status?.nameFr),
        header: ({ column }) => (
          <DataTableColumnHeaderWithOptions
            column={column}
            title={t('requests-tables.status')}
            options={isActive ? activeRequestNames : inactiveRequestNames}
          />
        ),
        cell: (info) => {
          const status = info.row.original.status;
          return status && <RequestStatusTag status={status} lang={lang} view={view} />;
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
            <div className="flex items-baseline gap-4">
              <InlineLink
                className="rounded-sm text-sky-800 underline hover:text-blue-700 focus:text-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none"
                file={`routes/${view}/request/index.tsx`}
                params={{ requestId }}
                aria-label={t('requests-tables.view-link', { requestId })}
              >
                {t('requests-tables.view')}
              </InlineLink>
              {view === 'hiring-manager' && (
                <fetcher.Form method="post" noValidate>
                  <input type="hidden" name="requestId" value={requestId}></input>
                  <LoadingButton
                    name="action"
                    variant="alternative"
                    size="sm"
                    disabled={isSubmitting}
                    loading={isSubmitting}
                    value="copy"
                  >
                    {t('requests-tables.copy')}
                  </LoadingButton>
                </fetcher.Form>
              )}
            </div>
          );
        },
      },
    );

    return columns;
  }

  const requestsOptions = useMemo(
    () => [
      {
        value: 'me',
        children: t('requests-tables.my-requests'),
      },
      {
        value: 'all',
        children: t('requests-tables.all-requests'),
      },
    ],
    [t],
  );

  return (
    <>
      {/* ARIA live region for screen reader announcements */}
      <div aria-live="polite" role="status" className="sr-only">
        {srAnnouncement}
      </div>
      <div className="mb-8 space-y-4">
        {view === 'hiring-manager' && (
          <fetcher.Form method="post" noValidate className="mb-8">
            <LoadingButton
              name="action"
              variant="primary"
              size="sm"
              disabled={isSubmitting}
              loading={isSubmitting}
              value="create"
            >
              {t('requests-tables.create-request')}
            </LoadingButton>
          </fetcher.Form>
        )}
        <section className="my-8">
          {enableRequestsFilter ? (
            <section className="mb-5 flex flex-col items-end justify-between gap-8 sm:flex-row">
              <h2 className="font-lato text-xl font-bold">{t('requests-tables.active-requests')}</h2>
              <InputSelect
                id="selectRequests"
                name="selectRequests"
                required={false}
                options={requestsOptions}
                aria-label={t('hr-advisor-employees-table.filter-by')}
                defaultValue={requestsFilter}
                onChange={({ target }) => {
                  setRequestsFilter(target.value);
                  const message =
                    target.value === 'me'
                      ? t('requests-tables.table-updated.my-requests')
                      : t('requests-tables.table-updated.all-requests');
                  setSrAnnouncement(message);
                }}
                className="text-left"
              />
            </section>
          ) : (
            <h2 className="font-lato text-xl font-bold">{t('requests-tables.active-requests')}</h2>
          )}

          {activeRequests.length === 0 ? (
            <div>{t('requests-tables.no-active-requests')}</div>
          ) : (
            <DataTable
              columns={createColumns(true)}
              data={activeRequests.filter((req) => (requestsFilter === 'me' ? req.hrAdvisor?.id === userId : true))}
              disableClientSorting={true}
            />
          )}
        </section>

        <section>
          <h2 className="font-lato text-xl font-bold">{t('requests-tables.inactive-requests')}</h2>
          {inactiveRequests.length === 0 ? (
            <div>{t('requests-tables.no-inactive-requests')}</div>
          ) : (
            <DataTable
              columns={createColumns(false)}
              data={inactiveRequests.filter((req) => (requestsFilter === 'me' ? req.hrAdvisor?.id === userId : true))}
            />
          )}
        </section>
      </div>
    </>
  );
}
