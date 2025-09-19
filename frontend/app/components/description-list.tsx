import type { ComponentProps, ReactNode } from 'react';

import { cn } from '~/utils/tailwind-utils';

export interface DescriptionListItemProps extends ComponentProps<'div'> {
  term: ReactNode;
  ddClassName?: string;
}
export function DescriptionListItem({ className, ddClassName, children, term, ...rest }: DescriptionListItemProps) {
  return (
    <div className={cn('py-2', className)} {...rest}>
      <dt className="font-semibold">{term}</dt>
      <dd className={ddClassName ?? 'mt-1 text-gray-600 sm:col-span-2 sm:mt-0'}>{children}</dd>
    </div>
  );
}

export interface DescriptionListProps extends ComponentProps<'dl'> {}
export function DescriptionList(props: DescriptionListProps) {
  return <dl {...props} />;
}
