import { useEffect, useRef, useState } from 'react';

import type { RouteHandle } from 'react-router';
import { Form, useActionData, useLocation, useNavigate, useNavigation, useSearchParams } from 'react-router';

import { useTranslation } from 'react-i18next';

import type { Route } from '../profile/+types/index';

import type { Profile } from '~/.server/domain/models';
import { getBranchService } from '~/.server/domain/services/branch-service';
import { getCityService } from '~/.server/domain/services/city-service';
import { getClassificationService } from '~/.server/domain/services/classification-service';
import { getDirectorateService } from '~/.server/domain/services/directorate-service';
import { getEmploymentTenureService } from '~/.server/domain/services/employment-tenure-service';
import { getLanguageForCorrespondenceService } from '~/.server/domain/services/language-for-correspondence-service';
import { getLanguageReferralTypeService } from '~/.server/domain/services/language-referral-type-service';
import { getProfileService } from '~/.server/domain/services/profile-service';
import { getProfileStatusService } from '~/.server/domain/services/profile-status-service';
import { getUserService } from '~/.server/domain/services/user-service';
import { getWFAStatuses } from '~/.server/domain/services/wfa-status-service';
import { requireAuthentication } from '~/.server/utils/auth-utils';
import { requirePrivacyConsentForOwnProfile } from '~/.server/utils/privacy-consent-utils';
import { countCompletedItems, omitObjectProperties } from '~/.server/utils/profile-utils';
import { AlertMessage } from '~/components/alert-message';
import { Button } from '~/components/button';
import { ButtonLink } from '~/components/button-link';
import { DescriptionList, DescriptionListItem } from '~/components/description-list';
import { ProfileCard } from '~/components/profile-card';
import { Progress } from '~/components/progress';
import { StatusTag } from '~/components/status-tag';
import { PROFILE_STATUS_CODE, EMPLOYEE_WFA_STATUS } from '~/domain/constants';
import { getTranslation } from '~/i18n-config.server';
import { handle as parentHandle } from '~/routes/layout';
import { formatDateTime } from '~/utils/date-utils';

export const handle = {
  i18nNamespace: [...parentHandle.i18nNamespace],
} as const satisfies RouteHandle;

export function meta({ loaderData }: Route.MetaArgs) {
  return [{ title: loaderData?.documentTitle }];
}

export async function action({ context, request }: Route.ActionArgs) {
  requireAuthentication(context.session, request);

  const profileResult = await getProfileService().getCurrentUserProfile(context.session.authState.accessToken);
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
      id: status.id,
      code: status.code,
      nameEn: status.nameEn,
      nameFr: status.nameFr,
    }));
  const isWfaDateOptional = selectedValidWfaStatusesForOptionalDate.some(
    (status) => status.id === profileData.employmentInformation.wfaStatus,
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
    };
  }

  // If all complete, submit for review
  const submitResult = await getProfileService().updateProfileStatus(
    context.session.authState.accessToken,
    profileData.userId.toString(),
    PROFILE_STATUS_CODE.pending,
  );
  if (submitResult.isErr()) {
    throw submitResult.unwrap();
  }

  return {
    status: 'submitted',
    profileStatus: submitResult.unwrap().id,
  };
}

export async function loader({ context, request, params }: Route.LoaderArgs) {
  requireAuthentication(context.session, request);
  await requirePrivacyConsentForOwnProfile(context.session, request);

  const profileResult = await getProfileService().getCurrentUserProfile(context.session.authState.accessToken);

  if (profileResult.isNone()) {
    throw new Response('Profile not found', { status: 404 });
  }

  const profileData: Profile = profileResult.unwrap();

  const { lang, t } = await getTranslation(request, handle.i18nNamespace);

  const url = new URL(request.url);
  const hasEmploymentChanged = url.searchParams.get('edited') === 'true';

  // Fetch both the profile user and the profile data
  const [
    currentUserResult,
    allLocalizedLanguageReferralTypes,
    allClassifications,
    allLocalizedCities,
    allLocalizedEmploymentTenures,
    allWfaStatus,
  ] = await Promise.all([
    getUserService().getUserById(profileData.userId, context.session.authState.accessToken),
    getLanguageReferralTypeService().listAllLocalized(lang),
    getClassificationService().listAllLocalized(lang),
    getCityService().listAllLocalized(lang),
    getEmploymentTenureService().listAllLocalized(lang),
    getWFAStatuses().listAll(),
  ]);

  // Extract the user from the result
  const currentUser = currentUserResult.isOk() ? currentUserResult.unwrap() : undefined;

  const profileUpdatedByUserResult = profileData.userUpdated
    ? await getUserService().getUserById(profileData.userId, context.session.authState.accessToken)
    : undefined;
  const profileUpdatedByUser = profileUpdatedByUserResult?.isOk() ? profileUpdatedByUserResult.unwrap() : undefined;
  const profileUpdatedByUserName = profileUpdatedByUser && `${profileUpdatedByUser.firstName} ${profileUpdatedByUser.lastName}`;
  const profileStatus = (await getProfileStatusService().findLocalizedById(profileData.profileStatus.id, lang)).unwrap();

  const preferredLanguageResult =
    profileData.personalInformation.preferredLanguage?.id !== undefined &&
    (await getLanguageForCorrespondenceService().findLocalizedById(profileData.personalInformation.preferredLanguage.id, lang));
  const workUnitResult =
    profileData.employmentInformation.directorate !== undefined &&
    (await getDirectorateService().findLocalizedById(profileData.employmentInformation.directorate, lang));
  const branchResult =
    profileData.employmentInformation.branchOrServiceCanadaRegion !== undefined &&
    !profileData.employmentInformation.directorate && // Only look up branch directly if there's no directorate
    (await getBranchService().findLocalizedById(profileData.employmentInformation.branchOrServiceCanadaRegion, lang));
  const substantivePositionResult =
    profileData.employmentInformation.substantivePosition !== undefined &&
    (await getClassificationService().findLocalizedById(profileData.employmentInformation.substantivePosition, lang));
  const cityResult =
    profileData.employmentInformation.cityId !== undefined &&
    (await getCityService().findLocalizedById(profileData.employmentInformation.cityId, lang));
  const wfaStatusResult =
    profileData.employmentInformation.wfaStatus !== undefined &&
    (await getWFAStatuses().findLocalizedById(profileData.employmentInformation.wfaStatus, lang));

  // convert the IDs to display names
  const preferredLanguage =
    preferredLanguageResult && preferredLanguageResult.isSome() ? preferredLanguageResult.unwrap().name : undefined;
  const substantivePosition =
    substantivePositionResult && substantivePositionResult.isSome() ? substantivePositionResult.unwrap().name : undefined;
  const branchOrServiceCanadaRegion =
    (workUnitResult && workUnitResult.isSome() ? workUnitResult.unwrap().parent?.name : undefined) ??
    (branchResult && branchResult.isSome() ? branchResult.unwrap().name : undefined);
  const directorate = workUnitResult && workUnitResult.isSome() ? workUnitResult.unwrap().name : undefined;
  const city = cityResult && cityResult.isSome() ? cityResult.unwrap() : undefined;
  const wfaStatus = wfaStatusResult ? (wfaStatusResult.isSome() ? wfaStatusResult.unwrap() : undefined) : undefined;
  const hrAdvisorResult = profileData.employmentInformation.hrAdvisor
    ? await getUserService().getUserById(profileData.employmentInformation.hrAdvisor, context.session.authState.accessToken)
    : undefined;
  const hrAdvisor = hrAdvisorResult?.isOk() ? hrAdvisorResult.unwrap() : undefined;
  const languageReferralTypes = profileData.referralPreferences.languageReferralTypeIds
    ?.map((langId) => allLocalizedLanguageReferralTypes.find((l) => l.id === langId))
    .filter(Boolean);
  const classifications = profileData.referralPreferences.classificationIds
    ?.map((classificationId) => allClassifications.find((c) => c.id === classificationId))
    .filter(Boolean);
  const cities = profileData.referralPreferences.workLocationCitiesIds
    ?.map((cityId) => allLocalizedCities.find((c) => c.id === cityId))
    .filter(Boolean);
  const employmentTenures = profileData.referralPreferences.employmentTenureIds
    ?.map((employmentTenureId) => allLocalizedEmploymentTenures.find((c) => c.id === employmentTenureId))
    .filter(Boolean);

  // Check each section if the required feilds are complete
  const requiredPersonalInformation = omitObjectProperties(profileData.personalInformation, [
    'workPhone',
    'additionalInformation',
  ]);
  const personalInformationCompleted = countCompletedItems(requiredPersonalInformation);
  const personalInformationTotalFeilds = Object.keys(requiredPersonalInformation).length;

  const validWFAStatusesForOptionalDate = [EMPLOYEE_WFA_STATUS.affected, EMPLOYEE_WFA_STATUS.exAffected] as const;
  const selectedValidWfaStatusesForOptionalDate = allWfaStatus
    .filter((c) => validWFAStatusesForOptionalDate.toString().includes(c.code))
    .map((status) => ({
      id: status.id,
      code: status.code,
      nameEn: status.nameEn,
      nameFr: status.nameFr,
    }));
  const isWfaDateOptional = selectedValidWfaStatusesForOptionalDate.some(
    (status) => status.id === profileData.employmentInformation.wfaStatus,
  );
  const requiredEmploymentInformation = isWfaDateOptional
    ? omitObjectProperties(profileData.employmentInformation, ['wfaEndDate', 'wfaEffectiveDate']) // If status is "Affected" or "Affected -EX", omit the effective date
    : omitObjectProperties(profileData.employmentInformation, ['wfaEndDate']);
  const employmentInformationCompleted = countCompletedItems(requiredEmploymentInformation);
  const employmentInformationTotalFields = Object.keys(requiredEmploymentInformation).length;

  const referralPreferencesCompleted = countCompletedItems(profileData.referralPreferences);
  const referralPreferencesTotalFields = Object.keys(profileData.referralPreferences).length;

  const isCompletePersonalInformation = personalInformationCompleted === personalInformationTotalFeilds;
  const isCompleteEmploymentInformation = employmentInformationCompleted === employmentInformationTotalFields;
  const isCompleteReferralPreferences = referralPreferencesCompleted === referralPreferencesTotalFields;

  const profileCompleted = personalInformationCompleted + employmentInformationCompleted + referralPreferencesCompleted;
  const profileTotalFields = personalInformationTotalFeilds + employmentInformationTotalFields + referralPreferencesTotalFields;
  const amountCompleted = (profileCompleted / profileTotalFields) * 100;

  return {
    documentTitle: t('app:profile.page-title'),
    name: currentUser ? `${currentUser.firstName} ${currentUser.lastName}` : '', //for first time employee login, the name is not in profile data
    email: currentUser?.businessEmail ?? profileData.personalInformation.workEmail, //for first time employee login, the work email is not in profile data
    amountCompleted: amountCompleted,
    isProfileComplete: isCompletePersonalInformation && isCompleteEmploymentInformation && isCompleteReferralPreferences,
    profileStatus,
    personalInformation: {
      isComplete: isCompletePersonalInformation,
      isNew: countCompletedItems(profileData.personalInformation) === 1, // only work email is available
      personalRecordIdentifier: profileData.personalInformation.personalRecordIdentifier,
      preferredLanguage: preferredLanguage,
      workEmail: currentUser?.businessEmail ?? profileData.personalInformation.workEmail,
      personalEmail: profileData.personalInformation.personalEmail,
      workPhone: currentUser?.businessPhone,
      personalPhone: profileData.personalInformation.personalPhone,
      additionalInformation: profileData.personalInformation.additionalInformation,
    },
    employmentInformation: {
      isComplete: isCompleteEmploymentInformation,
      isNew: countCompletedItems(profileData.employmentInformation) === 0,
      substantivePosition: substantivePosition,
      branchOrServiceCanadaRegion: branchOrServiceCanadaRegion,
      directorate: directorate,
      province: city?.provinceTerritory.name,
      city: city?.name,
      wfaStatus: wfaStatus?.name,
      wfaStatusCode: wfaStatus?.code,
      wfaEffectiveDate: profileData.employmentInformation.wfaEffectiveDate,
      wfaEndDate: profileData.employmentInformation.wfaEndDate,
      hrAdvisor: hrAdvisor && hrAdvisor.firstName + ' ' + hrAdvisor.lastName,
    },
    referralPreferences: {
      isComplete: isCompleteReferralPreferences,
      isNew: countCompletedItems(profileData.referralPreferences) === 0,
      languageReferralTypes: languageReferralTypes?.map((l) => l?.name),
      classifications: classifications?.map((c) => c?.name),
      workLocationCities: cities?.map((city) => city?.provinceTerritory.name + ' - ' + city?.name),
      referralAvailibility: profileData.referralPreferences.availableForReferralInd,
      alternateOpportunity: profileData.referralPreferences.interestedInAlternationInd,
      employmentTenures: employmentTenures?.map((e) => e?.name),
    },
    lastUpdated: profileData.dateUpdated ? formatDateTime(profileData.dateUpdated) : '0000-00-00 00:00',
    lastUpdatedBy: profileUpdatedByUserName ?? 'Unknown User',
    hasEmploymentChanged,
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

  const [searchParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();

  const [hasEmploymentChanged, setHasEmploymentChanged] = useState(loaderData.hasEmploymentChanged);

  // Clean the URL after reading the param
  useEffect(() => {
    if (searchParams.get('edited') === 'true') {
      setHasEmploymentChanged(true);
      const newUrl = location.pathname;
      void navigate(newUrl, { replace: true });
    }
  }, [searchParams, location.pathname, navigate]);

  return (
    <div className="space-y-8">
      <div className="space-y-4 py-8 text-white">
        <StatusTag status={{ code: loaderData.profileStatus.code, name: loaderData.profileStatus.name }} />
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
          <p className="mt-12">
            {loaderData.profileStatus.code === PROFILE_STATUS_CODE.pending
              ? t('app:profile.about-para-1-pending')
              : t('app:profile.about-para-1')}
          </p>
          <p className="mt-4">{t('app:profile.about-para-2')}</p>
        </div>
        <Form className="mt-6 flex place-content-end space-x-5 md:mt-auto" method="post" noValidate>
          <ButtonLink variant="alternative" file="routes/employee/index.tsx" id="save" disabled={navigation.state !== 'idle'}>
            {t('app:form.save-and-exit')}
          </ButtonLink>
          {loaderData.profileStatus.code === PROFILE_STATUS_CODE.incomplete && (
            <Button name="action" variant="primary" id="submit" disabled={navigation.state !== 'idle'}>
              {t('app:form.submit')}
            </Button>
          )}
        </Form>
      </div>

      {actionData && (
        <AlertMessage
          ref={alertRef}
          type={loaderData.isProfileComplete ? 'success' : 'error'}
          message={loaderData.isProfileComplete ? t('app:profile.profile-submitted') : t('app:profile.profile-incomplete')}
        />
      )}

      {hasEmploymentChanged && <AlertMessage ref={alertRef} type="info" message={t('app:profile.profile-pending-approval')} />}

      {loaderData.profileStatus.code === PROFILE_STATUS_CODE.incomplete && (
        <Progress
          className="mt-8 mb-8"
          label={t('app:profile.profile-completion-progress')}
          value={loaderData.amountCompleted}
        />
      )}
      <div className="mt-8 max-w-prose space-y-10">
        <ProfileCard
          title={t('app:profile.personal-information.title')}
          linkLabel={t('app:profile.personal-information.link-label')}
          file="routes/employee/profile/personal-information.tsx"
          isComplete={loaderData.personalInformation.isComplete}
          isNew={loaderData.personalInformation.isNew}
          params={params}
          errorState={actionData?.personalInfoComplete === false}
          required
          showStatus
        >
          {loaderData.personalInformation.isNew ? (
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
          file="routes/employee/profile/employment-information.tsx"
          isComplete={loaderData.employmentInformation.isComplete}
          isNew={loaderData.employmentInformation.isNew}
          params={params}
          required
          errorState={actionData?.employmentInfoComplete === false}
          showStatus
        >
          {loaderData.employmentInformation.isNew ? (
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
                {(loaderData.employmentInformation.wfaStatusCode === EMPLOYEE_WFA_STATUS.opting ||
                  loaderData.employmentInformation.wfaStatusCode === EMPLOYEE_WFA_STATUS.surplusGRJO ||
                  loaderData.employmentInformation.wfaStatusCode === EMPLOYEE_WFA_STATUS.surplusOptingOptionA ||
                  loaderData.employmentInformation.wfaStatusCode === EMPLOYEE_WFA_STATUS.exOpting ||
                  loaderData.employmentInformation.wfaStatusCode === EMPLOYEE_WFA_STATUS.exSurplusCPA) && (
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
          isComplete={loaderData.referralPreferences.isComplete}
          isNew={loaderData.referralPreferences.isNew}
          params={params}
          required
          errorState={actionData?.referralComplete === false}
          showStatus
        >
          {loaderData.referralPreferences.isNew ? (
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
