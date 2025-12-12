import { useEffect, useRef, useState } from 'react';

import type { RouteHandle } from 'react-router';
import { useFetcher, useLocation, useNavigate, useSearchParams } from 'react-router';

import { useTranslation } from 'react-i18next';

import type { Route } from '../profile/+types/index';

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
import { i18nRedirect } from '~/.server/utils/route-utils';
import { AlertMessage } from '~/components/alert-message';
import { Button } from '~/components/button';
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
import { SectionErrorSummary } from '~/components/section-error-summary';
import { ProfileStatusTag } from '~/components/status-tag';
import { VacmanBackground } from '~/components/vacman-background';
import { PROFILE_STATUS } from '~/domain/constants';
import { useFetcherState } from '~/hooks/use-fetcher-state';
import { useFormattedDate } from '~/hooks/use-formatted-date';
import { useSaveSuccessMessage } from '~/hooks/use-save-success-message';
import { getTranslation } from '~/i18n-config.server';
import { handle as parentHandle } from '~/routes/layout';
import { EmploymentInformationSection } from '~/routes/page-components/profile/employment-information-section';
import { PersonalInformationSection } from '~/routes/page-components/profile/personal-information-section';
import { ReferralPreferencesSection } from '~/routes/page-components/profile/referral-preferences-section';
import { calculateLocationScope } from '~/utils/location-utils';
import { formatWithMask } from '~/utils/string-utils';

export const handle = {
  i18nNamespace: [...parentHandle.i18nNamespace],
} as const satisfies RouteHandle;

export function meta({ loaderData }: Route.MetaArgs) {
  return [{ title: loaderData.documentTitle }];
}

export async function action({ context, request }: Route.ActionArgs) {
  const { session } = context.get(context.applicationContext);
  requireAuthentication(session, request);

  const formData = await request.formData();
  const formAction = formData.get('action');

  if (formAction === 'save') {
    return i18nRedirect('routes/employee/index.tsx', request, {
      search: new URLSearchParams({ success: 'save-profile' }),
    });
  }

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
    isProfileComplete: true,
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
  const preferredCityIds = new Set(profileData.preferredCities?.map((city) => city.id) ?? []);
  const { locationScope, provinceNames, partiallySelectedCities } = calculateLocationScope(
    preferredCityIds,
    allLocalizedCities,
  );

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
      personalRecordIdentifier: currentUser.personalRecordIdentifier
        ? formatWithMask(currentUser.personalRecordIdentifier, '### ### ###')
        : undefined,
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
      branchOrServiceCanadaRegion: profileData.substantiveWorkUnit?.parent
        ? lang === 'en'
          ? profileData.substantiveWorkUnit.parent.nameEn
          : profileData.substantiveWorkUnit.parent.nameFr
        : lang === 'en'
          ? profileData.substantiveWorkUnit?.nameEn
          : profileData.substantiveWorkUnit?.nameFr,
      directorate: profileData.substantiveWorkUnit?.parent
        ? lang === 'en'
          ? profileData.substantiveWorkUnit.nameEn
          : profileData.substantiveWorkUnit.nameFr
        : undefined,
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
  const lastModifiedDate = useFormattedDate(loaderData.lastModifiedDate, loaderData.baseTimeZone);

  const [searchParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();

  const alertRef = useRef<HTMLDivElement>(null);
  const successMessage = useSaveSuccessMessage({
    searchParams,
    location,
    navigate,
    i18nNamespace: handle.i18nNamespace,
    fetcherData: fetcher.data,
  });

  if (fetcher.data && alertRef.current) {
    alertRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    alertRef.current.focus();
  }

  const [hasEmploymentChanged, setHasEmploymentChanged] = useState<boolean>(loaderData.hasEmploymentChanged);
  const [hasReferralPreferenceChanged, setHasReferralPreferenceChanged] = useState<boolean>(
    loaderData.hasReferralPreferenceChanged,
  );

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
          {t('app:profile.last-updated', { date: lastModifiedDate, name: loaderData.lastUpdatedBy })}
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
          <Button value="save" name="action" variant="alternative" id="save" disabled={isSubmitting}>
            {t('app:form.save-and-exit')}
          </Button>
          {loaderData.profileStatus?.code === PROFILE_STATUS.INCOMPLETE.code && (
            <LoadingButton name="action" variant="primary" id="submit" disabled={isSubmitting} loading={isSubmitting}>
              {t('app:form.submit')}
            </LoadingButton>
          )}
        </fetcher.Form>
      </div>

      {successMessage && (
        <AlertMessage ref={alertRef} type="success" message={successMessage} role="alert" ariaLive="assertive" />
      )}

      {fetcher.data && (
        <>
          {fetcher.data.isProfileComplete === true && (
            <AlertMessage
              ref={alertRef}
              type={'success'}
              message={t('app:profile.profile-submitted')}
              role="alert"
              ariaLive="assertive"
            />
          )}
          <SectionErrorSummary
            sectionCompleteness={{
              personalInfoComplete: fetcher.data.personalInfoComplete,
              employmentInfoComplete: fetcher.data.employmentInfoComplete,
              referralComplete: fetcher.data.referralComplete,
            }}
            isForApproval={false}
          />
        </>
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
              <PersonalInformationSection
                personalEmail={loaderData.personalInformation.personalEmail}
                personalPhone={loaderData.personalInformation.personalPhone}
                preferredLanguage={loaderData.personalInformation.preferredLanguage}
                personalRecordIdentifier={loaderData.personalInformation.personalRecordIdentifier}
                workEmail={loaderData.personalInformation.workEmail}
                workPhone={loaderData.personalInformation.workPhone}
              />
            )}
          </ProfileCardContent>
          <ProfileCardFooter>
            <ProfileCardEditLink
              isNew={loaderData.personalInformation.isNew}
              file="routes/employee/profile/personal-information.tsx"
              params={params}
              sectionId="personal-information-section"
            >
              {t('app:profile.personal-information.link-label')}
            </ProfileCardEditLink>
          </ProfileCardFooter>
        </ProfileCard>

        <ProfileCard errorState={fetcher.data?.employmentInfoComplete === false}>
          <ProfileCardHeader
            required
            status={incompleteProfile ? (loaderData.employmentInformation.isComplete ? 'complete' : 'in-progress') : undefined}
            updated={hasEmploymentChanged}
          >
            {t('app:profile.employment.title')}
          </ProfileCardHeader>
          <ProfileCardContent>
            {loaderData.employmentInformation.isNew ? (
              <>{t('app:profile.employment.detail')}</>
            ) : (
              <EmploymentInformationSection
                branchOrServiceCanadaRegion={loaderData.employmentInformation.branchOrServiceCanadaRegion}
                city={loaderData.employmentInformation.city}
                directorate={loaderData.employmentInformation.directorate}
                hrAdvisor={loaderData.employmentInformation.hrAdvisor}
                province={loaderData.employmentInformation.province}
                substantivePosition={loaderData.employmentInformation.substantivePosition}
                wfaStatus={loaderData.employmentInformation.wfaStatus}
                wfaStatusCode={loaderData.employmentInformation.wfaStatusCode}
                wfaEffectiveDate={loaderData.employmentInformation.wfaEffectiveDate}
                wfaEndDate={loaderData.employmentInformation.wfaEndDate}
              />
            )}
          </ProfileCardContent>
          <ProfileCardFooter>
            <ProfileCardEditLink
              isNew={loaderData.employmentInformation.isNew}
              file="routes/employee/profile/employment-information.tsx"
              params={params}
              sectionId="employment-information-section"
            >
              {t('app:profile.employment.link-label')}
            </ProfileCardEditLink>
          </ProfileCardFooter>
        </ProfileCard>

        <ProfileCard errorState={fetcher.data?.referralComplete === false}>
          <ProfileCardHeader
            required
            status={incompleteProfile ? (loaderData.referralPreferences.isComplete ? 'complete' : 'in-progress') : undefined}
            updated={hasReferralPreferenceChanged}
          >
            {t('app:profile.referral.title')}
          </ProfileCardHeader>
          <ProfileCardContent>
            {loaderData.referralPreferences.isNew ? (
              <>{t('app:profile.referral.detail')}</>
            ) : (
              <ReferralPreferencesSection
                isAvailableForReferral={loaderData.referralPreferences.isAvailableForReferral}
                isInterestedInAlternation={loaderData.referralPreferences.isInterestedInAlternation}
                locationScope={loaderData.referralPreferences.locationScope}
                preferredCities={loaderData.referralPreferences.preferredCities}
                preferredClassifications={loaderData.referralPreferences.preferredClassifications}
                preferredLanguages={loaderData.referralPreferences.preferredLanguages}
                provinceNames={loaderData.referralPreferences.provinceNames}
              />
            )}
          </ProfileCardContent>
          <ProfileCardFooter>
            <ProfileCardEditLink
              isNew={loaderData.referralPreferences.isNew}
              file="routes/employee/profile/referral-preferences.tsx"
              params={params}
              sectionId="referral-preferences-section"
            >
              {t('app:profile.referral.link-label')}
            </ProfileCardEditLink>
          </ProfileCardFooter>
        </ProfileCard>
      </div>
    </div>
  );
}
