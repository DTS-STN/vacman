import 'react-router';

import type { Namespace } from 'i18next';

import type { ApplicationContext } from '~/.server/application-context';

declare module 'react-router' {
  ///
  /// TODO ::: GjB ::: overriding RouterContextProvider here facilitates an incremental adoption of RRv7 middleware
  ///                  obviously, this should be removed once the full migration to RRv7 middleware is complete
  ///                  see: https://reactrouter.com/how-to/middleware#migration-from-apploadcontext
  ///
  interface RouterContextProvider extends ApplicationContext {}

  /**
   * Route handles should export an i18n namespace, if necessary.
   */
  interface RouteHandle {
    i18nNamespace?: Namespace;
    /**
     * Whether the root layout should render its decorative background
     */
    layoutHasDecorativeBackground?: boolean;
  }

  /**
   * A route module exports an optional RouteHandle.
   */
  interface RouteModule {
    handle?: RouteHandle;
  }

  /**
   * Override the default React Router RouteModules
   * to include the new RouteModule type.
   */
  interface RouteModules extends Record<string, RouteModule | undefined> {}
}

export {};
