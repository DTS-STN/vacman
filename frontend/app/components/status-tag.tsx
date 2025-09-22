import type { JSX } from 'react';

import { PROFILE_STATUS, REQUEST_STATUS_CODE } from '~/domain/constants';
import { cn } from '~/utils/tailwind-utils';

interface StatusTagProps {
  status: {
    code: string;
    name: string;
  };
}

function getStatusStyle(code: string): string {
  switch (code) {
    case PROFILE_STATUS.APPROVED.code:
      return 'border-green-400 bg-green-100 text-green-800';
    case PROFILE_STATUS.ARCHIVED.code:
      return 'border-orange-400 bg-orange-100 text-orange-800';
    case PROFILE_STATUS.INCOMPLETE.code:
    case REQUEST_STATUS_CODE.SUBMIT:
      return 'border-blue-400 bg-blue-100 text-blue-800';
    case PROFILE_STATUS.PENDING.code:
    case REQUEST_STATUS_CODE.FDBK_PEND_APPR:
    case REQUEST_STATUS_CODE.DRAFT:
      return 'border-yellow-400 bg-yellow-100 text-yellow-800';
    default:
      return '';
  }
}

export function StatusTag({ status }: StatusTagProps): JSX.Element {
  const styleClass = getStatusStyle(status.code);
  if (!styleClass) return <></>;
  return <span className={cn('w-fit rounded-2xl border px-3 py-0.5 text-sm font-semibold', styleClass)}>{status.name}</span>;
}
