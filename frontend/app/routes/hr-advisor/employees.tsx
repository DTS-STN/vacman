import type { JSX } from 'react';

import type { RouteHandle, LoaderFunctionArgs } from 'react-router';
import { useSearchParams } from 'react-router';

import type { ColumnDef } from '@tanstack/react-table';
import { format } from 'date-fns';
import { useTranslation } from 'react-i18next';

import type { Route } from './+types/employees';

import type { Profile } from '~/.server/domain/models';
import { getProfileService } from '~/.server/domain/services/profile-service';
import { getProfileStatusService } from '~/.server/domain/services/profile-status-service';
import { requireAuthentication } from '~/.server/utils/auth-utils';
import { DataTable, DataTableColumnHeader, DataTableColumnHeaderWithOptions } from '~/components/data-table';
import { InputSelect } from '~/components/input-select';
import { InlineLink } from '~/components/links';
import { PageTitle } from '~/components/page-title';
import { PROFILE_STATUS_CODE } from '~/domain/constants';
import { getTranslation } from '~/i18n-config.server';
import { handle as parentHandle } from '~/routes/layout';

export const handle = {
  i18nNamespace: [...parentHandle.i18nNamespace],
} as const satisfies RouteHandle;

export function meta({ loaderData }: Route.MetaArgs) {
  return [{ title: loaderData?.documentTitle }];
}

export async function loader({ context, request }: LoaderFunctionArgs) {
  requireAuthentication(context.session, request);
  
  const { lang, t } = await getTranslation(request, handle.i18nNamespace);

  // Filter profiles based on hr-advisor selection. Options 'My Employees' or 'All employees'
  const url = new URL(request.url);
  const selectedProfiles = url.searchParams.get('selectedData');

  const profileParams = {
    accessToken: context.session.authState.accessToken,
    active: true, // will return In Progress, Pending Approval and Approved
    hrAdvisorId: selectedProfiles === '1' || selectedProfiles === null ? context.session.currentUser.id : null, // if null : will return everything, if a UserId : will return profiles linked to that hr-advisor, if "me" : will return profiles linked to the logged in hr-advisor -> to be used later in filtering
    includeUserData: true, // will add user data (names and email)
  };

  const profileService = getProfileService();
  const profileStatusService = getProfileStatusService();

  const [profiles, statuses] = await Promise.all([
    profileService.listAllProfiles(profileParams),
    profileStatusService.listAllLocalized(lang),
  ]);

  const hrRelevantEmployeeStatusCodes = [PROFILE_STATUS_CODE.approved, PROFILE_STATUS_CODE.pending];
  const statusIds = statuses
    .filter((s) =>
      hrRelevantEmployeeStatusCodes.includes(
        s.code as typeof PROFILE_STATUS_CODE.approved | typeof PROFILE_STATUS_CODE.pending,
      ),
    )
    .map((s) => s.id);

   const filteredAllProfiles = profiles.filter((profile) => statusIds.includes(profile.profileStatus.id));

  return {
    documentTitle: t('app:index.employees'),
    profiles: filteredAllProfiles,
    statuses,
  };
}

export default function EmployeeDashboard({ loaderData, params }: Route.ComponentProps) {
  const { t } = useTranslation(handle.i18nNamespace);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [searchParams, setSearchParams] = useSearchParams({ selectedData: '1' });

  const statusMap = Object.fromEntries(loaderData.statuses.map((s) => [s.id, s.name]));

  const employeesOptions = [
    {
      value: '1',
      children: t('app:hr-advisor-dashboard.my-employees'),
    },
    {
      value: '2',
      children: t('app:hr-advisor-dashboard.all-employees'),
    },
  ];

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
      accessorFn: (row) => statusMap[row.profileStatus.id] ?? '',
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
        const status = loaderData.statuses.find((s) => s.id === profile.profileStatus.id);
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
        const profileId = info.row.original.profileId.toString();
        return (
          <InlineLink
            className="text-sky-800 no-underline decoration-slate-400 decoration-2 hover:underline"
            file="routes/hr-advisor/employee-profile/index.tsx"
            params={{ profileId }}
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

      <InputSelect
        id="selectEmployees"
        name="selectEmployees"
        errorMessage=""
        required={false}
        options={employeesOptions}
        label=""
        defaultValue="all"
        onChange={({ target }) => setSearchParams({ selectedData: `${target.value}` })}
        className="wx-1/12 float-right my-4 sm:w-1/5"
      />

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
