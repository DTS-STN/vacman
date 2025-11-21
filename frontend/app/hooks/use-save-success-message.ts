import { useEffect, useState } from 'react';

import type { useLocation, useNavigate } from 'react-router';

import { useTranslation } from 'react-i18next';

export function useSaveSuccessMessage({
  searchParams,
  location,
  navigate,
  i18nNamespace,
  backLinkSearchParams,
  fetcherData,
}: {
  searchParams: URLSearchParams;
  location: ReturnType<typeof useLocation>;
  navigate: ReturnType<typeof useNavigate>;
  i18nNamespace: readonly ('gcweb' | 'app')[];
  backLinkSearchParams?: string;
  fetcherData: unknown;
}) {
  const { t } = useTranslation(i18nNamespace);

  // Mapping of success parameter values to translation keys
  const successMessageMap: Record<string, string> = {
    'personal-info': t('app:profile.profile-personal-info-saved'),
    'employment': t('app:profile.profile-employment-saved'),
    'referral': t('app:profile.profile-referral-saved'),
  };

  // Determine the success message based on URL params
  const successParam = searchParams.get('success');
  const initialMessage = successParam ? (successMessageMap[successParam] ?? null) : null;

  const [successMessage, setSuccessMessage] = useState<string | null>(initialMessage);

  // Clear success message when form is submitted
  useEffect(() => {
    if (fetcherData) {
      setSuccessMessage(null);
    }
  }, [fetcherData]);

  // Clean URL by removing success param (only needs to happen once)
  useEffect(() => {
    if (successParam) {
      const newUrl = location.pathname + (backLinkSearchParams ? '?' + backLinkSearchParams : '');
      void navigate(newUrl, { replace: true });
    }
  }, [successParam, location.pathname, backLinkSearchParams, navigate]);

  return successMessage;
}
