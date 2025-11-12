/**
 * Type declarations for extending the i18next module.
 *
 * This file augments the i18next library's type definitions to provide
 * type safety for our application's internationalization resources.
 * By extending the CustomTypeOptions interface, we ensure that TypeScript
 * can properly type-check translation keys and provide autocomplete
 * for our custom translation namespaces and keys.
 */
import 'i18next';

import type { I18nResources } from '~/.server/locales';

/**
 * Augment the `i18next` namespace with our custom resource type definitions.
 *
 * This module declaration extends i18next's CustomTypeOptions to specify
 * that our resources follow the structure defined in either I18nResources['en'] or I18nResources['fr'].
 * Using a union of both language resources allows TypeScript to accept keys that exist
 * in either language, providing flexibility but potentially less strict type checking
 * compared to using a single canonical language reference.
 */
declare module 'i18next' {
  interface CustomTypeOptions {
    /**
     * Defines the structure of our translation resources for type checking.
     * Uses a union of English and French resources, allowing keys that exist
     * in either language. This provides flexibility but may be less strict
     * than using a single canonical language reference.
     */
    resources: I18nResources['en'] | I18nResources['fr'];
  }
}

// Required empty export to ensure this file is treated as a module by TypeScript,
// allowing the module augmentation above to be properly scoped and applied.
export {};
