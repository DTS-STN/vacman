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
import { getHrAdvisors } from '~/.server/utils/profile-utils';
import { AlertMessage } from '~/components/alert-message';
import { DescriptionList, DescriptionListItem } from '~/components/description-list';
import { InlineLink } from '~/components/links';
import { LoadingButton } from '~/components/loading-button';
import { PageTitle } from '~/components/page-title';
import { ProfileCard } from '~/components/profile-card';
import { ProfileStatusTag } from '~/components/status-tag';
import { EMPLOYEE_WFA_STATUS, PROFILE_STATUS } from '~/domain/constants';
import { HttpStatusCodes } from '~/errors/http-status-codes';
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

export async function action({ context, request, params }: Route.ActionArgs) {
  requireAuthentication(context.session, request);

  const profileResult = await getProfileService().getProfileById(
    Number(params.profileId),
    context.session.authState.accessToken,
  );

  if (profileResult.isErr()) {
    throw new Response('Profile not found', { status: HttpStatusCodes.NOT_FOUND });
  }

  const profileData: Profile = profileResult.unwrap();

  // approve the profile
  const submitResult = await getProfileService().updateProfileStatus(
    profileData.profileUser.id,
    PROFILE_STATUS.APPROVED,
    context.session.authState.accessToken,
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
  requireAuthentication(context.session, request);

  const { lang, t } = await getTranslation(request, handle.i18nNamespace);

  // Fetch both the profile user and the profile data
  const [profileResult, allLocalizedCities] = await Promise.all([
    getProfileService().getProfileById(Number(params.profileId), context.session.authState.accessToken),
    getCityService().listAllLocalized(lang),
  ]);

  if (profileResult.isErr()) {
    throw new Response('Profile not found', { status: HttpStatusCodes.NOT_FOUND });
  }

  const profileData: Profile = profileResult.unwrap();

  // Fetch the profile user data to get current businessEmail and other user info
  const profileUserResult = await getUserService().getUserById(
    profileData.profileUser.id,
    context.session.authState.accessToken,
  );
  const profileUser = profileUserResult.into();

  const profileUpdatedByUserResult = profileData.profileUser.lastModifiedBy
    ? await getUserService().getUserById(profileData.profileUser.id, context.session.authState.accessToken)
    : undefined;
  const profileUpdatedByUser = profileUpdatedByUserResult?.into();
  const profileUpdatedByUserName = profileUpdatedByUser && `${profileUpdatedByUser.firstName} ${profileUpdatedByUser.lastName}`;

  // convert the IDs to display names
  const hrAdvisors = await getHrAdvisors(context.session.authState.accessToken);
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
      personalRecordIdentifier: profileData.profileUser.personalRecordIdentifier,
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
    backLinkFilter: new URL(request.url).searchParams.get('filter') ?? 'me',
  };
}

export default function EditProfile({ loaderData, params }: Route.ComponentProps) {
  const { t } = useTranslation(handle.i18nNamespace);
  const fetcher = useFetcher<typeof action>();
  const fetcherState = useFetcherState(fetcher);
  const isSubmitting = fetcherState.submitting;

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
      <div className="absolute left-0 w-full space-y-4 bg-[rgba(9,28,45,1)] py-8 wrap-break-word text-white">
        <div className="container">
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
        </div>
        <div
          role="presentation"
          className="absolute top-25 left-0 -z-10 h-70 w-full scale-x-[-1] bg-[rgba(9,28,45,1)] bg-[url('/VacMan-design-element-06.svg')] bg-size-[450px] bg-left-bottom bg-no-repeat sm:h-60"
        />
      </div>
      <div className="mt-110 justify-between sm:mt-70 md:grid md:grid-cols-2">
        <div className="max-w-prose">
          <InlineLink
            className="mt-6 block"
            file="routes/hr-advisor/employees.tsx"
            params={params}
            search={`filter=${loaderData.backLinkFilter}`}
            id="back-button"
          >
            {`< ${t('app:employee-profile.back')}`}
          </InlineLink>
          <p className="mt-12">{t('app:employee-profile.about-para-1')}</p>
        </div>
      </div>

      {fetcher.data && (
        <AlertMessage
          ref={alertRef}
          type={'success'}
          message={t('app:profile.hr-approved')}
          role="alert"
          ariaLive="assertive"
        />
      )}

      <div className="mt-8 max-w-prose space-y-10">
        <ProfileCard
          title={t('app:profile.personal-information.title')}
          linkLabel={t('app:profile.personal-information.link-label')}
          file="routes/hr-advisor/employee-profile/personal-information.tsx"
          params={params}
        >
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
        </ProfileCard>
        <ProfileCard
          title={t('app:profile.employment.title')}
          linkLabel={t('app:profile.employment.link-label')}
          file="routes/hr-advisor/employee-profile/employment-information.tsx"
          params={params}
        >
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
        </ProfileCard>
        <ProfileCard
          title={t('app:profile.referral.title')}
          linkLabel={t('app:profile.referral.link-label')}
          file="routes/hr-advisor/employee-profile/referral-preferences.tsx"
          params={params}
          required
        >
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
        </ProfileCard>
      </div>
      <fetcher.Form className="mt-6 flex place-content-start space-x-5 md:mt-auto" method="post" noValidate>
        <LoadingButton name="action" variant="primary" id="submit" disabled={isSubmitting} loading={isSubmitting}>
          {t('app:form.approve')}
        </LoadingButton>
      </fetcher.Form>
    </div>
  );
}
