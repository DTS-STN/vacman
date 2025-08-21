import type { Params, Path } from 'react-router';

import { faAngleLeft } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useTranslation } from 'react-i18next';

import { InlineLink } from '~/components/links';
import type { I18nRouteFile } from '~/i18n-routes';
import { cn } from '~/utils/tailwind-utils';

interface BackLinkProps {
  file: I18nRouteFile;
  params?: Params;
  className?: string;
  hash?: Path['hash'];
  search?: Path['search'];
  translationKey?: string;
}

export function BackLink({ className, file, params, hash, search, translationKey = 'app:profile.back' }: BackLinkProps) {
  const { t } = useTranslation();
  const linkText = t(translationKey);
  return (
    <InlineLink
      className={cn('inline-flex items-center', className)}
      file={file}
      params={params}
      hash={hash}
      search={search}
      aria-label={linkText}
    >
      <FontAwesomeIcon icon={faAngleLeft} />
      {linkText}
    </InlineLink>
  );
}
