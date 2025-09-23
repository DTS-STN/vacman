import type { ComponentProps } from 'react';

import { cn } from '~/utils/tailwind-utils';

export interface VacmanBackgroundProps extends ComponentProps<'div'> {
  height?: 'h-30' | 'h-40' | 'h-50' | 'h-60' | 'h-70' | 'h-80' | 'h-90';
  variant?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
}

const smallViewportHeights = {
  ['h-30']: 'h-40',
  ['h-40']: 'h-50',
  ['h-50']: 'h-60',
  ['h-60']: 'h-70',
  ['h-70']: 'h-80',
  ['h-80']: 'h-90',
  ['h-90']: 'h-100',
};

const variants = {
  ['top-left']: 'scale-x-[1] scale-y-[-1]',
  ['top-right']: 'scale-x-[-1] scale-y-[-1]',
  ['bottom-left']: 'scale-x-[1] scale-y-[1]',
  ['bottom-right']: 'scale-x-[-1] scale-y-[1]',
};

export function VacmanBackground({ className, children, height = 'h-60', variant = 'top-left' }: VacmanBackgroundProps) {
  return (
    <div className={cn('flex text-white', className, `sm:${height}`, smallViewportHeights[height])}>
      <div>{children}</div>
      <div
        role="presentation"
        className={cn(
          "absolute left-0 -z-10 w-full bg-[rgba(9,28,45,1)] bg-[url('/VacMan-design-element-06.svg')] bg-size-[450px] bg-left-bottom bg-no-repeat",
          `sm:${height}`,
          smallViewportHeights[height],
          variants[variant],
        )}
      />
    </div>
  );
}
