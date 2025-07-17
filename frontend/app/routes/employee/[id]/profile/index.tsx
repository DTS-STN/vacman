import type { JSX, ReactNode } from 'react';

import type { Params, RouteHandle } from 'react-router';
import { Form, useNavigation } from 'react-router';

import { faCheck, faPenToSquare, faPlus } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useTranslation } from 'react-i18next';

import type { Route } from './+types/index';

import type { Profile } from '~/.server/domain/models';
import { getCityService } from '~/.server/domain/services/city-service';
import { getClassificationService } from '~/.server/domain/services/classification-service';
import { getDirectorateService } from '~/.server/domain/services/directorate-service';
import { getEmploymentTenureService } from '~/.server/domain/services/employment-tenure-service';
import { getLanguageForCorrespondenceService } from '~/.server/domain/services/language-for-correspondence-service';
import { getLanguageReferralTypeService } from '~/.server/domain/services/language-referral-type-service';
import { getProfileService } from '~/.server/domain/services/profile-service';
import { getUserService } from '~/.server/domain/services/user-service';
import { getWFAStatuses } from '~/.server/domain/services/wfa-status-service';
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
import { countCompletedItems } from '~/utils/string-utils';
import { cn } from '~/utils/tailwind-utils';

export const handle = {
  i18nNamespace: [...parentHandle.i18nNamespace],
} as const satisfies RouteHandle;

export function meta({ data }: Route.MetaArgs) {
  return [{ title: data?.documentTitle }];
}

// TODO: Setup form action to submit user's profile data for review
export function action({ context, request }: Route.ActionArgs) {
  // Get the current user's ID from the authenticated session
  const authenticatedSession = context.session as AuthenticatedSession;
  const currentUserId = authenticatedSession.authState.idTokenClaims.oid as string;
  return i18nRedirect('routes/employee/[id]/profile/index.tsx', request, {
    params: { id: currentUserId },
  });
}

export async function loader({ context, request, params }: Route.LoaderArgs) {
  // Use the id parameter from the URL to fetch the profile
  const profileUserId = params.id;

  // Get the user service
  const userService = getUserService();
  const { lang, t } = await getTranslation(request, handle.i18nNamespace);

  // Fetch both the profile user and the profile data
  const [
    profileUser,
    profileResult,
    allLocalizedLanguageReferralTypes,
    allClassifications,
    allLocalizedCities,
    allLocalizedEmploymentTenures,
  ] = await Promise.all([
    userService.getUserByActiveDirectoryId(profileUserId),
    getProfileService().getProfile(profileUserId),
    getLanguageReferralTypeService().listAllLocalized(lang),
    getClassificationService().listAllLocalized(lang),
    getCityService().listAllLocalized(lang),
    getEmploymentTenureService().listAllLocalized(lang),
  ]);

  if (profileResult.isNone()) {
    throw new Response('Profile not found', { status: 404 });
  }

  const profileData: Profile = profileResult.unwrap();

  const preferredLanguageResult =
    profileData.personalInformation.preferredLanguageId &&
    (await getLanguageForCorrespondenceService().findLocalizedById(profileData.personalInformation.preferredLanguageId, lang));
  const workUnitResult =
    profileData.employmentInformation.workUnitId &&
    (await getDirectorateService().findLocalizedById(profileData.employmentInformation.workUnitId, lang));
  const substantivePositionResult =
    profileData.employmentInformation.classificationId &&
    (await getClassificationService().findLocalizedById(profileData.employmentInformation.classificationId, lang));
  const cityResult =
    profileData.employmentInformation.cityId &&
    (await getCityService().findLocalizedById(profileData.employmentInformation.cityId, lang));

  const completed = countCompletedItems(profileData);
  const total = Object.keys(profileData).length;
  const amountCompleted = (completed / total) * 100;

  // convert the IDs to display names
  const preferredLanguage =
    preferredLanguageResult && preferredLanguageResult.isSome() ? preferredLanguageResult.unwrap().name : undefined;
  const substantivePosition =
    substantivePositionResult && substantivePositionResult.isSome() ? substantivePositionResult.unwrap().name : undefined;
  const branchOrServiceCanadaRegion =
    workUnitResult && workUnitResult.isSome() ? workUnitResult.unwrap().parent.name : undefined;
  const directorate = workUnitResult && workUnitResult.isSome() ? workUnitResult.unwrap().name : undefined;
  const city = cityResult && cityResult.isSome() ? cityResult.unwrap() : undefined;
  const wfaStatus =
    profileData.employmentInformation.wfaStatusId &&
    (await getWFAStatuses().getLocalizedById(profileData.employmentInformation.wfaStatusId, lang)).unwrap().name; //TODO add find localized by ID in service
  const hrAdvisor =
    profileData.employmentInformation.hrAdvisor &&
    (await getUserService().getUserById(profileData.employmentInformation.hrAdvisor));
  const languageReferralTypes = profileData.referralPreferences.languageReferralTypeIds
    ?.map((langId) => allLocalizedLanguageReferralTypes.find((l) => String(l.id) === langId))
    .filter(Boolean);
  const classifications = profileData.referralPreferences.classificationIds
    ?.map((classificationId) => allClassifications.find((c) => String(c.id) === classificationId))
    .filter(Boolean);
  const cities = profileData.referralPreferences.workLocationCitiesIds
    ?.map((cityId) => allLocalizedCities.find((c) => String(c.id) === cityId))
    .filter(Boolean);
  const employmentTenures = profileData.referralPreferences.employmentTenureIds
    ?.map((employmentTenureId) => allLocalizedEmploymentTenures.find((c) => String(c.id) === employmentTenureId))
    .filter(Boolean);

  return {
    documentTitle: t('app:index.about'),
    name: profileUser?.uuName ?? 'Unknown User',
    email: profileUser?.businessEmail ?? profileData.personalInformation.workEmail,
    amountCompleted: amountCompleted,
    personalInformation: {
      completed: countCompletedItems(profileData.personalInformation),
      total: Object.keys(profileData.personalInformation).length,
      personalRecordIdentifier: profileData.personalInformation.personalRecordIdentifier,
      preferredLanguage: preferredLanguage,
      workEmail: profileUser?.businessEmail ?? profileData.personalInformation.workEmail,
      personalEmail: profileData.personalInformation.personalEmail,
      workPhone: profileData.personalInformation.workPhone,
      personalPhone: profileData.personalInformation.personalPhone,
      additionalInformation: profileData.personalInformation.additionalInformation,
    },
    employmentInformation: {
      completed: countCompletedItems(profileData.employmentInformation),
      total: Object.keys(profileData.employmentInformation).length,
      substantivePosition: substantivePosition,
      branchOrServiceCanadaRegion: branchOrServiceCanadaRegion,
      directorate: directorate,
      province: city?.province.name,
      city: city?.name,
      wfaStatus: wfaStatus,
      wfaEffectiveDate: profileData.employmentInformation.wfaEffectiveDate,
      wfaEndDate: profileData.employmentInformation.wfaEndDate,
      hrAdvisor: hrAdvisor && hrAdvisor.firstName + ' ' + hrAdvisor.lastName,
    },
    referralPreferences: {
      completed: countCompletedItems(profileData.referralPreferences),
      total: Object.keys(profileData.referralPreferences).length,
      languageReferralTypes: languageReferralTypes?.map((l) => l?.name),
      classifications: classifications?.map((c) => c?.name),
      workLocationCities: cities?.map((city) => city?.province.name + ' - ' + city?.name),
      referralAvailibility: profileData.referralPreferences.availableForReferralInd,
      alternateOpportunity: profileData.referralPreferences.interestedInAlternationInd,
      employmentTenures: employmentTenures?.map((e) => e?.name),
    },
    lastUpdated: profileData.dateUpdated ?? '0000-00-00',
    lastUpdatedBy: profileData.userUpdated ?? 'Unknown User',
  };
}

export default function EditProfile({ loaderData, params }: Route.ComponentProps) {
  const { t } = useTranslation(handle.i18nNamespace);
  const navigation = useNavigation();

  return (
    <div className="space-y-8">
      <div className="space-y-4 py-8 text-white">
        {!loaderData.personalInformation.completed ||
        !loaderData.employmentInformation.completed ||
        !loaderData.referralPreferences.completed
          ? InProgressTag()
          : CompleteTag()}
        <h1 className="mt-6 text-3xl font-semibold">{loaderData.name}</h1>
        {loaderData.email && <p className="mt-1">{loaderData.email}</p>}
        <p className="font-normal text-[#9FA3AD]">
          {t('app:profile.last-updated', { date: loaderData.lastUpdated, name: loaderData.lastUpdatedBy })}
        </p>
        <div
          role="presentation"
          className="absolute top-0 left-0 -z-10 h-60 w-full scale-x-[-1] bg-[rgba(9,28,45,1)] bg-[url('/VacMan-design-element-06.svg')] bg-size-[450px] bg-left-bottom bg-no-repeat"
        />
      </div>
      <div className="justify-between md:grid md:grid-cols-2">
        <div className="max-w-prose">
          <p className="mt-12">{t('app:profile.about-para-1')}</p>
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

      <Progress className="mt-8 mb-8" label={t('app:profile.profile-completion-progress')} value={loaderData.amountCompleted} />
      <div className="mt-8 max-w-prose space-y-10">
        <ProfileCard
          title={t('app:profile.personal-information.title')}
          linkLabel={t('app:profile.personal-information.link-label')}
          file="routes/employee/[id]/profile/personal-information.tsx"
          completed={loaderData.personalInformation.completed}
          total={loaderData.personalInformation.total}
          params={params}
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
              <DescriptionListItem term={t('app:personal-information.additional-information')}>
                {loaderData.personalInformation.additionalInformation ?? t('app:profile.not-provided')}
              </DescriptionListItem>
            </DescriptionList>
          )}
        </ProfileCard>
        <ProfileCard
          title={t('app:profile.employment.title')}
          linkLabel={t('app:profile.employment.link-label')}
          file="routes/employee/[id]/profile/employment-information.tsx"
          completed={loaderData.employmentInformation.completed}
          total={loaderData.employmentInformation.total}
          params={params}
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
          file="routes/employee/[id]/profile/referral-preferences.tsx"
          completed={loaderData.referralPreferences.completed}
          total={loaderData.referralPreferences.total}
          params={params}
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
                {loaderData.referralPreferences.classifications === undefined
                  ? t('app:profile.not-provided')
                  : loaderData.referralPreferences.classifications.length > 0 &&
                    loaderData.referralPreferences.classifications.join(', ')}
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
  params?: Params;
}

function ProfileCard({ title, linkLabel, file, completed, total, required, children, params }: ProfileCardProps): JSX.Element {
  const { t } = useTranslation(handle.i18nNamespace);
  const inProgress = completed < total && completed > 0;
  const isComplete = completed === total;
  const labelPrefix = `${inProgress || isComplete ? t('app:profile.edit') : t('app:profile.add')}\u0020`;
  return (
    <Card className="p-4 sm:p-6">
      <CardHeader className="p-0">
        <div className="mb-6 grid grid-cols-2 justify-between select-none">
          <div>
            <FieldsCompletedTag completed={completed} total={total} />
          </div>
          <div className="ml-auto space-x-2">
            {isComplete ? (
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
        {inProgress || isComplete ? <FontAwesomeIcon icon={faPenToSquare} /> : <FontAwesomeIcon icon={faPlus} />}
        <InlineLink className="font-semibold" file={file} params={params}>
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
    <span className="flex w-fit items-center gap-2 rounded-2xl border border-green-600 bg-green-600 px-3 py-0.5 text-sm font-semibold text-white">
      <FontAwesomeIcon icon={faCheck} />
      {t('app:profile.complete')}
    </span>
  );
}

function InProgressTag(): JSX.Element {
  const { t } = useTranslation(handle.i18nNamespace);

  return (
    <span className="w-fit rounded-2xl border border-blue-400 bg-blue-100 px-3 py-0.5 text-sm font-semibold text-blue-800">
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
