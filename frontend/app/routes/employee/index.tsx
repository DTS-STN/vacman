/**
 * @fileoverview Employee Dashboard Route
 * 
 * This file implements the main dashboard for employees in the VacMan application.
 * It serves as the landing page after authentication and provides access to the
 * employee's profile management functionality.
 * 
 * Key features:
 * - User registration and profile initialization
 * - Dashboard navigation to profile management
 * - Responsive design with decorative elements
 * - Internationalization support
 */

import type { RouteHandle } from 'react-router';

import { faUser } from '@fortawesome/free-solid-svg-icons';
import { useTranslation } from 'react-i18next';

import type { Route } from './+types/index';

import { getLanguageForCorrespondenceService } from '~/.server/domain/services/language-for-correspondence-service';
import { getProfileService } from '~/.server/domain/services/profile-service';
import { getUserService } from '~/.server/domain/services/user-service';
import { requireAuthentication } from '~/.server/utils/auth-utils';
import { DashboardCard } from '~/components/dashboard-card';
import { PageTitle } from '~/components/page-title';
import { LANGUAGE_ID } from '~/domain/constants';
import { getTranslation } from '~/i18n-config.server';
import { handle as parentHandle } from '~/routes/layout';
import { getLanguage } from '~/utils/i18n-utils';

/**
 * Route configuration for internationalization
 * Inherits translation namespaces from parent layout
 */
export const handle = {
  i18nNamespace: [...parentHandle.i18nNamespace],
} as const satisfies RouteHandle;

/**
 * Meta function to set the page title
 * @param loaderData - Data from the loader function containing document title
 * @returns Array of meta tags for the page
 */
export function meta({ loaderData }: Route.MetaArgs) {
  return [{ title: loaderData?.documentTitle }];
}

/**
 * Loader function for the employee dashboard
 * 
 * Handles user authentication, registration, and profile initialization.
 * This function ensures that:
 * 1. The user is authenticated
 * 2. The user exists in the system (registers if not)
 * 3. A profile is created for the user
 * 
 * @param context - Route context containing session and authentication info
 * @param request - The incoming HTTP request
 * @returns Object containing the document title for the page
 * @throws Will throw if authentication fails or user/profile creation fails
 */
export async function loader({ context, request }: Route.LoaderArgs) {
  // Ensure user is authenticated before proceeding
  requireAuthentication(context.session, request);
  
  // Check if current user exists in session, if not fetch/register user
  if (!context.session.currentUser) {
    try {
      // Try to get existing user
      const currentUser = await getUserService().getCurrentUser(context.session.authState.accessToken);
      context.session.currentUser = currentUser.unwrap();
    } catch {
      // User doesn't exist, register new user with default language
      const language = await getLanguageForCorrespondenceService().findById(LANGUAGE_ID[getLanguage(request) ?? 'en']);
      const languageId = language.unwrap().id;
      const currentUser = await getUserService().registerCurrentUser({ languageId }, context.session.authState.accessToken);
      context.session.currentUser = currentUser.unwrap();
    } finally {
      // Ensure user has a profile (register if needed)
      await getProfileService().registerProfile(context.session.authState.accessToken);
    }
  }

  // Get localized translations and return page data
  const { t } = await getTranslation(request, handle.i18nNamespace);
  return {
    documentTitle: t('app:index.employee-dashboard'),
  };
}

/**
 * Employee Dashboard Component
 * 
 * Renders the main dashboard interface for authenticated employees.
 * Features a responsive layout with:
 * - Main content area with navigation cards
 * - Decorative background elements (only visible on larger screens)
 * - Profile management access card
 * 
 * The dashboard uses a split layout where the right side shows decorative
 * VacMan design elements, and the left side contains the functional content.
 * 
 * @param loaderData - Data from the loader containing page configuration
 * @param params - Route parameters (currently unused)
 * @returns JSX element representing the dashboard
 */
export default function EmployeeDashboard({ loaderData, params }: Route.ComponentProps) {
  const { t } = useTranslation(handle.i18nNamespace);

  return (
    <div className="flex h-screen">
      {/* Decorative background section - hidden on small screens */}
      <aside className="absolute inset-y-0 right-0 z-0 hidden w-2/5 bg-[rgba(9,28,45,1)] sm:block">
        {/* Top decorative element */}
        <div
          role="presentation"
          className="absolute top-0 right-0 size-1/2 w-full bg-[url('/VacMan-design-element-07.svg')] bg-contain bg-top bg-no-repeat"
        />
        {/* Bottom decorative element */}
        <div
          role="presentation"
          className="absolute inset-x-0 bottom-0 h-1/2 bg-[url('/VacMan-design-element-06.svg')] bg-contain bg-bottom bg-no-repeat"
        />
      </aside>
      
      {/* Main content area */}
      <div className="mb-8 w-full px-4 sm:w-3/5 sm:px-6">
        <PageTitle className="after:w-14">{t('app:index.get-started')}</PageTitle>
        <div className="grid gap-4">
          {/* Profile management card */}
          <DashboardCard file="routes/employee/profile/index.tsx" icon={faUser} title={t('app:profile.view')} />
        </div>
      </div>
    </div>
  );
}
