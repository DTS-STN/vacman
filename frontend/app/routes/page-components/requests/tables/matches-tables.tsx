import type { JSX } from 'react';

import { faSortDown } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import type { ColumnDef } from '@tanstack/react-table';
import { useTranslation } from 'react-i18next';

import { Button } from '~/components/button';
import { DataTable, DataTableColumnHeader, DataTableColumnHeaderWithOptions } from '~/components/data-table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTrigger } from '~/components/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '~/components/dropdown-menu';
import { InputLabel } from '~/components/input-label';
import { InputTextarea } from '~/components/input-textarea';
import { InlineLink } from '~/components/links';

//TODO - Replace with the actual model for request matches
type Comment = {
  hrAdvisor?: string;
  hiringManager?: string;
};

type RequestMatchModel = {
  id: number;
  employee: {
    firstName: string;
    lastName: string;
    middleName?: string;
  };
  wfaStatus: number;
  feedback: number;
  comment: Comment;
  approval: boolean;
};

interface RequestTablesProps {
  requestMatches: RequestMatchModel[];
  matchStatusNames: string[];
  matchFeedbackNames: string[];
  requestId: string;
  view: 'hr-advisor' | 'hiring-manager';
}

export default function MatchesTable({
  requestMatches,
  matchStatusNames,
  matchFeedbackNames,
  requestId,
  view,
}: RequestTablesProps): JSX.Element {
  const { t } = useTranslation('app');

  const columns: ColumnDef<RequestMatchModel>[] = [
    {
      accessorKey: 'employee.firstName',
      accessorFn: (row) => `${row.employee.firstName} ${row.employee.lastName}`,
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('matches-tables.employee')} />,
      cell: (info) => {
        //TODO - Update link to proper redirect
        const profileId = info.row.original.id.toString();
        const employee = info.row.original.employee;
        return (
          <InlineLink
            className="text-sky-800 no-underline decoration-slate-400 decoration-2 hover:underline"
            file={`routes/${view}/request/profile.tsx`}
            params={{ requestId, profileId }}
            aria-label={`${t('matches-tables.employee')} ${employee.firstName} ${employee.lastName}`}
          >
            {info.getValue() as string}
          </InlineLink>
        );
      },
    },
    {
      accessorKey: 'wfaStatus',
      accessorFn: (row) => matchStatusNames[row.wfaStatus],
      header: ({ column }) => (
        <DataTableColumnHeaderWithOptions column={column} title={t('matches-tables.wfa-status')} options={matchStatusNames} />
      ),
      cell: (info) => {
        return matchStatusNames[info.row.original.wfaStatus];
      },
      filterFn: (row, columnId, filterValue: string[]) => {
        const status = row.getValue(columnId) as string;
        return filterValue.length === 0 || filterValue.includes(status);
      },
      enableColumnFilter: true,
    },
    {
      accessorKey: 'feedback',
      accessorFn: (row) => matchFeedbackNames[row.feedback],
      header: ({ column }) => (
        <DataTableColumnHeaderWithOptions column={column} title={t('matches-tables.feedback')} options={matchFeedbackNames} />
      ),
      cell: (info) => {
        const feedback = matchFeedbackNames[info.row.original.feedback];
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="-ml-3 h-8 w-full justify-between font-sans font-medium data-[state=open]:bg-neutral-100"
              >
                <span>{feedback}</span>
                <span className="ml-1 rounded-sm p-1 text-neutral-500 hover:bg-slate-300">
                  <FontAwesomeIcon icon={faSortDown} />
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="max-h-60 overflow-y-auto p-2">
              {matchFeedbackNames.map((option) => (
                <DropdownMenuItem key={option} asChild>
                  <label className="flex w-full cursor-pointer items-center gap-2 px-2 py-1.5">
                    <span className="text-sm capitalize">{option.replace('-', ' ')}</span>
                  </label>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
      filterFn: (row, columnId, filterValue: string[]) => {
        const feedback = row.getValue(columnId) as string;
        return filterValue.length === 0 || filterValue.includes(feedback);
      },
      enableColumnFilter: true,
    },
    {
      accessorKey: 'comment',
      accessorFn: (row) => row.comment,
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('matches-tables.comments')} />,
      cell: (info) => {
        const comment = info.getValue() as Comment;
        const editComment =
          (view === 'hr-advisor' && comment.hrAdvisor) ?? (view === 'hiring-manager' && comment.hiringManager);
        return (
          <Dialog>
            <DialogTrigger className="text-sky-800 no-underline decoration-slate-400 decoration-2 hover:underline">
              {editComment ? t('matches-tables.comment-label.edit') : t('matches-tables.comment-label.add')}
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogDescription className="space-y-5">
                  <InputTextarea
                    className="w-full"
                    id="hiring-manager-comment"
                    label={t('matches-tables.comment-popup.hiring-manager')}
                    name="hiring-manager-comment"
                    disabled={view === 'hr-advisor'}
                  >
                    {comment.hiringManager}
                  </InputTextarea>
                  <InputTextarea
                    className="w-full"
                    id="hr-advisor-comment"
                    label={t('matches-tables.comment-popup.hr-advisor')}
                    name="hr-advisor-comment"
                    disabled={view === 'hiring-manager'}
                  >
                    {comment.hrAdvisor}
                  </InputTextarea>
                </DialogDescription>
              </DialogHeader>
            </DialogContent>
          </Dialog>
        );
      },
    },
    {
      accessorKey: 'approval',
      accessorFn: (row) => row.approval,
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('matches-tables.approval')} />,
      cell: (info) => {
        const approval = info.getValue() as boolean;
        if (approval) {
          return <p>{t('matches-tables.approval-popup.approved')}</p>;
        }
        return (
          <Dialog>
            <DialogTrigger className="text-sky-800 no-underline decoration-slate-400 decoration-2 hover:underline">
              <Button variant="alternative">{t('form.approve')}</Button>
            </DialogTrigger>
            <DialogContent className="max-w-86">
              <DialogHeader>
                <DialogDescription className="space-y-5">
                  <InputLabel id="approve-feedback">{t('matches-tables.approval-popup.approve-feedback')}</InputLabel>
                  <div className="space-x-4">
                    <Button>{t('form.cancel')}</Button>
                    <Button variant="primary">{t('form.approve')}</Button>
                  </div>
                </DialogDescription>
              </DialogHeader>
            </DialogContent>
          </Dialog>
        );
      },
    },
  ];

  return (
    <div className="mb-8">
      <section className="mb-8">
        <h2 className="font-lato text-xl font-bold">{t('requests-tables.active-requests')}</h2>
        {requestMatches.length === 0 ? (
          <div>{t('requests-tables.no-active-requests')}</div>
        ) : (
          <DataTable columns={columns} data={requestMatches} />
        )}
      </section>
    </div>
  );
}
