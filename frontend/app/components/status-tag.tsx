import type { JSX } from 'react';

import { useTranslation } from 'react-i18next';

import type { RequestStatus } from '~/.server/domain/models';
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
      return 'border-blue-400 bg-blue-100 text-blue-800';
    case PROFILE_STATUS.PENDING.code:
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

interface RequestStatusTagProps {
  status: RequestStatus;
  lang: Language;
  rounded?: boolean;
  view: 'hr-advisor' | 'hiring-manager';
}

export function RequestStatusTag({ status, lang, rounded = false, view }: RequestStatusTagProps): JSX.Element {
  const { t } = useTranslation('app');
  const styleMap: Record<string, string> = {
    [REQUEST_STATUS_CODE.CLR_GRANTED]: 'bg-gray-100 text-slate-700',
    [REQUEST_STATUS_CODE.PSC_GRANTED]: 'bg-gray-100 text-slate-700',
    [REQUEST_STATUS_CODE.CANCELLED]: 'bg-gray-100 text-slate-700',
    ...(view === 'hr-advisor'
      ? {
          [REQUEST_STATUS_CODE.DRAFT]: 'border-yellow-400 bg-yellow-100 text-yellow-800',
          [REQUEST_STATUS_CODE.FDBK_PENDING]: 'bg-sky-100 text-sky-700',
          [REQUEST_STATUS_CODE.FDBK_PEND_APPR]: 'border-yellow-400 bg-yellow-100 text-yellow-800',
          Default: 'bg-amber-100 text-yellow-900',
        }
      : {
          [REQUEST_STATUS_CODE.DRAFT]: 'bg-amber-100 text-yellow-900',
          [REQUEST_STATUS_CODE.FDBK_PENDING]: 'bg-amber-100 text-yellow-900',
          [REQUEST_STATUS_CODE.FDBK_PEND_APPR]: 'border-yellow-400 bg-yellow-100 text-yellow-800',
          Default: 'bg-sky-100 text-sky-700',
        }),
  };
  const style = styleMap[status.code] ?? styleMap.Default;
  const displayName =
    status.code === 'SUBMIT' && view === 'hr-advisor'
      ? t('hr-advisor-referral-requests.status.request-pending-approval')
      : lang === 'en'
        ? status.nameEn
        : status.nameFr;

  const baseClasses = 'flex w-fit items-center gap-2 text-sm font-semibold';
  const defaultRoundedClasses = 'rounded-md px-3 py-1';
  const roundedTrueClasses = 'rounded-2xl border px-3 py-0.5';

  return (
    <div className={`${style} ${baseClasses} ${rounded ? roundedTrueClasses : defaultRoundedClasses}`}>
      <p>{displayName}</p>
    </div>
  );
}
