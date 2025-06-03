import appEn from './app-en';
import appFr from './app-fr';

import gcwebEn from '~/.server/locales/gcweb-en.json';
import gcwebFr from '~/.server/locales/gcweb-fr.json';

export const i18nResourcesEn = {
  gcweb: gcwebEn,
  app: appEn,
} as const;

export const i18nResourcesFr = {
  gcweb: gcwebFr,
  app: appFr,
} as const;

export const i18nResources = {
  en: i18nResourcesEn,
  fr: i18nResourcesFr,
} as const satisfies Record<Language, typeof i18nResourcesEn>;

export type I18nResources = typeof i18nResources;

export interface Translations {
  index: {
    about: string;
    dashboard: string;
    pageTitle: string;
    navigate: string;
    register: string;
  };
  register: {
    employee: string;
    hiringManager: string;
    pageTitle: string;
  };
  profile: {
    about: string;
    edit: string;
    add: string;
    inProgress: string;
    required: string;
    fieldsComplete: string;
    personalInformation: { title: string; linkLabel: string };
    employment: { title: string; linkLabel: string };
    referral: { title: string; linkLabel: string };
    qualifications: { title: string; linkLabel: string };
    back: string;
  };
  form: {
    save: string;
    submit: string;
  };
  personalInformation: {
    pageTitle: string;
    preferredLanguage: string;
    workEmail: string;
    personalEmail: string;
    workPhone: string;
    personalPhone: string;
    personalPhoneHelpMessagePrimary: string;
    workPhoneHelpMessagePrimary: string
    workPhoneExtension: string;
    workPhoneExtensionHelpMessagePrimary: string;
    education: string;
    additionalInformation: string;
    additionalInfoHelpMessage: string;
    errors: {
      preferredLanguage_Required: string;
      personalEmail_Invalid: string;
      personalEmail_Required: string;
      workPhone_Invalid: string;
      workPhone_Required: string;
      personalPhone_Invalid: string;
      personalPhone_Required: string;
      education_Required: string;
    };
  };
  employmentInformation: {
    pageTitle: string;
    personalRecordIdentifier: string;
    substantivePositionHeading: string;
    substantivePositionGroupAndLevel: string;
    substantiveGroup: string;
    substantiveLevel: string;
    branchOrServiceCanadaRegion: string;
    directorate: string;
    provinces: string;
    city: string;
    wfaDetailsHeading: string;
    current_Wfa_Status: string;
    wfa_EffectiveDate: string;
    wfa_EndDate: string;
    hrAdvisor: string;
    errors: {
      personalRecordIdentifier_Required: string;
      personalRecordIdentifier_Invalid: string;
      substantiveGroup_Required: string;
      substantiveLevel_Required: string;
      branchOrServiceCanadaRegion_Required: string;
      directorate_Required: string;
      provinces_Required: string;
      city_Required: string;
      current_Wfa_Status_Required: string;
      hrAdvisor_Required: string;
    };
  };
}
