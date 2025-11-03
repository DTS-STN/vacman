import type { ComponentProps } from 'react';

import { faAngleLeft } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import { LoadingLink } from '~/components/loading-link';
import { cn } from '~/utils/tailwind-utils';

type BackLinkProps = ComponentProps<typeof LoadingLink>;

export function BackLink({ children, className, ...props }: BackLinkProps) {
  return (
    <LoadingLink className={cn('inline-flex items-center', className)} {...props}>
      <FontAwesomeIcon icon={faAngleLeft} />
      {children}
    </LoadingLink>
  );
}
