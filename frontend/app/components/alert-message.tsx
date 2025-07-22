import type { Ref } from 'react';

import type { IconDefinition } from '@fortawesome/free-solid-svg-icons';
import { faTriangleExclamation, faCircleExclamation, faCircleCheck } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

interface AlertMessageProps {
  message: string;
  type: 'success' | 'info' | 'error';
  ref?: Ref<HTMLDivElement>;
}

const styles: Record<NonNullable<AlertMessageProps['type']>, string> = {
  success: `border-custom-green bg-light-green`,
  error: `border-custom-red bg-light-red`,
  info: `bg-opacity-80 border-custom-blue bg-custom-blue`,
};

const icons: Record<NonNullable<AlertMessageProps['type']>, IconDefinition> = {
  success: faCircleCheck,
  error: faTriangleExclamation,
  info: faCircleExclamation,
};

export function AlertMessage({ ref, message, type = 'info' }: AlertMessageProps) {
  return (
    <div ref={ref} className={`${styles[type]} flex w-full items-center border-l-4 p-2`}>
      <FontAwesomeIcon
        icon={icons[type]}
        className={`${type === 'success' ? 'text-custom-green' : type === 'error' ? 'text-custom-red' : 'text-custom-blue'} mr-2`}
      />
      {message}
    </div>
  );
}
