import { useCallback, useEffect, useMemo, useState } from 'react';

import type { RouteHandle } from 'react-router';
import { data, useFetcher, useSearchParams } from 'react-router';

import { useTranslation } from 'react-i18next';
import * as v from 'valibot';

import type { Route } from './+types/employees';

import type { Profile, ProfileQueryParams } from '~/.server/domain/models';
import { getProfileService } from '~/.server/domain/services/profile-service';
import { getProfileStatusService } from '~/.server/domain/services/profile-status-service';
import { getUserService } from '~/.server/domain/services/user-service';
import { serverEnvironment } from '~/.server/environment';
import { requireAuthentication } from '~/.server/utils/auth-utils';
import { i18nRedirect } from '~/.server/utils/route-utils';
import { BackLink } from '~/components/back-link';
import { Button } from '~/components/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '~/components/dialog';
import { ActionDataErrorSummary } from '~/components/error-summary';
import { InputField } from '~/components/input-field';
import { InputSelect } from '~/components/input-select';
import { LoadingButton } from '~/components/loading-button';
import { LoadingLink } from '~/components/loading-link';
import { PageTitle } from '~/components/page-title';
import { Column, ColumnHeader, ColumnOptions, ColumnSearch, ServerTable } from '~/components/server-table';
import { ProfileStatusTag } from '~/components/status-tag';
import { PROFILE_STATUS } from '~/domain/constants';
import { HttpStatusCodes } from '~/errors/http-status-codes';
import { useFetcherState } from '~/hooks/use-fetcher-state';
import { getTranslation } from '~/i18n-config.server';
import { handle as parentHandle } from '~/routes/layout';
import { formatDateTimeInZone } from '~/utils/date-utils';
import { formString } from '~/utils/string-utils';
import { extractValidationKey } from '~/utils/validation-utils';

// Shared default selection for statuses (kept in sync between loader and client UI)
const DEFAULT_STATUS_IDS = [PROFILE_STATUS.APPROVED.id, PROFILE_STATUS.PENDING.id] as const;

export const handle = {
  i18nNamespace: [...parentHandle.i18nNamespace],
} as const satisfies RouteHandle;

export function meta({ loaderData }: Route.MetaArgs) {
  return [{ title: loaderData.documentTitle }];
}

export async function action({ context, request }: Route.ActionArgs) {
  const { session } = context.get(context.applicationContext);
  requireAuthentication(session, request);
  const { t } = await getTranslation(request, handle.i18nNamespace);
  const formData = await request.formData();

  const action = formString(formData.get('action'));

  if (action === 'archive') {
    // Handle archive action
    const parseResult = v.safeParse(
      v.object({
        profileId: v.pipe(
          v.string(),
          v.transform((val) => parseInt(val, 10)),
          v.number('Profile ID must be a number'),
        ),
      }),
      {
        profileId: formString(formData.get('profileId')),
      },
    );

    if (!parseResult.success) {
      return data({ errors: v.flatten(parseResult.issues).nested }, { status: HttpStatusCodes.BAD_REQUEST });
    }

    const { profileId } = parseResult.output;

    // Call profile service to update status to ARCHIVED
    const updateResult = await getProfileService().updateProfileStatus(
      profileId,
      PROFILE_STATUS.ARCHIVED,
      session.authState.accessToken,
    );

    if (updateResult.isErr()) {
      throw updateResult.unwrapErr();
    }

    return data({ success: true });
  }

  // Handle create profile action
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

  const user = (await getUserService().getUsers({ email: parseResult.output.email }, session.authState.accessToken)).into()
    ?.content[0];

  if (!user) {
    return {
      errors: {
        email: t('app:hr-advisor-employees-table.errors.no-user-found-with-this-email'),
      },
    };
  }

  const profile = (await getUserService().createProfileForUser(user.id, session.authState.accessToken)).into();
  if (!profile) {
    return {
      errors: {
        email: t('app:hr-advisor-employees-table.errors.profile-already-exists'),
      },
    };
  }

  // Profile created by an HR advisor default to PENDING status
  const submitResult = await getProfileService().updateProfileStatus(
    profile.id,
    PROFILE_STATUS.PENDING,
    session.authState.accessToken,
  );

  if (submitResult.isErr()) {
    const error = submitResult.unwrapErr();
    return {
      status: 'error',
      errorMessage: error.message,
      errorCode: error.errorCode,
    };
  }

  return i18nRedirect('routes/hr-advisor/employee-profile/index.tsx', request, {
    params: { profileId: profile.id.toString() },
  });
}

export async function loader({ context, request }: Route.LoaderArgs) {
  const { session } = context.get(context.applicationContext);
  requireAuthentication(session, request);

  const { lang, t } = await getTranslation(request, handle.i18nNamespace);

  // Filter profiles based on hr-advisor selection. Options 'My Employees' or 'All employees'
  const url = new URL(request.url);
  const filter = url.searchParams.get('filter');
  // Server-side pagination params with sensible defaults
  const pageParam = url.searchParams.get('page');
  const sizeParam = url.searchParams.get('size');
  // statusIds as repeated params: ?statusIds=1&statusIds=2
  const statusIdsParams = url.searchParams.getAll('statusIds');
  // sort as a single param: sort=property,(asc|desc)
  const sortParam = url.searchParams.get('sort');
  const employeeNameParam = url.searchParams.get('employeeName');
  const employeeNameFilter = employeeNameParam?.trim() ?? '';
  // URL 'page' is treated as 1-based for the backend; default to 1 if missing/invalid
  const pageOneBased = Math.max(1, Number.parseInt(pageParam ?? '1', 10) || 1);
  // Keep page size modest for wire efficiency, cap to prevent abuse
  const size = Math.min(50, Math.max(1, Number.parseInt(sizeParam ?? '10', 10) || 10));

  // Compute desired statusIds, defaulting to Approved + Pending Approval
  const defaultStatusIds = [...DEFAULT_STATUS_IDS];
  const rawStatusValues = statusIdsParams;
  const statusIdsFromQuery = rawStatusValues.map((s) => Number.parseInt(s.trim(), 10)).filter((n) => Number.isFinite(n));

  // Filter out INCOMPLETE status (id: 2) - profiles with INCOMPLETE status should never be displayed
  const validStatusIdsFromQuery = statusIdsFromQuery.filter((id) => id !== PROFILE_STATUS.INCOMPLETE.id);

  const desiredStatusIds = validStatusIdsFromQuery.length
    ? Array.from(new Set(validStatusIdsFromQuery)).sort((a, b) => a - b)
    : defaultStatusIds;

  // If no statusIds in URL, redirect to include default statusIds so ColumnOptions shows them as selected
  if (validStatusIdsFromQuery.length === 0) {
    const redirectUrl = new URL(request.url);
    defaultStatusIds.forEach((id) => redirectUrl.searchParams.append('statusIds', id.toString()));
    throw new Response(null, {
      status: 302,
      headers: { Location: redirectUrl.toString() },
    });
  }

  const profileParams: ProfileQueryParams = {
    hrAdvisorId: filter === 'me' ? filter : undefined, // 'me' is used in the API to filter for the current HR advisor
    statusIds: desiredStatusIds,
    // Backend expects 1-based page index
    page: pageOneBased,
    size: size,
    sort: sortParam ?? undefined,
    employeeName: employeeNameFilter !== '' ? employeeNameFilter : undefined,
  };

  const [profilesResult, allStatuses] = await Promise.all([
    getProfileService().getProfiles(profileParams, session.authState.accessToken),
    getProfileStatusService().listAllLocalized(lang),
  ]);

  if (profilesResult.isErr()) {
    throw profilesResult.unwrapErr();
  }

  const profiles = profilesResult.unwrap();

  // Filter out INCOMPLETE status from dropdown options - profiles with INCOMPLETE status should never be displayed
  const statuses = allStatuses.filter((status) => status.code !== 'INCOMPLETE');

  return {
    documentTitle: t('app:index.employees'),
    profiles: profiles.content,
    page: profiles.page,
    statuses,
    baseTimeZone: serverEnvironment.BASE_TIMEZONE,
    lang,
  };
}

export default function EmployeeDashboard({ loaderData, params }: Route.ComponentProps) {
  const { t } = useTranslation(handle.i18nNamespace);
  const fetcher = useFetcher<typeof action>();
  const archiveFetcher = useFetcher();
  const fetcherState = useFetcherState(fetcher);
  const isSubmitting = fetcherState.submitting;

  // Keep URL 'page' 1-based; DataTable remains 0-based internally
  const [searchParams, setSearchParams] = useSearchParams({ filter: 'all', page: '1', size: '10' });
  const [browserTZ, setBrowserTZ] = useState<string | null>(null);
  const [srAnnouncement, setSrAnnouncement] = useState('');
  const [showArchiveDialog, setShowArchiveDialog] = useState(false);
  const [selectedProfileForArchive, setSelectedProfileForArchive] = useState<Profile | null>(null);
  const [isArchiving, setIsArchiving] = useState(false);

  useEffect(() => {
    setBrowserTZ(Intl.DateTimeFormat().resolvedOptions().timeZone);
  }, []);

  const formatDateYMD = useMemo(
    () => (iso?: string) =>
      iso ? formatDateTimeInZone(iso, browserTZ ?? loaderData.baseTimeZone, 'yyyy-MM-dd') : '0000-00-00',
    [browserTZ, loaderData.baseTimeZone],
  );

  // Handle archive action
  const handleArchive = (profile: Profile) => {
    setSelectedProfileForArchive(profile);
    setShowArchiveDialog(true);
  };

  const confirmArchive = useCallback(() => {
    if (!selectedProfileForArchive || isArchiving) return;

    setIsArchiving(true);

    // Create form data for the archive action
    const formData = new FormData();
    formData.set('profileId', selectedProfileForArchive.id.toString());
    formData.set('action', 'archive');

    // Submit the archive request using archiveFetcher
    void archiveFetcher.submit(formData, { method: 'put' });

    // Close dialog and reset state
    setShowArchiveDialog(false);
    // Announce successful archive action to screen readers
    setSrAnnouncement(
      t('app:hr-advisor-employees-table.profile-archived', {
        profileUserName: `${selectedProfileForArchive.profileUser.firstName} ${selectedProfileForArchive.profileUser.lastName}`,
      }),
    );
    setSelectedProfileForArchive(null);
    setIsArchiving(false);
  }, [selectedProfileForArchive, archiveFetcher, t, isArchiving]);

  const employeesOptions = useMemo(
    () => [
      {
        value: 'me',
        children: t('app:hr-advisor-employees-table.my-employees'),
      },
      {
        value: 'all',
        children: t('app:hr-advisor-employees-table.all-employees'),
      },
    ],
    [t],
  );

  // Get dynamic column ID for branch based on language
  const getBranchColumnId = useMemo(() => {
    return loaderData.lang === 'fr' ? 'substantiveWorkUnit.parent.nameFr' : 'substantiveWorkUnit.parent.nameEn';
  }, [loaderData.lang]);

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
              errorMessage={t(
                extractValidationKey(fetcher.data && 'errors' in fetcher.data ? fetcher.data.errors?.email : undefined),
              )}
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
              const existingStatusIds = searchParams.getAll('statusIds');
              // Reset to page 1 (1-based) on filter change and preserve existing statusIds selection
              const params = new URLSearchParams({ filter: target.value, page: '1', size });
              // Preserve existing single sort
              const sort = searchParams.get('sort');
              if (sort) params.set('sort', sort);
              const employeeName = searchParams.get('employeeName');
              if (employeeName) params.set('employeeName', employeeName);
              existingStatusIds.forEach((id) => params.append('statusIds', id));
              setSearchParams(params, { preventScrollReset: true });
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

      <ServerTable
        page={loaderData.page}
        data={loaderData.profiles}
        searchParams={searchParams}
        setSearchParams={setSearchParams}
      >
        <Column
          id="employeeName"
          accessorFn={(row: Profile) => `${row.profileUser.lastName}, ${row.profileUser.firstName}`}
          header={({ column }) => (
            <ColumnSearch
              column={column}
              title={t('app:hr-advisor-employees-table.employee')}
              page="page"
              searchParams={searchParams}
              setSearchParams={setSearchParams}
            />
          )}
          cell={(info) => <p>{info.getValue() as string}</p>}
        />

        <Column
          id="user.businessEmailAddress"
          accessorFn={(row: Profile) => row.profileUser.businessEmailAddress}
          header={({ column }) => <ColumnHeader column={column} title={t('app:hr-advisor-employees-table.email')} />}
          cell={(info) => {
            const email = info.row.original.profileUser.businessEmailAddress;
            return (
              <a
                href={`mailto:${email}`}
                className="text-sky-800 underline decoration-slate-400 decoration-2 hover:text-blue-700 focus:text-blue-700"
              >
                {email}
              </a>
            );
          }}
        />

        <Column
          id="lastModifiedDate"
          accessorFn={(row: Profile) => formatDateYMD(row.lastModifiedDate)}
          header={({ column }) => <ColumnHeader column={column} title={t('app:hr-advisor-employees-table.updated')} />}
          cell={(info) => {
            const lastModifiedDate = info.row.original.lastModifiedDate;
            const userUpdated = info.row.original.lastModifiedBy ?? 'Unknown User';
            const dateUpdated = formatDateYMD(lastModifiedDate);
            return <p className="text-neutral-600">{`${dateUpdated}: ${userUpdated}`}</p>;
          }}
        />

        <Column
          id={getBranchColumnId}
          accessorFn={(row: Profile) => {
            const branch = row.substantiveWorkUnit?.parent;
            return loaderData.lang === 'en' ? branch?.nameEn : branch?.nameFr;
          }}
          header={({ column }) => <ColumnHeader column={column} title={t('app:hr-advisor-employees-table.branch')} />}
          cell={(info) => {
            const branch = info.row.original.substantiveWorkUnit?.parent;
            return <p className="text-neutral-600">{loaderData.lang === 'en' ? branch?.nameEn : branch?.nameFr}</p>;
          }}
        />

        <Column
          id="statusIds"
          accessorKey="profileStatus"
          accessorFn={(row: Profile) =>
            (loaderData.lang === 'en' ? row.profileStatus?.nameEn : row.profileStatus?.nameFr) ?? '-'
          }
          header={({ column }) => (
            <ColumnOptions
              column={column}
              title={t('app:hr-advisor-employees-table.status')}
              options={loaderData.statuses}
              page={`page`}
              searchParams={searchParams}
              setSearchParams={setSearchParams}
            />
          )}
          cell={(info) => {
            const status = info.row.original.profileStatus;
            return status && <ProfileStatusTag status={status} lang={loaderData.lang} view="hr-advisor" />;
          }}
        />

        <Column
          id="action"
          accessorFn={() => ''}
          header={() => t('app:hr-advisor-employees-table.action')}
          cell={(info) => {
            const profile = info.row.original as Profile;
            const profileId = profile.id.toString();
            const profileUserName = `${profile.profileUser.firstName} ${profile.profileUser.lastName}`;
            const isArchived = profile.profileStatus?.code === 'ARCHIVED';

            return (
              <div className="flex items-baseline gap-4">
                <LoadingLink
                  className="rounded-sm text-sky-800 underline hover:text-blue-700 focus:text-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none"
                  file="routes/hr-advisor/employee-profile/index.tsx"
                  params={{ profileId }}
                  search={`filter=${searchParams.get('filter')}`}
                  aria-label={t('app:hr-advisor-employees-table.view-link', {
                    profileUserName,
                  })}
                >
                  {t('app:hr-advisor-employees-table.view')}
                </LoadingLink>
                {!isArchived && (
                  <Button
                    variant="alternative"
                    id="archive-employee"
                    onClick={() => handleArchive(profile)}
                    aria-label={t('app:hr-advisor-employees-table.archive-link', {
                      profileUserName,
                    })}
                    size="sm"
                  >
                    {t('app:hr-advisor-employees-table.archive')}
                  </Button>
                )}
              </div>
            );
          }}
        />
      </ServerTable>

      {/* Archive Confirmation Dialog */}
      <Dialog open={showArchiveDialog} onOpenChange={setShowArchiveDialog}>
        <DialogContent aria-describedby="archive-dialog-description" role="alertdialog">
          <DialogHeader>
            <DialogTitle id="archive-dialog-title">
              {t('app:hr-advisor-employees-table.archive-confirmation.title')}
            </DialogTitle>
          </DialogHeader>
          <DialogDescription id="archive-dialog-description">
            {selectedProfileForArchive &&
              t('app:hr-advisor-employees-table.archive-confirmation.message', {
                profileUserName: `${selectedProfileForArchive.profileUser.firstName} ${selectedProfileForArchive.profileUser.lastName}`,
              })}
          </DialogDescription>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="alternative" disabled={isArchiving}>
                {t('app:hr-advisor-employees-table.archive-confirmation.cancel')}
              </Button>
            </DialogClose>
            <LoadingButton variant="primary" onClick={confirmArchive} disabled={isArchiving} loading={isArchiving}>
              {t('app:hr-advisor-employees-table.archive-confirmation.confirm')}
            </LoadingButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
