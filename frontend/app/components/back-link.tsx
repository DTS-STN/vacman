import type { ComponentProps } from 'react';

import { faAngleLeft, faSpinner } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import { InlineLink } from '~/components/links';
import { useLinkLoading } from '~/hooks/use-loading';
import { cn } from '~/utils/tailwind-utils';

type BackLinkProps = ComponentProps<typeof InlineLink>;

export function BackLink({ children, className, ...props }: BackLinkProps) {
  const isLoading = useLinkLoading(props.file, props.to);
  return (
    <InlineLink className={cn('inline-flex items-center', className)} {...props}>
      <FontAwesomeIcon icon={faAngleLeft} />
      {children}
      {isLoading && <FontAwesomeIcon className="ml-1" icon={faSpinner} spin={true} />}
    </InlineLink>
  );
}
