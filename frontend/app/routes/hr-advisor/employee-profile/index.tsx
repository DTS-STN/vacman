import { useRef } from 'react';

import type { RouteHandle } from 'react-router';
import { Form, useActionData, useNavigation } from 'react-router';

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
import { getProfileStatusService } from '~/.server/domain/services/profile-status-service';
import { getUserService } from '~/.server/domain/services/user-service';
import { getWFAStatuses } from '~/.server/domain/services/wfa-status-service';
import { requireAuthentication } from '~/.server/utils/auth-utils';
import { Button } from '~/components/button';
import { DescriptionList, DescriptionListItem } from '~/components/description-list';
import { InlineLink } from '~/components/links';
import { ProfileCard } from '~/components/profile-card';
import { StatusTag } from '~/components/status-tag';
import { EMPLOYEE_WFA_STATUS } from '~/domain/constants';
import { getTranslation } from '~/i18n-config.server';
import { handle as parentHandle } from '~/routes/layout';
import { formatDateTime } from '~/utils/date-utils';

export const handle = {
  i18nNamespace: [...parentHandle.i18nNamespace],
} as const satisfies RouteHandle;

export function meta({ loaderData }: Route.MetaArgs) {
  return [{ title: loaderData?.documentTitle }];
}

export function action({ context, request }: Route.ActionArgs) {
  requireAuthentication(context.session, request);

  //TODO: add logic to approve employee profile

  return {};
}

export async function loader({ context, request, params }: Route.LoaderArgs) {
  requireAuthentication(context.session, request);

  const { lang, t } = await getTranslation(request, handle.i18nNamespace);

  // Fetch both the profile user and the profile data
  const [
    profileResult,
    allLocalizedLanguageReferralTypes,
    allClassifications,
    allLocalizedCities,
    allLocalizedEmploymentTenures,
  ] = await Promise.all([
    getProfileService().getProfileById(context.session.authState.accessToken, Number(params.profileId)),
    getLanguageReferralTypeService().listAllLocalized(lang),
    getClassificationService().listAllLocalized(lang),
    getCityService().listAllLocalized(lang),
    getEmploymentTenureService().listAllLocalized(lang),
    getWFAStatuses().listAll(),
  ]);

  if (profileResult.isErr()) {
    throw new Response('Profile not found', { status: 404 });
  }

  const profileData: Profile = profileResult.unwrap();

  const profileUpdatedByUser = profileData.userUpdated
    ? await getUserService().getUserById(profileData.userId, context.session.authState.accessToken)
    : undefined;
  const profileUpdatedByUserName = profileUpdatedByUser && `${profileUpdatedByUser.firstName} ${profileUpdatedByUser.lastName}`;
  const profileStatus = (await getProfileStatusService().findLocalizedById(profileData.profileStatusId, lang)).unwrap();
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
    workUnitResult && workUnitResult.isSome() ? workUnitResult.unwrap().parent?.name : undefined;
  const directorate = workUnitResult && workUnitResult.isSome() ? workUnitResult.unwrap().name : undefined;
  const city = cityResult && cityResult.isSome() ? cityResult.unwrap() : undefined;
  const wfaStatus = wfaStatusResult ? (wfaStatusResult.isSome() ? wfaStatusResult.unwrap() : undefined) : undefined;
  const hrAdvisor =
    profileData.employmentInformation.hrAdvisor &&
    (await getUserService().getUserById(profileData.employmentInformation.hrAdvisor, context.session.authState.accessToken));
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

  return {
    documentTitle: t('app:employee-profile.page-title'),
    name: `${profileData.personalInformation.givenName} ${profileData.personalInformation.surname}`,
    email: profileData.personalInformation.workEmail,
    profileStatus,
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
      province: city?.provinceTerritory.name,
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
      workLocationCities: cities?.map((city) => city?.provinceTerritory.name + ' - ' + city?.name),
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
        <StatusTag status={{ code: loaderData.profileStatus.code, name: loaderData.profileStatus.name }} />
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
          required
          errorState={actionData?.referralComplete === false}
          showStatus
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
