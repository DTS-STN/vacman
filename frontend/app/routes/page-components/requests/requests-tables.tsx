import { useEffect, useMemo, useState } from 'react';
import type { JSX } from 'react';

import type { FetcherWithComponents, SetURLSearchParams } from 'react-router';
import { useFetcher, useSearchParams } from 'react-router';

import { useTranslation } from 'react-i18next';

import type { LocalizedLookupModel, PageMetadata, RequestReadModel } from '~/.server/domain/models';
import { InputSelect } from '~/components/input-select';
import { LoadingButton } from '~/components/loading-button';
import { LoadingLink } from '~/components/loading-link';
import { Column, ColumnHeader, ColumnOptions, ColumnSearch, ServerTable } from '~/components/server-table';
import { RequestStatusTag } from '~/components/status-tag';
import { REQUEST_CATEGORY, REQUEST_STATUSES } from '~/domain/constants';
import { useFetcherState } from '~/hooks/use-fetcher-state';
import { useLanguage } from '~/hooks/use-language';
import { formatDateTimeInZone } from '~/utils/date-utils';
import { formatWithMask } from '~/utils/string-utils';

interface RequestTablesProps {
  activeRequestsPage: PageMetadata;
  activeRequests: RequestReadModel[];
  inactiveRequestsPage: PageMetadata;
  inactiveRequests: RequestReadModel[];
  requestStatuses: readonly LocalizedLookupModel[];
  classifications: readonly LocalizedLookupModel[];
  workUnits: LocalizedLookupModel[];
  baseTimeZone: string;
  view: 'hr-advisor' | 'hiring-manager';
}

export default function RequestsTables({
  activeRequestsPage,
  activeRequests,
  inactiveRequestsPage,
  inactiveRequests,
  requestStatuses,
  classifications,
  workUnits,
  baseTimeZone,
  view,
}: RequestTablesProps): JSX.Element {
  const [searchParams, setSearchParams] = useSearchParams({ filter: 'all' });
  const fetcher = useFetcher();
  const fetcherState = useFetcherState(fetcher);
  const isSubmitting = fetcherState.submitting;
  const { t } = useTranslation('app');
  const enableRequestsFilter = view === 'hr-advisor';
  const [browserTZ, setBrowserTZ] = useState<string | null>(null);
  const [srAnnouncement, setSrAnnouncement] = useState('');
  const [requestsFilter, setRequestsFilter] = useState<string>(searchParams.get('filter') ?? 'all');

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

  const activeRequestsOptions = useMemo(
    () =>
      requestStatuses.filter((s) =>
        REQUEST_STATUSES.filter((req) => req.category === REQUEST_CATEGORY.active).some((req) => req.code === s.code),
      ),
    [requestStatuses],
  );

  const inactiveRequestsOptions = useMemo(
    () =>
      requestStatuses.filter((s) =>
        REQUEST_STATUSES.filter((req) => req.category === REQUEST_CATEGORY.inactive).some((req) => req.code === s.code),
      ),
    [requestStatuses],
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
                  const params = new URLSearchParams(searchParams.toString());
                  params.delete('activePage');
                  params.delete('inactivePage');
                  params.set('filter', target.value);
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

          <RequestsColumns
            keyPrefix="active"
            fetcher={fetcher}
            page={activeRequestsPage}
            requests={activeRequests}
            requestStatuses={activeRequestsOptions}
            classifications={classifications}
            workUnits={workUnits}
            view={view}
            isSubmitting={isSubmitting}
            formatDateYMD={formatDateYMD}
            searchParams={searchParams}
            setSearchParams={setSearchParams}
          />
        </section>

        <section>
          <h2 className="font-lato text-xl font-bold">{t('requests-tables.inactive-requests')}</h2>
          <RequestsColumns
            keyPrefix="inactive"
            fetcher={fetcher}
            page={inactiveRequestsPage}
            requests={inactiveRequests}
            requestStatuses={inactiveRequestsOptions}
            classifications={classifications}
            workUnits={workUnits}
            view={view}
            isSubmitting={isSubmitting}
            formatDateYMD={formatDateYMD}
            searchParams={searchParams}
            setSearchParams={setSearchParams}
          />
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
  requestStatuses: readonly LocalizedLookupModel[];
  classifications: readonly LocalizedLookupModel[];
  workUnits: LocalizedLookupModel[];
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
  requestStatuses,
  classifications,
  workUnits,
  isSubmitting,
  formatDateYMD,
  searchParams,
  setSearchParams,
}: RequestColumnsProps) {
  const { currentLanguage } = useLanguage();
  const { t } = useTranslation('app');
  const urlParam = {
    page: `${keyPrefix}Page`,
    sort: `${keyPrefix}Sort`,
  };

  // Helper function to get HR advisor name
  const getHrAdvisorName = (hrAdvisor: RequestReadModel['hrAdvisor']) => {
    return hrAdvisor ? `${hrAdvisor.firstName} ${hrAdvisor.lastName}` : '';
  };

  return (
    <ServerTable page={page} data={requests} searchParams={searchParams} setSearchParams={setSearchParams} urlParam={urlParam}>
      <Column
        accessorKey={`${keyPrefix}Id`}
        accessorFn={(row: RequestReadModel) => row.id}
        header={({ column }) => (
          <ColumnSearch
            column={column}
            title={t('requests-tables.requestId')}
            page={urlParam.page}
            searchParams={searchParams}
            setSearchParams={setSearchParams}
          />
        )}
        cell={(info) => {
          const requestId = info.row.original.id.toString();
          return (
            <LoadingLink
              className="text-sky-800 decoration-slate-400 decoration-2"
              file={`routes/${view}/request/index.tsx`}
              params={{ requestId }}
              search={searchParams}
              aria-label={t('requests-tables.view-link', { requestId })}
            >
              {formatWithMask(info.row.original.id, '####-####-##')}
            </LoadingLink>
          );
        }}
        sortingFn={(rowA, rowB) => {
          const a = rowA.original.id;
          const b = rowB.original.id;
          return a - b;
        }}
      />
      <Column
        accessorKey={`${keyPrefix}Group`}
        accessorFn={(row: RequestReadModel) => row.classification?.code ?? ''}
        header={({ column }) => (
          <ColumnOptions
            column={column}
            title={t('requests-tables.classification')}
            options={classifications}
            page={urlParam.page}
            searchParams={searchParams}
            setSearchParams={setSearchParams}
            showClearAll
          />
        )}
        cell={(info) => <p>{info.row.original.classification?.code}</p>}
      />
      {view === 'hr-advisor' && (
        <Column
          accessorKey={`${keyPrefix}Branch`}
          accessorFn={(row: RequestReadModel) =>
            (currentLanguage === 'en' ? row.workUnit?.parent?.nameEn : row.workUnit?.parent?.nameFr) ?? '-'
          }
          header={({ column }) => (
            <ColumnOptions
              column={column}
              title={t('requests-tables.work-unit')}
              options={workUnits}
              page={urlParam.page}
              searchParams={searchParams}
              setSearchParams={setSearchParams}
              showClearAll
            />
          )}
          cell={(info) => (
            <p>
              {currentLanguage === 'en'
                ? (info.row.original.workUnit?.parent?.nameEn ?? '-')
                : (info.row.original.workUnit?.parent?.nameFr ?? '-')}
            </p>
          )}
        />
      )}
      <Column
        accessorKey="lastModifiedDate"
        accessorFn={(row: RequestReadModel) => row.lastModifiedDate ?? ''}
        header={({ column }) => <ColumnHeader column={column} title={t('requests-tables.updated')} />}
        cell={(info) => {
          const lastModifiedDate = info.row.original.lastModifiedDate;
          const userUpdated = info.row.original.lastModifiedBy ?? 'Unknown User';
          const dateUpdated = formatDateYMD(lastModifiedDate);
          return <p className="text-neutral-600">{`${dateUpdated}: ${userUpdated}`}</p>;
        }}
      />
      <Column
        accessorKey="hrAdvisor"
        accessorFn={(row: RequestReadModel) => getHrAdvisorName(row.hrAdvisor)}
        header={({ column }) => <ColumnHeader column={column} title={t('requests-tables.hr-advisor')} />}
        cell={(info) => {
          const hrAdvisorName = getHrAdvisorName(info.row.original.hrAdvisor) || t('requests-tables.not-assigned');
          return <p className="text-neutral-600">{hrAdvisorName}</p>;
        }}
      />
      <Column
        accessorKey={`${keyPrefix}Status`}
        accessorFn={(row: RequestReadModel) => (currentLanguage === 'en' ? row.status?.nameEn : row.status?.nameFr) ?? '-'}
        header={({ column }) => (
          <ColumnOptions
            column={column}
            title={t('requests-tables.status')}
            options={requestStatuses}
            page={urlParam.page}
            searchParams={searchParams}
            setSearchParams={setSearchParams}
            showClearAll
          />
        )}
        cell={(info) => {
          const status = info.row.original.status;
          return status && <RequestStatusTag status={status} lang={currentLanguage ?? 'en'} view={view} />;
        }}
      />
      <Column
        header={t('requests-tables.action')}
        accessorKey="action"
        accessorFn={(row: RequestReadModel) => row.id}
        cell={(info) => {
          const requestId = info.row.original.id.toString();
          return (
            <div className="flex items-baseline gap-4">
              <LoadingLink
                className="rounded-sm text-sky-800 underline hover:text-blue-700 focus:text-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none"
                file={`routes/${view}/request/index.tsx`}
                params={{ requestId }}
                search={searchParams}
                aria-label={t('requests-tables.view-link', { requestId })}
              >
                {t('requests-tables.view')}
              </LoadingLink>
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
