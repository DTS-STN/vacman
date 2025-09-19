import { useEffect, useRef, useState } from 'react';

import type { RouteHandle } from 'react-router';
import { useActionData, useFetcher, useLocation, useNavigate, useSearchParams } from 'react-router';

import { useTranslation } from 'react-i18next';

import type { Route } from '../profile/+types/index';

import type { LocalizedCity } from '~/.server/domain/models';
import { getCityService } from '~/.server/domain/services/city-service';
import { getClassificationService } from '~/.server/domain/services/classification-service';
import { getDirectorateService } from '~/.server/domain/services/directorate-service';
import { getLanguageReferralTypeService } from '~/.server/domain/services/language-referral-type-service';
import { getProfileService } from '~/.server/domain/services/profile-service';
import { getProfileStatusService } from '~/.server/domain/services/profile-status-service';
import { serverEnvironment } from '~/.server/environment';
import { requireAuthentication } from '~/.server/utils/auth-utils';
import { requirePrivacyConsentForOwnProfile } from '~/.server/utils/privacy-consent-utils';
import {
  countCompletedItems,
  countReferralPreferencesCompleted,
  getHrAdvisors,
  omitObjectProperties,
} from '~/.server/utils/profile-utils';
import { AlertMessage } from '~/components/alert-message';
import { ButtonLink } from '~/components/button-link';
import { DescriptionList, DescriptionListItem } from '~/components/description-list';
import { LoadingButton } from '~/components/loading-button';
import { ProfileCard } from '~/components/profile-card';
import { Progress } from '~/components/progress';
import { StatusTag } from '~/components/status-tag';
import { EMPLOYEE_WFA_STATUS, PROFILE_STATUS_CODE, PROFILE_STATUS_PENDING } from '~/domain/constants';
import { useFetcherState } from '~/hooks/use-fetcher-state';
import { getTranslation } from '~/i18n-config.server';
import { handle as parentHandle } from '~/routes/layout';
import { formatDateTimeForTimezone } from '~/utils/date-utils';

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

  const currentUser = profileData.profileUser;

  // For personal information, check required fields directly on profile and profile user
  const requiredPersonalFields = {
    businessEmailAddress: currentUser.businessEmailAddress,
    languageOfCorrespondence: profileData.languageOfCorrespondence,
    personalRecordIdentifier: currentUser.personalRecordIdentifier,
    personalEmailAddress: profileData.personalEmailAddress,
    personalPhoneNumber: profileData.personalPhoneNumber,
  };

  // For employment information, check required fields directly on profile
  const requiredEmploymentFields = {
    substantiveClassification: profileData.substantiveClassification,
    substantiveWorkUnit: profileData.substantiveWorkUnit,
    substantiveCity: profileData.substantiveCity,
    wfaStatus: profileData.wfaStatus,
    wfaStartDate: profileData.wfaStartDate,
    hrAdvisorId: profileData.hrAdvisorId,
  };

  // For referral preferences, use the correct property names from Profile type
  const referralPreferencesFields = {
    preferredLanguages: profileData.preferredLanguages,
    preferredClassifications: profileData.preferredClassifications,
    preferredCities: profileData.preferredCities,
    isAvailableForReferral: profileData.isAvailableForReferral,
    isInterestedInAlternation: profileData.isInterestedInAlternation,
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
    PROFILE_STATUS_PENDING,
    context.session.authState.accessToken,
  );
  if (submitResult.isErr()) {
    const error = submitResult.unwrapErr();
    return {
      status: 'error',
      errorMessage: error.message,
      errorCode: error.errorCode,
    };
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
  const hasEmploymentChanged = url.searchParams.get('editedEmp') === 'true';
  const hasReferralPreferenceChanged = url.searchParams.get('editedRef') === 'true';

  // Use the profile user data directly instead of fetching it separately
  const currentUser = profileData.profileUser;

  // Fetch reference data
  const [allLocalizedLanguageReferralTypes, allClassifications, allLocalizedCities] = await Promise.all([
    getLanguageReferralTypeService().listAllLocalized(lang),
    getClassificationService().listAllLocalized(lang),
    getCityService().listAllLocalized(lang),
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
  const hrAdvisors = await getHrAdvisors(context.session.authState.accessToken);
  const hrAdvisor = hrAdvisors.find((u) => u.id === profileData.hrAdvisorId);
  const languageReferralTypes = profileData.preferredLanguages
    ?.map((lang) => allLocalizedLanguageReferralTypes.find((l) => l.id === lang.id))
    .filter(Boolean);
  const classifications = profileData.preferredClassifications
    ?.map((classification) => allClassifications.find((c) => c.id === classification.id))
    .filter(Boolean);

  // Check each section if the required fields are complete
  const personalInformationData = {
    businessEmailAddress: currentUser.businessEmailAddress,
    languageOfCorrespondence: profileData.languageOfCorrespondence,
    personalRecordIdentifier: currentUser.personalRecordIdentifier,
    personalEmailAddress: profileData.personalEmailAddress,
    personalPhoneNumber: profileData.personalPhoneNumber,
  };
  const requiredPersonalInformation = personalInformationData;
  const personalInformationCompleted = countCompletedItems(requiredPersonalInformation);
  const personalInformationTotalFields = Object.keys(requiredPersonalInformation).length;

  // Employment information from Profile type
  const employmentInformationData = {
    substantiveClassification: profileData.substantiveClassification,
    substantiveCity: profileData.substantiveCity,
    substantiveWorkUnit: profileData.substantiveWorkUnit,
    wfaStatus: profileData.wfaStatus,
    wfaStartDate: profileData.wfaStartDate,
    wfaEndDate: profileData.wfaEndDate,
  };

  const requiredEmploymentInformation = omitObjectProperties(employmentInformationData, ['wfaEndDate']);

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
  };

  const referralPreferencesCompleted = countReferralPreferencesCompleted(referralPreferencesFields);
  const referralPreferencesTotalFields = Object.keys(referralPreferencesFields).length;

  const isCompletePersonalInformation = personalInformationCompleted === personalInformationTotalFields;
  const isCompleteEmploymentInformation = employmentInformationCompleted === employmentInformationTotalFields;
  const isCompleteReferralPreferences = referralPreferencesCompleted === referralPreferencesTotalFields;

  const profileCompleted = personalInformationCompleted + employmentInformationCompleted + referralPreferencesCompleted;
  const profileTotalFields = personalInformationTotalFields + employmentInformationTotalFields + referralPreferencesTotalFields;
  const amountCompleted = (profileCompleted / profileTotalFields) * 100;

  // Display Canada wide or province wide or list of cities on referral preferences section

  const allProvinceIds = Array.from(new Set(allLocalizedCities.map((city) => city.provinceTerritory.id)));

  const preferredCityIds = new Set(profileData.preferredCities?.map((city) => city.id) ?? []);
  const provinceToCitiesMap = new Map<number, LocalizedCity[]>();

  // Group all cities by province
  for (const city of allLocalizedCities) {
    const provinceId = city.provinceTerritory.id;
    if (!provinceToCitiesMap.has(provinceId)) {
      provinceToCitiesMap.set(provinceId, []);
    }
    provinceToCitiesMap.get(provinceId)?.push(city);
  }

  // Determine which provinces are fully selected
  const fullySelectedProvinces: string[] = [];
  const partiallySelectedCities: { province: string; city: string }[] = [];

  for (const [, cities] of provinceToCitiesMap.entries()) {
    const selectedCities = cities.filter((city) => preferredCityIds.has(city.id));
    if (selectedCities.length === cities.length) {
      // All cities in this province are selected
      const provinceName = cities[0]?.provinceTerritory.name;
      if (provinceName) {
        fullySelectedProvinces.push(provinceName);
      }
    } else if (selectedCities.length > 0) {
      // Some cities in this province are selected
      for (const city of selectedCities) {
        partiallySelectedCities.push({
          province: city.provinceTerritory.name,
          city: city.name,
        });
      }
    }
  }

  let locationScope: 'anywhere-in-country' | 'anywhere-in-provinces' | 'specific-cities' | 'not-provided';
  let provinceNames: string[] = [];

  if (preferredCityIds.size === 0) {
    locationScope = 'not-provided';
  } else if (fullySelectedProvinces.length === allProvinceIds.length) {
    locationScope = 'anywhere-in-country';
  } else if (fullySelectedProvinces.length > 0 && partiallySelectedCities.length === 0) {
    locationScope = 'anywhere-in-provinces';
    provinceNames = fullySelectedProvinces;
  } else {
    locationScope = 'specific-cities';
    provinceNames = fullySelectedProvinces;
  }

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
      preferredLanguages: languageReferralTypes?.map((l) => l?.name),
      preferredClassifications: classifications?.map((c) => c?.name),
      preferredCities: partiallySelectedCities,
      locationScope,
      provinceNames,
      isAvailableForReferral: profileData.isAvailableForReferral,
      isInterestedInAlternation: profileData.isInterestedInAlternation,
    },
    lastModifiedDate: profileData.lastModifiedDate ?? undefined,
    lastUpdatedBy: profileUpdatedByUserName,
    hasEmploymentChanged,
    hasReferralPreferenceChanged,
    baseTimeZone: serverEnvironment.BASE_TIMEZONE,
    lang,
  };
}

export default function EditProfile({ loaderData, params }: Route.ComponentProps) {
  const { t } = useTranslation(handle.i18nNamespace);
  const actionData = useActionData();
  const fetcher = useFetcher();
  const fetcherState = useFetcherState(fetcher);
  const isSubmitting = fetcherState.submitting;

  type CityPreference = {
    province: string;
    city: string;
  };

  type GroupedCities = Record<string, string[]>;

  // Use fetcher.data instead of actionData since we're using fetcher.Form
  const formActionData = fetcher.data ?? actionData;

  const alertRef = useRef<HTMLDivElement>(null);

  if (formActionData && alertRef.current) {
    alertRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    alertRef.current.focus();
  }

  const [searchParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();

  const [hasEmploymentChanged, setHasEmploymentChanged] = useState(loaderData.hasEmploymentChanged);
  const [hasReferralPreferenceChanged, setHasReferralPreferenceChanged] = useState(loaderData.hasReferralPreferenceChanged);
  const [browserTZ, setBrowserTZ] = useState(() =>
    loaderData.lastModifiedDate
      ? formatDateTimeForTimezone(loaderData.lastModifiedDate, loaderData.baseTimeZone, loaderData.lang)
      : '0000-00-00 00:00',
  );

  useEffect(() => {
    if (!loaderData.lastModifiedDate) return;

    const browserTZ = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (browserTZ) {
      setBrowserTZ(formatDateTimeForTimezone(loaderData.lastModifiedDate, browserTZ, loaderData.lang));
    }
  }, [loaderData.lastModifiedDate, loaderData.lang]);

  // Clean the URL after reading the param
  useEffect(() => {
    if (searchParams.get('editedEmp') === 'true') {
      setHasEmploymentChanged(true);
      const newUrl = location.pathname;
      void navigate(newUrl, { replace: true });
    }
  }, [searchParams, location.pathname, navigate]);

  useEffect(() => {
    if (searchParams.get('editedRef') === 'true') {
      setHasReferralPreferenceChanged(true);
      const newUrl = location.pathname;
      void navigate(newUrl, { replace: true });
    }
  }, [searchParams, location.pathname, navigate]);

  return (
    <div className="space-y-8">
      <div className="space-y-4 py-8 text-white">
        <StatusTag
          status={{
            code: loaderData.profileStatus.code,
            name:
              loaderData.profileStatus.code === PROFILE_STATUS_CODE.pending
                ? t('app:profile.pending-status-employee')
                : loaderData.profileStatus.name,
          }}
        />
        <h1 id="wb-cont" tabIndex={-1} className="mt-6 text-3xl font-semibold">
          {loaderData.name}
        </h1>
        {loaderData.email && <p className="mt-1">{loaderData.email}</p>}
        <p className="font-normal text-[#9FA3AD]">
          {t('app:profile.last-updated', { date: browserTZ, name: loaderData.lastUpdatedBy })}
        </p>
        <div
          role="presentation"
          className="absolute top-25 left-0 -z-10 h-60 w-full scale-x-[-1] bg-[rgba(9,28,45,1)] bg-[url('/VacMan-design-element-06.svg')] bg-size-[450px] bg-left-bottom bg-no-repeat"
        />
      </div>
      <div className="justify-between md:grid md:grid-cols-2">
        <div className="max-w-prose">
          <p className="mt-12">
            {loaderData.profileStatus.code === PROFILE_STATUS_CODE.pending
              ? t('app:profile.about-para-1-pending')
              : t('app:profile.about-para-1')}
          </p>
        </div>
        <fetcher.Form className="mt-6 flex place-content-end space-x-5 md:mt-auto" method="post" noValidate>
          <ButtonLink variant="alternative" file="routes/employee/index.tsx" id="save" disabled={isSubmitting}>
            {t('app:form.save-and-exit')}
          </ButtonLink>
          {loaderData.profileStatus.code === PROFILE_STATUS_CODE.incomplete && (
            <LoadingButton name="action" variant="primary" id="submit" disabled={isSubmitting} loading={isSubmitting}>
              {t('app:form.submit')}
            </LoadingButton>
          )}
        </fetcher.Form>
      </div>

      {formActionData && (
        <AlertMessage
          ref={alertRef}
          type={loaderData.isProfileComplete ? 'success' : 'error'}
          message={loaderData.isProfileComplete ? t('app:profile.profile-submitted') : t('app:profile.profile-incomplete')}
          role="alert"
          ariaLive="assertive"
        />
      )}

      {(hasEmploymentChanged || hasReferralPreferenceChanged) && (
        <AlertMessage
          ref={alertRef}
          type="info"
          message={t('app:profile.profile-pending-approval')}
          role="status"
          ariaLive="polite"
        />
      )}

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
          errorState={formActionData?.personalInfoComplete === false}
          required
          showStatus={loaderData.profileStatus.code === PROFILE_STATUS_CODE.incomplete}
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
              <DescriptionListItem term={t('app:personal-information.language-of-correspondence')}>
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
          errorState={formActionData?.employmentInfoComplete === false}
          showStatus={loaderData.profileStatus.code === PROFILE_STATUS_CODE.incomplete}
          updated={hasEmploymentChanged}
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
                <DescriptionListItem term={t('app:employment-information.wfa-effective-date')}>
                  {loaderData.employmentInformation.wfaEffectiveDate ?? t('app:profile.not-provided')}
                </DescriptionListItem>
                {(loaderData.employmentInformation.wfaStatusCode === EMPLOYEE_WFA_STATUS.opting ||
                  loaderData.employmentInformation.wfaStatusCode === EMPLOYEE_WFA_STATUS.exOpting ||
                  loaderData.employmentInformation.wfaStatusCode === EMPLOYEE_WFA_STATUS.surplusOptingOptionA ||
                  loaderData.employmentInformation.wfaStatusCode === EMPLOYEE_WFA_STATUS.exSurplusCPA) && (
                  <DescriptionListItem term={t('app:employment-information.wfa-end-date')}>
                    {loaderData.employmentInformation.wfaEndDate ?? t('app:profile.not-provided')}
                  </DescriptionListItem>
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
          errorState={formActionData?.referralComplete === false}
          showStatus={loaderData.profileStatus.code === PROFILE_STATUS_CODE.incomplete}
          updated={hasReferralPreferenceChanged}
        >
          {loaderData.referralPreferences.isNew ? (
            <>{t('app:profile.referral.detail')}</>
          ) : (
            <DescriptionList>
              <DescriptionListItem term={t('app:referral-preferences.language-referral-type')}>
                {loaderData.referralPreferences.preferredLanguages === undefined
                  ? t('app:profile.not-provided')
                  : loaderData.referralPreferences.preferredLanguages.length > 0 &&
                    loaderData.referralPreferences.preferredLanguages.join(', ')}
              </DescriptionListItem>
              <DescriptionListItem term={t('app:referral-preferences.classification')}>
                {loaderData.referralPreferences.preferredClassifications === undefined
                  ? t('app:profile.not-provided')
                  : loaderData.referralPreferences.preferredClassifications.length > 0 &&
                    loaderData.referralPreferences.preferredClassifications.join(', ')}
              </DescriptionListItem>
              <DescriptionListItem term={t('app:referral-preferences.work-location')}>
                {loaderData.referralPreferences.locationScope === 'not-provided' && <p>{t('app:profile.not-provided')}</p>}

                {loaderData.referralPreferences.locationScope === 'anywhere-in-country' && <p>{t('app:anywhere-in-canada')}</p>}

                {loaderData.referralPreferences.locationScope === 'anywhere-in-provinces' && (
                  <p>
                    {t('app:anywhere-in-provinces', {
                      provinceNames: loaderData.referralPreferences.provinceNames.join(', '),
                    })}
                  </p>
                )}

                {loaderData.referralPreferences.locationScope === 'specific-cities' &&
                  loaderData.referralPreferences.preferredCities.length > 0 && (
                    <>
                      {loaderData.referralPreferences.provinceNames.length > 0 && (
                        <p>
                          {t('app:anywhere-in-provinces', {
                            provinceNames: loaderData.referralPreferences.provinceNames.join(', '),
                          })}
                        </p>
                      )}
                      <div>
                        {/* Group cities by province */}
                        {Object.entries(
                          (loaderData.referralPreferences.preferredCities as CityPreference[]).reduce(
                            (acc: GroupedCities, city: CityPreference) => {
                              const provinceName = city.province;
                              acc[provinceName] ??= [];
                              acc[provinceName].push(city.city);
                              return acc;
                            },
                            {} as GroupedCities,
                          ),
                        ).map(([province, cities]) => (
                          <div key={province}>
                            <strong>{province}:</strong> {cities.join(', ')}
                          </div>
                        ))}
                      </div>
                    </>
                  )}
              </DescriptionListItem>
              <DescriptionListItem term={t('app:referral-preferences.referral-availibility')}>
                {loaderData.referralPreferences.isAvailableForReferral === undefined
                  ? t('app:profile.not-provided')
                  : loaderData.referralPreferences.isAvailableForReferral
                    ? t('gcweb:input-option.yes')
                    : t('gcweb:input-option.no')}
              </DescriptionListItem>
              <DescriptionListItem term={t('app:referral-preferences.alternate-opportunity')}>
                {loaderData.referralPreferences.isInterestedInAlternation === undefined
                  ? t('app:profile.not-provided')
                  : loaderData.referralPreferences.isInterestedInAlternation
                    ? t('gcweb:input-option.yes')
                    : t('gcweb:input-option.no')}
              </DescriptionListItem>
            </DescriptionList>
          )}
        </ProfileCard>
      </div>
    </div>
  );
}
