import { useState, useCallback } from 'react';
import type { JSX, ChangeEvent } from 'react';

import { useSearchParams } from 'react-router';
import type { FetcherSubmitFunction } from 'react-router';

import { useTranslation } from 'react-i18next';

import type { LocalizedMatchFeedback, LookupModel, MatchSummaryReadModel, PageMetadata } from '~/.server/domain/models';
import { Button } from '~/components/button';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from '~/components/dialog';
import { InputLabel } from '~/components/input-label';
import { InputSelect } from '~/components/input-select';
import { InputTextarea } from '~/components/input-textarea';
import { LoadingButton } from '~/components/loading-button';
import { LoadingLink } from '~/components/loading-link';
import { Column, ColumnOptions, ColumnSearch, ServerTable } from '~/components/server-table';
import { MATCH_STATUS } from '~/domain/constants';
import type { Errors } from '~/routes/page-components/requests/validation.server';
import { extractValidationKey } from '~/utils/validation-utils';

interface MatchesTablesProps {
  requestMatches: MatchSummaryReadModel[];
  wfaStatuses: readonly Readonly<LookupModel>[];
  matchFeedbacks: readonly Readonly<LocalizedMatchFeedback>[];
  requestId: number;
  view: 'hr-advisor' | 'hiring-manager';
  submit: FetcherSubmitFunction;
  lang: 'en' | 'fr';
  isUpdating?: boolean;
  errors?: Errors;
  page: PageMetadata;
}

export default function MatchesTables({
  requestMatches,
  wfaStatuses,
  matchFeedbacks,
  requestId,
  view,
  submit,
  lang,
  isUpdating = false,
  errors,
  page,
}: MatchesTablesProps): JSX.Element {
  const { t } = useTranslation('app');
  const [searchParams, setSearchParams] = useSearchParams({ filter: 'all' });

  // Helper function to safely extract feedback value from mixed data types
  // This is necessary because matchFeedback can come from different sources:
  // - Initial loader: object with id property
  // - Real-time updates: primitive value
  const extractFeedbackValue = (feedback: unknown): string | number | null => {
    if (!feedback) return null;
    if (typeof feedback === 'object' && 'id' in feedback) {
      return (feedback as { id: string | number }).id;
    }
    return feedback as string | number;
  };

  const updateFeedback = useCallback(
    (id: number, feedback: string) => {
      const formData = new FormData();
      formData.set('action', 'feedback');
      formData.set('matchId', id.toString());
      formData.set('feedback', feedback);
      void submit(formData, { method: 'post' });
    },
    [submit],
  );

  const updateComment = useCallback(
    (id: number, comment: string) => {
      const formData = new FormData();
      formData.set('action', 'comment');
      formData.set('matchId', id.toString());
      formData.set('comment', comment);
      void submit(formData, { method: 'post' });
    },
    [submit],
  );

  const approveRequest = useCallback(
    (id: number) => {
      const formData = new FormData();
      formData.set('action', 'approve');
      formData.set('matchId', id.toString());
      void submit(formData, { method: 'post' });
    },
    [submit],
  );

  return (
    <div className="mb-8">
      <section className="mb-8">
        <ServerTable page={page} data={requestMatches} searchParams={searchParams} setSearchParams={setSearchParams}>
          <Column
            accessorKey="employeeName"
            accessorFn={(row: MatchSummaryReadModel) => `${row.profile?.firstName} ${row.profile?.lastName}`}
            header={({ column }) => (
              <ColumnSearch
                column={column}
                title={t('matches-tables.employee')}
                searchParams={searchParams}
                setSearchParams={setSearchParams}
              />
            )}
            cell={(info) => {
              const profile = info.row.original.profile;
              const profileId = profile?.id;
              const employeeName = `${profile?.firstName ?? ''} ${profile?.lastName ?? ''}`.trim();

              // Only render link if profileId exists
              if (!profileId) {
                return <span>{employeeName || '-'}</span>;
              }

              return (
                <LoadingLink
                  className="text-sky-800 no-underline decoration-slate-400 decoration-2 hover:underline"
                  file={`routes/${view}/request/profile.tsx`}
                  params={{ requestId: requestId.toString(), profileId: profileId.toString() }}
                  aria-label={`${t('matches-tables.employee')} ${profile.firstName} ${profile.lastName}`}
                  search={searchParams}
                >
                  {employeeName || '-'}
                </LoadingLink>
              );
            }}
          />
          <Column
            accessorKey="wfaStatusId"
            accessorFn={(row: MatchSummaryReadModel) =>
              (lang === 'en' ? row.profile?.wfaStatus?.nameEn : row.profile?.wfaStatus?.nameFr) ?? '-'
            }
            header={({ column }) => (
              <ColumnOptions
                column={column}
                title={t('matches-tables.wfa-status')}
                options={wfaStatuses}
                searchParams={searchParams}
                setSearchParams={setSearchParams}
                showClearAll
              />
            )}
            cell={(info) => {
              return (
                <span>
                  {lang === 'en'
                    ? (info.row.original.profile?.wfaStatus?.nameEn ?? '-')
                    : (info.row.original.profile?.wfaStatus?.nameFr ?? '-')}
                </span>
              );
            }}
          />
          <Column
            accessorKey="matchFeedbackId"
            accessorFn={(row: MatchSummaryReadModel) => row.matchFeedback}
            header={({ column }) => (
              <ColumnOptions
                column={column}
                title={t('matches-tables.feedback')}
                options={matchFeedbacks}
                searchParams={searchParams}
                setSearchParams={setSearchParams}
                showClearAll
                id="feedback-column-header"
              />
            )}
            cell={(info) => {
              const match = info.row.original;
              const currentFeedback = match.matchFeedback;
              const feedbackValue = extractFeedbackValue(currentFeedback);

              const selectOptions = [{ id: 'select-option', name: '' }, ...matchFeedbacks].map(({ id, name }) => ({
                value: id === 'select-option' ? '' : String(id),
                children: id === 'select-option' ? t('form.select-option') : name,
              }));

              return (
                <InputSelect
                  id={info.cell.id}
                  name={t('matches-tables.feedback')}
                  options={selectOptions}
                  value={feedbackValue ?? ''}
                  aria-label={t('matches-tables.feedback')}
                  variant="alternative"
                  disabled={isUpdating}
                  onChange={(event: ChangeEvent<HTMLSelectElement>) => updateFeedback(match.id, event.target.value)}
                />
              );
            }}
          />
          <Column
            header={t('matches-tables.comments')}
            id="comment"
            accessorFn={(row: MatchSummaryReadModel) => row}
            cell={(info) => {
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
                  return hasHiringManagerComment
                    ? t('matches-tables.comment-label.edit')
                    : t('matches-tables.comment-label.add');
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
                          maxLength={100}
                        />
                        <InputTextarea
                          className="w-full"
                          id={`hr-advisor-comment-${match.id}`}
                          label={t('matches-tables.comment-popup.hr-advisor')}
                          name="hr-advisor-comment"
                          disabled={view === 'hiring-manager'}
                          value={hrAdvisorComment}
                          onChange={(e) => setHrAdvisorComment(e.target.value)}
                          maxLength={100}
                          errorMessage={t(extractValidationKey(errors?.comment?.[match.id]))}
                        />
                        <div className="space-x-4">
                          <DialogClose asChild>
                            <Button name="cancel" variant="alternative" id={`cancel-button-${match.id}`} type="button">
                              {t('form.cancel')}
                            </Button>
                          </DialogClose>
                          <Button
                            name="save"
                            variant="primary"
                            id={`save-button-${match.id}`}
                            type="button"
                            onClick={handleSave}
                          >
                            {t('form.save')}
                          </Button>
                        </div>
                      </div>
                    </DialogDescription>
                  </DialogContent>
                </Dialog>
              );
            }}
          />
          {view === 'hr-advisor' && (
            <Column
              header={t('matches-tables.approval')}
              id="action"
              accessorFn={(row: MatchSummaryReadModel) => row}
              cell={(info) => {
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
                      <span>{t('matches-tables.approval-popup.approved')}</span>
                    ) : (
                      <>
                        <LoadingButton
                          variant="alternative"
                          id={`approve-employee-${match.id}`}
                          onClick={() => setShowApprovalDialog(true)}
                          size="sm"
                          disabled={isUpdating}
                          loading={isUpdating}
                        >
                          {t('form.approve')}
                        </LoadingButton>
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
              }}
            />
          )}
        </ServerTable>
      </section>
    </div>
  );
}
