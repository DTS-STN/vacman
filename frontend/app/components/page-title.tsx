import type { ComponentProps } from 'react';

import { cn } from '~/utils/tailwind-utils';

export type PageTitleProps = Omit<ComponentProps<'h1'>, 'id' | 'property'> & {
  subTitle?: string;
  subTitleClassName?: string;
  containerClassName?: string;
  variant?: 'top' | 'bottom';
};

export function PageTitle({
  children,
  className,
  subTitle,
  subTitleClassName,
  containerClassName,
  variant = 'top',
  ...props
}: PageTitleProps) {
  return (
    <div className={cn('mt-10 mb-8', containerClassName)}>
      {variant === 'top' && subTitle && <h2 className={subTitleClassName}>{subTitle}</h2>}
      <h1 id="wb-cont" tabIndex={-1} className={cn('font-lato text-3xl font-bold focus-visible:ring-3', className)} {...props}>
        {children}
      </h1>
      {variant === 'bottom' && subTitle && <h2 className={subTitleClassName}>{subTitle}</h2>}
    </div>
  );
}
