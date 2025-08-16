import { useEffect, useRef, useState } from 'react';

import type { RouteHandle } from 'react-router';
import { Form, useActionData, useLocation, useNavigate, useNavigation, useSearchParams } from 'react-router';

import { useTranslation } from 'react-i18next';

import type { Route } from '../profile/+types/index';

import { getCityService } from '~/.server/domain/services/city-service';
import { getClassificationService } from '~/.server/domain/services/classification-service';
import { getDirectorateService } from '~/.server/domain/services/directorate-service';
import { getEmploymentOpportunityTypeService } from '~/.server/domain/services/employment-opportunity-type-service';
import { getLanguageReferralTypeService } from '~/.server/domain/services/language-referral-type-service';
import { getProfileService } from '~/.server/domain/services/profile-service';
import { getProfileStatusService } from '~/.server/domain/services/profile-status-service';
import { getUserService } from '~/.server/domain/services/user-service';
import { getWFAStatuses } from '~/.server/domain/services/wfa-status-service';
import { requireAuthentication } from '~/.server/utils/auth-utils';
import { requirePrivacyConsentForOwnProfile } from '~/.server/utils/privacy-consent-utils';
import { countCompletedItems, countReferralPreferencesCompleted, omitObjectProperties } from '~/.server/utils/profile-utils';
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
  return [{ title: loaderData.documentTitle }];
}

export async function action({ context, request }: Route.ActionArgs) {
  requireAuthentication(context.session, request);

  const profileParams = { active: true };
  const profileData = await getProfileService().findCurrentUserProfile(profileParams, context.session.authState.accessToken);
  const allWfaStatus = await getWFAStatuses().listAll();

  // For personal information, check required fields directly on profile
  const requiredPersonalFields = {
    personalEmailAddress: profileData.personalEmailAddress,
    personalPhoneNumber: profileData.personalPhoneNumber,
  };
  const validWFAStatusesForOptionalDate = [EMPLOYEE_WFA_STATUS.affected, EMPLOYEE_WFA_STATUS.exAffected] as const;
  const selectedValidWfaStatusesForOptionalDate = allWfaStatus
    .filter((c) => validWFAStatusesForOptionalDate.toString().includes(c.code))
    .map((status) => ({
      id: status.id,
      code: status.code,
      nameEn: status.nameEn,
      nameFr: status.nameFr,
    }));
  const isWfaDateOptional = selectedValidWfaStatusesForOptionalDate.some((status) => status.id === profileData.wfaStatus?.id);
  // For employment information, check required fields directly on profile
  const requiredEmploymentFields = {
    substantiveClassification: profileData.substantiveClassification,
    substantiveWorkUnit: profileData.substantiveWorkUnit,
    substantiveCity: profileData.substantiveCity,
    wfaStatus: profileData.wfaStatus,
    hrAdvisorId: profileData.hrAdvisorId,
    ...(isWfaDateOptional ? {} : { wfaStartDate: profileData.wfaStartDate }),
  };

  // For referral preferences, use the correct property names from Profile type
  const referralPreferencesFields = {
    preferredLanguages: profileData.preferredLanguages,
    preferredClassifications: profileData.preferredClassifications,
    preferredCities: profileData.preferredCities,
    isAvailableForReferral: profileData.isAvailableForReferral,
    isInterestedInAlternation: profileData.isInterestedInAlternation,
    preferredEmploymentOpportunities: profileData.preferredEmploymentOpportunities,
  };

  // Check if all sections are complete
  const personalInfoComplete = countCompletedItems(requiredPersonalFields) === Object.keys(requiredPersonalFields).length;
  const employmentInfoComplete = countCompletedItems(requiredEmploymentFields) === Object.keys(requiredEmploymentFields).length;
  const referralComplete =
    countReferralPreferencesCompleted(referralPreferencesFields) === Object.keys(referralPreferencesFields).length;

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
    profileData.id,
    {
      code: PROFILE_STATUS_CODE.pending,
    },
    context.session.authState.accessToken,
  );
  if (submitResult.isErr()) {
    throw submitResult.unwrap();
  }

  return {
    status: 'submitted',
    profileStatus: submitResult.unwrap(),
  };
}

export async function loader({ context, request, params }: Route.LoaderArgs) {
  requireAuthentication(context.session, request);
  await requirePrivacyConsentForOwnProfile(context.session, request);

  const profileParams = { active: true };
  const profileData = await getProfileService().findCurrentUserProfile(profileParams, context.session.authState.accessToken);

  const { lang, t } = await getTranslation(request, handle.i18nNamespace);

  const url = new URL(request.url);
  const hasEmploymentChanged = url.searchParams.get('edited') === 'true';

  // Use the profile user data directly instead of fetching it separately
  const currentUser = profileData.profileUser;

  // Fetch reference data
  const [
    allLocalizedLanguageReferralTypes,
    allClassifications,
    allLocalizedCities,
    allLocalizedEmploymentOpportunities,
    allWfaStatus,
  ] = await Promise.all([
    getLanguageReferralTypeService().listAllLocalized(lang),
    getClassificationService().listAllLocalized(lang),
    getCityService().listAllLocalized(lang),
    getEmploymentOpportunityTypeService().listAllLocalized(lang),
    getWFAStatuses().listAll(),
  ]);

  // Use profileUser for updated by information as well
  const profileUpdatedByUserName = `${currentUser.firstName ?? 'Unknown'} ${currentUser.lastName ?? 'User'}`;
  const profileStatus = profileData.profileStatus
    ? (await getProfileStatusService().findLocalizedById(profileData.profileStatus.id, lang)).unwrap()
    : { code: PROFILE_STATUS_CODE.incomplete, name: 'Incomplete' };
  const workUnitResult =
    profileData.substantiveWorkUnit !== undefined
      ? await getDirectorateService().findLocalizedById(profileData.substantiveWorkUnit.id, lang)
      : undefined;
  const substantivePositionResult =
    profileData.substantiveClassification !== undefined
      ? await getClassificationService().findLocalizedById(profileData.substantiveClassification.id, lang)
      : undefined;
  const cityResult =
    profileData.substantiveCity !== undefined
      ? await getCityService().findLocalizedById(profileData.substantiveCity.id, lang)
      : undefined;

  // convert the IDs to display names
  const substantivePosition = substantivePositionResult?.into()?.name;
  const branchOrServiceCanadaRegion = workUnitResult?.into()?.parent?.name;
  const directorate = workUnitResult?.into()?.name;
  const city = cityResult?.into();
  const hrAdvisorResult = profileData.hrAdvisorId
    ? await getUserService().getUserById(profileData.hrAdvisorId, context.session.authState.accessToken)
    : undefined;
  const hrAdvisor = hrAdvisorResult?.into();
  const languageReferralTypes = profileData.preferredLanguages
    ?.map((lang) => allLocalizedLanguageReferralTypes.find((l) => l.id === lang.id))
    .filter(Boolean);
  const classifications = profileData.preferredClassifications
    ?.map((classification) => allClassifications.find((c) => c.id === classification.id))
    .filter(Boolean);
  const cities = profileData.preferredCities?.map((city) => allLocalizedCities.find((c) => c.id === city.id)).filter(Boolean);
  const employmentOpportunities = profileData.preferredEmploymentOpportunities
    ?.map((employmentOpportunity) => allLocalizedEmploymentOpportunities.find((c) => c.id === employmentOpportunity.id))
    .filter(Boolean);

  // Check each section if the required fields are complete
  // Personal information from Profile type
  const personalInformationData = {
    personalEmailAddress: profileData.personalEmailAddress,
    personalPhoneNumber: profileData.personalPhoneNumber,
  };
  const requiredPersonalInformation = personalInformationData;
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

  const isWfaDateOptional = selectedValidWfaStatusesForOptionalDate.some((status) => status.id === profileData.wfaStatus?.id);

  // Employment information from Profile type
  const employmentInformationData = {
    substantiveClassification: profileData.substantiveClassification,
    substantiveCity: profileData.substantiveCity,
    substantiveWorkUnit: profileData.substantiveWorkUnit,
    wfaStatus: profileData.wfaStatus,
    wfaStartDate: profileData.wfaStartDate,
    wfaEndDate: profileData.wfaEndDate,
  };

  const requiredEmploymentInformation = isWfaDateOptional
    ? omitObjectProperties(employmentInformationData, ['wfaEndDate', 'wfaStartDate']) // If status is "Affected" or "Affected -EX", omit the effective date
    : omitObjectProperties(employmentInformationData, ['wfaEndDate']);

  const employmentInformationCompleted = countCompletedItems(requiredEmploymentInformation);
  const employmentInformationTotalFields = Object.keys(requiredEmploymentInformation).length;

  // Referral preferences from Profile type
  // Create an object with all required fields, ensuring they exist even if undefined
  const referralPreferencesFields = {
    preferredLanguages: profileData.preferredLanguages,
    preferredClassifications: profileData.preferredClassifications,
    preferredCities: profileData.preferredCities,
    isAvailableForReferral: profileData.isAvailableForReferral,
    isInterestedInAlternation: profileData.isInterestedInAlternation,
    preferredEmploymentOpportunities: profileData.preferredEmploymentOpportunities,
  };

  const referralPreferencesCompleted = countReferralPreferencesCompleted(referralPreferencesFields);
  const referralPreferencesTotalFields = Object.keys(referralPreferencesFields).length;

  const isCompletePersonalInformation = personalInformationCompleted === personalInformationTotalFeilds;
  const isCompleteEmploymentInformation = employmentInformationCompleted === employmentInformationTotalFields;
  const isCompleteReferralPreferences = referralPreferencesCompleted === referralPreferencesTotalFields;

  const profileCompleted = personalInformationCompleted + employmentInformationCompleted + referralPreferencesCompleted;
  const profileTotalFields = personalInformationTotalFeilds + employmentInformationTotalFields + referralPreferencesTotalFields;
  const amountCompleted = (profileCompleted / profileTotalFields) * 100;

  return {
    documentTitle: t('app:profile.page-title'),
    name: `${currentUser.firstName ?? ''} ${currentUser.lastName ?? ''}`.trim() || 'Unknown User',
    email: currentUser.businessEmailAddress,
    amountCompleted: amountCompleted,
    isProfileComplete: isCompletePersonalInformation && isCompleteEmploymentInformation && isCompleteReferralPreferences,
    profileStatus,
    personalInformation: {
      isComplete: isCompletePersonalInformation,
      isNew: countCompletedItems(personalInformationData) === 1, // only work email is available
      personalRecordIdentifier: currentUser.personalRecordIdentifier,
      preferredLanguage:
        lang === 'en' ? profileData.languageOfCorrespondence?.nameEn : profileData.languageOfCorrespondence?.nameFr,
      workEmail: currentUser.businessEmailAddress,
      personalEmail: profileData.personalEmailAddress,
      workPhone: currentUser.businessPhoneNumber,
      personalPhone: profileData.personalPhoneNumber,
      additionalInformation: profileData.additionalComment,
    },
    employmentInformation: {
      isComplete: isCompleteEmploymentInformation,
      isNew: countCompletedItems(employmentInformationData) === 0,
      substantivePosition: substantivePosition,
      branchOrServiceCanadaRegion: branchOrServiceCanadaRegion,
      directorate: directorate,
      province: city?.provinceTerritory.name,
      city: city?.name,
      wfaStatus: lang === 'en' ? profileData.wfaStatus?.nameEn : profileData.wfaStatus?.nameFr,
      wfaStatusCode: profileData.wfaStatus?.code,
      wfaEffectiveDate: profileData.wfaStartDate,
      wfaEndDate: profileData.wfaEndDate,
      hrAdvisor: hrAdvisor && hrAdvisor.firstName + ' ' + hrAdvisor.lastName,
    },
    referralPreferences: {
      isComplete: isCompleteReferralPreferences,
      isNew: countReferralPreferencesCompleted(referralPreferencesFields) === 0,
      languageReferralTypes: languageReferralTypes?.map((l) => l?.name),
      classifications: classifications?.map((c) => c?.name),
      workLocationCities: cities?.map((city) => city?.provinceTerritory.name + ' - ' + city?.name),
      referralAvailibility: profileData.isAvailableForReferral,
      alternateOpportunity: profileData.isInterestedInAlternation,
      employmentOpportunities: employmentOpportunities?.map((e) => e?.name),
    },
    lastUpdated: profileData.lastModifiedDate ? formatDateTime(profileData.lastModifiedDate) : '0000-00-00 00:00',
    lastUpdatedBy: profileUpdatedByUserName,
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
                {loaderData.referralPreferences.employmentOpportunities === undefined
                  ? t('app:profile.not-provided')
                  : loaderData.referralPreferences.employmentOpportunities.length > 0 &&
                    loaderData.referralPreferences.employmentOpportunities.join(', ')}
              </DescriptionListItem>
            </DescriptionList>
          )}
        </ProfileCard>
      </div>
    </div>
  );
}
