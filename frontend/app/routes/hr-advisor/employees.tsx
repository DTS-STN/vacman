import { startTransition, useCallback, useEffect, useMemo, useState } from 'react';

import type { RouteHandle } from 'react-router';
import { data, useFetcher, useSearchParams } from 'react-router';

import type { ColumnDef } from '@tanstack/react-table';
import { useTranslation } from 'react-i18next';
import * as v from 'valibot';

import type { Route } from './+types/employees';

import type { Profile, ProfileQueryParams } from '~/.server/domain/models';
import { getProfileService } from '~/.server/domain/services/profile-service';
import { getProfileStatusService } from '~/.server/domain/services/profile-status-service';
import { getUserService } from '~/.server/domain/services/user-service';
import { requireAuthentication } from '~/.server/utils/auth-utils';
import { i18nRedirect } from '~/.server/utils/route-utils';
import { BackLink } from '~/components/back-link';
import { Button } from '~/components/button';
import { DataTable, DataTableColumnHeader, DataTableColumnHeaderWithOptions } from '~/components/data-table';
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
import { InlineLink } from '~/components/links';
import { LoadingButton } from '~/components/loading-button';
import { PageTitle } from '~/components/page-title';
import Pagination from '~/components/pagination';
import { ProfileStatusTag } from '~/components/status-tag';
import { PROFILE_STATUS } from '~/domain/constants';
import { HttpStatusCodes } from '~/errors/http-status-codes';
import { useFetcherState } from '~/hooks/use-fetcher-state';
import { getTranslation } from '~/i18n-config.server';
import { handle as parentHandle } from '~/routes/layout';
import { formatDateTimeInZone } from '~/utils/date-utils';
import { getCurrentPage, getPageItems, makePageClickHandler, nextPage, prevPage } from '~/utils/pagination-utils';
import { formString } from '~/utils/string-utils';
import { extractValidationKey } from '~/utils/validation-utils';

// Shared default selection for statuses (kept in sync between loader and client UI)
const DEFAULT_STATUS_IDS = [PROFILE_STATUS.APPROVED.id, PROFILE_STATUS.PENDING.id] as const;
const PROFILE_STATUS_CODE = [
  PROFILE_STATUS.APPROVED.code,
  PROFILE_STATUS.PENDING.code,
  PROFILE_STATUS.ARCHIVED.code,
  PROFILE_STATUS.INCOMPLETE.code,
] as const;

// Strongly type the allowed column ids and backend properties
type ColumnId = 'name' | 'email' | 'dateUpdated';
type SortProp = 'user.lastName' | 'user.businessEmailAddress' | 'lastModifiedDate';

// Static mapping objects - moved outside component to avoid recreation
const COLUMN_TO_PROPERTY = {
  name: 'user.lastName',
  email: 'user.businessEmailAddress',
  dateUpdated: 'lastModifiedDate',
} as const satisfies Record<ColumnId, SortProp>;

const PROPERTY_TO_COLUMN = {
  'user.lastName': 'name',
  'user.businessEmailAddress': 'email',
  'lastModifiedDate': 'dateUpdated',
} as const satisfies Record<SortProp, ColumnId>;

// Static helper functions - moved outside component to avoid recreation
const isColumnId = (id: string): id is ColumnId => {
  return Object.prototype.hasOwnProperty.call(COLUMN_TO_PROPERTY, id);
};

const isSortProp = (v: string): v is SortProp => {
  return Object.prototype.hasOwnProperty.call(PROPERTY_TO_COLUMN, v);
};

const parseSortParam = (value: string | null): { id: ColumnId; desc: boolean } | null => {
  if (!value) return null;
  const [propRaw, dirRaw] = value.split(',');
  const propKey = (propRaw ?? '').trim();
  if (!isSortProp(propKey)) return null;
  const colId = PROPERTY_TO_COLUMN[propKey];
  const dir = (dirRaw ?? 'asc').trim().toLowerCase();
  const desc = dir === 'desc';
  return { id: colId, desc };
};

const serializeSortParam = (s: { id: string; desc: boolean } | null | undefined): string | null => {
  if (!s?.id || !isColumnId(s.id)) return null;
  const prop = COLUMN_TO_PROPERTY[s.id];
  return `${prop},${s.desc ? 'desc' : 'asc'}`;
};

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
  // URL 'page' is treated as 1-based for the backend; default to 1 if missing/invalid
  const pageOneBased = Math.max(1, Number.parseInt(pageParam ?? '1', 10) || 1);
  // Keep page size modest for wire efficiency, cap to prevent abuse
  const size = Math.min(50, Math.max(1, Number.parseInt(sizeParam ?? '10', 10) || 10));

  // Compute desired statusIds, defaulting to Approved + Pending Approval
  const defaultStatusIds = [...DEFAULT_STATUS_IDS];
  const rawStatusValues = statusIdsParams;
  const statusIdsFromQuery = rawStatusValues.map((s) => Number.parseInt(s.trim(), 10)).filter((n) => Number.isFinite(n));
  const desiredStatusIds = statusIdsFromQuery.length
    ? Array.from(new Set(statusIdsFromQuery)).sort((a, b) => a - b)
    : defaultStatusIds;

  const profileParams: ProfileQueryParams = {
    hrAdvisorId: filter === 'me' ? filter : undefined, // 'me' is used in the API to filter for the current HR advisor
    statusIds: desiredStatusIds,
    // Backend expects 1-based page index
    page: pageOneBased,
    size: size,
    sort: sortParam ?? undefined,
  };

  const [profilesResult, statuses] = await Promise.all([
    getProfileService().getProfiles(profileParams, session.authState.accessToken),
    getProfileStatusService().listAllLocalized(lang),
  ]);

  if (profilesResult.isErr()) {
    throw profilesResult.unwrapErr();
  }

  const profiles = profilesResult.unwrap();

  const { serverEnvironment } = await import('~/.server/environment');

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

  // Pagination helpers
  const totalPages = loaderData.page.totalPages;
  const currentPage = getCurrentPage(searchParams, 'page', totalPages);
  const pageItems = getPageItems(totalPages, currentPage, { threshold: 9, delta: 2 });

  // Sorting helpers

  const currentSort = useMemo((): { id: ColumnId; desc: boolean } | null => {
    return parseSortParam(searchParams.get('sort'));
  }, [searchParams]);

  // Map column ids to localized header titles for announcements
  const columnIdToTitle = useMemo(
    () =>
      ({
        name: t('app:hr-advisor-employees-table.employee'),
        email: t('app:hr-advisor-employees-table.email'),
        dateUpdated: t('app:hr-advisor-employees-table.updated'),
      }) as const satisfies Record<ColumnId, string>,
    [t],
  );

  const announceSortChange = useCallback(
    (next: { id: ColumnId; desc: boolean } | null | undefined) => {
      if (next?.id) {
        const colTitle = columnIdToTitle[next.id];
        setSrAnnouncement(
          next.desc
            ? t('gcweb:data-table.sorting.sorted-descending', { column: colTitle })
            : t('gcweb:data-table.sorting.sorted-ascending', { column: colTitle }),
        );
      } else {
        const prev = currentSort;
        const colTitle = prev ? columnIdToTitle[prev.id] : undefined;
        setSrAnnouncement(
          colTitle ? t('gcweb:data-table.sorting.not-sorted', { column: colTitle }) : t('gcweb:data-table.sorting.cleared'),
        );
      }
    },
    [columnIdToTitle, currentSort, t],
  );

  // When sorting changes in the table UI, push it into URL and announce the change (single sort only)
  const handleSortingChange = useCallback(
    (next: { id: string; desc: boolean } | null | undefined) => {
      // Normalize input to our typed ColumnId or clear
      const normalized: { id: ColumnId; desc: boolean } | null =
        next?.id && isColumnId(next.id) ? { id: next.id, desc: next.desc } : null;
      const paramsNext = new URLSearchParams(searchParams);
      // Clear and set single sort param
      paramsNext.delete('sort');
      const encoded = serializeSortParam(normalized);
      if (encoded) paramsNext.set('sort', encoded);
      announceSortChange(normalized);
      startTransition(() => setSearchParams(paramsNext));
    },
    [searchParams, announceSortChange, setSearchParams],
  );

  // Map loader statuses (id + codes) to help translate between codes shown in UI and ids for query
  const statusCodeById = useMemo(() => {
    const map = new Map<number, string>();
    loaderData.statuses.forEach((s) => map.set(s.id, s.code));
    return map;
  }, [loaderData.statuses]);

  const statusIdByCode = useMemo(() => {
    const map = new Map<string, number>();
    loaderData.statuses.forEach((s) => map.set(s.code, s.id));
    return map;
  }, [loaderData.statuses]);

  // Selected statusIds from URL (repeated). Defaults are already applied in loader
  const selectedStatusIds = useMemo(() => {
    const parts = searchParams.getAll('statusIds');
    if (parts.length === 0) return [...DEFAULT_STATUS_IDS];
    return Array.from(new Set(parts.map((s) => Number.parseInt(s.trim(), 10)).filter((n) => Number.isFinite(n)))).sort(
      (a, b) => a - b,
    );
  }, [searchParams]);

  // Selected status codes for the DataTable header control
  const selectedStatusCodes = useMemo(
    () => selectedStatusIds.map((id: number) => statusCodeById.get(id)).filter((code): code is string => code !== undefined),
    [selectedStatusIds, statusCodeById],
  );

  // Navigation helpers
  const handlePageClick = (target: number) => makePageClickHandler(searchParams, setSearchParams, target);

  const columns: ColumnDef<Profile>[] = [
    {
      id: 'name',
      accessorKey: 'profileUser.firstName',
      accessorFn: (row) => `${row.profileUser.lastName}, ${row.profileUser.firstName}`,
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('app:hr-advisor-employees-table.employee')} />,
      cell: (info) => <p>{info.getValue() as string}</p>,
    },
    {
      id: 'email',
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
      id: 'dateUpdated',
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
          selected={selectedStatusCodes}
          onSelectionChange={(selectedCodes) => {
            // Map selected codes to IDs present in loaderData.statuses
            const ids = selectedCodes.map((code) => statusIdByCode.get(code)).filter((n): n is number => typeof n === 'number');
            const filter = searchParams.get('filter') ?? 'all';
            const size = searchParams.get('size') ?? '10';
            const params = new URLSearchParams({ filter, page: '1', size });
            // Preserve existing single sort
            const sort = searchParams.get('sort');
            if (sort) params.set('sort', sort);
            Array.from(new Set(ids))
              .sort((a, b) => a - b)
              .forEach((id) => params.append('statusIds', String(id)));
            setSearchParams(params);
            setSrAnnouncement(t('app:hr-advisor-employees-table.updated'));
          }}
        />
      ),
      cell: (info) => {
        const status = info.row.original.profileStatus;
        return status && <ProfileStatusTag status={status} lang={loaderData.lang} view="hr-advisor" />;
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
        const profile = info.row.original;
        const profileId = profile.id.toString();
        const profileUserName = `${profile.profileUser.firstName} ${profile.profileUser.lastName}`;
        const isArchived = profile.profileStatus?.code === 'ARCHIVED';

        return (
          <div className="flex gap-4">
            <InlineLink
              className="rounded-sm text-sky-800 underline hover:text-blue-700 focus:text-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none"
              file="routes/hr-advisor/employee-profile/index.tsx"
              params={{ profileId }}
              search={`filter=${searchParams.get('filter')}`}
              aria-label={t('app:hr-advisor-employees-table.view-link', {
                profileUserName,
              })}
            >
              {t('app:hr-advisor-employees-table.view')}
            </InlineLink>
            {!isArchived && (
              <button
                type="button"
                onClick={() => handleArchive(profile)}
                className="rounded-sm text-sky-800 hover:text-blue-700 focus:text-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none"
                aria-label={t('app:hr-advisor-employees-table.archive-link', {
                  profileUserName,
                })}
              >
                {t('app:hr-advisor-employees-table.archive')}
              </button>
            )}
          </div>
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
              existingStatusIds.forEach((id) => params.append('statusIds', id));
              setSearchParams(params);
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

      <DataTable
        columns={columns}
        data={loaderData.profiles}
        showPagination={false}
        sorting={currentSort ? [currentSort] : []}
        onSortingChange={(state) => handleSortingChange(state[0])}
        disableClientSorting
      />

      {totalPages > 1 && (
        <Pagination className="my-4" aria-label={t('gcweb:data-table.pagination.label', { defaultValue: 'Pagination' })}>
          <p className="sr-only">
            {t('gcweb:data-table.pagination.page-info', {
              index: currentPage,
              count: totalPages,
            })}
          </p>
          <Pagination.Content>
            {/* Previous */}
            <Pagination.Item>
              <Pagination.Previous disabled={currentPage <= 1} onClick={handlePageClick(prevPage(currentPage))} />
            </Pagination.Item>

            {/* Page numbers */}
            {pageItems.map((item, idx) => {
              if (item === 'ellipsis') {
                return (
                  <Pagination.Item key={`ellipsis-${idx}`}>
                    <Pagination.Ellipsis />
                  </Pagination.Item>
                );
              }
              const p = item as number;
              const isActive = p === currentPage;
              return (
                <Pagination.Item key={p}>
                  <Pagination.Link
                    isActive={isActive}
                    aria-label={
                      isActive
                        ? t('gcweb:data-table.pagination.page-button-current', { index: p })
                        : t('gcweb:data-table.pagination.page-button-go-to', { index: p })
                    }
                    onClick={handlePageClick(p)}
                  >
                    {p}
                  </Pagination.Link>
                </Pagination.Item>
              );
            })}

            {/* Next */}
            <Pagination.Item>
              <Pagination.Next
                disabled={currentPage >= totalPages}
                onClick={handlePageClick(nextPage(currentPage, totalPages))}
              />
            </Pagination.Item>
          </Pagination.Content>
        </Pagination>
      )}

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
