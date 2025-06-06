import appEn from '~/.server/locales/app-en';
import appFr from '~/.server/locales/app-fr';
import gcwebEn from '~/.server/locales/gcweb-en';
import gcwebFr from '~/.server/locales/gcweb-fr';

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
