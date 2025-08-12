import type { RouteHandle } from 'react-router';
import { Outlet } from 'react-router';

import { useTranslation } from 'react-i18next';

import type { Route } from './+types/layout';

import { requireAuthentication } from '~/.server/utils/auth-utils';
import { checkHiringManagerRouteRegistration } from '~/.server/utils/hiring-manager-registration-utils';
import { checkHrAdvisorRouteRegistration } from '~/.server/utils/hr-advisor-registration-utils';
import { AppBar } from '~/components/app-bar';
import { LanguageSwitcher } from '~/components/language-switcher';
import { AppLink } from '~/components/links';
import { MenuItem } from '~/components/menu';
import { PageDetails } from '~/components/page-details';
import { SkipNavigationLinks } from '~/components/skip-navigation-links';
import { useLanguage } from '~/hooks/use-language';
import { useRoute } from '~/hooks/use-route';

export const handle = {
  i18nNamespace: ['gcweb', 'app'],
} as const satisfies RouteHandle;

export async function loader({ context, request }: Route.LoaderArgs) {
  const currentUrl = new URL(request.url);

  // First ensure the user is authenticated (no specific roles required)
  requireAuthentication(context.session, currentUrl);

  // Check hiring manager registration for hiring manager routes
  await checkHiringManagerRouteRegistration(context.session, currentUrl);

  // Check hr-advisor registration for hr-advisor routes
  await checkHrAdvisorRouteRegistration(context.session, currentUrl);

  return { name: context.session.authState.idTokenClaims.name };
}

export default function Layout({ loaderData }: Route.ComponentProps) {
  const { currentLanguage } = useLanguage();
  const { t } = useTranslation(['gcweb', 'app']);
  const { id: pageId } = useRoute();

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
            </AppLink>
            <LanguageSwitcher>{t('gcweb:language-switcher.alt-lang')}</LanguageSwitcher>
          </div>
        </div>
        <AppBar
          name={loaderData.name?.toString()}
          profileItems={<MenuItem file="routes/employee/index.tsx">{t('app:index.dashboard')}</MenuItem>}
        ></AppBar>
      </header>

      <main className="flex-grow">
        <div className="relative">
          <div className="container print:w-full print:max-w-none">
            <Outlet />
            <PageDetails buildDate={BUILD_DATE} buildVersion={BUILD_VERSION} pageId={pageId} />
          </div>
        </div>
      </main>

      <footer id="wb-info" tabIndex={-1} className="mt-auto bg-stone-50 print:hidden">
        <div className="container flex items-center justify-end gap-6 py-2.5 sm:py-3.5">
          <div>
            <h2 className="sr-only">{t('gcweb:footer.about-site')}</h2>
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
        </div>
      </footer>
    </div>
  );
}
