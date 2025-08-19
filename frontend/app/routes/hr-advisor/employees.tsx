import type { JSX } from 'react';

import type { RouteHandle } from 'react-router';
import { useSearchParams } from 'react-router';

import type { ColumnDef } from '@tanstack/react-table';
import { format } from 'date-fns';
import { useTranslation } from 'react-i18next';

import type { Route } from './+types/employees';

import type { Profile, ProfileStatus } from '~/.server/domain/models';
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
  return [{ title: loaderData.documentTitle }];
}

export async function loader({ context, request }: Route.LoaderArgs) {
  requireAuthentication(context.session, request);

  const { lang, t } = await getTranslation(request, handle.i18nNamespace);

  // Filter profiles based on hr-advisor selection. Options 'My Employees' or 'All employees'
  const url = new URL(request.url);
  const filter = url.searchParams.get('filter');

  const profileParams = {
    'active': true, // will return In Progress, Pending Approval and Approved
    'hr-advisor': filter === 'me' ? filter : undefined, // 'me' is used in the API to filter for the current HR advisor
  };

  const profileService = getProfileService();
  const profileStatusService = getProfileStatusService();

  const [profilesResult, statuses] = await Promise.all([
    profileService.getProfiles(profileParams, context.session.authState.accessToken),
    profileStatusService.listAllLocalized(lang),
  ]);

  if (profilesResult.isErr()) {
    throw profilesResult.unwrapErr();
  }

  const profiles = profilesResult.unwrap();
  const filteredAllProfiles = profiles.content.filter(
    (profile) =>
      profile.profileStatus &&
      [PROFILE_STATUS_CODE.approved, PROFILE_STATUS_CODE.pending].some((id) => id === profile.profileStatus?.code),
  );

  return {
    documentTitle: t('app:index.employees'),
    profiles: filteredAllProfiles,
    statuses,
    lang,
  };
}

export default function EmployeeDashboard({ loaderData, params }: Route.ComponentProps) {
  const { t } = useTranslation(handle.i18nNamespace);

  const [, setSearchParams] = useSearchParams({ filter: 'all' });

  const employeesOptions = [
    {
      value: 'me',
      children: t('app:hr-advisor-dashboard.my-employees'),
    },
    {
      value: 'all',
      children: t('app:hr-advisor-dashboard.all-employees'),
    },
  ];

  const columns: ColumnDef<Profile>[] = [
    {
      accessorKey: 'profileUser.firstName',
      accessorFn: (row) => `${row.profileUser.firstName ?? ''} ${row.profileUser.lastName ?? ''}`.trim(),
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('app:employee-dashboard.employee')} />,
      cell: (info) => <p>{info.getValue() as string}</p>,
    },
    {
      accessorKey: 'profileUser.businessEmailAddress',
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('app:employee-dashboard.email')} />,
      cell: (info) => {
        const email = info.row.original.profileUser.businessEmailAddress;
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
        const date = info.row.original.lastModifiedDate;
        const userUpdated = info.row.original.lastModifiedBy ?? 'Unknown User';

        const dateUpdated = date !== undefined ? format(new Date(date), 'yyyy-MM-dd') : '0000-00-00';

        return <p className="text-neutral-600">{`${dateUpdated}: ${userUpdated}`}</p>;
      },
    },
    {
      accessorKey: 'status',
      accessorFn: (row) => row.profileStatus?.code,
      header: ({ column }) => (
        <DataTableColumnHeaderWithOptions
          column={column}
          title={t('app:employee-dashboard.status')}
          options={Object.values(PROFILE_STATUS_CODE)}
        />
      ),
      cell: (info) => {
        const status = info.row.original.profileStatus;
        return status && statusTag(status, loaderData.lang);
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
        const profileId = info.row.original.id.toString();
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
        onChange={({ target }) => setSearchParams({ filter: target.value })}
        className="wx-1/12 float-right my-4 sm:w-1/5"
      />

      <DataTable columns={columns} data={loaderData.profiles} />
    </div>
  );
}

function statusTag(status: ProfileStatus, lang: Language): JSX.Element {
  const styleMap: Record<string, string> = {
    APPROVED: 'bg-sky-100 text-sky-700',
    PENDING: 'bg-amber-100 text-yellow-700',
  };

  const style = styleMap[status.code] ?? styleMap.DEFAULT;

  return (
    <div className={`${style} flex w-fit items-center gap-2 rounded-md px-3 py-1 text-sm font-semibold`}>
      <p>{lang === 'en' ? status.nameEn : status.nameFr}</p>
    </div>
  );
}
