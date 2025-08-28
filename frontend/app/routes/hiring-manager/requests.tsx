import { useEffect, useMemo, useState } from 'react';
import type { JSX } from 'react';

import { useFetcher } from 'react-router';
import type { RouteHandle } from 'react-router';

import type { ColumnDef } from '@tanstack/react-table';
import { useTranslation } from 'react-i18next';

import type { Route } from './+types/requests';

import type { LocalizedLookupModel, LookupModel, RequestReadModel, RequestStatus } from '~/.server/domain/models';
import { getRequestService } from '~/.server/domain/services/request-service';
import { getRequestStatusService } from '~/.server/domain/services/request-status-service';
import { serverEnvironment } from '~/.server/environment';
import { requireAuthentication } from '~/.server/utils/auth-utils';
import { i18nRedirect } from '~/.server/utils/route-utils';
import { DataTable, DataTableColumnHeader, DataTableColumnHeaderWithOptions } from '~/components/data-table';
import { InlineLink } from '~/components/links';
import { LoadingButton } from '~/components/loading-button';
import { PageTitle } from '~/components/page-title';
import { ACTIVE_REQUEST_STATUS_IDS, ARCHIVED_REQUEST_STATUS_IDS } from '~/domain/constants';
import { useFetcherState } from '~/hooks/use-fetcher-state';
import { getTranslation } from '~/i18n-config.server';
import { handle as parentHandle } from '~/routes/layout';
import { formatDateTimeInZone } from '~/utils/date-utils';

export const handle = {
  i18nNamespace: [...parentHandle.i18nNamespace],
} as const satisfies RouteHandle;

export function meta({ loaderData }: Route.MetaArgs) {
  return [{ title: loaderData.documentTitle }];
}

export async function action({ context, request }: Route.ActionArgs) {
  requireAuthentication(context.session, request);

  const newRequestResult = await getRequestService().createRequest(context.session.authState.accessToken);
  const requestId = newRequestResult.into()?.id.toString();

  throw i18nRedirect('routes/hiring-manager/request/index.tsx', request, { params: { requestId } });
}

export async function loader({ context, request }: Route.LoaderArgs) {
  requireAuthentication(context.session, request);

  const { t, lang } = await getTranslation(request, handle.i18nNamespace);

  const requestStatuses = await getRequestStatusService().listAllLocalized(lang);

  const requestsResult = await getRequestService().getCurrentUserRequests(context.session.authState.accessToken);
  const requests = requestsResult.into()?.content ?? [];

  const activeRequests = requests.filter((req) => req.status && ACTIVE_REQUEST_STATUS_IDS.includes(req.status.id));
  const archivedRequests = requests.filter((req) => req.status && ARCHIVED_REQUEST_STATUS_IDS.includes(req.status.id));

  return {
    documentTitle: t('app:hiring-manager-requests.page-title'),
    activeRequests,
    archivedRequests,
    requestStatusNames: requestStatuses.map(({ name }) => name),
    baseTimeZone: serverEnvironment.BASE_TIMEZONE,
    lang,
  };
}

export default function HiringManagerRequests({ loaderData, params }: Route.ComponentProps) {
  const fetcher = useFetcher();
  const fetcherState = useFetcherState(fetcher);
  const isSubmitting = fetcherState.submitting;
  const { t } = useTranslation(handle.i18nNamespace);

  const [browserTZ, setBrowserTZ] = useState<string | null>(null);

  useEffect(() => {
    setBrowserTZ(Intl.DateTimeFormat().resolvedOptions().timeZone);
  }, []);

  const formatDateYMD = useMemo(
    () => (iso?: string) =>
      iso ? formatDateTimeInZone(iso, browserTZ ?? loaderData.baseTimeZone, 'yyyy-MM-dd') : '0000-00-00',
    [browserTZ, loaderData.baseTimeZone],
  );

  const columns: ColumnDef<RequestReadModel & { classification?: LookupModel; requestStatus?: LocalizedLookupModel }>[] = [
    {
      accessorKey: 'id',
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('app:hiring-manager-requests.requestId')} />,
      cell: (info) => <p>{info.getValue() as string}</p>,
    },
    {
      accessorKey: 'classification.id',
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('app:hiring-manager-requests.classification')} />,
      cell: (info) => <p>{info.row.original.classification?.code}</p>,
    },
    {
      accessorKey: 'dateUpdated',
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('app:hiring-manager-requests.updated')} />,
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
          title={t('app:hiring-manager-requests.status')}
          options={loaderData.requestStatusNames}
        />
      ),
      cell: (info) => {
        const status = info.row.original.status;
        return status && statusTag(status, loaderData.lang);
      },
      filterFn: (row, columnId, filterValue: string[]) => {
        const status = row.getValue(columnId) as string;
        return filterValue.length === 0 || filterValue.includes(status);
      },
      enableColumnFilter: true,
    },
    {
      header: t('app:hiring-manager-requests.action'),
      id: 'action',
      cell: (info) => {
        const requestId = info.row.original.id.toString();
        return (
          <InlineLink
            className="text-sky-800 no-underline decoration-slate-400 decoration-2 hover:underline"
            file="routes/hiring-manager/request/index.tsx"
            params={{ requestId }}
            aria-label={t('app:hiring-manager-requests.view-link', {
              requestId,
            })}
          >
            {t('app:hiring-manager-requests.view')}
          </InlineLink>
        );
      },
    },
  ];

  return (
    <div className="mb-8 space-y-4">
      <PageTitle className="after:w-14">{t('app:hiring-manager-requests.page-title')}</PageTitle>

      <fetcher.Form method="post" noValidate className="mb-8">
        <LoadingButton name="action" variant="primary" size="sm" disabled={isSubmitting} loading={isSubmitting}>
          {t('app:hiring-manager-requests.create-request')}
        </LoadingButton>
      </fetcher.Form>

      <section className="mb-8">
        <h2 className="font-lato text-xl font-bold">{t('app:hiring-manager-requests.active-requests')}</h2>
        {loaderData.activeRequests.length === 0 ? (
          <div>{t('app:hiring-manager-requests.no-active-requests')}</div>
        ) : (
          <DataTable columns={columns} data={loaderData.activeRequests} />
        )}
      </section>

      <section>
        <h2 className="font-lato text-xl font-bold">{t('app:hiring-manager-requests.archived-requests')}</h2>
        {loaderData.archivedRequests.length === 0 ? (
          <div>{t('app:hiring-manager-requests.no-archived-requests')}</div>
        ) : (
          <DataTable columns={columns} data={loaderData.archivedRequests} />
        )}
      </section>
    </div>
  );
}

function statusTag(status: RequestStatus, lang: Language): JSX.Element {
  const styleMap: Record<string, string> = {
    SUBMIT: 'bg-sky-100 text-sky-700',
    HR_REVIEW: 'bg-sky-100 text-sky-700',
    FDBK_PEND_APPR: 'bg-sky-100 text-sky-700',
    PENDING_PSC: 'bg-sky-100 text-sky-700',
    DRAFT: 'bg-amber-100 text-yellow-900',
    FDBK_PENDING: 'bg-amber-100 text-yellow-900',
    DEFAULT: 'bg-transparent',
  };
  const style = styleMap[status.code] ?? styleMap.DEFAULT;
  return (
    <div className={`${style} flex w-fit items-center gap-2 rounded-md px-3 py-1 text-sm font-semibold`}>
      <p>{lang === 'en' ? status.nameEn : status.nameFr}</p>
    </div>
  );
}
