import type { JSX, ReactElement, ReactNode, Ref } from 'react';
import React from 'react';

import type { Params } from 'react-router';

import { faCheck, faEye, faPenToSquare, faPlus, faTriangleExclamation } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useTranslation } from 'react-i18next';

import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '~/components/card';
import { LoadingLink } from '~/components/loading-link';
import type { I18nRouteFile } from '~/i18n-routes';
import { cn } from '~/utils/tailwind-utils';

interface ProfileBaseProps {
  errorState?: boolean;
  children: ReactNode;
}

interface ProfileExtendedProps extends ProfileBaseProps {
  children: (ReactElement<ProfileBaseProps> | false | undefined) | (ReactElement<ProfileBaseProps> | false | undefined)[];
}

function ChildrenWithProps({ errorState, children }: ProfileExtendedProps): ReactNode {
  if (errorState) {
    return React.Children.map(children, (child) => {
      if (React.isValidElement(child)) {
        return React.cloneElement(child, { ...child, errorState });
      }
      return child;
    });
  }
  return children;
}

interface ProfileCardProps extends ProfileExtendedProps {
  ref?: Ref<HTMLDivElement>;
}

export function ProfileCard(props: ProfileCardProps): JSX.Element {
  const { ref, errorState } = props;
  return (
    <Card ref={ref} className={cn(errorState && 'border-b-6 border-[#C90101]', 'rounded-md p-4 sm:p-6')}>
      {ChildrenWithProps(props)}
    </Card>
  );
}

interface ProfileCardContentProps extends ProfileBaseProps {}

export function ProfileCardContent({ children }: ProfileCardContentProps): JSX.Element {
  return <CardContent className="my-3 space-y-3 p-0">{children}</CardContent>;
}

interface ProfileCardHeaderProps extends ProfileBaseProps {
  status?: 'in-progress' | 'complete';
  required?: boolean;
  updated?: boolean;
}

export function ProfileCardHeader({ status, required, updated, children }: ProfileCardHeaderProps): JSX.Element {
  return (
    <CardHeader className="p-0">
      <div className="mb-6 grid justify-between gap-2 select-none sm:grid-cols-2">
        <div>
          <CardTitle className="text-2xl">{children}</CardTitle>
        </div>
        <div className="space-x-2 sm:ml-auto">
          {status &&
            (status === 'complete' ? (
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
  );
}

interface ProfileCardFooterProps extends ProfileExtendedProps {}

export function ProfileCardFooter(props: ProfileCardFooterProps): JSX.Element {
  const { errorState } = props;
  return (
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
      {ChildrenWithProps(props)}
    </CardFooter>
  );
}

interface ProfileCardEditLinkProps extends ProfileBaseProps {
  isNew?: boolean;
  file: I18nRouteFile;
  params?: Params;
}

export function ProfileCardEditLink({ isNew, file, params, errorState, children }: ProfileCardEditLinkProps): JSX.Element {
  const { t } = useTranslation('app');

  return (
    <>
      {errorState && <h3 className="pb-4 text-lg font-bold text-[#333333]">{t('profile.field-incomplete')}</h3>}
      <span className="flex items-center gap-x-2">
        {errorState && <FontAwesomeIcon icon={faTriangleExclamation} className="text-red-800" />}
        {!errorState && (isNew ? <FontAwesomeIcon icon={faPlus} /> : <FontAwesomeIcon icon={faPenToSquare} />)}
        <LoadingLink className={`${errorState && 'text-red-800'} font-semibold`} file={file} params={params}>
          {`${isNew ? t('profile.add') : t('profile.edit')}\u0020`}
          {children}
        </LoadingLink>
      </span>
    </>
  );
}

interface ProfileCardViewLinkProps extends ProfileBaseProps {
  file: I18nRouteFile;
  params?: Params;
}

export function ProfileCardViewLink({ file, params, children }: ProfileCardViewLinkProps): JSX.Element {
  const { t } = useTranslation('app');
  return (
    <span className="flex items-center gap-x-2">
      {<FontAwesomeIcon icon={faEye} />}
      <LoadingLink className="font-semibold" file={file} params={params}>
        {`${t('profile.view')}\u0020`}
        {children}
      </LoadingLink>
    </span>
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
