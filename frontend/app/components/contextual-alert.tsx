import type { Ref } from 'react';

import type { IconDefinition } from '@fortawesome/free-solid-svg-icons';
import { faTriangleExclamation, faCircleExclamation, faCircleCheck } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

interface ContextualAlertProps {
  type: 'info' | 'success' | 'error';
  ref?: Ref<HTMLDivElement>;
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
  info: faCircleExclamation, //not used
};

export function ContextualAlert({
  ref,
  type = 'info',
  role = 'alert',
  ariaLive = 'polite',
  ariaAtomic = true,
  textSmall = false,
  children,
}: ContextualAlertProps) {
  return (
    <>
      <div
        ref={ref}
        className={`${styles[type]} flex w-full items-start border-l-6 p-2`}
        role={role}
        aria-live={ariaLive}
        aria-atomic={ariaAtomic}
      >
        {type === 'info' ? (
          <div
            role="presentation"
            className="bg-[rgba(37, 114, 180,1)] h-[32px] mt-1 w-[32px] max-w-[32px] flex-none bg-[url('/info-icon.svg')] bg-size-[28px] bg-left-top bg-no-repeat"
          />
        ) : (
          <FontAwesomeIcon
            icon={icons[type]}
            size="xl"
            color={`${type === 'success' ? 'green-600' : 'red-800'}`}
            className={`${type === 'success' ? 'text-green-600' : 'text-red-800'} min-w-[36px]`}
          />
        )}

        <div className={`pl-2 ${textSmall ? 'text-sm' : 'text-base'}`}>{children}</div>
      </div>
    </>
  );
}
