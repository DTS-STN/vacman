import { useEffect, useRef, useState } from 'react';

import type { RouteHandle } from 'react-router';
import { useFetcher, useLocation, useNavigate, useSearchParams } from 'react-router';

import { useTranslation } from 'react-i18next';

import type { Route } from '../profile/+types/index';

import type { LocalizedCity } from '~/.server/domain/models';
import { getCityService } from '~/.server/domain/services/city-service';
import { getProfileService } from '~/.server/domain/services/profile-service';
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
import { PageTitle } from '~/components/page-title';
import {
  ProfileCard,
  ProfileCardContent,
  ProfileCardEditLink,
  ProfileCardFooter,
  ProfileCardHeader,
} from '~/components/profile-card';
import { Progress } from '~/components/progress';
import { ProfileStatusTag } from '~/components/status-tag';
import { VacmanBackground } from '~/components/vacman-background';
import { EMPLOYEE_WFA_STATUS, PROFILE_STATUS } from '~/domain/constants';
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
  const { session } = context.get(context.applicationContext);
  requireAuthentication(session, request);

  const profileParams = { active: true };
  const profileData = await getProfileService().findCurrentUserProfile(profileParams, session.authState.accessToken);

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
    PROFILE_STATUS.PENDING,
    session.authState.accessToken,
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
  const { session } = context.get(context.applicationContext);
  requireAuthentication(session, request);
  await requirePrivacyConsentForOwnProfile(session, request);

  const profileParams = { active: true };
  const profileData = await getProfileService().findCurrentUserProfile(profileParams, session.authState.accessToken);

  const { lang, t } = await getTranslation(request, handle.i18nNamespace);

  const url = new URL(request.url);
  const hasEmploymentChanged: boolean = url.searchParams.get('editedEmp') === 'true';
  const hasReferralPreferenceChanged: boolean = url.searchParams.get('editedRef') === 'true';

  // Use the profile user data directly instead of fetching it separately
  const currentUser = profileData.profileUser;

  // Fetch reference data
  const allLocalizedCities = await getCityService().listAllLocalized(lang);

  // Use profileUser for updated by information as well
  const profileUpdatedByUserName = `${currentUser.firstName ?? 'Unknown'} ${currentUser.lastName ?? 'User'}`;

  // convert the IDs to display names
  const hrAdvisors = await getHrAdvisors(session.authState.accessToken);
  const hrAdvisor = hrAdvisors.find((u) => u.id === profileData.hrAdvisorId);

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
    profileStatus: profileData.profileStatus,
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
      substantivePosition:
        lang === 'en' ? profileData.substantiveClassification?.nameEn : profileData.substantiveClassification?.nameFr,
      branchOrServiceCanadaRegion:
        lang === 'en' ? profileData.substantiveWorkUnit?.parent?.nameEn : profileData.substantiveWorkUnit?.parent?.nameFr,
      directorate: lang === 'en' ? profileData.substantiveWorkUnit?.nameEn : profileData.substantiveWorkUnit?.nameFr,
      province:
        lang === 'en'
          ? profileData.substantiveCity?.provinceTerritory.nameEn
          : profileData.substantiveCity?.provinceTerritory.nameFr,
      city: lang === 'en' ? profileData.substantiveCity?.nameEn : profileData.substantiveCity?.nameFr,
      wfaStatus: lang === 'en' ? profileData.wfaStatus?.nameEn : profileData.wfaStatus?.nameFr,
      wfaStatusCode: profileData.wfaStatus?.code,
      wfaEffectiveDate: profileData.wfaStartDate,
      wfaEndDate: profileData.wfaEndDate,
      hrAdvisor: hrAdvisor && hrAdvisor.firstName + ' ' + hrAdvisor.lastName,
    },
    referralPreferences: {
      isComplete: isCompleteReferralPreferences,
      isNew: countReferralPreferencesCompleted(referralPreferencesFields) === 0,
      preferredLanguages: profileData.preferredLanguages?.map((l) => (lang === 'en' ? l.nameEn : l.nameFr)),
      preferredClassifications: profileData.preferredClassifications?.map((c) => (lang === 'en' ? c.nameEn : c.nameFr)),
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
  const fetcher = useFetcher<typeof action>();
  const fetcherState = useFetcherState(fetcher);
  const isSubmitting = fetcherState.submitting;
  const incompleteProfile = loaderData.profileStatus?.code === PROFILE_STATUS.INCOMPLETE.code;

  type CityPreference = {
    province: string;
    city: string;
  };

  type GroupedCities = Record<string, string[]>;

  const alertRef = useRef<HTMLDivElement>(null);
  if (fetcher.data && alertRef.current) {
    alertRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    alertRef.current.focus();
  }

  const [searchParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();

  const [hasEmploymentChanged, setHasEmploymentChanged] = useState<boolean>(loaderData.hasEmploymentChanged);
  const [hasReferralPreferenceChanged, setHasReferralPreferenceChanged] = useState<boolean>(
    loaderData.hasReferralPreferenceChanged,
  );
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
    const newUrl = location.pathname;
    if (searchParams.get('editedEmp') === 'true') setHasEmploymentChanged(true);
    if (searchParams.get('editedRef') === 'true') setHasReferralPreferenceChanged(true);
    void navigate(newUrl, { replace: true });
  }, [searchParams, location.pathname, navigate]);

  return (
    <div className="space-y-8">
      <VacmanBackground variant="bottom-right">
        {loaderData.profileStatus && (
          <ProfileStatusTag status={loaderData.profileStatus} lang={loaderData.lang} rounded view="employee" />
        )}
        <PageTitle className="after:w-14" containerClassName="my-6">
          {loaderData.name}
        </PageTitle>
        {loaderData.email && <p className="mt-1">{loaderData.email}</p>}
        <p className="font-normal text-[#9FA3AD]">
          {t('app:profile.last-updated', { date: browserTZ, name: loaderData.lastUpdatedBy })}
        </p>
      </VacmanBackground>
      <div className="justify-between md:grid md:grid-cols-2">
        <div className="max-w-prose">
          <p className="mt-5">
            {loaderData.profileStatus?.code === PROFILE_STATUS.PENDING.code
              ? t('app:profile.about-para-1-pending')
              : t('app:profile.about-para-1')}
          </p>
        </div>
        <fetcher.Form className="mt-6 flex place-content-end space-x-5 md:mt-auto" method="post" noValidate>
          <ButtonLink variant="alternative" file="routes/employee/index.tsx" id="save" disabled={isSubmitting}>
            {t('app:form.save-and-exit')}
          </ButtonLink>
          {loaderData.profileStatus?.code === PROFILE_STATUS.INCOMPLETE.code && (
            <LoadingButton name="action" variant="primary" id="submit" disabled={isSubmitting} loading={isSubmitting}>
              {t('app:form.submit')}
            </LoadingButton>
          )}
        </fetcher.Form>
      </div>

      {fetcher.data && (
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

      {incompleteProfile && (
        <Progress
          className="mt-8 mb-8"
          label={t('app:profile.profile-completion-progress')}
          value={loaderData.amountCompleted}
        />
      )}
      <div className="mt-8 max-w-prose space-y-10">
        <ProfileCard errorState={fetcher.data?.personalInfoComplete === false}>
          <ProfileCardHeader
            required
            status={incompleteProfile ? (loaderData.personalInformation.isComplete ? 'complete' : 'in-progress') : undefined}
          >
            {t('app:profile.personal-information.title')}
          </ProfileCardHeader>
          <ProfileCardContent>
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
          </ProfileCardContent>
          <ProfileCardFooter>
            <ProfileCardEditLink
              isNew={loaderData.personalInformation.isNew}
              file="routes/employee/profile/personal-information.tsx"
              params={params}
            >
              {t('app:profile.personal-information.link-label')}
            </ProfileCardEditLink>
          </ProfileCardFooter>
        </ProfileCard>

        <ProfileCard errorState={fetcher.data?.employmentInfoComplete === false}>
          <ProfileCardHeader
            required
            status={incompleteProfile ? (loaderData.employmentInformation.isComplete ? 'complete' : 'in-progress') : undefined}
          >
            {t('app:profile.employment.title')}
          </ProfileCardHeader>
          <ProfileCardContent>
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
                <h3 className="font-lato text-xl font-bold">{t('app:employment-information.wfa-details-heading')}</h3>
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
                    loaderData.employmentInformation.wfaStatusCode === EMPLOYEE_WFA_STATUS.exSurplusCPA ||
                    loaderData.employmentInformation.wfaStatusCode === EMPLOYEE_WFA_STATUS.relocation ||
                    loaderData.employmentInformation.wfaStatusCode === EMPLOYEE_WFA_STATUS.alternateDeliveryInitiative) && (
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
          </ProfileCardContent>
          <ProfileCardFooter>
            <ProfileCardEditLink
              isNew={loaderData.employmentInformation.isNew}
              file="routes/employee/profile/employment-information.tsx"
              params={params}
            >
              {t('app:profile.employment.link-label')}
            </ProfileCardEditLink>
          </ProfileCardFooter>
        </ProfileCard>

        <ProfileCard errorState={fetcher.data?.referralComplete === false}>
          <ProfileCardHeader
            required
            status={incompleteProfile ? (loaderData.referralPreferences.isComplete ? 'complete' : 'in-progress') : undefined}
          >
            {t('app:profile.referral.title')}
          </ProfileCardHeader>
          <ProfileCardContent>
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

                  {loaderData.referralPreferences.locationScope === 'anywhere-in-country' && (
                    <p>{t('app:anywhere-in-canada')}</p>
                  )}

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
          </ProfileCardContent>
          <ProfileCardFooter>
            <ProfileCardEditLink
              isNew={loaderData.referralPreferences.isNew}
              file="routes/employee/profile/referral-preferences.tsx"
              params={params}
            >
              {t('app:profile.referral.link-label')}
            </ProfileCardEditLink>
          </ProfileCardFooter>
        </ProfileCard>
      </div>
    </div>
  );
}
