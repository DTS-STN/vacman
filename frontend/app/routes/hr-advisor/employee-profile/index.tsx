import type { Ref, JSX, ReactNode } from 'react';
import { useRef } from 'react';

import type { Params, RouteHandle } from 'react-router';
import { Form, useActionData, useNavigation } from 'react-router';

import { faCheck, faPenToSquare, faTriangleExclamation } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useTranslation } from 'react-i18next';

import type { Route } from '../employee-profile/+types/index';

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
import { countCompletedItems, omitObjectProperties } from '~/.server/utils/profile-utils';
import { AlertMessage } from '~/components/alert-message';
import { Button } from '~/components/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '~/components/card';
import { DescriptionList, DescriptionListItem } from '~/components/description-list';
import { InlineLink } from '~/components/links';
import { EMPLOYEE_WFA_STATUS } from '~/domain/constants';
import { getTranslation } from '~/i18n-config.server';
import type { I18nRouteFile } from '~/i18n-routes';
import { handle as parentHandle } from '~/routes/layout';
import { formatDateTime } from '~/utils/date-utils';
import { cn } from '~/utils/tailwind-utils';

export const handle = {
  i18nNamespace: [...parentHandle.i18nNamespace],
} as const satisfies RouteHandle;

export function meta({ data }: Route.MetaArgs) {
  return [{ title: data?.documentTitle }];
}

export async function action({ context, request }: Route.ActionArgs) {
  // Get the current user's ID from the authenticated session
  const authenticatedSession = context.session as AuthenticatedSession;
  const currentUserId = authenticatedSession.authState.idTokenClaims.oid as string;

  const profileResult = await getProfileService().getProfile(currentUserId);
  if (profileResult.isNone()) {
    return { status: 'profile-not-found' };
  }

  const profileData: Profile = profileResult.unwrap();
  const allWfaStatus = await getWFAStatuses().listAll();

  const requiredPersonalInformation = omitObjectProperties(profileData.personalInformation, [
    'workPhone',
    'additionalInformation',
  ]);
  const validWFAStatusesForOptionalDate = [EMPLOYEE_WFA_STATUS.affected] as const;
  const selectedValidWfaStatusesForOptionalDate = allWfaStatus
    .filter((c) => validWFAStatusesForOptionalDate.toString().includes(c.code))
    .map((status) => ({
      id: status.id.toString(),
      code: status.code,
      nameEn: status.nameEn,
      nameFr: status.nameFr,
    }));
  const isWfaDateOptional = selectedValidWfaStatusesForOptionalDate.some(
    (status) => String(status.id) === profileData.employmentInformation.wfaStatus,
  );
  const requiredEmploymentInformation = isWfaDateOptional
    ? omitObjectProperties(profileData.employmentInformation, ['wfaEndDate', 'wfaEffectiveDate']) // If status is "Affected", omit the effective date
    : omitObjectProperties(profileData.employmentInformation, ['wfaEndDate']);

  // Check if all sections are complete
  const personalInfoComplete =
    countCompletedItems(requiredPersonalInformation) === Object.keys(requiredPersonalInformation).length;
  const employmentInfoComplete =
    countCompletedItems(requiredEmploymentInformation) === Object.keys(requiredEmploymentInformation).length;
  const referralComplete =
    countCompletedItems(profileData.referralPreferences) === Object.keys(profileData.referralPreferences).length;

  // If any section is incomplete, return incomplete state
  if (!personalInfoComplete || !employmentInfoComplete || !referralComplete) {
    return {
      personalInfoComplete,
      employmentInfoComplete,
      referralComplete,
      status: 'incomplete',
    };
  }

  // If all complete, submit for review
  const submitResult = await getProfileService().submitProfileForReview(currentUserId);
  if (submitResult.isErr()) {
    throw submitResult.unwrap();
  }

  return {
    status: 'submitted',
    profileStatus: submitResult.unwrap().status,
  };
}

export async function loader({ context, request, params }: Route.LoaderArgs) {
  // Use the id parameter from the URL to fetch the profile
  const profileUserId = params.id;

  const { lang, t } = await getTranslation(request, handle.i18nNamespace);

  // Fetch both the profile user and the profile data
  const [
    profileResult,
    allLocalizedLanguageReferralTypes,
    allClassifications,
    allLocalizedCities,
    allLocalizedEmploymentTenures,
  ] = await Promise.all([
    getProfileService().getProfile(profileUserId),
    getLanguageReferralTypeService().listAllLocalized(lang),
    getClassificationService().listAllLocalized(lang),
    getCityService().listAllLocalized(lang),
    getEmploymentTenureService().listAllLocalized(lang),
    getWFAStatuses().listAll(),
  ]);

  if (profileResult.isNone()) {
    throw new Response('Profile not found', { status: 404 });
  }

  const profileData: Profile = profileResult.unwrap();

  const profileUpdatedByUser = profileData.userUpdated
    ? await getUserService().getUserByActiveDirectoryId(profileData.userUpdated)
    : undefined;
  const profileUpdatedByUserName = profileUpdatedByUser && `${profileUpdatedByUser.firstName} ${profileUpdatedByUser.lastName}`;

  const preferredLanguageResult =
    profileData.personalInformation.preferredLanguageId &&
    (await getLanguageForCorrespondenceService().findLocalizedById(profileData.personalInformation.preferredLanguageId, lang));
  const workUnitResult =
    profileData.employmentInformation.directorate &&
    (await getDirectorateService().findLocalizedById(profileData.employmentInformation.directorate, lang));
  const substantivePositionResult =
    profileData.employmentInformation.substantivePosition &&
    (await getClassificationService().findLocalizedById(profileData.employmentInformation.substantivePosition, lang));
  const cityResult =
    profileData.employmentInformation.cityId &&
    (await getCityService().findLocalizedById(profileData.employmentInformation.cityId, lang));
  const wfaStatusResult =
    profileData.employmentInformation.wfaStatus &&
    (await getWFAStatuses().findLocalizedById(profileData.employmentInformation.wfaStatus, lang));

  // convert the IDs to display names
  const preferredLanguage =
    preferredLanguageResult && preferredLanguageResult.isSome() ? preferredLanguageResult.unwrap().name : undefined;
  const substantivePosition =
    substantivePositionResult && substantivePositionResult.isSome() ? substantivePositionResult.unwrap().name : undefined;
  const branchOrServiceCanadaRegion =
    workUnitResult && workUnitResult.isSome() ? workUnitResult.unwrap().parent.name : undefined;
  const directorate = workUnitResult && workUnitResult.isSome() ? workUnitResult.unwrap().name : undefined;
  const city = cityResult && cityResult.isSome() ? cityResult.unwrap() : undefined;
  const wfaStatus = wfaStatusResult ? (wfaStatusResult.isSome() ? wfaStatusResult.unwrap() : undefined) : undefined;
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
    name: `${profileData.personalInformation.givenName} ${profileData.personalInformation.surname}`,
    email: profileData.personalInformation.workEmail,
    isProfilePendingApproval: true, //TODO: add logic for approval status
    personalInformation: {
      personalRecordIdentifier: profileData.personalInformation.personalRecordIdentifier,
      preferredLanguage: preferredLanguage,
      workEmail: profileData.personalInformation.workEmail,
      personalEmail: profileData.personalInformation.personalEmail,
      workPhone: profileData.personalInformation.workPhone,
      personalPhone: profileData.personalInformation.personalPhone,
      additionalInformation: profileData.personalInformation.additionalInformation,
    },
    employmentInformation: {
      substantivePosition: substantivePosition,
      branchOrServiceCanadaRegion: branchOrServiceCanadaRegion,
      directorate: directorate,
      province: city?.province.name,
      city: city?.name,
      wfaStatus: wfaStatus?.name,
      wfaStatusCode: wfaStatus?.code,
      wfaEffectiveDate: profileData.employmentInformation.wfaEffectiveDate,
      wfaEndDate: profileData.employmentInformation.wfaEndDate,
      hrAdvisor: hrAdvisor && hrAdvisor.firstName + ' ' + hrAdvisor.lastName,
    },
    referralPreferences: {
      languageReferralTypes: languageReferralTypes?.map((l) => l?.name),
      classifications: classifications?.map((c) => c?.name),
      workLocationCities: cities?.map((city) => city?.province.name + ' - ' + city?.name),
      referralAvailibility: profileData.referralPreferences.availableForReferralInd,
      alternateOpportunity: profileData.referralPreferences.interestedInAlternationInd,
      employmentTenures: employmentTenures?.map((e) => e?.name),
    },
    lastUpdated: profileData.dateUpdated ? formatDateTime(profileData.dateUpdated) : '0000-00-00 00:00',
    lastUpdatedBy: profileUpdatedByUserName ?? 'Unknown User',
  };
}

export default function EditProfile({ loaderData, params }: Route.ComponentProps) {
  const { t } = useTranslation(handle.i18nNamespace);
  const navigation = useNavigation();
  const actionData = useActionData();

  const alertRef = useRef<HTMLDivElement>(null);

  if (actionData && alertRef.current) {
    alertRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  return (
    <div className="space-y-8">
      <div className="space-y-4 py-8 text-white">
        {loaderData.isProfilePendingApproval ? ApprovedTag() : PendingApprovalTag()}{' '}
        {/*TODO: Show profile status instead of the Complete */}
        <h1 className="mt-6 text-3xl font-semibold">{loaderData.name}</h1>
        {loaderData.email && <p className="mt-1">{loaderData.email}</p>}
        <p className="font-normal text-[#9FA3AD]">
          {t('app:employee-profile.last-updated', { date: loaderData.lastUpdated, name: loaderData.lastUpdatedBy })}
        </p>
        <div
          role="presentation"
          className="absolute top-0 left-0 -z-10 h-60 w-full scale-x-[-1] bg-[rgba(9,28,45,1)] bg-[url('/VacMan-design-element-06.svg')] bg-size-[450px] bg-left-bottom bg-no-repeat"
        />
      </div>
      <div className="justify-between md:grid md:grid-cols-2">
        <div className="max-w-prose">
          <InlineLink className="mt-6 block" file="routes/hr-advisor/employees.tsx" params={params} id="back-button">
            {`< ${t('app:employee-profile.back')}`}
          </InlineLink>
          <p className="mt-12">{t('app:employee-profile.about-para-1')}</p>
        </div>
      </div>

      {actionData && (
        <AlertMessage
          ref={alertRef}
          type={loaderData.isProfilePendingApproval ? 'success' : 'error'}
          message={
            loaderData.isProfilePendingApproval
              ? t('app:employee-profile.profile-submitted')
              : t('app:employee-profile.profile-incomplete')
          }
        />
      )}
      <div className="mt-8 max-w-prose space-y-10">
        <ProfileCard
          title={t('app:employee-profile.personal-information.title')}
          linkLabel={t('app:employee-profile.personal-information.link-label')}
          file="routes/hr-advisor/employee-profile/personal-information.tsx"
          params={params}
          errorState={actionData?.personalInfoComplete === false}
        >
          <DescriptionList>
            <DescriptionListItem term={t('app:personal-information.personal-record-identifier')}>
              {loaderData.personalInformation.personalRecordIdentifier ?? t('app:employee-profile.not-provided')}
            </DescriptionListItem>
            <DescriptionListItem term={t('app:personal-information.preferred-language')}>
              {loaderData.personalInformation.preferredLanguage ?? t('app:employee-profile.not-provided')}
            </DescriptionListItem>
            <DescriptionListItem term={t('app:personal-information.work-email')}>
              {loaderData.personalInformation.workEmail}
            </DescriptionListItem>
            <DescriptionListItem term={t('app:personal-information.personal-email')}>
              {loaderData.personalInformation.personalEmail ?? t('app:employee-profile.not-provided')}
            </DescriptionListItem>
            <DescriptionListItem term={t('app:personal-information.work-phone')}>
              {loaderData.personalInformation.workPhone ?? t('app:employee-profile.not-provided')}
            </DescriptionListItem>
            <DescriptionListItem term={t('app:personal-information.personal-phone')}>
              {loaderData.personalInformation.personalPhone ?? t('app:employee-profile.not-provided')}
            </DescriptionListItem>
            <DescriptionListItem term={t('app:personal-information.additional-information')}>
              {loaderData.personalInformation.additionalInformation ?? t('app:employee-profile.not-provided')}
            </DescriptionListItem>
          </DescriptionList>
        </ProfileCard>
        <ProfileCard
          title={t('app:employee-profile.employment.title')}
          linkLabel={t('app:employee-profile.employment.link-label')}
          file="routes/hr-advisor/employee-profile/employment-information.tsx"
          params={params}
          errorState={actionData?.employmentInfoComplete === false}
        >
          <>
            <h3 className="font-lato text-xl font-bold">{t('app:employment-information.substantive-position-heading')}</h3>
            <DescriptionList>
              <DescriptionListItem term={t('app:employment-information.substantive-position-group-and-level')}>
                {loaderData.employmentInformation.substantivePosition ?? t('app:employee-profile.not-provided')}
              </DescriptionListItem>
              <DescriptionListItem term={t('app:employment-information.branch-or-service-canada-region')}>
                {loaderData.employmentInformation.branchOrServiceCanadaRegion ?? t('app:employee-profile.not-provided')}
              </DescriptionListItem>
              <DescriptionListItem term={t('app:employment-information.directorate')}>
                {loaderData.employmentInformation.directorate ?? t('app:employee-profile.not-provided')}
              </DescriptionListItem>
              <DescriptionListItem term={t('app:employment-information.provinces')}>
                {loaderData.employmentInformation.province ?? t('app:employee-profile.not-provided')}
              </DescriptionListItem>
              <DescriptionListItem term={t('app:employment-information.city')}>
                {loaderData.employmentInformation.city ?? t('app:employee-profile.not-provided')}
              </DescriptionListItem>
            </DescriptionList>
            <h3 className="font-lato text-xl font-bold">{t('app:employment-information.wfa-detils-heading')}</h3>
            <DescriptionList>
              <DescriptionListItem term={t('app:employment-information.wfa-status')}>
                {loaderData.employmentInformation.wfaStatus ?? t('app:employee-profile.not-provided')}
              </DescriptionListItem>
              {(loaderData.employmentInformation.wfaStatusCode === EMPLOYEE_WFA_STATUS.opting ||
                loaderData.employmentInformation.wfaStatusCode === EMPLOYEE_WFA_STATUS.surplusGRJO ||
                loaderData.employmentInformation.wfaStatusCode === EMPLOYEE_WFA_STATUS.surplusOptingOptionA) && (
                <>
                  <DescriptionListItem term={t('app:employment-information.wfa-effective-date')}>
                    {loaderData.employmentInformation.wfaEffectiveDate ?? t('app:employee-profile.not-provided')}
                  </DescriptionListItem>
                  <DescriptionListItem term={t('app:employment-information.wfa-end-date')}>
                    {loaderData.employmentInformation.wfaEndDate ?? t('app:employee-profile.not-provided')}
                  </DescriptionListItem>
                </>
              )}
              <DescriptionListItem term={t('app:employment-information.hr-advisor')}>
                {loaderData.employmentInformation.hrAdvisor ?? t('app:employee-profile.not-provided')}
              </DescriptionListItem>
            </DescriptionList>
          </>
        </ProfileCard>
        <ProfileCard
          title={t('app:employee-profile.referral.title')}
          linkLabel={t('app:employee-profile.referral.link-label')}
          file="routes/hr-advisor/employee-profile/referral-preferences.tsx"
          params={params}
          errorState={actionData?.referralComplete === false}
        >
          <DescriptionList>
            <DescriptionListItem term={t('app:referral-preferences.language-referral-type')}>
              {loaderData.referralPreferences.languageReferralTypes === undefined
                ? t('app:employee-profile.not-provided')
                : loaderData.referralPreferences.languageReferralTypes.length > 0 &&
                  loaderData.referralPreferences.languageReferralTypes.join(', ')}
            </DescriptionListItem>
            <DescriptionListItem term={t('app:referral-preferences.classification')}>
              {loaderData.referralPreferences.classifications === undefined
                ? t('app:employee-profile.not-provided')
                : loaderData.referralPreferences.classifications.length > 0 &&
                  loaderData.referralPreferences.classifications.join(', ')}
            </DescriptionListItem>
            <DescriptionListItem term={t('app:referral-preferences.work-location')}>
              {loaderData.referralPreferences.workLocationCities === undefined
                ? t('app:employee-profile.not-provided')
                : loaderData.referralPreferences.workLocationCities.length > 0 &&
                  loaderData.referralPreferences.workLocationCities.join(', ')}
            </DescriptionListItem>
            <DescriptionListItem term={t('app:referral-preferences.referral-availibility')}>
              {loaderData.referralPreferences.referralAvailibility === undefined
                ? t('app:employee-profile.not-provided')
                : loaderData.referralPreferences.referralAvailibility
                  ? t('gcweb:input-option.yes')
                  : t('gcweb:input-option.no')}
            </DescriptionListItem>
            <DescriptionListItem term={t('app:referral-preferences.alternate-opportunity')}>
              {loaderData.referralPreferences.alternateOpportunity === undefined
                ? t('app:employee-profile.not-provided')
                : loaderData.referralPreferences.alternateOpportunity
                  ? t('gcweb:input-option.yes')
                  : t('gcweb:input-option.no')}
            </DescriptionListItem>
            <DescriptionListItem term={t('app:referral-preferences.employment-tenure')}>
              {loaderData.referralPreferences.employmentTenures === undefined
                ? t('app:employee-profile.not-provided')
                : loaderData.referralPreferences.employmentTenures.length > 0 &&
                  loaderData.referralPreferences.employmentTenures.join(', ')}
            </DescriptionListItem>
          </DescriptionList>
        </ProfileCard>
      </div>
      <Form className="mt-6 flex place-content-start space-x-5 md:mt-auto" method="post" noValidate>
        <Button name="action" variant="primary" id="submit" disabled={navigation.state !== 'idle'}>
          {t('app:form.approve')}
        </Button>
      </Form>
    </div>
  );
}

interface ProfileCardProps {
  title: string;
  linkLabel: string;
  file: I18nRouteFile;
  children: ReactNode;
  params?: Params;
  errorState?: boolean;
  ref?: Ref<HTMLDivElement>;
}

// TODO: Consider moving this to a separate file as a reusable component
function ProfileCard({ title, linkLabel, file, errorState, children, params, ref }: ProfileCardProps): JSX.Element {
  const { t } = useTranslation(handle.i18nNamespace);

  const labelPrefix = `${t('app:employee-profile.edit')}\u0020`;
  return (
    <Card ref={ref} className={`${errorState && 'border-b-6 border-[#C90101]'} rounded-md p-4 sm:p-6`}>
      <CardHeader className="p-0">
        <div className="mb-6 grid justify-between gap-2 select-none sm:grid-cols-2">
          <div>
            <CardTitle className="text-2xl">{title}</CardTitle>
          </div>
        </div>
      </CardHeader>
      <CardContent className="my-3 space-y-3 p-0">{children}</CardContent>
      <CardFooter
        className={cn(
          'mt-3',
          errorState ? 'bg-red-100' : 'bg-gray-100', // Add background
          '-mx-4 sm:-mx-6', // Pull horizontally to cancel parent padding
          '-mb-4 sm:-mb-6', // Pull down to cancel parent bottom padding
          'px-4 sm:px-6', // Add horizontal padding back for the content
          'py-4', // Add vertical padding for the contents
          'rounded-b-xs', // Re-apply bottom roundings
        )}
      >
        {errorState && <p className="pb-4 text-lg font-bold text-[#333333]">{t('app:employee-profile.field-incomplete')}</p>}
        <span className="flex items-center gap-x-2">
          {errorState && <FontAwesomeIcon icon={faTriangleExclamation} className="text-red-800" />}
          {!errorState && <FontAwesomeIcon icon={faPenToSquare} />}
          <InlineLink className={`${errorState && 'text-red-800'} font-semibold`} file={file} params={params}>
            {labelPrefix}
            {linkLabel}
          </InlineLink>
        </span>
      </CardFooter>
    </Card>
  );
}

function PendingApprovalTag(): JSX.Element {
  const { t } = useTranslation(handle.i18nNamespace);

  return (
    <span className="flex w-fit items-center gap-2 rounded-2xl border border-blue-400 bg-blue-100 px-3 py-0.5 text-sm font-semibold text-blue-800">
      <FontAwesomeIcon icon={faCheck} />
      {t('app:employee-profile.approved')}
    </span>
  );
}

function ApprovedTag(): JSX.Element {
  const { t } = useTranslation(handle.i18nNamespace);

  return (
    <span className="w-fit rounded-2xl border border-yellow-400 bg-yellow-100 px-3 py-0.5 text-sm font-semibold text-yellow-800">
      {t('app:employee-profile.pending')}
    </span>
  );
}
