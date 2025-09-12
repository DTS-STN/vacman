import type { JSX } from 'react';
import { useEffect, useMemo, useState } from 'react';

import type { RouteHandle } from 'react-router';
import { data, useFetcher, useSearchParams } from 'react-router';

import type { ColumnDef } from '@tanstack/react-table';
import { useTranslation } from 'react-i18next';
import * as v from 'valibot';

import type { Route } from './+types/employees';

import type { Profile, ProfileStatus } from '~/.server/domain/models';
import { getProfileService } from '~/.server/domain/services/profile-service';
import { getProfileStatusService } from '~/.server/domain/services/profile-status-service';
import { getUserService } from '~/.server/domain/services/user-service';
import { requireAuthentication } from '~/.server/utils/auth-utils';
import { i18nRedirect } from '~/.server/utils/route-utils';
import { BackLink } from '~/components/back-link';
import { DataTable, DataTableColumnHeader, DataTableColumnHeaderWithOptions } from '~/components/data-table';
import { ActionDataErrorSummary } from '~/components/error-summary';
import { InputField } from '~/components/input-field';
import { InputSelect } from '~/components/input-select';
import { InlineLink } from '~/components/links';
import { LoadingButton } from '~/components/loading-button';
import { PageTitle } from '~/components/page-title';
import { Pagination } from '~/components/pagination';
import { PROFILE_STATUS_CODE } from '~/domain/constants';
import { HttpStatusCodes } from '~/errors/http-status-codes';
import { useFetcherState } from '~/hooks/use-fetcher-state';
import { getTranslation } from '~/i18n-config.server';
import { handle as parentHandle } from '~/routes/layout';
import { formatDateTimeInZone } from '~/utils/date-utils';
import { formString } from '~/utils/string-utils';
import { extractValidationKey } from '~/utils/validation-utils';

export const handle = {
  i18nNamespace: [...parentHandle.i18nNamespace],
} as const satisfies RouteHandle;

export function meta({ loaderData }: Route.MetaArgs) {
  return [{ title: loaderData.documentTitle }];
}

export async function action({ context, request }: Route.ActionArgs) {
  requireAuthentication(context.session, request);
  const formData = await request.formData();
  const parseResult = v.safeParse(
    v.object({
      email: v.pipe(
        v.string('app:hr-advisor-employees-table.errors.email-required'),
        v.trim(),
        v.nonEmpty('app:hr-advisor-employees-table.errors.email-required'),
        v.email('app:hr-advisor-employees-table.errors.email-invalid'),
      ),
    }),
    {
      email: formString(formData.get('email')),
    },
  );

  if (!parseResult.success) {
    return data({ errors: v.flatten(parseResult.issues).nested }, { status: HttpStatusCodes.BAD_REQUEST });
  }

  const userResult = await getUserService().getUsers(
    { email: parseResult.output.email },
    context.session.authState.accessToken,
  );
  const user = userResult.into()?.content[0];
  // TODO: create profile for the user and update with correct profileId
  return i18nRedirect('routes/hr-advisor/employee-profile/index.tsx', request, {
    params: { profileId: user?.id.toString() },
  });
}

export async function loader({ context, request }: Route.LoaderArgs) {
  requireAuthentication(context.session, request);

  const { lang, t } = await getTranslation(request, handle.i18nNamespace);

  // Filter profiles based on hr-advisor selection. Options 'My Employees' or 'All employees'
  const url = new URL(request.url);
  const filter = url.searchParams.get('filter');
  // Server-side pagination params with sensible defaults
  const pageParam = url.searchParams.get('page');
  const sizeParam = url.searchParams.get('size');
  // URL 'page' is treated as 1-based for the backend; default to 1 if missing/invalid
  const pageOneBased = Math.max(1, Number.parseInt(pageParam ?? '1', 10) || 1);
  // Keep page size modest for wire efficiency, cap to prevent abuse
  const size = Math.min(50, Math.max(1, Number.parseInt(sizeParam ?? '10', 10) || 10));

  const profileParams = {
    'active': true, // will return In Progress, Pending Approval and Approved
    'hr-advisor': filter === 'me' ? filter : undefined, // 'me' is used in the API to filter for the current HR advisor
    // Backend expects 1-based page index
    'page': pageOneBased,
    'size': size,
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
    page: profiles.page,
    statuses,
    baseTimeZone: serverEnvironment.BASE_TIMEZONE,
    lang,
  };
}

export default function EmployeeDashboard({ loaderData, params }: Route.ComponentProps) {
  const { t } = useTranslation(handle.i18nNamespace);
  const fetcher = useFetcher<typeof action>();
  const fetcherState = useFetcherState(fetcher);
  const isSubmitting = fetcherState.submitting;

  // Keep URL 'page' 1-based; DataTable remains 0-based internally
  const [searchParams, setSearchParams] = useSearchParams({ filter: 'all', page: '1', size: '10' });
  const [browserTZ, setBrowserTZ] = useState<string | null>(null);
  const [srAnnouncement, setSrAnnouncement] = useState('');

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
          <a
            href={`mailto:${email}`}
            className="text-sky-800 underline decoration-slate-400 decoration-2 hover:text-blue-700 focus:text-blue-700"
          >
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
            className="text-sky-800 underline decoration-slate-400 decoration-2 hover:text-blue-700 focus:text-blue-700"
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
        aria-label={t('app:hr-advisor-employees-table.back-to-dashboard')}
        file="routes/hr-advisor/index.tsx"
        params={params}
      >
        {t('app:hr-advisor-employees-table.back-to-dashboard')}
      </BackLink>

      <ActionDataErrorSummary actionData={fetcher.data}>
        <h2 className="font-lato mt-8 text-lg font-semibold">{t('app:hr-advisor-employees-table.create-profile')}</h2>
        <section className="mb-8 flex flex-col justify-between gap-8 sm:flex-row">
          <fetcher.Form method="post" noValidate className="grid place-content-between items-end gap-2 sm:grid-cols-2">
            <InputField
              label={t('app:hr-advisor-employees-table.employee-work-email')}
              name="email"
              errorMessage={t(extractValidationKey(fetcher.data?.errors?.email))}
              required
              className="w-full"
            />
            <LoadingButton variant="primary" className="w-1/2" disabled={isSubmitting} loading={isSubmitting}>
              {t('app:hr-advisor-employees-table.create-profile')}
            </LoadingButton>
          </fetcher.Form>

          <InputSelect
            id="selectEmployees"
            name="selectEmployees"
            required={false}
            options={employeesOptions}
            label=""
            aria-label={t('app:hr-advisor-employees-table.filter-by')}
            defaultValue={searchParams.get('filter') ?? 'all'}
            onChange={({ target }) => {
              const size = searchParams.get('size') ?? '10';
              // Reset to page 1 (1-based) on filter change
              setSearchParams({ filter: target.value, page: '1', size });
              // Announce table filtering change to screen readers
              const message =
                target.value === 'me'
                  ? t('app:hr-advisor-employees-table.table-updated-my-employees')
                  : t('app:hr-advisor-employees-table.table-updated-all-employees');
              setSrAnnouncement(message);
            }}
            className="w-full"
          />
        </section>
      </ActionDataErrorSummary>

      {/* ARIA live region for screen reader announcements */}
      <div aria-live="polite" role="status" className="sr-only">
        {srAnnouncement}
      </div>

      <DataTable columns={columns} data={loaderData.profiles} showPagination={false} />

      <Pagination
        pageIndex={Math.min(
          Math.max(0, loaderData.page.totalPages - 1),
          Math.max(0, (Number.parseInt(searchParams.get('page') ?? '1', 10) || 1) - 1),
        )}
        pageCount={loaderData.page.totalPages}
        onPageChange={(nextIndex) => {
          const filter = searchParams.get('filter') ?? 'all';
          const size = searchParams.get('size') ?? '10';
          const clamped = Math.min(Math.max(0, nextIndex), Math.max(0, loaderData.page.totalPages - 1));
          setSearchParams({ filter, page: String(clamped + 1), size });
        }}
        className="my-4"
      />
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
