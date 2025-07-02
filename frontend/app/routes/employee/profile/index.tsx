import type { JSX, ReactNode } from 'react';

import type { RouteHandle } from 'react-router';
import { Form, useNavigation } from 'react-router';

import { faCheck, faPenToSquare, faPlus } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useTranslation } from 'react-i18next';

import type { Route } from './+types/index';

import type { AuthenticatedSession } from '~/.server/utils/auth-utils';
import { i18nRedirect } from '~/.server/utils/route-utils';
import { Button } from '~/components/button';
import { ButtonLink } from '~/components/button-link';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '~/components/card';
import { DescriptionList, DescriptionListItem } from '~/components/description-list';
import { InlineLink } from '~/components/links';
import { Progress } from '~/components/progress';
import { EMPLOYEE_WFA_STATUS } from '~/domain/constants';
import { getTranslation } from '~/i18n-config.server';
import type { I18nRouteFile } from '~/i18n-routes';
import { handle as parentHandle } from '~/routes/layout';
import { cn } from '~/utils/tailwind-utils';

export const handle = {
  i18nNamespace: [...parentHandle.i18nNamespace],
} as const satisfies RouteHandle;

export function meta({ data }: Route.MetaArgs) {
  return [{ title: data?.documentTitle }];
}

export function action({ context, params, request }: Route.ActionArgs) {
  // Since parent layout ensures authentication, we can safely cast the session
  /*
  TODO: Update redirect to correct page
  */
  throw i18nRedirect('routes/employee/profile/index.tsx', request);
}

export async function loader({ context, request }: Route.LoaderArgs) {
  // Since parent layout ensures authentication, we can safely cast the session
  const authenticatedSession = context.session as AuthenticatedSession;

  const { t } = await getTranslation(request, handle.i18nNamespace);
  const completed = 1; //TODO: Replace with a function to count completed items by checking undefined values
  const total = 21; //TODO: Replace with a function to count total items by checking length
  const amountCompleted = (completed / total) * 100;

  return {
    documentTitle: t('app:index.about'),
    name: authenticatedSession.authState.idTokenClaims.name,
    email: authenticatedSession.authState.idTokenClaims.email,
    amountCompleted: amountCompleted,
    //TODO: Replace with actual values
    personalInformation: {
      completed: 1, //TODO: Replace with a function to count completed items by checking undefined values
      total: 6, //TODO: Replace with a function to count total items by checking length
      personalRecordIdentifier: undefined as string | undefined,
      preferredLanguage: undefined as string | undefined,
      workEmail: 'firstname.lastname@email.ca',
      personalEmail: undefined as string | undefined,
      workPhone: undefined as string | undefined,
      personalPhone: undefined as string | undefined,
      education: undefined as string | undefined,
      additionalInformation: undefined as string | undefined,
    },
    employmentInformation: {
      completed: 0, //TODO: Replace with a function to count completed items by checking undefined values
      total: 9, //TODO: Replace with a function to count total items by checking length
      substantivePosition: undefined as string | undefined,
      branchOrServiceCanadaRegion: undefined as string | undefined,
      directorate: undefined as string | undefined,
      province: undefined as string | undefined,
      city: undefined as string | undefined,
      wfaStatus: undefined as string | undefined,
      wfaEffectiveDate: undefined as string | undefined,
      wfaEndDate: undefined as string | undefined,
      hrAdvisor: undefined as string | undefined,
    },
    referralPreferences: {
      completed: 0, //TODO: Replace with a function to count completed items by checking undefined values
      total: 6, //TODO: Replace with a function to count total items by checking length
      languageReferralTypes: undefined as string[] | undefined,
      classification: undefined as string[] | undefined,
      workLocationCities: undefined as string[] | undefined,
      referralAvailibility: undefined as boolean | undefined,
      alternateOpportunity: undefined as boolean | undefined,
      employmentTenures: undefined as string[] | undefined,
    },
  };
}

export default function EditProfile({ loaderData, params }: Route.ComponentProps) {
  const { t } = useTranslation(handle.i18nNamespace);
  const navigation = useNavigation();

  return (
    <div className="mt-8 space-y-8">
      <div className="justify-between md:grid md:grid-cols-2">
        <div className="max-w-prose">
          <h1 className="mt-5 text-3xl font-semibold">{loaderData.name}</h1>
          {loaderData.email && <p className="mt-1 text-gray-500">{loaderData.email}</p>}
          <p className="mt-4">{t('app:profile.about-para-1')}</p>
          <p className="mt-4">{t('app:profile.about-para-2')}</p>
        </div>
        <Form className="mt-6 flex place-content-end space-x-5 md:mt-auto" method="post" noValidate>
          <ButtonLink variant="alternative" file="routes/index.tsx" id="save" disabled={navigation.state !== 'idle'}>
            {t('app:form.save-and-exit')}
          </ButtonLink>
          <Button name="action" variant="primary" id="submit" disabled={navigation.state !== 'idle'}>
            {t('app:form.submit')}
          </Button>
        </Form>
      </div>

      <Progress className="mt-8 mb-8" label="" value={loaderData.amountCompleted} />
      <div className="mt-8 max-w-prose space-y-10">
        <ProfileCard
          title={t('app:profile.personal-information.title')}
          linkLabel={t('app:profile.personal-information.link-label')}
          file="routes/employee/profile/personal-information.tsx"
          completed={loaderData.personalInformation.completed}
          total={loaderData.personalInformation.total}
          required
        >
          {loaderData.personalInformation.completed === 1 ? ( // only work email is available
            <>
              {t('app:profile.personal-information.detail')}
              <DescriptionList>
                <DescriptionListItem term={t('app:personal-information.work-email')}>
                  {loaderData.personalInformation.workEmail}
                </DescriptionListItem>
              </DescriptionList>
            </>
          ) : (
            <DescriptionList>
              <DescriptionListItem term={t('app:personal-information.personal-record-identifier')}>
                {loaderData.personalInformation.personalRecordIdentifier ?? t('app:profile.not-provided')}
              </DescriptionListItem>
              <DescriptionListItem term={t('app:personal-information.preferred-language')}>
                {loaderData.personalInformation.preferredLanguage ?? t('app:profile.not-provided')}
              </DescriptionListItem>
              <DescriptionListItem term={t('app:personal-information.work-email')}>
                {loaderData.personalInformation.workEmail}
              </DescriptionListItem>
              <DescriptionListItem term={t('app:personal-information.personal-email')}>
                {loaderData.personalInformation.personalEmail ?? t('app:profile.not-provided')}
              </DescriptionListItem>
              <DescriptionListItem term={t('app:personal-information.work-phone')}>
                {loaderData.personalInformation.workPhone ?? t('app:profile.not-provided')}
              </DescriptionListItem>
              <DescriptionListItem term={t('app:personal-information.personal-phone')}>
                {loaderData.personalInformation.personalPhone ?? t('app:profile.not-provided')}
              </DescriptionListItem>
              <DescriptionListItem term={t('app:personal-information.education')}>
                {loaderData.personalInformation.education ?? t('app:profile.not-provided')}
              </DescriptionListItem>
              <DescriptionListItem term={t('app:personal-information.additional-information')}>
                {loaderData.personalInformation.additionalInformation ?? t('app:profile.not-provided')}
              </DescriptionListItem>
            </DescriptionList>
          )}
        </ProfileCard>
        <ProfileCard
          title={t('app:profile.employment.title')}
          linkLabel={t('app:profile.employment.link-label')}
          file="routes/employee/profile/employment-information.tsx"
          completed={loaderData.employmentInformation.completed}
          total={loaderData.employmentInformation.total}
          required
        >
          {loaderData.employmentInformation.completed === 0 ? (
            <>{t('app:profile.employment.detail')}</>
          ) : (
            <>
              <h3 className="font-lato text-xl font-bold">{t('app:employment-information.substantive-position-heading')}</h3>
              <DescriptionList>
                <DescriptionListItem term={t('app:employment-information.substantive-position-group-and-level')}>
                  {loaderData.employmentInformation.substantivePosition ?? t('app:profile.not-provided')}
                </DescriptionListItem>
                <DescriptionListItem term={t('app:employment-information.branch-or-service-canada-region')}>
                  {loaderData.employmentInformation.branchOrServiceCanadaRegion ?? t('app:profile.not-provided')}
                </DescriptionListItem>
                <DescriptionListItem term={t('app:employment-information.directorate')}>
                  {loaderData.employmentInformation.directorate ?? t('app:profile.not-provided')}
                </DescriptionListItem>
                <DescriptionListItem term={t('app:employment-information.provinces')}>
                  {loaderData.employmentInformation.province ?? t('app:profile.not-provided')}
                </DescriptionListItem>
                <DescriptionListItem term={t('app:employment-information.city')}>
                  {loaderData.employmentInformation.city ?? t('app:profile.not-provided')}
                </DescriptionListItem>
              </DescriptionList>
              <h3 className="font-lato text-xl font-bold">{t('app:employment-information.wfa-detils-heading')}</h3>
              <DescriptionList>
                <DescriptionListItem term={t('app:employment-information.wfa-status')}>
                  {loaderData.employmentInformation.wfaStatus ?? t('app:profile.not-provided')}
                </DescriptionListItem>
                {(loaderData.employmentInformation.wfaStatus === EMPLOYEE_WFA_STATUS.opting ||
                  loaderData.employmentInformation.wfaStatus === EMPLOYEE_WFA_STATUS.surplusGRJO ||
                  loaderData.employmentInformation.wfaStatus === EMPLOYEE_WFA_STATUS.surplusOptingOptionA) && (
                  <>
                    <DescriptionListItem term={t('app:employment-information.wfa-effective-date')}>
                      {loaderData.employmentInformation.wfaEffectiveDate ?? t('app:profile.not-provided')}
                    </DescriptionListItem>
                    <DescriptionListItem term={t('app:employment-information.wfa-end-date')}>
                      {loaderData.employmentInformation.wfaEndDate ?? t('app:profile.not-provided')}
                    </DescriptionListItem>
                  </>
                )}
                <DescriptionListItem term={t('app:employment-information.hr-advisor')}>
                  {loaderData.employmentInformation.hrAdvisor ?? t('app:profile.not-provided')}
                </DescriptionListItem>
              </DescriptionList>
            </>
          )}
        </ProfileCard>
        <ProfileCard
          title={t('app:profile.referral.title')}
          linkLabel={t('app:profile.referral.link-label')}
          file="routes/employee/profile/referral-preferences.tsx"
          completed={loaderData.referralPreferences.completed}
          total={loaderData.referralPreferences.total}
          required
        >
          {loaderData.referralPreferences.completed === 0 ? (
            <>{t('app:profile.referral.detail')}</>
          ) : (
            <DescriptionList>
              <DescriptionListItem term={t('app:referral-preferences.language-referral-type')}>
                {loaderData.referralPreferences.languageReferralTypes === undefined
                  ? t('app:profile.not-provided')
                  : loaderData.referralPreferences.languageReferralTypes.length > 0 &&
                    loaderData.referralPreferences.languageReferralTypes.join(', ')}
              </DescriptionListItem>
              <DescriptionListItem term={t('app:referral-preferences.classification')}>
                {loaderData.referralPreferences.classification === undefined
                  ? t('app:profile.not-provided')
                  : loaderData.referralPreferences.classification.length > 0 &&
                    loaderData.referralPreferences.classification.join(', ')}
              </DescriptionListItem>
              <DescriptionListItem term={t('app:referral-preferences.work-location')}>
                {loaderData.referralPreferences.workLocationCities === undefined
                  ? t('app:profile.not-provided')
                  : loaderData.referralPreferences.workLocationCities.length > 0 &&
                    loaderData.referralPreferences.workLocationCities.join(', ')}
              </DescriptionListItem>
              <DescriptionListItem term={t('app:referral-preferences.referral-availibility')}>
                {loaderData.referralPreferences.referralAvailibility === undefined
                  ? t('app:profile.not-provided')
                  : loaderData.referralPreferences.referralAvailibility
                    ? t('gcweb:input-option.yes')
                    : t('gcweb:input-option.no')}
              </DescriptionListItem>
              <DescriptionListItem term={t('app:referral-preferences.alternate-opportunity')}>
                {loaderData.referralPreferences.alternateOpportunity === undefined
                  ? t('app:profile.not-provided')
                  : loaderData.referralPreferences.alternateOpportunity
                    ? t('gcweb:input-option.yes')
                    : t('gcweb:input-option.no')}
              </DescriptionListItem>
              <DescriptionListItem term={t('app:referral-preferences.employment-tenure')}>
                {loaderData.referralPreferences.employmentTenures === undefined
                  ? t('app:profile.not-provided')
                  : loaderData.referralPreferences.employmentTenures.length > 0 &&
                    loaderData.referralPreferences.employmentTenures.join(', ')}
              </DescriptionListItem>
            </DescriptionList>
          )}
        </ProfileCard>
      </div>
    </div>
  );
}

interface ProfileCardProps {
  title: string;
  linkLabel: string;
  file: I18nRouteFile;
  completed: number;
  total: number;
  required: boolean;
  children: ReactNode;
}

function ProfileCard({ title, linkLabel, file, completed, total, required, children }: ProfileCardProps): JSX.Element {
  const { t } = useTranslation(handle.i18nNamespace);
  const inProgress = completed < total && completed > 0;
  const complete = completed / total;
  const labelPrefix = `${inProgress ? t('app:profile.edit') : t('app:profile.add')}\u0020`;
  return (
    <Card className="p-4 sm:p-6">
      <CardHeader className="p-0">
        <div className="mb-6 grid grid-cols-2 justify-between select-none">
          <div>
            <FieldsCompletedTag completed={completed} total={total} />
          </div>
          <div className="ml-auto space-x-2">
            {complete === 1 ? (
              <CompleteTag />
            ) : (
              <>
                {inProgress && <InProgressTag />}
                {required && <RequiredTag />}
              </>
            )}
          </div>
        </div>
        <CardTitle className="text-2xl">{title}</CardTitle>
      </CardHeader>
      <CardContent className="my-3 space-y-3 p-0">{children}</CardContent>
      <CardFooter
        className={cn(
          'mt-3 flex items-center gap-2',
          'bg-gray-100', // Add background
          '-mx-4 sm:-mx-6', // Pull horizontally to cancel parent padding
          '-mb-4 sm:-mb-6', // Pull down to cancel parent bottom padding
          'px-4 sm:px-6', // Add horizontal padding back for the content
          'py-4', // Add vertical padding for the content
          'rounded-b-xs', // Re-apply bottom rounding
        )}
      >
        {inProgress ? <FontAwesomeIcon icon={faPenToSquare} /> : <FontAwesomeIcon icon={faPlus} />}
        <InlineLink className="font-semibold" file={file}>
          {labelPrefix}
          {linkLabel}
        </InlineLink>
      </CardFooter>
    </Card>
  );
}

function CompleteTag(): JSX.Element {
  const { t } = useTranslation(handle.i18nNamespace);

  return (
    <span className="rounded-2xl border border-green-600 bg-green-600 px-3 py-0.5 text-sm font-semibold text-white">
      <FontAwesomeIcon className="mr-1" icon={faCheck} />
      {t('app:profile.complete')}
    </span>
  );
}

function InProgressTag(): JSX.Element {
  const { t } = useTranslation(handle.i18nNamespace);

  return (
    <span className="rounded-2xl border border-blue-400 bg-blue-100 px-3 py-0.5 text-sm font-semibold text-blue-800">
      {t('app:profile.in-progress')}
    </span>
  );
}

function RequiredTag(): JSX.Element {
  const { t } = useTranslation(handle.i18nNamespace);

  return (
    <span className="rounded-2xl border border-gray-400 bg-gray-100 px-3 py-0.5 text-sm font-semibold text-black">
      {t('app:profile.required')}
    </span>
  );
}

interface FieldsCompletedTagProps {
  completed: number;
  total: number;
}

function FieldsCompletedTag({ completed, total }: FieldsCompletedTagProps): JSX.Element {
  const { t } = useTranslation(handle.i18nNamespace);

  return (
    <span className="rounded-2xl border border-gray-100 bg-gray-100 px-3 py-0.5 text-sm text-black">
      {t('app:profile.fields-complete', { completed, total })}
    </span>
  );
}
