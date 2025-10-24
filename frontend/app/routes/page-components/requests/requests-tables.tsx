import { useEffect, useMemo, useState } from 'react';
import type { JSX } from 'react';

import type { FetcherWithComponents, SetURLSearchParams } from 'react-router';
import { useFetcher, useSearchParams } from 'react-router';

import { useTranslation } from 'react-i18next';

import type { LookupModel, PageMetadata, RequestReadModel } from '~/.server/domain/models';
import { Column, ColumnOptions, ServerTable, DataTableColumnHeader } from '~/components/data-table';
import { InputSelect } from '~/components/input-select';
import { InlineLink } from '~/components/links';
import { LoadingButton } from '~/components/loading-button';
import { RequestStatusTag } from '~/components/status-tag';
import { useFetcherState } from '~/hooks/use-fetcher-state';
import { useLanguage } from '~/hooks/use-language';
import { formatDateTimeInZone } from '~/utils/date-utils';
import { formatWithMask } from '~/utils/string-utils';

interface RequestTablesProps {
  activeRequestsPage: PageMetadata;
  activeRequests: RequestReadModel[];
  inactiveRequestsPage: PageMetadata;
  inactiveRequests: RequestReadModel[];
  baseTimeZone: string;
  view: 'hr-advisor' | 'hiring-manager';
}

export default function RequestsTables({
  activeRequestsPage,
  activeRequests,
  inactiveRequestsPage,
  inactiveRequests,
  baseTimeZone,
  view,
}: RequestTablesProps): JSX.Element {
  const [searchParams, setSearchParams] = useSearchParams({ filter: 'all', page: '1', size: '10' });
  const fetcher = useFetcher();
  const fetcherState = useFetcherState(fetcher);
  const isSubmitting = fetcherState.submitting;
  const { t } = useTranslation('app');
  const enableRequestsFilter = view === 'hr-advisor';
  const { currentLanguage } = useLanguage();
  const [browserTZ, setBrowserTZ] = useState<string | null>(null);
  const [srAnnouncement, setSrAnnouncement] = useState('');
  const [requestsFilter, setRequestsFilter] = useState<string>('all');

  // Helper to generate unique, sorted work unit names for filter options
  function getUniqueWorkUnits(requests: RequestReadModel[], language: string): LookupModel[] {
    const uniqueWorkUnits = new Set<LookupModel>();
    requests.forEach((request) => {
      if (request.workUnit?.parent) {
        uniqueWorkUnits.add(request.workUnit.parent);
      }
    });
    return Array.from(uniqueWorkUnits).sort((a, b) =>
      currentLanguage === 'en'
        ? a.nameEn.localeCompare(b.nameEn, currentLanguage)
        : a.nameFr.localeCompare(b.nameFr, currentLanguage),
    );
  }

  const activeWorkUnits = useMemo(
    () => getUniqueWorkUnits(activeRequests, currentLanguage ?? 'en'),
    [activeRequests, currentLanguage],
  );

  const inactiveWorkUnits = useMemo(
    () => getUniqueWorkUnits(inactiveRequests, currentLanguage ?? 'en'),
    [inactiveRequests, currentLanguage],
  );

  useEffect(() => {
    setBrowserTZ(Intl.DateTimeFormat().resolvedOptions().timeZone);
  }, []);

  const formatDateYMD = useMemo(
    () => (iso?: string) => (iso ? formatDateTimeInZone(iso, browserTZ ?? baseTimeZone, 'yyyy-MM-dd') : '0000-00-00'),
    [browserTZ, baseTimeZone],
  );

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
        <section className="mt-8 mb-12">
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
                  const params = new URLSearchParams({ ...Object.fromEntries(searchParams.entries()), page: '1' });
                  params.delete('filter');
                  params.append('filter', target.value);
                  setSearchParams(params);
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
            <RequestsColumns
              keyPrefix="active"
              fetcher={fetcher}
              page={activeRequestsPage}
              requests={activeRequests}
              workUnits={activeWorkUnits}
              view={view}
              isSubmitting={isSubmitting}
              formatDateYMD={formatDateYMD}
              searchParams={searchParams}
              setSearchParams={setSearchParams}
            />
          )}
        </section>

        <section>
          <h2 className="font-lato text-xl font-bold">{t('requests-tables.inactive-requests')}</h2>
          {inactiveRequests.length === 0 ? (
            <div>{t('requests-tables.no-inactive-requests')}</div>
          ) : (
            <RequestsColumns
              keyPrefix="inactive"
              fetcher={fetcher}
              page={inactiveRequestsPage}
              requests={inactiveRequests}
              workUnits={inactiveWorkUnits}
              view={view}
              isSubmitting={isSubmitting}
              formatDateYMD={formatDateYMD}
              searchParams={searchParams}
              setSearchParams={setSearchParams}
            />
          )}
        </section>
      </div>
    </>
  );
}

interface RequestColumnsProps {
  keyPrefix: string;
  fetcher: FetcherWithComponents<unknown>;
  page: PageMetadata;
  requests: RequestReadModel[];
  workUnits: LookupModel[];
  view: 'hr-advisor' | 'hiring-manager';
  isSubmitting: boolean;
  formatDateYMD: (iso?: string | undefined) => string;
  searchParams: URLSearchParams;
  setSearchParams: SetURLSearchParams;
}

function RequestsColumns({
  keyPrefix,
  fetcher,
  page,
  requests,
  view,
  workUnits,
  isSubmitting,
  formatDateYMD,
  searchParams,
  setSearchParams,
}: RequestColumnsProps) {
  const { currentLanguage } = useLanguage();
  const { t } = useTranslation('app');

  const workUnitOptions = useMemo(() => {
    // Use a map to remove any duplicates
    return [...new Map(workUnits.map((unit) => [unit.id, unit])).values()];
  }, [requests]);

  //TODO: Call the API for status options
  const statusOptions = useMemo(() => {
    // Use a map to remove any duplicates
    return [...new Map(requests.map((req) => [req.status?.id, req.status])).values()].filter((s) => s !== undefined);
  }, [requests]);

  return (
    <ServerTable
      page={page}
      pageParam={`${keyPrefix}page`}
      data={requests}
      searchParams={searchParams}
      setSearchParams={setSearchParams}
    >
      <Column
        accessorKey={`${keyPrefix}id`}
        accessorFn={(row: RequestReadModel) => row.id}
        header={({ column }) => <DataTableColumnHeader column={column} title={t('requests-tables.requestId')} />}
        cell={(info) => {
          const requestId = info.row.original.id.toString();
          return (
            <InlineLink
              className="text-sky-800 decoration-slate-400 decoration-2"
              file={`routes/${view}/request/index.tsx`}
              params={{ requestId }}
              aria-label={t('requests-tables.view-link', { requestId })}
            >
              {formatWithMask(info.row.original.id, '####-####-##')}
            </InlineLink>
          );
        }}
        sortingFn={(rowA, rowB) => {
          const a = rowA.original.id;
          const b = rowB.original.id;
          return a - b;
        }}
      />
      <Column
        accessorKey={`${keyPrefix}group`}
        accessorFn={(row: RequestReadModel) => row.classification?.code ?? ''}
        header={({ column }) => <DataTableColumnHeader column={column} title={t('requests-tables.classification')} />}
        cell={(info) => <p>{info.row.original.classification?.code}</p>}
      />
      {view === 'hr-advisor' && (
        <Column
          accessorKey={`${keyPrefix}workUnitId`}
          accessorFn={(row: RequestReadModel) =>
            (currentLanguage === 'en' ? row.workUnit?.parent?.nameEn : row.workUnit?.parent?.nameFr) ?? '-'
          }
          header={({ column }) => (
            <ColumnOptions
              column={column}
              title={t('requests-tables.work-unit')}
              options={workUnitOptions}
              searchParams={searchParams}
              setSearchParams={setSearchParams}
            />
          )}
          cell={(info) => (
            <p>
              {currentLanguage === 'en'
                ? (info.row.original.workUnit?.parent?.nameEn ?? '-')
                : (info.row.original.workUnit?.parent?.nameFr ?? '-')}
            </p>
          )}
          filterFn={(row, columnId, filterValue) => {
            const branch = row.getValue(columnId);
            return filterValue.length === 0 || filterValue.some((filter) => filter.name === branch);
          }}
          enableColumnFilter={true}
        />
      )}
      <Column
        accessorKey={`${keyPrefix}updated`}
        accessorFn={(row: RequestReadModel) => row.lastModifiedDate ?? ''}
        header={({ column }) => <DataTableColumnHeader column={column} title={t('requests-tables.updated')} />}
        cell={(info) => {
          const lastModifiedDate = info.row.original.lastModifiedDate;
          const userUpdated = info.row.original.lastModifiedBy ?? 'Unknown User';
          const dateUpdated = formatDateYMD(lastModifiedDate);
          return <p className="text-neutral-600">{`${dateUpdated}: ${userUpdated}`}</p>;
        }}
      />
      <Column
        accessorKey={`${keyPrefix}statusId`}
        accessorFn={(row: RequestReadModel) => (currentLanguage === 'en' ? row.status?.nameEn : row.status?.nameFr) ?? '-'}
        header={({ column }) => (
          <ColumnOptions
            column={column}
            title={t('requests-tables.status')}
            options={statusOptions}
            searchParams={searchParams}
            setSearchParams={setSearchParams}
          />
        )}
        cell={(info) => {
          const status = info.row.original.status;
          return status && <RequestStatusTag status={status} lang={currentLanguage ?? 'en'} view={view} />;
        }}
        filterFn={(row, columnId, filterValue) => {
          const status = row.getValue(columnId);
          return filterValue.length === 0 || filterValue.some((filter) => filter.name === status);
        }}
        enableColumnFilter={true}
      />
      <Column
        header={t('requests-tables.action')}
        accessorKey={`${keyPrefix}action`}
        accessorFn={(row: RequestReadModel) => row.id}
        cell={(info) => {
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
        }}
      />
    </ServerTable>
  );
}
