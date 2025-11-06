import { useEffect, useRef, useState } from 'react';

import type { RouteHandle } from 'react-router';
import { useFetcher } from 'react-router';

import { useTranslation } from 'react-i18next';

import type { Route } from '../employee-profile/+types/index';

import type { LocalizedCity, Profile } from '~/.server/domain/models';
import { getCityService } from '~/.server/domain/services/city-service';
import { getProfileService } from '~/.server/domain/services/profile-service';
import { getUserService } from '~/.server/domain/services/user-service';
import { serverEnvironment } from '~/.server/environment';
import { requireAuthentication } from '~/.server/utils/auth-utils';
import { countCompletedItems, countReferralPreferencesCompleted, getHrAdvisors } from '~/.server/utils/profile-utils';
import { AlertMessage } from '~/components/alert-message';
import { BackLink } from '~/components/back-link';
import { LoadingButton } from '~/components/loading-button';
import { PageTitle } from '~/components/page-title';
import {
  ProfileCard,
  ProfileCardContent,
  ProfileCardEditLink,
  ProfileCardFooter,
  ProfileCardHeader,
} from '~/components/profile-card';
import { ProfileStatusTag } from '~/components/status-tag';
import { VacmanBackground } from '~/components/vacman-background';
import { PROFILE_STATUS } from '~/domain/constants';
import { HttpStatusCodes } from '~/errors/http-status-codes';
import { useFetcherState } from '~/hooks/use-fetcher-state';
import { getTranslation } from '~/i18n-config.server';
import { handle as parentHandle } from '~/routes/layout';
import { EmploymentInformationSection } from '~/routes/page-components/profile/employment-information-section';
import { PersonalInformationSection } from '~/routes/page-components/profile/personal-information-section';
import { ReferralPreferencesSection } from '~/routes/page-components/profile/referral-preferences-section';
import { formatDateTimeForTimezone } from '~/utils/date-utils';
import { formatWithMask } from '~/utils/string-utils';

export const handle = {
  i18nNamespace: [...parentHandle.i18nNamespace],
} as const satisfies RouteHandle;

export function meta({ loaderData }: Route.MetaArgs) {
  return [{ title: loaderData.documentTitle }];
}

export async function action({ context, request, params }: Route.ActionArgs) {
  const { session } = context.get(context.applicationContext);
  requireAuthentication(session, request);

  const profileResult = await getProfileService().getProfileById(Number(params.profileId), session.authState.accessToken);

  if (profileResult.isErr()) {
    throw new Response('Profile not found', { status: HttpStatusCodes.NOT_FOUND });
  }

  const profileData: Profile = profileResult.unwrap();

  // For personal information, check required fields directly on profile and profile user
  const requiredPersonalFields = {
    businessEmailAddress: profileData.profileUser.businessEmailAddress,
    languageOfCorrespondence: profileData.languageOfCorrespondence,
    personalRecordIdentifier: profileData.profileUser.personalRecordIdentifier,
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

  // approve the profile
  const submitResult = await getProfileService().updateProfileStatus(
    profileData.id,
    PROFILE_STATUS.APPROVED,
    session.authState.accessToken,
  );
  if (submitResult.isErr()) {
    throw submitResult.unwrapErr();
  }

  return {
    status: 'submitted',
    profileStatus: submitResult.unwrap(),
  };
}

export async function loader({ context, request, params }: Route.LoaderArgs) {
  const { session } = context.get(context.applicationContext);
  requireAuthentication(session, request);

  const { lang, t } = await getTranslation(request, handle.i18nNamespace);

  // Fetch both the profile user and the profile data
  const [profileResult, allLocalizedCities] = await Promise.all([
    getProfileService().getProfileById(Number(params.profileId), session.authState.accessToken),
    getCityService().listAllLocalized(lang),
  ]);

  if (profileResult.isErr()) {
    throw new Response('Profile not found', { status: HttpStatusCodes.NOT_FOUND });
  }

  const profileData: Profile = profileResult.unwrap();

  // Fetch the profile user data to get current businessEmail and other user info
  const profileUserResult = await getUserService().getUserById(profileData.profileUser.id, session.authState.accessToken);
  const profileUser = profileUserResult.into();

  const profileUpdatedByUserResult = profileData.profileUser.lastModifiedBy
    ? await getUserService().getUserById(profileData.profileUser.id, session.authState.accessToken)
    : undefined;
  const profileUpdatedByUser = profileUpdatedByUserResult?.into();
  const profileUpdatedByUserName = profileUpdatedByUser && `${profileUpdatedByUser.firstName} ${profileUpdatedByUser.lastName}`;

  // convert the IDs to display names
  const hrAdvisors = await getHrAdvisors(session.authState.accessToken);
  const hrAdvisor = hrAdvisors.find((u) => u.id === profileData.hrAdvisorId);

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
    documentTitle: t('app:employee-profile.page-title'),
    name: `${profileData.profileUser.firstName} ${profileData.profileUser.lastName}`,
    email: profileUser?.businessEmailAddress ?? profileData.profileUser.businessEmailAddress,
    profileStatus: profileData.profileStatus,
    personalInformation: {
      personalRecordIdentifier: profileData.profileUser.personalRecordIdentifier
        ? formatWithMask(profileData.profileUser.personalRecordIdentifier, '### ### ###')
        : undefined,
      preferredLanguage:
        lang === 'en' ? profileData.languageOfCorrespondence?.nameEn : profileData.languageOfCorrespondence?.nameFr,
      workEmail: profileUser?.businessEmailAddress ?? profileData.profileUser.businessEmailAddress,
      personalEmail: profileData.personalEmailAddress,
      workPhone: profileUser?.businessPhoneNumber ?? profileData.profileUser.businessPhoneNumber,
      personalPhone: profileData.personalPhoneNumber,
    },
    employmentInformation: {
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
      preferredLanguages: profileData.preferredLanguages?.map((l) => (lang === 'en' ? l.nameEn : l.nameFr)),
      preferredClassifications: profileData.preferredClassifications?.map((c) => (lang === 'en' ? c.nameEn : c.nameFr)),
      preferredCities: partiallySelectedCities,
      locationScope,
      provinceNames,
      isAvailableForReferral: profileData.isAvailableForReferral,
      isInterestedInAlternation: profileData.isInterestedInAlternation,
    },
    lastUpdatedBy: profileUpdatedByUserName ?? 'Unknown User',
    lastModifiedDate: profileData.lastModifiedDate ?? undefined,
    baseTimeZone: serverEnvironment.BASE_TIMEZONE,
    lang,
    backLinkSearchParams: new URL(request.url).searchParams.toString(),
  };
}

export default function EditProfile({ loaderData, params }: Route.ComponentProps) {
  const { t } = useTranslation(handle.i18nNamespace);
  const fetcher = useFetcher<typeof action>();
  const fetcherState = useFetcherState(fetcher);
  const isSubmitting = fetcherState.submitting;

  const alertRef = useRef<HTMLDivElement>(null);
  if (fetcher.data && alertRef.current) {
    alertRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    alertRef.current.focus();
  }

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

  return (
    <div className="space-y-8">
      <VacmanBackground variant="bottom-right">
        {loaderData.profileStatus && (
          <ProfileStatusTag status={loaderData.profileStatus} lang={loaderData.lang} rounded view="hr-advisor" />
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
          <BackLink
            aria-label={t('app:employee-profile.back')}
            file="routes/hr-advisor/employees.tsx"
            params={params}
            search={new URLSearchParams(loaderData.backLinkSearchParams)}
          >
            {t('app:employee-profile.back')}
          </BackLink>
          {(loaderData.profileStatus?.code === PROFILE_STATUS.INCOMPLETE.code ||
            loaderData.profileStatus?.code === PROFILE_STATUS.PENDING.code) && (
            <p className="mt-12">{t('app:employee-profile.about-para-1')}</p>
          )}
        </div>
      </div>

      {fetcher.data &&
        (fetcher.data.personalInfoComplete === false ||
        fetcher.data.employmentInfoComplete === false ||
        fetcher.data.referralComplete === false ? (
          <AlertMessage
            ref={alertRef}
            type={'error'}
            message={t('app:profile.profile-incomplete-for-approval')}
            role="alert"
            ariaLive="assertive"
          />
        ) : (
          <AlertMessage
            ref={alertRef}
            type={'success'}
            message={t('app:profile.hr-approved')}
            role="alert"
            ariaLive="assertive"
          />
        ))}

      <div className="mt-8 max-w-prose space-y-10">
        <ProfileCard errorState={fetcher.data?.personalInfoComplete === false}>
          <ProfileCardHeader>{t('app:profile.personal-information.title')}</ProfileCardHeader>
          <ProfileCardContent>
            <PersonalInformationSection
              personalEmail={loaderData.personalInformation.personalEmail}
              personalPhone={loaderData.personalInformation.personalPhone}
              preferredLanguage={loaderData.personalInformation.preferredLanguage}
              personalRecordIdentifier={loaderData.personalInformation.personalRecordIdentifier}
              workEmail={loaderData.personalInformation.workEmail}
              workPhone={loaderData.personalInformation.workPhone}
            />
          </ProfileCardContent>
          <ProfileCardFooter>
            <ProfileCardEditLink file="routes/hr-advisor/employee-profile/personal-information.tsx" params={params}>
              {t('app:profile.personal-information.link-label')}
            </ProfileCardEditLink>
          </ProfileCardFooter>
        </ProfileCard>

        <ProfileCard errorState={fetcher.data?.employmentInfoComplete === false}>
          <ProfileCardHeader>{t('app:profile.employment.title')}</ProfileCardHeader>
          <ProfileCardContent>
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
          </ProfileCardContent>
          <ProfileCardFooter>
            <ProfileCardEditLink file="routes/hr-advisor/employee-profile/employment-information.tsx" params={params}>
              {t('app:profile.employment.link-label')}
            </ProfileCardEditLink>
          </ProfileCardFooter>
        </ProfileCard>

        <ProfileCard errorState={fetcher.data?.referralComplete === false}>
          <ProfileCardHeader required>{t('app:profile.referral.title')}</ProfileCardHeader>
          <ProfileCardContent>
            <ReferralPreferencesSection
              isAvailableForReferral={loaderData.referralPreferences.isAvailableForReferral}
              isInterestedInAlternation={loaderData.referralPreferences.isInterestedInAlternation}
              locationScope={loaderData.referralPreferences.locationScope}
              preferredCities={loaderData.referralPreferences.preferredCities}
              preferredClassifications={loaderData.referralPreferences.preferredClassifications}
              preferredLanguages={loaderData.referralPreferences.preferredLanguages}
              provinceNames={loaderData.referralPreferences.provinceNames}
            />
          </ProfileCardContent>
          <ProfileCardFooter>
            <ProfileCardEditLink file="routes/hr-advisor/employee-profile/referral-preferences.tsx" params={params}>
              {t('app:profile.referral.link-label')}
            </ProfileCardEditLink>
          </ProfileCardFooter>
        </ProfileCard>
      </div>
      <fetcher.Form className="mt-6 flex place-content-start space-x-5 md:mt-auto" method="post" noValidate>
        {(loaderData.profileStatus?.code === PROFILE_STATUS.INCOMPLETE.code ||
          loaderData.profileStatus?.code === PROFILE_STATUS.PENDING.code) && (
          <LoadingButton name="action" variant="primary" id="submit" disabled={isSubmitting} loading={isSubmitting}>
            {t('app:form.approve')}
          </LoadingButton>
        )}
      </fetcher.Form>
    </div>
  );
}
