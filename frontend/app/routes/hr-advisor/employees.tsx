import type { JSX } from 'react';

import { useLoaderData } from 'react-router';
import type { RouteHandle, LoaderFunctionArgs, MetaFunction } from 'react-router';

import type { ColumnDef } from '@tanstack/react-table';
import { format } from 'date-fns';
import { useTranslation } from 'react-i18next';

import type { Route } from '../+types/index';

import type { Profile } from '~/.server/domain/models';
import { getProfileService } from '~/.server/domain/services/profile-service';
import { getProfileStatusService } from '~/.server/domain/services/profile-status-service';
import { requireAuthentication } from '~/.server/utils/auth-utils';
import { Button } from '~/components/button';
import { DataTable, DataTableColumnHeader, DataTableColumnHeaderWithOptions } from '~/components/data-table';
import { InlineLink } from '~/components/links';
import { PageTitle } from '~/components/page-title';
import { PROFILE_STATUS_CODE } from '~/domain/constants';
import { getTranslation } from '~/i18n-config.server';
import { handle as parentHandle } from '~/routes/layout';

export const handle = {
  i18nNamespace: [...parentHandle.i18nNamespace],
} as const satisfies RouteHandle;

export async function loader({ context, request }: LoaderFunctionArgs) {
  const currentUrl = new URL(request.url);
  // Check if the user is authenticated (no specific roles required)
  requireAuthentication(context.session, currentUrl);

  const { lang, t } = await getTranslation(request, handle.i18nNamespace);

  const profiles = await getProfileService().getAllProfiles();
  const statuses = await getProfileStatusService().listAllLocalized(lang);

  const hrRelevantEmployeeStatusCodes = [PROFILE_STATUS_CODE.approved, PROFILE_STATUS_CODE.pending];
  const statusIds = statuses
    .filter((s) =>
      hrRelevantEmployeeStatusCodes.includes(
        s.code as typeof PROFILE_STATUS_CODE.approved | typeof PROFILE_STATUS_CODE.pending,
      ),
    )
    .map((s) => s.id);

  // Filter profiles based on allowed status codes
  const filteredProfiles = profiles.filter((profile) => statusIds.includes(profile.profileStatusId));

  return {
    documentTitle: t('app:index.employees'),
    profiles: filteredProfiles,
    statuses,
  };
}

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  return [{ title: data?.documentTitle }];
};

export default function EmployeeDashboard({ params }: Route.ComponentProps) {
  const { t } = useTranslation(handle.i18nNamespace);
  const loaderData = useLoaderData<typeof loader>();

  const statusMap = Object.fromEntries(loaderData.statuses.map((s) => [s.id, s.name]));

  const columns: ColumnDef<Profile>[] = [
    {
      accessorKey: 'personalInformation.givenName',
      accessorFn: (row) => `${row.personalInformation.givenName ?? ''} ${row.personalInformation.surname ?? ''}`.trim(),
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('app:employee-dashboard.employee')} />,
      cell: (info) => <p>{info.getValue() as string}</p>,
    },
    {
      accessorKey: 'personalInformation.workEmail',
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('app:employee-dashboard.email')} />,
      cell: (info) => {
        const email = info.row.original.personalInformation.workEmail;
        return (
          <a href={`mailto:${email}`} className="text-sky-800 decoration-slate-400 decoration-2 hover:underline">
            {email}
          </a>
        );
      },
    },
    {
      accessorKey: 'dateUpdated',
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('app:employee-dashboard.updated')} />,
      cell: (info) => {
        const date = info.row.original.dateUpdated;
        const userUpdated = info.row.original.userUpdated ?? 'Unknown User';

        const dateUpdated = date !== undefined ? format(new Date(date), 'yyyy-MM-dd') : '0000-00-00';

        return <p className="text-neutral-600">{`${dateUpdated}: ${userUpdated}`}</p>;
      },
    },
    {
      accessorKey: 'status',
      accessorFn: (row) => statusMap[row.profileStatusId] ?? '',
      header: ({ column }) => (
        <DataTableColumnHeaderWithOptions
          column={column}
          title={t('app:employee-dashboard.status')}
          options={loaderData.statuses
            .filter((status) => status.code === PROFILE_STATUS_CODE.approved || status.code === PROFILE_STATUS_CODE.pending)
            .map((status) => status.name)}
        />
      ),
      cell: (info) => {
        const profile = info.row.original;
        const status = loaderData.statuses.find((s) => s.id === profile.profileStatusId);
        return status && statusTag(status.code, status.name);
      },
      filterFn: (row, columnId, filterValue: string[]) => {
        const status = row.getValue(columnId) as string;
        return filterValue.length === 0 || filterValue.includes(status);
      },
      enableColumnFilter: true,
    },
    {
      header: t('app:employee-dashboard.action'),
      id: 'action',
      cell: (info) => {
        const profileId = info.row.original.profileId;
        return (
          <InlineLink
            className="text-sky-800 no-underline decoration-slate-400 decoration-2 hover:underline"
            file="routes/employee/profile/personal-information.tsx"
            params={{ id: String(profileId) }}
          >
            {t('app:employee-dashboard.view')}
          </InlineLink>
        );
      },
    },
  ];

  return (
    <div className="mb-8">
      <PageTitle className="after:w-14">{t('app:index.employees')}</PageTitle>
      {/* TODO:  This button should select between "My employees" and "All employees" in case an HR advisor needs to pick up an employee assigned to the wrong advisor*/}
      <Button variant="alternative" className="float-right my-4">
        {t('app:employee-dashboard.all-employees')}
      </Button>
      <DataTable columns={columns} data={loaderData.profiles} />
    </div>
  );
}

function statusTag(statusCode: string, label: string): JSX.Element {
  const styleMap: Record<string, string> = {
    APPROVED: 'bg-sky-100 text-sky-700',
    PENDING: 'bg-amber-100 text-yellow-700',
  };

  const style = styleMap[statusCode] ?? styleMap.DEFAULT;

  return (
    <div className={`${style} flex w-fit items-center gap-2 rounded-md px-3 py-1 text-sm font-semibold`}>
      <p>{label}</p>
    </div>
  );
}
