import type { ComponentProps } from 'react';

import { faAngleLeft } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import { InlineLink } from '~/components/links';
import { cn } from '~/utils/tailwind-utils';

type BackLinkProps = ComponentProps<typeof InlineLink>;

export function BackLink({ children, className, ...props }: BackLinkProps) {
  return (
    <InlineLink className={cn('inline-flex items-center', className)} {...props}>
      <FontAwesomeIcon icon={faAngleLeft} />
      {children}
    </InlineLink>
  );
}
