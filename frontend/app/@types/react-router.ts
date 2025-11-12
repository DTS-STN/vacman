/**
 * Type declarations for extending the React Router module.
 *
 * This file augments React Router's type definitions to support our application's
 * specific routing needs, including internationalization, custom route handles,
 * and application context management. These extensions provide type safety
 * for our custom routing patterns and middleware integration.
 */
import type { RouterContext } from 'react-router';

import type { Namespace } from 'i18next';

import type { ApplicationContext } from '~/.server/express/handlers';

declare module 'react-router' {
  /**
   * Temporary override to facilitate incremental adoption of React Router v7 middleware.
   *
   * This extends the RouterContextProvider to include our custom ApplicationContext,
   * allowing gradual migration from the current middleware setup. This should be
   * removed once the full migration to RRv7 middleware is complete.
   *
   * @see ~/.server/express/handlers for more details on the migration
   */
  interface RouterContextProvider {
    applicationContext: RouterContext<ApplicationContext>;
  }

  /**
   * Extended route handle interface for our application's routing needs.
   *
   * Route handles allow routes to export metadata that can be used by parent
   * routes, layouts, or other components. Our extension adds support for
   * internationalization namespaces and layout customization options.
   */
  interface RouteHandle {
    /**
     * Specifies the i18next namespace(s) required by this route.
     * Used by the i18n loading system to ensure translation resources
     * are available before rendering the route.
     */
    i18nNamespace?: Namespace;
    /**
     * Controls whether the root layout should render its decorative background.
     * Allows individual routes to customize the visual appearance of the layout.
     */
    layoutHasDecorativeBackground?: boolean;
  }

  /**
   * Extended route module interface that includes our custom route handle.
   *
   * Route modules in React Router can export various properties including
   * loaders, actions, and components. Our extension adds support for
   * the custom RouteHandle interface.
   */
  interface RouteModule {
    /**
     * Optional route handle containing metadata for this route.
     * Used by parent routes and layouts to customize behavior and styling.
     */
    handle?: RouteHandle;
  }

  /**
   * Override of React Router's RouteModules to use our extended RouteModule type.
   *
   * This ensures that all route modules in our application support the
   * custom RouteHandle interface and its associated properties.
   */
  interface RouteModules extends Record<string, RouteModule | undefined> {}
}

// Required empty export to ensure this file is treated as a module by TypeScript,
// allowing the module augmentation above to be properly scoped and applied.
export {};
