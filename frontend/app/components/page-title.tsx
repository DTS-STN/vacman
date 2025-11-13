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
  subTitleClassName = 'text-lg font-normal',
  containerClassName,
  variant = 'top',
  ...props
}: PageTitleProps) {
  const topSubTitle = variant === 'top' && subTitle;
  const bottomSubTitle = variant === 'bottom' && subTitle;

  return (
    <div className={cn('mt-10 mb-8', containerClassName)}>
      <h1 id="wb-cont" tabIndex={-1} className={cn('font-lato text-3xl font-bold focus-visible:ring-3', className)} {...props}>
        {topSubTitle ? <span className={cn('block', subTitleClassName)}>{topSubTitle}</span> : null}
        {typeof children === 'string' ? <span className="block">{children}</span> : children}
        {bottomSubTitle ? <span className={cn('block', subTitleClassName)}>{subTitle}</span> : null}
      </h1>
    </div>
  );
}
