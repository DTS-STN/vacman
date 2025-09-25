import type { RouteHandle } from 'react-router';
import { Outlet } from 'react-router';

import { useTranslation } from 'react-i18next';

import type { Route } from './+types/layout';

import { requireAuthentication } from '~/.server/utils/auth-utils';
import { checkHrAdvisorRouteRegistration } from '~/.server/utils/registration-utils';
import { getDashboardFile } from '~/.server/utils/route-utils';
import { AppBar } from '~/components/app-bar';
import { LanguageSwitcher } from '~/components/language-switcher';
import { AppLink } from '~/components/links';
import { MenuItem } from '~/components/menu';
import { PageDetails } from '~/components/page-details';
import { SkipNavigationLinks } from '~/components/skip-navigation-links';
import { useLanguage } from '~/hooks/use-language';
import { uselayoutHasDecorativeBackground } from '~/hooks/use-layout-has-background';
import { useRoute } from '~/hooks/use-route';
import { getFixedT } from '~/i18n-config.server';
import { getAltLanguage, getLanguage } from '~/utils/i18n-utils';
import { cn } from '~/utils/tailwind-utils';

export const handle = {
  i18nNamespace: ['gcweb', 'app'],
} as const satisfies RouteHandle;

export async function loader({ context, request }: Route.LoaderArgs) {
  const altLang = getAltLanguage(getLanguage(request) ?? 'en');
  const altT = await getFixedT(altLang, 'gcweb');

  // First ensure the user is authenticated (no specific roles required)
  requireAuthentication(context.session, request);

  // There is no security group in Azure AD for hiring managers, hiring managers are also regular users

  await checkHrAdvisorRouteRegistration(context.session, request);

  return {
    name: context.session.authState.idTokenClaims.name,
    dashboardFile: getDashboardFile(request),
    altLang,
    altLogoText: altT('header.govt-of-canada.text'),
  };
}

export default function Layout({ loaderData }: Route.ComponentProps) {
  const { currentLanguage } = useLanguage();
  const { t } = useTranslation(['gcweb', 'app']);
  const { id: pageId } = useRoute();
  const layoutHasDecorativeBackground = uselayoutHasDecorativeBackground();

  const { BUILD_DATE, BUILD_VERSION } = globalThis.__appEnvironment;
  return (
    <div className="flex min-h-screen flex-col">
      <header className="print:hidden">
        <SkipNavigationLinks />
        <div id="wb-bnr">
          <div className="container flex items-center justify-between gap-6 py-2.5 sm:py-3.5">
            <AppLink to="https://canada.ca/">
              <img
                className="h-8 w-auto"
                src={`https://www.canada.ca/etc/designs/canada/wet-boew/assets/sig-blk-${currentLanguage}.svg`}
                alt={t('gcweb:header.govt-of-canada.text')}
                width="300"
                height="28"
                decoding="async"
              />
              <span className="sr-only">
                / <span lang={loaderData.altLang}>{loaderData.altLogoText}</span>
              </span>
            </AppLink>
            <LanguageSwitcher>{t('gcweb:language-switcher.alt-lang')}</LanguageSwitcher>
          </div>
        </div>
        <AppBar
          name={loaderData.name?.toString()}
          profileItems={<MenuItem file={loaderData.dashboardFile}>{t('app:index.dashboard')}</MenuItem>}
        ></AppBar>
      </header>

      <main className="flex flex-grow flex-col">
        <div
          className={cn('flex flex-grow flex-col print:w-full print:max-w-none', !layoutHasDecorativeBackground && 'container')}
        >
          {layoutHasDecorativeBackground ? (
            <div className="relative flex flex-grow">
              <div className="pointer-events-none absolute inset-0 hidden grid-cols-1 sm:grid sm:grid-cols-12">
                <div className="sm:col-span-8"></div>
                <div className="bg-[rgba(9,28,45,1)] sm:col-span-4">
                  <div className="grid h-full grid-rows-2">
                    <div
                      role="presentation"
                      className="row-start-1 h-full w-full bg-[url('/VacMan-design-element-07.svg')] bg-right-top bg-no-repeat"
                    />
                    <div
                      role="presentation"
                      className="row-start-2 h-full w-full bg-[url('/VacMan-design-element-06.svg')] bg-left-bottom bg-no-repeat"
                    />
                  </div>
                </div>
              </div>

              <div className="relative z-10 container flex h-full">
                <div className="flex flex-1 flex-col">
                  <Outlet />
                  <div className="mt-auto">
                    <PageDetails buildDate={BUILD_DATE} buildVersion={BUILD_VERSION} pageId={pageId} />
                  </div>
                </div>
                <div className="hidden w-4/12 sm:block"></div>
              </div>
            </div>
          ) : (
            <div className="flex flex-grow flex-col">
              <Outlet />
              <div className="mt-auto">
                <PageDetails buildDate={BUILD_DATE} buildVersion={BUILD_VERSION} pageId={pageId} />
              </div>
            </div>
          )}
        </div>
      </main>

      <footer className="mt-auto bg-stone-50 print:hidden">
        <div className="container flex items-center justify-end gap-6 py-2.5 sm:py-3.5">
          <div>
            <img
              src="https://www.canada.ca/etc/designs/canada/wet-boew/assets/wmms-blk.svg"
              alt={t('gcweb:footer.gc-symbol')}
              width={300}
              height={71}
              className="h-10 w-auto"
            />
          </div>
        </div>
      </footer>
    </div>
  );
}
