import { useRef } from 'react';

import type { RouteHandle } from 'react-router';
import { Form, useActionData, useNavigation } from 'react-router';

import { useTranslation } from 'react-i18next';

import type { Route } from '../employee-profile/+types/index';

import type { Profile } from '~/.server/domain/models';
import { getBranchService } from '~/.server/domain/services/branch-service';
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
import { AlertMessage } from '~/components/alert-message';
import { Button } from '~/components/button';
import { DescriptionList, DescriptionListItem } from '~/components/description-list';
import { InlineLink } from '~/components/links';
import { ProfileCard } from '~/components/profile-card';
import { StatusTag } from '~/components/status-tag';
import { EMPLOYEE_WFA_STATUS, PROFILE_STATUS_CODE } from '~/domain/constants';
import { getTranslation } from '~/i18n-config.server';
import { handle as parentHandle } from '~/routes/layout';
import { formatDateTime } from '~/utils/date-utils';

export const handle = {
  i18nNamespace: [...parentHandle.i18nNamespace],
} as const satisfies RouteHandle;

export function meta({ loaderData }: Route.MetaArgs) {
  return [{ title: loaderData.documentTitle }];
}

export async function action({ context, request, params }: Route.ActionArgs) {
  requireAuthentication(context.session, request);

  const profileResult = await getProfileService().getProfileById(
    context.session.authState.accessToken,
    Number(params.profileId),
  );

  if (profileResult.isErr()) {
    throw new Response('Profile not found', { status: 404 });
  }

  const profileData: Profile = profileResult.unwrap();

  // approve the profile
  const submitResult = await getProfileService().updateProfileStatus(
    context.session.authState.accessToken,
    profileData.profileUser.id.toString(),
    PROFILE_STATUS_CODE.approved,
  );
  if (submitResult.isErr()) {
    throw submitResult.unwrapErr();
  }

  return {
    status: 'submitted',
    profileStatus: submitResult.unwrap().id,
  };
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
    allLocalizedEmploymentOpportunities,
  ] = await Promise.all([
    getProfileService().getProfileById(context.session.authState.accessToken, Number(params.profileId)),
    getLanguageReferralTypeService().listAllLocalized(lang),
    getClassificationService().listAllLocalized(lang),
    getCityService().listAllLocalized(lang),
    getEmploymentOpportunityTypeService().listAllLocalized(lang),
    getWFAStatuses().listAll(),
  ]);

  if (profileResult.isErr()) {
    throw new Response('Profile not found', { status: 404 });
  }

  const profileData: Profile = profileResult.unwrap();

  // Fetch the profile user data to get current businessEmail and other user info
  const profileUserResult = await getUserService().getUserById(
    profileData.profileUser.id,
    context.session.authState.accessToken,
  );
  const profileUser = profileUserResult.into();

  const profileUpdatedByUserResult = profileData.userUpdated
    ? await getUserService().getUserById(profileData.profileUser.id, context.session.authState.accessToken)
    : undefined;
  const profileUpdatedByUser = profileUpdatedByUserResult?.into();
  const profileUpdatedByUserName = profileUpdatedByUser && `${profileUpdatedByUser.firstName} ${profileUpdatedByUser.lastName}`;
  const profileStatus = (await getProfileStatusService().findLocalizedById(profileData.profileStatus.id, lang)).unwrap();
  const workUnitResult =
    profileData.employmentInformation.directorate !== undefined
      ? await getDirectorateService().findLocalizedById(profileData.employmentInformation.directorate, lang)
      : undefined;
  const branchResult =
    profileData.employmentInformation.branchOrServiceCanadaRegion !== undefined &&
    profileData.employmentInformation.directorate === undefined // Only look up branch directly if there's no directorate
      ? await getBranchService().findLocalizedById(profileData.employmentInformation.branchOrServiceCanadaRegion, lang)
      : undefined;
  const substantivePositionResult =
    profileData.employmentInformation.substantivePosition !== undefined
      ? await getClassificationService().findLocalizedById(profileData.employmentInformation.substantivePosition, lang)
      : undefined;
  const cityResult =
    profileData.employmentInformation.city !== undefined
      ? await getCityService().findLocalizedById(profileData.employmentInformation.city.id, lang)
      : undefined;

  // convert the IDs to display names
  const substantivePosition = substantivePositionResult?.into()?.name;
  const branchOrServiceCanadaRegion = workUnitResult?.into()?.parent?.name ?? branchResult?.into()?.name;
  const directorate = workUnitResult?.into()?.name;
  const city = cityResult?.into();
  const hrAdvisorResult = profileData.employmentInformation.hrAdvisor
    ? await getUserService().getUserById(profileData.employmentInformation.hrAdvisor, context.session.authState.accessToken)
    : undefined;
  const hrAdvisor = hrAdvisorResult?.into();
  const languageReferralTypes = profileData.languageReferralTypeIds
    ?.map((langId) => allLocalizedLanguageReferralTypes.find((l) => l.id === langId))
    .filter(Boolean);
  const classifications = profileData.classificationIds
    ?.map((classificationId) => allClassifications.find((c) => c.id === classificationId))
    .filter(Boolean);
  const cities = profileData.workLocationCitiesIds
    ?.map((cityId) => allLocalizedCities.find((c) => c.id === cityId))
    .filter(Boolean);
  const employmentOpportunities = profileData.employmentOpportunityIds
    ?.map((employmentOpportunityId) => allLocalizedEmploymentOpportunities.find((c) => c.id === employmentOpportunityId))
    .filter(Boolean);

  return {
    documentTitle: t('app:employee-profile.page-title'),
    name: `${profileData.profileUser.firstName} ${profileData.profileUser.lastName}`,
    email: profileUser?.businessEmail ?? profileData.profileUser.businessEmailAddress,
    profileStatus,
    personalInformation: {
      personalRecordIdentifier: profileData.profileUser.personalRecordIdentifier,
      preferredLanguage:
        lang === 'en'
          ? profileData.personalInformation.preferredLanguage?.nameEn
          : profileData.personalInformation.preferredLanguage?.nameFr,
      workEmail: profileUser?.businessEmail ?? profileData.profileUser.businessEmailAddress,
      personalEmail: profileData.personalInformation.personalEmail,
      workPhone: profileUser?.businessPhone ?? profileData.profileUser.businessPhoneNumber,
      personalPhone: profileData.personalInformation.personalPhone,
      additionalInformation: profileData.personalInformation.additionalInformation,
    },
    employmentInformation: {
      substantivePosition: substantivePosition,
      branchOrServiceCanadaRegion: branchOrServiceCanadaRegion,
      directorate: directorate,
      province: city?.provinceTerritory.name,
      city: city?.name,
      wfaStatus:
        lang === 'en'
          ? profileData.employmentInformation.wfaStatus?.nameEn
          : profileData.employmentInformation.wfaStatus?.nameFr,
      wfaStatusCode: profileData.employmentInformation.wfaStatus?.code,
      wfaEffectiveDate: profileData.employmentInformation.wfaEffectiveDate,
      wfaEndDate: profileData.employmentInformation.wfaEndDate,
      hrAdvisor: hrAdvisor && hrAdvisor.firstName + ' ' + hrAdvisor.lastName,
    },
    referralPreferences: {
      languageReferralTypes: languageReferralTypes?.map((l) => l?.name),
      classifications: classifications?.map((c) => c?.name),
      workLocationCities: cities?.map((city) => city?.provinceTerritory.name + ' - ' + city?.name),
      referralAvailibility: profileData.isAvailableForReferral,
      alternateOpportunity: profileData.isInterestedInAlternation,
      employmentOpportunities: employmentOpportunities?.map((e) => e?.name),
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

      {actionData && (
        <AlertMessage
          ref={alertRef}
          type={loaderData.profileStatus.code === PROFILE_STATUS_CODE.approved ? 'success' : 'error'}
          message={
            loaderData.profileStatus.code === PROFILE_STATUS_CODE.approved
              ? t('app:profile.hr-approved')
              : t('app:profile.profile-incomplete')
          }
        />
      )}

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
                loaderData.employmentInformation.wfaStatusCode === EMPLOYEE_WFA_STATUS.surplusOptingOptionA ||
                loaderData.employmentInformation.wfaStatusCode === EMPLOYEE_WFA_STATUS.exOpting ||
                loaderData.employmentInformation.wfaStatusCode === EMPLOYEE_WFA_STATUS.exSurplusCPA) && (
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
              {loaderData.referralPreferences.employmentOpportunities === undefined
                ? t('app:employee-profile.not-provided')
                : loaderData.referralPreferences.employmentOpportunities.length > 0 &&
                  loaderData.referralPreferences.employmentOpportunities.join(', ')}
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
