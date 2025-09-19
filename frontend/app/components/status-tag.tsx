import type { JSX } from 'react';

import { PROFILE_STATUS_CODE, REQUEST_STATUS_CODE } from '~/domain/constants';

interface StatusTagProps {
  status: {
    code: string;
    name: string;
  };
}

const statusStyles: Record<string, string> = {
  [PROFILE_STATUS_CODE.approved]: 'border-green-400 bg-green-100 text-green-800',
  [PROFILE_STATUS_CODE.archived]: 'border-orange-400 bg-orange-100 text-orange-800',
  [PROFILE_STATUS_CODE.incomplete]: 'border-blue-400 bg-blue-100 text-blue-800',
  [PROFILE_STATUS_CODE.pending]: 'border-yellow-400 bg-yellow-100 text-yellow-800',
  [REQUEST_STATUS_CODE.DRAFT]: 'border-yellow-400 bg-yellow-100 text-yellow-800',
  [REQUEST_STATUS_CODE.SUBMIT]: 'border-blue-400 bg-blue-100 text-blue-800',
  [REQUEST_STATUS_CODE.FDBK_PEND_APPR]:
    'w-fit rounded-2xl border border-yellow-400 bg-yellow-100 px-3 py-0.5 text-sm font-semibold text-yellow-800',
};

export function StatusTag({ status }: StatusTagProps): JSX.Element {
  const style = statusStyles[status.code];
  return <span className={`w-fit rounded-2xl border px-3 py-0.5 text-sm font-semibold ${style}`}>{status.name}</span>;
}
