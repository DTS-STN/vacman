import type { JSX } from 'react';

import { useLoaderData } from 'react-router';
import type { RouteHandle, LoaderFunctionArgs, MetaFunction } from 'react-router';

import type { ColumnDef } from '@tanstack/react-table';
import { format } from 'date-fns';
import { useTranslation } from 'react-i18next';

import type { Route } from '../+types/index';

import type { Profile } from '~/.server/domain/models';
import { getProfileService } from '~/.server/domain/services/profile-service';
import { Button } from '~/components/button';
import { DataTable, DataTableColumnHeader, DataTableColumnHeaderWithOptions } from '~/components/data-table';
import { InlineLink } from '~/components/links';
import { PageTitle } from '~/components/page-title';
import { getTranslation } from '~/i18n-config.server';
import { handle as parentHandle } from '~/routes/layout';

const STATUS_OPTIONS = {
  pendingApproval: 'pending-approval',
  approved: 'approved',
  incomplete: 'incomplete',
};

export const handle = {
  i18nNamespace: [...parentHandle.i18nNamespace],
} as const satisfies RouteHandle;

export async function loader({ context, request }: LoaderFunctionArgs) {
  const { t } = await getTranslation(request, handle.i18nNamespace);

  const allProfiles = await getProfileService().getAllProfiles();

  const profileData = allProfiles.filter(
    (profile) => profile.status === STATUS_OPTIONS.approved || profile.status === STATUS_OPTIONS.pendingApproval,
  );

  return { documentTitle: t('app:index.employees'), profileData };
}

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  return [{ title: data?.documentTitle }];
};

export default function EmployeeDashboard({ params }: Route.ComponentProps) {
  const { t } = useTranslation(handle.i18nNamespace);
  const loaderData = useLoaderData<typeof loader>();

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
      header: ({ column }) => (
        <DataTableColumnHeaderWithOptions
          column={column}
          title={t('app:employee-dashboard.status')}
          options={[STATUS_OPTIONS.approved, STATUS_OPTIONS.pendingApproval]}
        />
      ),
      cell: (info) => (info.row.original.status ? statusTag(info.row.original.status) : ''),
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
      <DataTable columns={columns} data={loaderData.profileData} />
    </div>
  );
}

function statusTag(status?: string): JSX.Element {
  return (
    <div
      className={`${status === STATUS_OPTIONS.incomplete ? 'bg-gray-100 text-slate-700' : status === STATUS_OPTIONS.approved ? 'bg-sky-100 text-sky-700' : 'bg-amber-100 text-yellow-700'} flex w-fit items-center gap-2 rounded-md px-3 py-1 text-sm font-semibold`}
    >
      <p>{status}</p>
    </div>
  );
}
