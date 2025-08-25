import { useEffect, useMemo, useState } from 'react';
import type { JSX } from 'react';

import type { RouteHandle } from 'react-router';
import { useSearchParams } from 'react-router';

import type { ColumnDef } from '@tanstack/react-table';
import { useTranslation } from 'react-i18next';

import type { Route } from './+types/employees';

import type { Profile, ProfileStatus } from '~/.server/domain/models';
import { getProfileService } from '~/.server/domain/services/profile-service';
import { getProfileStatusService } from '~/.server/domain/services/profile-status-service';
import { requireAuthentication } from '~/.server/utils/auth-utils';
import { BackLink } from '~/components/back-link';
import { DataTable, DataTableColumnHeader, DataTableColumnHeaderWithOptions } from '~/components/data-table';
import { InputSelect } from '~/components/input-select';
import { InlineLink } from '~/components/links';
import { PageTitle } from '~/components/page-title';
import { PROFILE_STATUS_CODE } from '~/domain/constants';
import { getTranslation } from '~/i18n-config.server';
import { handle as parentHandle } from '~/routes/layout';
import { formatDateTimeInZone } from '~/utils/date-utils';

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

  const { serverEnvironment } = await import('~/.server/environment');

  return {
    documentTitle: t('app:index.employees'),
    profiles: filteredAllProfiles,
    statuses,
    baseTimeZone: serverEnvironment.BASE_TIMEZONE,
    lang,
  };
}

export default function EmployeeDashboard({ loaderData, params }: Route.ComponentProps) {
  const { t } = useTranslation(handle.i18nNamespace);

  const [, setSearchParams] = useSearchParams({ filter: 'all' });
  const [browserTZ, setBrowserTZ] = useState<string | null>(null);

  useEffect(() => {
    setBrowserTZ(Intl.DateTimeFormat().resolvedOptions().timeZone);
  }, []);

  const formatDateYMD = useMemo(
    () => (iso?: string) =>
      iso ? formatDateTimeInZone(iso, browserTZ ?? loaderData.baseTimeZone, 'yyyy-MM-dd') : '0000-00-00',
    [browserTZ, loaderData.baseTimeZone],
  );

  const employeesOptions = [
    {
      value: 'me',
      children: t('app:hr-advisor-employees-table.my-employees'),
    },
    {
      value: 'all',
      children: t('app:hr-advisor-employees-table.all-employees'),
    },
  ];

  const columns: ColumnDef<Profile>[] = [
    {
      accessorKey: 'profileUser.firstName',
      accessorFn: (row) => `${row.profileUser.firstName} ${row.profileUser.lastName}`,
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('app:hr-advisor-employees-table.employee')} />,
      cell: (info) => <p>{info.getValue() as string}</p>,
    },
    {
      accessorKey: 'profileUser.businessEmailAddress',
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('app:hr-advisor-employees-table.email')} />,
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
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('app:hr-advisor-employees-table.updated')} />,
      cell: (info) => {
        const lastModifiedDate = info.row.original.lastModifiedDate;
        const userUpdated = info.row.original.lastModifiedBy ?? 'Unknown User';
        const dateUpdated = formatDateYMD(lastModifiedDate);
        return <p className="text-neutral-600">{`${dateUpdated}: ${userUpdated}`}</p>;
      },
    },
    {
      accessorKey: 'status',
      accessorFn: (row) => row.profileStatus?.code,
      header: ({ column }) => (
        <DataTableColumnHeaderWithOptions
          column={column}
          title={t('app:hr-advisor-employees-table.status')}
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
      header: t('app:hr-advisor-employees-table.action'),
      id: 'action',
      cell: (info) => {
        const profileId = info.row.original.id.toString();
        const profileUserName = `${info.row.original.profileUser.firstName} ${info.row.original.profileUser.lastName}`;
        return (
          <InlineLink
            className="text-sky-800 no-underline decoration-slate-400 decoration-2 hover:underline"
            file="routes/hr-advisor/employee-profile/index.tsx"
            params={{ profileId }}
            aria-label={t('app:hr-advisor-employees-table.view-link', {
              profileUserName,
            })}
          >
            {t('app:hr-advisor-employees-table.view')}
          </InlineLink>
        );
      },
    },
  ];

  return (
    <div className="mb-8">
      <PageTitle className="after:w-14">{t('app:index.employees')}</PageTitle>
      <BackLink
        file="routes/hr-advisor/index.tsx"
        params={params}
        translationKey="app:hr-advisor-employees-table.back-to-dashboard"
      />

      <InputSelect
        id="selectEmployees"
        name="selectEmployees"
        required={false}
        options={employeesOptions}
        label=""
        aria-label={t('app:hr-advisor-employees-table.filter-by')}
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
    PENDING: 'bg-amber-100 text-yellow-900',
    DEFAULT: 'bg-transparent',
  };
  const style = styleMap[status.code] ?? styleMap.DEFAULT;
  return (
    <div className={`${style} flex w-fit items-center gap-2 rounded-md px-3 py-1 text-sm font-semibold`}>
      <p>{lang === 'en' ? status.nameEn : status.nameFr}</p>
    </div>
  );
}
