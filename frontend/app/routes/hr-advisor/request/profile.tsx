import type { JSX, ReactNode } from 'react';

import type { RouteHandle } from 'react-router';

import { useTranslation } from 'react-i18next';

import type { Route } from './+types/profile';

import { getCityService } from '~/.server/domain/services/city-service';
import { getClassificationService } from '~/.server/domain/services/classification-service';
import { getLanguageReferralTypeService } from '~/.server/domain/services/language-referral-type-service';
import { getRequestService } from '~/.server/domain/services/request-service';
import { getWorkUnitService } from '~/.server/domain/services/workunit-service';
import { requireAuthentication } from '~/.server/utils/auth-utils';
import { getHrAdvisors } from '~/.server/utils/profile-utils';
import { BackLink } from '~/components/back-link';
import { Card, CardContent, CardHeader, CardTitle } from '~/components/card';
import { DescriptionList, DescriptionListItem } from '~/components/description-list';
import { PageTitle } from '~/components/page-title';
import { VacmanBackground } from '~/components/vacman-background';
import { WFA_STATUS } from '~/domain/constants';
import { HttpStatusCodes } from '~/errors/http-status-codes';
import { getTranslation } from '~/i18n-config.server';
import { handle as parentHandle } from '~/routes/layout';
import { formatWithMask } from '~/utils/string-utils';

export const handle = {
  i18nNamespace: [...parentHandle.i18nNamespace],
} as const satisfies RouteHandle;

export async function loader({ context, request, params }: Route.LoaderArgs) {
  const { session } = context.get(context.applicationContext);
  requireAuthentication(session, request);
  const { lang, t } = await getTranslation(request, handle.i18nNamespace);

  const profileDataOption = await getRequestService().getRequestProfile(
    parseInt(params.requestId),
    parseInt(params.profileId),
    session.authState.accessToken,
  );

  if (profileDataOption.isErr()) {
    throw new Response('Profile not found', { status: HttpStatusCodes.NOT_FOUND });
  }

  const profileData = profileDataOption.unwrap();
  const profileUser = profileData.profileUser;

  // Fetch reference data
  const [allLocalizedLanguageReferralTypes, allClassifications, allLocalizedCities] = await Promise.all([
    getLanguageReferralTypeService().listAllLocalized(lang),
    getClassificationService().listAllLocalized(lang),
    getCityService().listAllLocalized(lang),
  ]);

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
  const languageReferralTypes = profileData.preferredLanguages
    ?.map((lang) => allLocalizedLanguageReferralTypes.find((l) => l.id === lang.id))
    .filter(Boolean);
  const classifications = profileData.preferredClassifications
    ?.map((classification) => allClassifications.find((c) => c.id === classification.id))
    .filter(Boolean);
  const cities = profileData.preferredCities?.map((city) => allLocalizedCities.find((c) => c.id === city.id)).filter(Boolean);

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
      preferredLanguages: languageReferralTypes?.map((l) => l?.name),
      preferredClassifications: classifications?.map((c) => c?.name),
      preferredCities: cities?.map((city) => city?.provinceTerritory.name + ' - ' + city?.name),
      isAvailableForReferral: profileData.isAvailableForReferral,
      isInterestedInAlternation: profileData.isInterestedInAlternation,
    },
    backLinkSearchParams: new URL(request.url).searchParams.toString(),
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
        file="routes/hr-advisor/request/matches.tsx"
        params={params}
        search={new URLSearchParams(loaderData.backLinkSearchParams)}
      >
        {t('app:matches.back-request-candidates')}
      </BackLink>
      <div className="max-w-prose space-y-10">
        <DetailsCard title={t('app:profile.personal-information.title')}>
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
        </DetailsCard>
        <DetailsCard title={t('app:profile.employment.title')}>
          <div>
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
          </div>
          <div>
            <h3 className="font-lato text-xl font-bold">{t('app:employment-information.wfa-details-heading')}</h3>
            <DescriptionList>
              <DescriptionListItem term={t('app:employment-information.wfa-status')}>
                {loaderData.employmentInformation.wfaStatus ?? t('app:profile.not-provided')}
              </DescriptionListItem>
              <DescriptionListItem term={t('app:employment-information.wfa-effective-date')}>
                {loaderData.employmentInformation.wfaEffectiveDate ?? t('app:profile.not-provided')}
              </DescriptionListItem>
              {(loaderData.employmentInformation.wfaStatusCode === WFA_STATUS.OPTING.code ||
                loaderData.employmentInformation.wfaStatusCode === WFA_STATUS.OPTING_EX.code ||
                loaderData.employmentInformation.wfaStatusCode === WFA_STATUS.SURPLUS_NO_GRJO.code ||
                loaderData.employmentInformation.wfaStatusCode === WFA_STATUS.EXSURPLUSCPA.code ||
                loaderData.employmentInformation.wfaStatusCode === WFA_STATUS.RELOCATION.code ||
                loaderData.employmentInformation.wfaStatusCode === WFA_STATUS.ALTERNATE_DELIVERY.code) && (
                <DescriptionListItem term={t('app:employment-information.wfa-end-date')}>
                  {loaderData.employmentInformation.wfaEndDate ?? t('app:profile.not-provided')}
                </DescriptionListItem>
              )}
              <DescriptionListItem term={t('app:employment-information.hr-advisor')}>
                {loaderData.employmentInformation.hrAdvisor ?? t('app:profile.not-provided')}
              </DescriptionListItem>
            </DescriptionList>
          </div>
        </DetailsCard>
        <DetailsCard title={t('app:profile.referral.title')}>
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
              {loaderData.referralPreferences.preferredCities === undefined
                ? t('app:profile.not-provided')
                : loaderData.referralPreferences.preferredCities.length > 0 &&
                  loaderData.referralPreferences.preferredCities.join(', ')}
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
