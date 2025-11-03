import { useMemo } from 'react';

import type { Params, To } from 'react-router';
import { generatePath, matchPath, useNavigation } from 'react-router';

import { useLanguage } from '~/hooks/use-language';
import { i18nRoutes } from '~/i18n-routes';
import type { I18nRouteFile } from '~/i18n-routes';
import { findRouteByFile } from '~/utils/route-utils';

/**
 * @param path The link's location, either a `I18nRouteFile` or `To`.
 * @returns `boolean` Indicates if the link is loading.
 */
export function useLinkLoading(path: I18nRouteFile | To | undefined, params: Params | undefined): boolean {
  const { currentLanguage } = useLanguage();
  const navigation = useNavigation();
  const currentPath = typeof path === 'object' ? path.pathname : path;
  const isLoading = useMemo(() => {
    const pathname =
      typeof path === 'string'
        ? //The path either a 'I18nRouteFile' or a 'string', if it's a string we have to normalize it
          (findRouteByFile(path, i18nRoutes)?.paths[currentLanguage ?? 'en'] ?? (path ? new URL(path).pathname : null))
        : //The path is a 'Partial<Path>'
          typeof path === 'object'
          ? path.pathname
            ? new URL(path.pathname).pathname //Normalize the url path
            : null
          : null;
    return navigation.state === 'loading' && generatePath(pathname ?? '', params) === navigation.location.pathname;
  }, [currentPath, navigation.state, navigation.location]);
  return isLoading;
}

/**
 * @returns `boolean` Indicates if the page is loading.
 */
export function useFetchLoading(): boolean {
  const navigation = useNavigation();
  const isLoading = useMemo(
    () => navigation.state === 'loading' && matchPath(location.pathname, navigation.location.pathname) !== null,
    [navigation.state, navigation.location],
  );
  return isLoading;
}
