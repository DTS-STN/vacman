import type { JSX, ChangeEvent } from 'react';
import { useRef } from 'react';

import type { FetcherSubmitFunction } from 'react-router';

import type { ColumnDef } from '@tanstack/react-table';
import { useTranslation } from 'react-i18next';

import { Button } from '~/components/button';
import { DataTable, DataTableColumnHeader, DataTableColumnHeaderWithOptions } from '~/components/data-table';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from '~/components/dialog';
import { InputLabel } from '~/components/input-label';
import { InputSelect } from '~/components/input-select';
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
  wfaStatus: string;
  feedback: string;
  comment: Comment;
  approval: boolean;
};

type MatchFeedback = {
  id: number;
  name: string;
  code: string;
};

type MatchStatus = {
  id: number;
  name: string;
  code: string;
};

interface MatchesTablesProps {
  requestMatches: RequestMatchModel[];
  matchStatus: readonly Readonly<MatchStatus>[];
  matchFeedback: readonly Readonly<MatchFeedback>[];
  requestId: string | undefined;
  view: 'hr-advisor' | 'hiring-manager';
  submit: FetcherSubmitFunction;
}

export default function MatchesTables({
  requestMatches,
  matchStatus,
  matchFeedback,
  requestId,
  view,
  submit,
}: MatchesTablesProps): JSX.Element {
  const { t } = useTranslation('app');

  const updateFeedback = (id: number, feedback: string) => {
    const formData = new FormData();
    formData.set('action', 'feedback');
    formData.set('id', id.toString());
    formData.set('feedback', feedback);
    void submit(formData, { method: 'post' });
  };

  const updateComment = (id: number, comment: string) => {
    const formData = new FormData();
    formData.set('action', 'comment');
    formData.set('id', id.toString());
    formData.set('comment', comment);
    void submit(formData, { method: 'post' });
  };

  const approveRequest = (id: number) => {
    const formData = new FormData();
    formData.set('action', 'approve');
    formData.set('id', id.toString());
    void submit(formData, { method: 'post' });
  };

  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  const columns: ColumnDef<RequestMatchModel>[] = [
    {
      accessorKey: 'employee.firstName',
      accessorFn: (row) => `${row.employee.firstName} ${row.employee.lastName}`,
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('matches-tables.employee')} />,
      cell: (info) => {
        const profileId = info.row.original.id.toString();
        const employee = info.row.original.employee;
        return (
          <InlineLink
            className="text-sky-800 no-underline decoration-slate-400 decoration-2 hover:underline"
            file={`routes/${view}/request/profile.tsx`}
            params={{ requestId, profileId }}
            aria-label={`${t('matches-tables.employee')} ${employee.firstName} ${employee.lastName}`}
          >
            {String(info.renderValue())}
          </InlineLink>
        );
      },
    },
    {
      accessorKey: 'wfaStatus',
      accessorFn: (row) => row.wfaStatus,
      header: ({ column }) => (
        <DataTableColumnHeaderWithOptions
          column={column}
          title={t('matches-tables.wfa-status')}
          options={matchStatus.map((status) => status.name)}
        />
      ),
      cell: (info) => {
        const status = info.getValue();
        return matchStatus.find((match) => match.code === status)?.name ?? status;
      },
      filterFn: (row, columnId, filterValue: string[]) => {
        const status = row.getValue(columnId);
        const statusName = matchStatus.find((match) => match.code === status)?.name ?? '';
        return filterValue.length === 0 || filterValue.includes(statusName);
      },
      enableColumnFilter: true,
    },
    {
      accessorKey: 'feedback',
      accessorFn: (row) => row.feedback,
      header: ({ column }) => (
        <DataTableColumnHeaderWithOptions
          column={column}
          title={t('matches-tables.feedback')}
          options={matchFeedback.map((feedback) => feedback.name)}
        />
      ),
      cell: (info) => {
        const selectOptions = matchFeedback.map((option) => ({
          value: option.code,
          children: option.name,
        }));
        return (
          <InputSelect
            id={info.cell.id}
            name={t('matches-tables.feedback')}
            options={selectOptions}
            defaultValue={String(info.getValue())}
            aria-label={t('matches-tables.feedback')}
            variant="alternative"
            onChange={(event: ChangeEvent<HTMLSelectElement>) => updateFeedback(info.row.original.id, event.target.value)}
          />
        );
      },
      filterFn: (row, columnId, filterValue: string[]) => {
        const feedback = row.getValue(columnId);
        const feedbackName = matchFeedback.find((match) => match.code === feedback)?.name ?? '';
        return filterValue.length === 0 || filterValue.includes(feedbackName);
      },
      enableColumnFilter: true,
    },
    {
      accessorKey: 'comment',
      accessorFn: (row) => row.comment,
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('matches-tables.comments')} />,
      cell: (info) => {
        const comment = info.getValue<Comment>();
        const editComment =
          (view === 'hr-advisor' && comment.hrAdvisor) ?? (view === 'hiring-manager' && comment.hiringManager);
        return (
          <Dialog>
            <DialogTrigger className="text-sky-800 no-underline decoration-slate-400 decoration-2 hover:underline">
              {editComment ? t('matches-tables.comment-label.edit') : t('matches-tables.comment-label.add')}
            </DialogTrigger>
            <DialogContent>
              <DialogTitle>{t('matches-tables.comments')}</DialogTitle>
              <DialogDescription className="space-y-5" asChild>
                <div>
                  <InputTextarea
                    className="w-full"
                    id="hiring-manager-comment"
                    label={t('matches-tables.comment-popup.hiring-manager')}
                    name="hiring-manager-comment"
                    disabled={view === 'hr-advisor'}
                    defaultValue={comment.hiringManager}
                    ref={view === 'hiring-manager' ? textAreaRef : null}
                  />
                  <InputTextarea
                    className="w-full"
                    id="hr-advisor-comment"
                    label={t('matches-tables.comment-popup.hr-advisor')}
                    name="hr-advisor-comment"
                    disabled={view === 'hiring-manager'}
                    defaultValue={comment.hrAdvisor}
                    ref={view === 'hr-advisor' ? textAreaRef : null}
                  />
                  <div className="space-x-4">
                    <DialogClose asChild>
                      <Button name="cancel" variant="alternative" id="cancel-button" type="button">
                        {t('form.cancel')}
                      </Button>
                    </DialogClose>
                    <Button
                      name="save"
                      variant="primary"
                      id="save-button"
                      type="button"
                      onClick={() => {
                        updateComment(info.row.original.id, textAreaRef.current?.value ?? '');
                      }}
                    >
                      {t('form.save')}
                    </Button>
                  </div>
                </div>
              </DialogDescription>
            </DialogContent>
          </Dialog>
        );
      },
    },
  ];

  if (view === 'hr-advisor') {
    columns.push({
      accessorKey: 'approval',
      accessorFn: (row) => row.approval,
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('matches-tables.approval')} />,
      cell: (info) => {
        const approval = info.getValue();
        if (approval) {
          return <p>{t('matches-tables.approval-popup.approved')}</p>;
        }
        return (
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="alternative">{t('form.approve')}</Button>
            </DialogTrigger>
            <DialogContent className="max-w-86">
              <DialogTitle>{t('matches-tables.approval')}</DialogTitle>
              <DialogDescription className="space-y-5" asChild>
                <div>
                  <InputLabel id="approve-feedback">{t('matches-tables.approval-popup.approve-feedback')}</InputLabel>
                  <div className="space-x-4">
                    <DialogClose asChild>
                      <Button name="cancel" variant="alternative" id="cancel-button" type="button">
                        {t('form.cancel')}
                      </Button>
                    </DialogClose>
                    <DialogClose asChild>
                      <Button variant="primary" onClick={() => approveRequest(info.row.original.id)}>
                        {t('form.approve')}
                      </Button>
                    </DialogClose>
                  </div>
                </div>
              </DialogDescription>
            </DialogContent>
          </Dialog>
        );
      },
    });
  }

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
