import type { JSX } from 'react';

import { useTranslation } from 'react-i18next';

import type { ProfileStatus, RequestStatus } from '~/.server/domain/models';
import { PROFILE_STATUS, REQUEST_STATUS_CODE } from '~/domain/constants';
import { cn } from '~/utils/tailwind-utils';

interface ProfileStatusTagProps {
  status: ProfileStatus;
  lang: Language;
  rounded?: boolean;
  view: 'hr-advisor' | 'employee';
}

export function ProfileStatusTag({ status, lang, rounded = false, view }: ProfileStatusTagProps): JSX.Element {
  const { t } = useTranslation('app');
  const styleMap: Record<string, string> = {
    [PROFILE_STATUS.ARCHIVED.code]: 'bg-gray-100 text-slate-700',
    ...(view === 'hr-advisor'
      ? {
          [PROFILE_STATUS.INCOMPLETE.code]: 'border-yellow-400 bg-yellow-100 text-yellow-800',
          [PROFILE_STATUS.PENDING.code]: 'border-yellow-400 bg-yellow-100 text-yellow-800',
          [PROFILE_STATUS.APPROVED.code]: 'border-blue-400 bg-blue-100 text-blue-800',
          Default: 'bg-amber-100 text-yellow-900',
        }
      : {
          [PROFILE_STATUS.APPROVED.code]: 'border-blue-400 bg-blue-100 text-blue-800',
          [PROFILE_STATUS.PENDING.code]: 'border-blue-400 bg-blue-100 text-blue-800',
          [PROFILE_STATUS.INCOMPLETE.code]: 'border-yellow-400 bg-yellow-100 text-yellow-800',
          Default: 'bg-sky-100 text-sky-700',
        }),
  };
  const style = styleMap[status.code] ?? styleMap.Default;
  const displayName =
    status.code === 'PENDING' && view === 'employee'
      ? t('profile.pending-status-employee')
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

  let displayName: string;

  if (status.code === REQUEST_STATUS_CODE.SUBMIT && view === 'hr-advisor') {
    displayName = t('hr-advisor-referral-requests.status.request-pending-approval');
  } else {
    displayName = lang === 'en' ? status.nameEn : status.nameFr;
  }

  const baseClasses = 'flex w-fit items-center gap-2 text-sm font-semibold';
  const defaultRoundedClasses = 'rounded-md px-3 py-1';
  const roundedTrueClasses = 'rounded-2xl border px-3 py-0.5';

  return (
    <div className={cn(style, baseClasses, rounded ? roundedTrueClasses : defaultRoundedClasses)}>
      <p>{displayName}</p>
    </div>
  );
}
