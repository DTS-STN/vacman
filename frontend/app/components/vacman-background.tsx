import type { ComponentProps } from 'react';

import { cn } from '~/utils/tailwind-utils';

export interface VacmanBackgroundProps extends ComponentProps<'div'> {
  variant?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
}

const variants = {
  ['top-left']: 'scale-x-[1] scale-y-[-1]',
  ['top-right']: 'scale-x-[-1] scale-y-[-1]',
  ['bottom-left']: 'scale-x-[1] scale-y-[1]',
  ['bottom-right']: 'scale-x-[-1] scale-y-[1]',
};

export function VacmanBackground({ className, children, variant = 'top-left' }: VacmanBackgroundProps) {
  return (
    <div className={cn('flex text-white', className)}>
      <div className="my-8">{children}</div>
      <div
        role="presentation"
        className={cn(
          "absolute left-0 -z-10 w-full bg-[rgba(9,28,45,1)] bg-[url('/VacMan-design-element-06.svg')] bg-size-[450px] bg-left-bottom bg-no-repeat",
          variants[variant],
        )}
      >
        <div
          className="pointer-events-none invisible container touch-none py-8 select-none focus:outline-none"
          tabIndex={-1}
          aria-hidden
        >
          {children}
        </div>
      </div>
    </div>
  );
}
