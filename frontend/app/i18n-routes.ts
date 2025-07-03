/*
 *
 * This file defines the structure and types for internationalized (i18n) routes.
 * It provides a way to represent routes with different paths for different languages.
 *
 * The `i18nRoutes` constant holds the configuration for these routes, which are then
 * transformed into react-router `RouteConfigEntry` objects in `routes.ts`. This
 * separation allows the i18n route definitions to be imported and used in client-side
 * code when generating links.
 *
 */

/**
 * Represents a record of paths for different languages.
 * Key: Language code (e.g., 'en', 'fr').
 * Value: A path for that language (ex: /en/about or /fr/a-propos).
 */
type I18nPaths = Record<Language, string>;

/**
 * A utility typpe that extracts the file path from an I18nPageRoute type.
 * @template T - The type to extract the file from.
 */
type ExtractI18nRouteFile<T> = T extends I18nPageRoute ? T['file'] : never;

/**
 * A utility typpe that extracts the id from an I18nPageRoute type.
 * @template T - The type to extract the id from.
 */
type ExtractI18nRouteId<T> = T extends I18nPageRoute ? T['id'] : never;

/**
 * A utility type that recursively extracts all file paths from an array of I18nRoute objects.
 * @template T - The type of the I18nRoute array.
 */
type ExtractI18nRouteFiles<T> = T extends I18nLayoutRoute
  ? ExtractI18nRouteFiles<T['children'][number]> //
  : ExtractI18nRouteFile<T>;

/**
 * A utility type that recursively extracts all ids from an array of I18nRoute objects.
 * @template T - The type of the I18nRoute array.
 */
type ExtractI18nRouteIds<T> = T extends I18nLayoutRoute
  ? ExtractI18nRouteIds<T['children'][number]> //
  : ExtractI18nRouteId<T>;

/**
 * Represents a route that can be either a layout route or a page route.
 */
export type I18nRoute = I18nLayoutRoute | I18nPageRoute;

/**
 * Represents a layout route, which contains other routes as children.
 * @property file - The file path for the layout component.
 * @property children - An array of child I18nRoute objects.
 */
export type I18nLayoutRoute = { file: string; children: I18nRoute[] };

/**
 * Represents a page route, which has specific paths for different languages.
 * @property id - A unique identifier for the route.
 * @property file - The file path for the page component.
 * @property paths - An I18nPaths object containing paths for different languages.
 */
export type I18nPageRoute = { id: string; file: string; paths: I18nPaths };

/**
 * Represents all file paths used in the i18n routes.
 */
export type I18nRouteFile = ExtractI18nRouteFiles<(typeof i18nRoutes)[number]>;

/**
 * Represents all ids used in the i18n routes.
 */
export type I18nRouteId = ExtractI18nRouteIds<(typeof i18nRoutes)[number]>;

/**
 * Type guard to determine if a route is an I18nLayoutRoute.
 * @param obj - The object to check.
 * @returns `true` if the object is an I18nLayoutRoute, `false` otherwise.
 */
export function isI18nLayoutRoute(obj: unknown): obj is I18nLayoutRoute {
  return obj !== null && typeof obj === 'object' && 'file' in obj && 'children' in obj;
}

/**
 * Type guard to determine if a route is an I18nPageRoute.
 * @param obj - The object to check.
 * @returns `true` if the object is an I18nPageRoute, `false` otherwise.
 */
export function isI18nPageRoute(obj: unknown): obj is I18nPageRoute {
  return obj !== null && typeof obj === 'object' && 'file' in obj && 'paths' in obj;
}

/**
 * Bilingual routes are declared in an I18nRoute[] object so the
 * filenames can be extracted and strongly typed as I18nPageRouteId
 *
 * These routes exist in a separate module from routes.ts so they can
 * be imported into clientside code without triggering side effects.
 */
export const i18nRoutes = [
  //
  // Protected routes (ie: authentication required)
  //
  {
    file: 'routes/layout.tsx',
    children: [
      {
        id: 'PROT-0001',
        file: 'routes/index.tsx',
        paths: { en: '/en/', fr: '/fr/' },
      },
      {
        id: 'EMPL-0001',
        file: 'routes/employee/index.tsx',
        paths: {
          en: '/en/employee',
          fr: '/fr/employe',
        },
      },
      {
        id: 'EMPL-0002',
        file: 'routes/employee/privacy-consent.tsx',
        paths: {
          en: '/en/employee/privacy-consent',
          fr: '/fr/employe/consentement-a-la-confidentialite',
        },
      },
      {
        id: 'EMPL-0003',
        file: 'routes/employee/profile/index.tsx',
        paths: {
          en: '/en/employee/profile',
          fr: '/fr/employe/profil',
        },
      },
      {
        id: 'EMPL-0004',
        file: 'routes/employee/profile/personal-information.tsx',
        paths: {
          en: '/en/employee/profile/personal-information',
          fr: '/fr/employe/profil/informations-personnelles',
        },
      },
      {
        id: 'EMPL-0005',
        file: 'routes/employee/profile/employment-information.tsx',
        paths: {
          en: '/en/employee/profile/employment-information',
          fr: `/fr/employe/profil/informations-sur-lemploi`,
        },
      },
      {
        id: 'EMPL-0006',
        file: 'routes/employee/profile/referral-preferences.tsx',
        paths: {
          en: '/en/employee/profile/referral-preferences',
          fr: '/fr/employe/profil/préférences-de-référence',
        },
      },
      {
        id: 'HIRE-0001',
        file: 'routes/hiring-manager/index.tsx',
        paths: {
          en: '/en/hiring-manager',
          fr: '/fr/gestionnaire-embauche',
        },
      },
    ],
  },

  //
  // Publicly accessable routes (ie: no authentication required)
  //
  // {
  //   file: 'routes/public/layout.tsx',
  //   children: [
  //     {
  //       id: 'PUBL-0001',
  //       file: 'routes/public/index.tsx',
  //       paths: { en: '/en/public', fr: '/fr/public' },
  //     },
  //   ],
  // },
] as const satisfies I18nRoute[];
