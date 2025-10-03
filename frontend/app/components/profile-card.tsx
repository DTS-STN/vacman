import type { JSX, ReactNode, Ref } from 'react';

import type { Params } from 'react-router';

import { faCheck, faEye, faPenToSquare, faPlus, faTriangleExclamation } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useTranslation } from 'react-i18next';

import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '~/components/card';
import { InlineLink } from '~/components/links';
import type { I18nRouteFile } from '~/i18n-routes';
import { cn } from '~/utils/tailwind-utils';

interface ProfileCardProps {
  title: string;
  linkLabel?: string;
  file?: I18nRouteFile;
  isComplete?: boolean;
  isNew?: boolean;
  required?: boolean;
  children: ReactNode;
  params?: Params;
  errorState?: boolean;
  ref?: Ref<HTMLDivElement>;
  showStatus?: boolean;
  updated?: boolean;
  linkType?: 'edit' | 'view';
}

export function ProfileCard({
  title,
  linkLabel,
  file,
  isComplete,
  isNew,
  required,
  errorState,
  children,
  params,
  ref,
  showStatus,
  updated,
  linkType,
}: ProfileCardProps): JSX.Element {
  const { t } = useTranslation('app');

  // Excluding file or linkLabel will omit the edit link footer from the card (ex. for hr-advisor requests)

  return (
    <Card ref={ref} className={cn(errorState && 'border-b-6 border-[#C90101]', 'rounded-md p-4 sm:p-6')}>
      <CardHeader className="p-0">
        <div className="mb-6 grid justify-between gap-2 select-none sm:grid-cols-2">
          <div>
            <CardTitle className="text-2xl">{title}</CardTitle>
          </div>
          <div className="space-x-2 sm:ml-auto">
            {showStatus &&
              (isComplete ? (
                <CompleteTag />
              ) : (
                <>
                  <InProgressTag />
                  {required && <RequiredTag />}
                </>
              ))}
            {updated && <UpdatedTag />}
          </div>
        </div>
      </CardHeader>
      <CardContent className="my-3 space-y-3 p-0">{children}</CardContent>

      {linkType && file && linkLabel && (
        <CardFooter
          className={cn(
            'mt-3',
            errorState ? 'bg-red-100' : 'bg-gray-100', // Add background
            '-mx-4 sm:-mx-6', // Pull horizontally to cancel parent padding
            '-mb-4 sm:-mb-6', // Pull down to cancel parent bottom padding
            'px-4 sm:px-6', // Add horizontal padding back for the content
            'py-4', // Add vertical padding for the contents
            'rounded-b-xs', // Re-apply bottom roundings
          )}
        >
          {linkType === 'edit' && (
            <>
              {errorState && <h3 className="pb-4 text-lg font-bold text-[#333333]">{t('profile.field-incomplete')}</h3>}
              <span className="flex items-center gap-x-2">
                {errorState && <FontAwesomeIcon icon={faTriangleExclamation} className="text-red-800" />}
                {!errorState && (isNew ? <FontAwesomeIcon icon={faPlus} /> : <FontAwesomeIcon icon={faPenToSquare} />)}
                <InlineLink className={`${errorState && 'text-red-800'} font-semibold`} file={file} params={params}>
                  {`${isNew ? t('profile.add') : t('profile.edit')}\u0020`}
                  {linkLabel}
                </InlineLink>
              </span>
            </>
          )}
          {linkType === 'view' && (
            <span className="flex items-center gap-x-2">
              {<FontAwesomeIcon icon={faEye} />}
              <InlineLink className="font-semibold" file={file} params={params}>
                {`${t('profile.view')}\u0020`}
                {linkLabel}
              </InlineLink>
            </span>
          )}
        </CardFooter>
      )}
    </Card>
  );
}

function CompleteTag(): JSX.Element {
  const { t } = useTranslation('app');

  return (
    <span className="flex w-fit items-center gap-2 rounded-2xl border border-green-700 bg-green-700 px-3 py-0.5 text-sm font-semibold text-white">
      <FontAwesomeIcon icon={faCheck} />
      {t('profile.complete')}
    </span>
  );
}

function InProgressTag(): JSX.Element {
  const { t } = useTranslation('app');

  return (
    <span className="w-fit rounded-2xl border border-blue-400 bg-blue-100 px-3 py-0.5 text-sm font-semibold text-blue-800">
      {t('profile.in-progress')}
    </span>
  );
}

function RequiredTag(): JSX.Element {
  const { t } = useTranslation('app');

  return (
    <span className="rounded-2xl border border-gray-400 bg-gray-100 px-3 py-0.5 text-sm font-semibold text-black">
      {t('profile.required')}
    </span>
  );
}

function UpdatedTag(): JSX.Element {
  const { t } = useTranslation('app');

  return (
    <span className="w-fit rounded-2xl border border-blue-400 bg-blue-100 px-3 py-0.5 text-sm font-semibold text-blue-800">
      {t('profile.updated')}
    </span>
  );
}
