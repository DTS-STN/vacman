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
  success: `border-green-600 bg-green-100`,
  error: `border-red-800 bg-red-100`,
  info: `border-sky-700 bg-sky-100`,
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
        className={`${type === 'success' ? 'text-green-600' : type === 'error' ? 'text-red-800' : 'text-sky-700'} mr-2`}
      />
      {message}
    </div>
  );
}
