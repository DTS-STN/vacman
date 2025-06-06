import type { ComponentProps } from 'react';

import { ButtonEndIcon, ButtonStartIcon } from '~/components/button-icons';
import { AppLink } from '~/components/links';
import { cn } from '~/utils/tailwind-utils';

type ButtonEndIconProps = ComponentProps<typeof ButtonEndIcon>;
type ButtonStartIconProps = ComponentProps<typeof ButtonStartIcon>;

const sizes = {
  xs: 'px-3 py-2 text-xs',
  sm: 'px-3 py-2 text-sm',
  base: 'px-5 py-2.5 text-sm',
  lg: 'px-5 py-3 text-base',
  xl: 'px-6 py-3.5 text-base',
} as const;

// prettier-ignore
const variants = {
  alternative: 'border-gray-900 bg-white text-gray-900 hover:bg-gray-100 hover:text-blue-700 focus:bg-gray-100 focus:text-blue-700',
  default: 'border-gray-300 bg-gray-200 text-slate-700 hover:bg-neutral-300 focus:bg-neutral-300',
  dark: 'border-gray-800 bg-gray-800 text-white hover:bg-gray-900 focus:bg-gray-900',
  green: 'border-green-700 bg-green-700 text-white hover:bg-green-800 focus:bg-green-800',
  primary: 'border-slate-700 bg-slate-700 text-white hover:bg-sky-800 focus:bg-sky-800',
  red: 'border-red-700 bg-red-700 text-white hover:bg-red-800 focus:bg-red-800',
  link: 'bg-white text-gray-900 hover:bg-gray-100 hover:text-blue-700 focus:bg-gray-100 focus:text-blue-700 border-0 underline',
} as const;

type ButtonLinkStyleProps = {
  className?: string;
  pill?: boolean;
  size?: keyof typeof sizes;
  variant?: keyof typeof variants;
};

type ButtonLinkProps = ComponentProps<typeof AppLink> &
  ButtonLinkStyleProps & {
    disabled?: boolean;
    endIcon?: ButtonEndIconProps['icon'];
    endIconProps?: OmitStrict<ButtonEndIconProps, 'icon'>;
    startIcon?: ButtonStartIconProps['icon'];
    startIconProps?: OmitStrict<ButtonStartIconProps, 'icon'>;
  };

/**
 * Tailwind CSS Buttons from Flowbite
 * @see https://flowbite.com/docs/components/buttons/
 *
 * Disabling a link
 * @see https://www.scottohara.me/blog/2021/05/28/disabled-links.html
 */
export function ButtonLink({
  children,
  className,
  disabled,
  endIcon,
  endIconProps,
  pill,
  size = 'base',
  startIcon,
  startIconProps,
  variant = 'default',
  ...props
}: ButtonLinkProps) {
  return (
    <AppLink
      className={cn(
        'font-lato inline-flex items-center justify-center rounded-sm border align-middle no-underline outline-offset-4',
        sizes[size],
        variants[variant],
        disabled && 'pointer-events-none cursor-not-allowed opacity-70',
        pill && 'rounded-full',
        className,
      )}
      disabled={disabled}
      {...props}
    >
      {startIcon && <ButtonStartIcon {...(startIconProps ?? {})} icon={startIcon} />}
      {children}
      {endIcon && <ButtonEndIcon {...(endIconProps ?? {})} icon={endIcon} />}
    </AppLink>
  );
}
