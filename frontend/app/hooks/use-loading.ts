import type { To } from 'react-router';
import { useNavigation } from 'react-router';

import { useLanguage } from '~/hooks/use-language';
import { i18nRoutes } from '~/i18n-routes';
import type { I18nRouteFile } from '~/i18n-routes';
import { findRouteByFile } from '~/utils/route-utils';

export function useLinkLoading(file?: I18nRouteFile, to?: To): boolean {
  const { currentLanguage } = useLanguage();
  const navigation = useNavigation();
  const pathname = file
    ? (findRouteByFile(file, i18nRoutes)?.paths[currentLanguage ?? 'en'] ?? null)
    : typeof to === 'object'
      ? to.pathname
        ? new URL(to.pathname).pathname
        : null
      : to
        ? new URL(to).pathname
        : null;
  return (pathname && pathname === navigation.location?.pathname) === true;
}

export function useFetchLoading(): boolean {
  const navigation = useNavigation();
  return navigation.state === 'loading' && location.pathname === navigation.location.pathname;
}
