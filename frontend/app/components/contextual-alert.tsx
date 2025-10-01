import type { IconDefinition } from '@fortawesome/free-solid-svg-icons';
import { faTriangleExclamation, faCircleInfo, faCircleCheck } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import { cn } from '~/utils/tailwind-utils';

interface ContextualAlertProps {
  type: 'info' | 'success' | 'error';
  role?: 'alert' | 'status' | 'log';
  ariaLive?: 'assertive' | 'polite';
  ariaAtomic?: boolean;
  textSmall?: boolean;
  children?: React.ReactNode;
}

const styles: Record<NonNullable<ContextualAlertProps['type']>, string> = {
  success: `border-green-600 bg-green-100`,
  error: `border-red-800 bg-red-100`,
  info: `border-[#2572B4] bg-sky-100`,
};

const icons: Record<NonNullable<ContextualAlertProps['type']>, IconDefinition> = {
  success: faCircleCheck,
  error: faTriangleExclamation,
  info: faCircleInfo,
};

const iconColors: Record<NonNullable<ContextualAlertProps['type']>, string> = {
  success: 'text-green-600',
  error: 'text-red-800',
  info: 'text-[#2572B4]',
};

export function ContextualAlert({
  type = 'info',
  role = 'alert',
  ariaLive = 'polite',
  ariaAtomic = true,
  textSmall = false,
  children,
}: ContextualAlertProps) {
  return (
    <div
      className={cn(styles[type], 'flex w-full items-start gap-1 border-l-6 p-2')}
      role={role}
      aria-live={ariaLive}
      aria-atomic={ariaAtomic}
    >
      <FontAwesomeIcon
        icon={icons[type]}
        size="xl"
        className={cn('min-w-[36px] self-baseline', iconColors[type])}
        aria-hidden={true}
      />
      <div className={cn(textSmall && 'text-sm')}>{children}</div>
    </div>
  );
}
