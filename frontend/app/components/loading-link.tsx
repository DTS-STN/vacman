import type { ComponentProps } from 'react';

import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import { InlineLink } from '~/components/links';
import { useLinkLoading } from '~/hooks/use-loading';
import { cn } from '~/utils/tailwind-utils';

type LoadingLinkProps = ComponentProps<typeof InlineLink> & {
  spinner?: 'left' | 'right';
};

export function LoadingLink({ children, className, spinner = 'right', ...props }: LoadingLinkProps) {
  const isLoading = useLinkLoading(props.file ?? props.to, props.params);
  return (
    <InlineLink className={cn('relative inline-flex items-center', className)} {...props}>
      {spinner === 'left' && (
        <FontAwesomeIcon className={cn('mr-1', isLoading ? '' : 'invisible')} icon={faSpinner} spin={true} />
      )}
      {children}
      {spinner === 'right' && (
        <FontAwesomeIcon className={cn('ml-1', isLoading ? '' : 'invisible')} icon={faSpinner} spin={true} />
      )}
    </InlineLink>
  );
}
