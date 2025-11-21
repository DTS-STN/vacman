import type { JSX } from 'react';

import type { IconDefinition } from '@fortawesome/free-solid-svg-icons';
import { faBan, faBell, faCheckCircle, faHourglassHalf, faInfoCircle } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useTranslation } from 'react-i18next';

import type { ProfileStatus, RequestStatus } from '~/.server/domain/models';
import { PROFILE_STATUS, REQUEST_STATUS_CODE } from '~/domain/constants';
import { cn } from '~/utils/tailwind-utils';

type TagStyle = {
  className: string;
  icon: IconDefinition;
};

const TagVariants = {
  default: { className: 'border-sky-200 bg-sky-100 text-sky-700', icon: faInfoCircle },
  alternative: { className: 'border-amber-200 bg-amber-100 text-yellow-900', icon: faBell },
  inactive: { className: 'border-gray-300 bg-gray-100 text-slate-700', icon: faBan },
  pending: { className: 'border-yellow-400 bg-yellow-100 text-yellow-800', icon: faHourglassHalf },
  approved: { className: 'border-blue-400 bg-blue-100 text-blue-800', icon: faCheckCircle },
} as const;

interface ProfileStatusTagProps {
  status: ProfileStatus;
  lang: Language;
  rounded?: boolean;
  view: 'hr-advisor' | 'employee';
}

export function ProfileStatusTag({ status, lang, rounded = false, view }: ProfileStatusTagProps): JSX.Element {
  const { t } = useTranslation('app');
  const { t: tGcweb } = useTranslation('gcweb');

  const styleMap: Record<string, TagStyle> = {
    [PROFILE_STATUS.ARCHIVED.code]: TagVariants.inactive,
    ...(view === 'hr-advisor'
      ? {
          [PROFILE_STATUS.INCOMPLETE.code]: TagVariants.pending,
          [PROFILE_STATUS.PENDING.code]: TagVariants.pending,
          [PROFILE_STATUS.APPROVED.code]: TagVariants.approved,
          Default: TagVariants.alternative,
        }
      : {
          [PROFILE_STATUS.APPROVED.code]: TagVariants.approved,
          [PROFILE_STATUS.PENDING.code]: TagVariants.approved,
          [PROFILE_STATUS.INCOMPLETE.code]: TagVariants.pending,
          Default: TagVariants.default,
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
  const defaultRoundedClasses = 'rounded-md border-2 px-2 py-1';
  const roundedTrueClasses = 'rounded-2xl border-2 px-2 py-0.5';

  return (
    <div className={`${style?.className} ${baseClasses} ${rounded ? roundedTrueClasses : defaultRoundedClasses}`}>
      {style && <FontAwesomeIcon icon={style.icon} />}
      <span className="sr-only">
        {tGcweb('aria-label-for-status', {
          label: displayName,
        })}
      </span>
      <p className="mr-0.5" aria-hidden="true">
        {displayName}
      </p>
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
  const { t: tGcweb } = useTranslation('gcweb');

  const styleMap: Record<string, TagStyle> = {
    [REQUEST_STATUS_CODE.CLR_GRANTED]: TagVariants.inactive,
    [REQUEST_STATUS_CODE.PSC_GRANTED]: TagVariants.inactive,
    [REQUEST_STATUS_CODE.CANCELLED]: TagVariants.inactive,
    ...(view === 'hr-advisor'
      ? {
          [REQUEST_STATUS_CODE.DRAFT]: TagVariants.pending,
          [REQUEST_STATUS_CODE.FDBK_PENDING]: TagVariants.default,
          [REQUEST_STATUS_CODE.FDBK_PEND_APPR]: TagVariants.pending,
          Default: TagVariants.alternative,
        }
      : {
          [REQUEST_STATUS_CODE.DRAFT]: TagVariants.alternative,
          [REQUEST_STATUS_CODE.FDBK_PENDING]: TagVariants.alternative,
          [REQUEST_STATUS_CODE.FDBK_PEND_APPR]: TagVariants.pending,
          Default: TagVariants.default,
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
  const defaultRoundedClasses = 'rounded-md border-2 px-2 py-1';
  const roundedTrueClasses = 'rounded-2xl border-2 px-2 py-0.5';

  return (
    <div className={cn(style?.className, baseClasses, rounded ? roundedTrueClasses : defaultRoundedClasses)}>
      {style && <FontAwesomeIcon icon={style.icon} />}
      <span className="sr-only">
        {tGcweb('aria-label-for-status', {
          label: displayName,
        })}
      </span>
      <p className="mr-0.5" aria-hidden="true">
        {displayName}
      </p>
    </div>
  );
}
