import { useMemo, useState } from 'react';
import type { JSX, ChangeEvent } from 'react';

import type { FetcherSubmitFunction } from 'react-router';

import type { ColumnDef } from '@tanstack/react-table';
import { useTranslation } from 'react-i18next';

import type { LocalizedMatchFeedback, MatchSummaryReadModel } from '~/.server/domain/models';
import { Button } from '~/components/button';
import { DataTable, DataTableColumnHeader, DataTableColumnHeaderWithOptions } from '~/components/data-table';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from '~/components/dialog';
import { InputLabel } from '~/components/input-label';
import { InputSelect } from '~/components/input-select';
import { InputTextarea } from '~/components/input-textarea';
import { InlineLink } from '~/components/links';
import { MATCH_STATUS } from '~/domain/constants';

interface MatchesTablesProps {
  requestMatches: MatchSummaryReadModel[];
  matchFeedbacks: readonly Readonly<LocalizedMatchFeedback>[];
  requestId: number;
  view: 'hr-advisor' | 'hiring-manager';
  submit: FetcherSubmitFunction;
  lang: 'en' | 'fr';
}

export default function MatchesTables({
  requestMatches,
  matchFeedbacks,
  requestId,
  view,
  submit,
  lang,
}: MatchesTablesProps): JSX.Element {
  const { t } = useTranslation('app');

  const updateFeedback = (id: number, feedback: string) => {
    const formData = new FormData();
    formData.set('action', 'feedback');
    formData.set('id', id.toString());
    formData.set('feedback', feedback);
    void submit(formData, { method: 'post' }); // TODO call PUT /api/v1/requests/{id}/matches/{matchId} to update feedback
  };

  const updateComment = (id: number, comment: string) => {
    const formData = new FormData();
    formData.set('action', 'comment');
    formData.set('id', id.toString());
    formData.set('comment', comment);
    void submit(formData, { method: 'post' }); // TODO call PUT /api/v1/requests/{id}/matches/{matchId} to update comment
  };

  const approveRequest = (id: number) => {
    const formData = new FormData();
    formData.set('action', 'approve');
    formData.set('id', id.toString());
    void submit(formData, { method: 'post' }); // TODO call POST /requests/{id}/matches/{id}/status-change and send  { "type"="feedbackApproved"}
  };

  // Helper to generate unique, sorted wfa status names for filter options
  function getUniqueWFAStatusNames(requestMatches: MatchSummaryReadModel[], language: string): string[] {
    const uniqueWFAStatuses = new Set<string>();
    requestMatches.forEach((requestMatch) => {
      const wfaStatusName =
        language === 'en' ? requestMatch.profile?.wfaStatus?.nameEn : requestMatch.profile?.wfaStatus?.nameFr;
      if (wfaStatusName) {
        uniqueWFAStatuses.add(wfaStatusName);
      }
    });
    return Array.from(uniqueWFAStatuses).sort();
  }

  const wfaStatusNames = useMemo(() => getUniqueWFAStatusNames(requestMatches, lang), [requestMatches, lang]);

  const columns: ColumnDef<MatchSummaryReadModel>[] = [
    {
      accessorKey: 'profile.firstName',
      accessorFn: (row) => `${row.profile?.firstName} ${row.profile?.lastName}`,
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('matches-tables.employee')} />,
      cell: (info) => {
        const profileId = info.row.original.id.toString();
        const profile = info.row.original.profile;
        return (
          <InlineLink
            className="text-sky-800 no-underline decoration-slate-400 decoration-2 hover:underline"
            file={`routes/${view}/request/profile.tsx`}
            params={{ requestId: requestId.toString(), profileId: profileId.toString() }}
            aria-label={`${t('matches-tables.employee')} ${profile?.firstName} ${profile?.lastName}`}
          >
            {String(info.renderValue())}
          </InlineLink>
        );
      },
    },
    {
      accessorKey: 'profile.wfaStatus',
      accessorFn: (row) => (lang === 'en' ? row.profile?.wfaStatus?.nameEn : row.profile?.wfaStatus?.nameFr) ?? '-',
      header: ({ column }) => (
        <DataTableColumnHeaderWithOptions column={column} title={t('matches-tables.wfa-status')} options={wfaStatusNames} />
      ),
      cell: (info) => {
        return (
          <p>
            {lang === 'en'
              ? (info.row.original.profile?.wfaStatus?.nameEn ?? '-')
              : (info.row.original.profile?.wfaStatus?.nameFr ?? '-')}
          </p>
        );
      },
      filterFn: (row, columnId, filterValue: string[]) => {
        const statusName = row.getValue(columnId) as string;
        return filterValue.length === 0 || filterValue.includes(statusName);
      },
      enableColumnFilter: true,
    },
    {
      accessorKey: 'feedback',
      accessorFn: (row) => row.matchFeedback,
      header: ({ column }) => (
        <DataTableColumnHeaderWithOptions
          column={column}
          title={t('matches-tables.feedback')}
          options={matchFeedbacks.map((feedback) => feedback.name)}
        />
      ),
      cell: (info) => {
        const selectOptions = matchFeedbacks.map((option) => ({
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
        const feedbackName = matchFeedbacks.find((match) => match.code === feedback)?.name ?? '';
        return filterValue.length === 0 || filterValue.includes(feedbackName);
      },
      enableColumnFilter: true,
    },
    {
      header: t('matches-tables.approval'),
      id: 'comment',
      cell: (info) => {
        const match = info.row.original;
        const [hiringManagerComment, setHiringManagerComment] = useState(match.hiringManagerComment ?? '');
        const [hrAdvisorComment, setHrAdvisorComment] = useState(match.hrAdvisorComment ?? '');
        const [isDialogOpen, setIsDialogOpen] = useState(false);

        // Determine button text based on current state and user role
        const getButtonText = (): string => {
          const hasHiringManagerComment = Boolean(match.hiringManagerComment);
          const hasHrAdvisorComment = Boolean(match.hrAdvisorComment);
          const hasAnyComment = hasHiringManagerComment || hasHrAdvisorComment;

          if (view === 'hiring-manager') {
            return hasHiringManagerComment ? t('matches-tables.comment-label.edit') : t('matches-tables.comment-label.add');
          }

          // HR Advisor view
          if (!hasAnyComment) {
            return t('matches-tables.comment-label.add');
          }
          if (hasHiringManagerComment && !hasHrAdvisorComment) {
            return t('matches-tables.comment-label.view-add');
          }
          return t('matches-tables.comment-label.edit-add');
        };

        const handleSave = () => {
          // Save the appropriate comment based on user role
          const commentToSave = view === 'hiring-manager' ? hiringManagerComment : hrAdvisorComment;
          updateComment(match.id, commentToSave);
          setIsDialogOpen(false);
        };

        const handleDialogOpen = () => {
          // Reset local state to current values when opening dialog
          setHiringManagerComment(match.hiringManagerComment ?? '');
          setHrAdvisorComment(match.hrAdvisorComment ?? '');
          setIsDialogOpen(true);
        };

        return (
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger
              className="text-sky-800 no-underline decoration-slate-400 decoration-2 hover:underline"
              onClick={handleDialogOpen}
            >
              {getButtonText()}
            </DialogTrigger>
            <DialogContent>
              <DialogTitle>{t('matches-tables.comments')}</DialogTitle>
              <DialogDescription className="space-y-5" asChild>
                <div>
                  <InputTextarea
                    className="w-full"
                    id={`hiring-manager-comment-${match.id}`}
                    label={t('matches-tables.comment-popup.hiring-manager')}
                    name="hiring-manager-comment"
                    disabled={view === 'hr-advisor'}
                    value={hiringManagerComment}
                    onChange={(e) => setHiringManagerComment(e.target.value)}
                  />
                  <InputTextarea
                    className="w-full"
                    id={`hr-advisor-comment-${match.id}`}
                    label={t('matches-tables.comment-popup.hr-advisor')}
                    name="hr-advisor-comment"
                    disabled={view === 'hiring-manager'}
                    value={hrAdvisorComment}
                    onChange={(e) => setHrAdvisorComment(e.target.value)}
                  />
                  <div className="space-x-4">
                    <DialogClose asChild>
                      <Button name="cancel" variant="alternative" id={`cancel-button-${match.id}`} type="button">
                        {t('form.cancel')}
                      </Button>
                    </DialogClose>
                    <Button name="save" variant="primary" id={`save-button-${match.id}`} type="button" onClick={handleSave}>
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
      header: t('matches-tables.approval'),
      id: 'action',
      cell: (info) => {
        const match = info.row.original;
        const isApproved = match.matchStatus?.code === MATCH_STATUS.APPROVED.code;
        const [showApprovalDialog, setShowApprovalDialog] = useState(false);

        const handleApprove = () => {
          approveRequest(match.id);
          setShowApprovalDialog(false);
        };

        return (
          <div className="flex items-baseline gap-4">
            {isApproved ? (
              <p>{t('matches-tables.approval-popup.approved')}</p>
            ) : (
              <>
                <Button
                  variant="alternative"
                  id={`approve-employee-${match.id}`}
                  onClick={() => setShowApprovalDialog(true)}
                  size="sm"
                >
                  {t('form.approve')}
                </Button>
                {/* Approval Confirmation Dialog */}
                <Dialog open={showApprovalDialog} onOpenChange={setShowApprovalDialog}>
                  <DialogContent className="max-w-86">
                    <DialogTitle>{t('matches-tables.approval')}</DialogTitle>
                    <DialogDescription className="space-y-5" asChild>
                      <div>
                        <InputLabel id={`approve-feedback-${match.id}`}>
                          {t('matches-tables.approval-popup.approve-feedback')}
                        </InputLabel>
                        <div className="space-x-4">
                          <DialogClose asChild>
                            <Button name="cancel" variant="alternative" id={`cancel-button-${match.id}`} type="button">
                              {t('form.cancel')}
                            </Button>
                          </DialogClose>
                          <DialogClose asChild>
                            <Button variant="primary" id={`approve-button-${match.id}`} onClick={handleApprove}>
                              {t('form.approve')}
                            </Button>
                          </DialogClose>
                        </div>
                      </div>
                    </DialogDescription>
                  </DialogContent>
                </Dialog>
              </>
            )}
          </div>
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
