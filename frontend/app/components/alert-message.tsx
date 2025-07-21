import type { Ref } from 'react';

import type { IconDefinition } from '@fortawesome/free-solid-svg-icons';
import { faTriangleExclamation, faCircleExclamation, faCircleCheck } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

interface AlertMessageProps {
  message: string;
  type: 'success' | 'info' | 'error';
  ref?: Ref<HTMLDivElement>;
}

const CUSTOM_COLORS = {
  red: '#a62a1e',
  green: '#289f58',
  blue: '#2572b4',
};

const styles: Record<NonNullable<AlertMessageProps['type']>, string> = {
  success: `border-[${CUSTOM_COLORS.green}] bg-[#e7fff1]`,
  error: `border-[${CUSTOM_COLORS.red}] bg-[#ffd9d9]`,
  info: `bg-opacity-80 border-[${CUSTOM_COLORS.blue}] bg-[${CUSTOM_COLORS.blue}]`,
};

const icons: Record<NonNullable<AlertMessageProps['type']>, IconDefinition> = {
  success: faCircleCheck,
  error: faTriangleExclamation,
  info: faCircleExclamation,
};

const iconColors: Record<NonNullable<AlertMessageProps['type']>, string> = {
  success: CUSTOM_COLORS.green,
  error: CUSTOM_COLORS.red,
  info: CUSTOM_COLORS.blue,
};

export function AlertMessage({ ref, message, type = 'info' }: AlertMessageProps) {
  return (
    <div ref={ref} className={`${styles[type]} flex w-full items-center border-l-4 p-2`}>
      <FontAwesomeIcon style={{ color: iconColors[type] }} icon={icons[type]} className="mr-2" />
      {message}
    </div>
  );
}
