import type { JSX, ReactNode } from 'react';

import type { RouteHandle } from 'react-router';

import { useTranslation } from 'react-i18next';

import type { Route } from './+types/profile';

import type { LocalizedCity } from '~/.server/domain/models';
import { getCityService } from '~/.server/domain/services/city-service';
import { getClassificationService } from '~/.server/domain/services/classification-service';
import { getRequestService } from '~/.server/domain/services/request-service';
import { getWorkUnitService } from '~/.server/domain/services/workunit-service';
import { requireAuthentication } from '~/.server/utils/auth-utils';
import { getHrAdvisors } from '~/.server/utils/profile-utils';
import { BackLink } from '~/components/back-link';
import { Card, CardContent, CardHeader, CardTitle } from '~/components/card';
import { PageTitle } from '~/components/page-title';
import { VacmanBackground } from '~/components/vacman-background';
import { HttpStatusCodes } from '~/errors/http-status-codes';
import { getTranslation } from '~/i18n-config.server';
import { handle as parentHandle } from '~/routes/layout';
import { EmploymentInformationSection } from '~/routes/page-components/profile/employment-information-section';
import { PersonalInformationSection } from '~/routes/page-components/profile/personal-information-section';
import { ReferralPreferencesSection } from '~/routes/page-components/profile/referral-preferences-section';
import { formatWithMask } from '~/utils/string-utils';

export const handle = {
  i18nNamespace: [...parentHandle.i18nNamespace],
} as const satisfies RouteHandle;

export async function loader({ context, request, params }: Route.LoaderArgs) {
  const { session } = context.get(context.applicationContext);
  requireAuthentication(session, request);
  const { lang, t } = await getTranslation(request, handle.i18nNamespace);

  const [profileResult, allLocalizedCities] = await Promise.all([
    getRequestService().getRequestProfile(
      parseInt(params.requestId),
      parseInt(params.profileId),
      session.authState.accessToken,
    ),
    getCityService().listAllLocalized(lang),
  ]);

  if (profileResult.isErr()) {
    throw new Response('Profile not found', { status: HttpStatusCodes.NOT_FOUND });
  }

  const profileData = profileResult.unwrap();
  const profileUser = profileData.profileUser;

  // Use profileUser for updated by information as well
  const workUnitResult =
    profileData.substantiveWorkUnit !== undefined
      ? await getWorkUnitService().findLocalizedById(profileData.substantiveWorkUnit.id, lang)
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
    documentTitle: t('app:profile.page-title'),
    name: `${profileUser.firstName ?? ''} ${profileUser.lastName ?? ''}`.trim() || 'Unknown User',
    email: profileUser.businessEmailAddress,
    personalInformation: {
      personalRecordIdentifier: profileUser.personalRecordIdentifier
        ? formatWithMask(profileUser.personalRecordIdentifier, '### ### ###')
        : undefined,
      preferredLanguage:
        lang === 'en' ? profileData.languageOfCorrespondence?.nameEn : profileData.languageOfCorrespondence?.nameFr,
      workEmail: profileUser.businessEmailAddress,
      personalEmail: profileData.personalEmailAddress,
      workPhone: profileUser.businessPhoneNumber,
      personalPhone: profileData.personalPhoneNumber,
    },
    employmentInformation: {
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
      preferredLanguages: profileData.preferredLanguages?.map((l) => (lang === 'en' ? l.nameEn : l.nameFr)),
      preferredClassifications: profileData.preferredClassifications?.map((c) => (lang === 'en' ? c.nameEn : c.nameFr)),
      preferredCities: partiallySelectedCities,
      locationScope,
      provinceNames,
      isAvailableForReferral: profileData.isAvailableForReferral,
      isInterestedInAlternation: profileData.isInterestedInAlternation,
    },
  };
}

export default function HiringManagerRequestProfile({ loaderData, params }: Route.ComponentProps) {
  const { t } = useTranslation(handle.i18nNamespace);

  return (
    <div className="space-y-8">
      <VacmanBackground variant="bottom-right">
        <PageTitle className="after:w-14" variant="bottom" subTitle={loaderData.email} subTitleClassName="mt-3">
          {loaderData.name}
        </PageTitle>
      </VacmanBackground>
      <BackLink
        aria-label={t('app:matches.back-request-candidates')}
        file="routes/hiring-manager/request/matches.tsx"
        params={params}
      >
        {t('app:matches.back-request-candidates')}
      </BackLink>
      <div className="max-w-prose space-y-10">
        <DetailsCard title={t('app:profile.personal-information.title')}>
          <PersonalInformationSection
            personalEmail={loaderData.personalInformation.personalEmail}
            personalPhone={loaderData.personalInformation.personalPhone}
            preferredLanguage={loaderData.personalInformation.preferredLanguage}
            personalRecordIdentifier={loaderData.personalInformation.personalRecordIdentifier}
            workEmail={loaderData.personalInformation.workEmail}
            workPhone={loaderData.personalInformation.workPhone}
          />
        </DetailsCard>
        <DetailsCard title={t('app:profile.employment.title')}>
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
        </DetailsCard>
        <DetailsCard title={t('app:profile.referral.title')}>
          <ReferralPreferencesSection
            isAvailableForReferral={loaderData.referralPreferences.isAvailableForReferral}
            isInterestedInAlternation={loaderData.referralPreferences.isInterestedInAlternation}
            locationScope={loaderData.referralPreferences.locationScope}
            preferredCities={loaderData.referralPreferences.preferredCities}
            preferredClassifications={loaderData.referralPreferences.preferredClassifications}
            preferredLanguages={loaderData.referralPreferences.preferredLanguages}
            provinceNames={loaderData.referralPreferences.provinceNames}
          />
        </DetailsCard>
      </div>
    </div>
  );
}

interface DetailsCardProps {
  title: string;
  children: ReactNode;
}

function DetailsCard({ title, children }: DetailsCardProps): JSX.Element {
  return (
    <Card className="rounded-md p-4 sm:p-6">
      <CardHeader className="p-0">
        <CardTitle className="text-2xl">{title}</CardTitle>
      </CardHeader>
      <CardContent className="my-3 space-y-5 p-0">{children}</CardContent>
    </Card>
  );
}
