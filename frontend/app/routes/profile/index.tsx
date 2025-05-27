import type { JSX, ReactNode } from 'react';

import type { RouteHandle } from 'react-router';
import { Form, useNavigation } from 'react-router';

import { useTranslation } from 'react-i18next';

import type { Route } from './+types/index';

import { requireAllRoles } from '~/.server/utils/auth-utils';
import { i18nRedirect } from '~/.server/utils/route-utils';
import { Button } from '~/components/button';
import { ButtonLink } from '~/components/button-link';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '~/components/card';
import { InlineLink } from '~/components/links';
import { getTranslation } from '~/i18n-config.server';
import type { I18nRouteFile } from '~/i18n-routes';
import { handle as parentHandle } from '~/routes/layout';
import { cn } from '~/utils/tailwind-utils';

export const handle = {
  i18nNamespace: [...parentHandle.i18nNamespace],
} as const satisfies RouteHandle;

export function meta({ data }: Route.MetaArgs) {
  return [{ title: data.documentTitle }];
}

export function action({ context, params, request }: Route.ActionArgs) {
  requireAllRoles(context.session, new URL(request.url), ['employee']);
  /*
  TODO: Update redirect to correct page
  */
  throw i18nRedirect('routes/profile/index.tsx', request);
}

export async function loader({ context, request }: Route.LoaderArgs) {
  requireAllRoles(context.session, new URL(request.url), ['employee']);

  const { t } = await getTranslation(request, handle.i18nNamespace);
  return {
    documentTitle: t('app:index.about'),
    name: context.session.authState.idTokenClaims.name,
    email: context.session.authState.idTokenClaims.email,
    completed: 6,
    total: 12,
    contact: {
      completed: 2,
      workEmail: 'firstname.lastname@email.ca',
    },
    employment: {
      completed: 0,
    },
    referral: {
      completed: 0,
    },
    qualifications: {
      completed: 0,
    },
  };
}

export default function EditProfile({ loaderData, params }: Route.ComponentProps) {
  const { t } = useTranslation(handle.i18nNamespace);
  const navigation = useNavigation();

  return (
    <div className="mt-8 space-y-8">
      <div className="justify-between md:grid md:grid-cols-2">
        <div className="max-w-prose">
          <h1 className="mt-5 text-3xl font-semibold">{loaderData.name}</h1>
          {loaderData.email && <p className="mt-1 text-gray-500">{loaderData.email}</p>}
          <p className="mt-4">{t('app:profile.about')}</p>
        </div>
        <Form className="mt-6 flex place-content-end space-x-5 md:mt-auto" method="post" noValidate>
          <ButtonLink className="px-11" file="routes/index.tsx" id="back-button" disabled={navigation.state !== 'idle'}>
            {t('app:form.save')}
          </ButtonLink>
          <Button className="px-11" name="action" variant="primary" id="continue-button" disabled={navigation.state !== 'idle'}>
            {t('app:form.submit')}
          </Button>
        </Form>
      </div>
      <ProgressBar completed={loaderData.completed} total={loaderData.total} />
      <div className="grid gap-4 md:grid-cols-2">
        <ProfileCard
          title={t('app:profile.contact.title')}
          linkLabel={t('app:profile.contact.link-label')}
          file="routes/profile/contact-information.tsx"
          completed={loaderData.contact.completed}
          total={3}
          required={true}
        >
          <ProfileField label="Work email address">{loaderData.contact.workEmail}</ProfileField>
          <ProfileField label="Other field">field value</ProfileField>
        </ProfileCard>
        <ProfileCard
          title={t('app:profile.employment.title')}
          linkLabel={t('app:profile.employment.link-label')}
          file="routes/profile/personal-details.tsx"
          completed={loaderData.employment.completed}
          total={3}
          required={true}
        >
          <ProfileField label="Other field">field value</ProfileField>
        </ProfileCard>
        <ProfileCard
          title={t('app:profile.referral.title')}
          linkLabel={t('app:profile.referral.link-label')}
          file="routes/profile/personal-details.tsx"
          completed={loaderData.referral.completed}
          total={3}
          required={true}
        >
          <ProfileField label="Other field">field value</ProfileField>
        </ProfileCard>
        <ProfileCard
          title={t('app:profile.qualifications.title')}
          linkLabel={t('app:profile.qualifications.link-label')}
          file="routes/profile/personal-details.tsx"
          completed={loaderData.qualifications.completed}
          total={3}
          required={true}
        >
          <ProfileField label="Other field">field value</ProfileField>
        </ProfileCard>
      </div>
    </div>
  );
}

interface ProgressBarProps {
  completed: number;
  total: number;
}

function ProgressBar({ completed, total }: ProgressBarProps): JSX.Element {
  const amountCompleted = completed / total;
  const width =
    {
      0: 'w-0',
      10: 'w-[10%]',
      20: 'w-[20%]',
      30: 'w-[30%]',
      40: 'w-[40%]',
      50: 'w-[50%]',
      60: 'w-[60%]',
      70: 'w-[70%]',
      80: 'w-[80%]',
      90: 'w-[90%]',
      100: 'w-[100%]',
    }[Math.round(amountCompleted * 10) * 10] ?? 'w-0';
  const percentage = Math.round(amountCompleted * 100);
  const textColor = width !== 'w-0' ? 'text-white text-shadow-sm' : 'text-black';
  return (
    <div className="rounded-2xl border border-gray-600 select-none">
      <div className={cn('rounded-2xl bg-gray-600 whitespace-nowrap', width)}>
        <span className={cn('ml-5 text-sm', textColor)}>{percentage}% complete</span>
      </div>
    </div>
  );
}

interface ProfileCardProps {
  title: string;
  linkLabel: string;
  file: I18nRouteFile;
  completed: number;
  total: number;
  required: boolean;
  children: ReactNode;
}

function ProfileCard({ title, linkLabel, file, completed, total, required, children }: ProfileCardProps): JSX.Element {
  const { t } = useTranslation(handle.i18nNamespace);
  const inProgress = completed < total && completed > 0;
  const labelPrefix = `${inProgress ? t('app:profile.edit') : t('app:profile.add')}\u0020`;
  return (
    <Card className="p-4 sm:p-6">
      <CardHeader className="p-0">
        <div className="mb-6 grid grid-cols-2 justify-between select-none">
          <div>
            <span className="rounded-2xl border border-gray-500 px-3 py-0.5 text-sm text-gray-500">
              {t('app:profile.fields-complete', { completed, total })}
            </span>
          </div>
          <div className="ml-auto space-x-2">
            {inProgress && (
              <span className="rounded-2xl bg-gray-500 px-3 py-0.5 text-sm text-white">{t('app:profile.in-progress')}</span>
            )}
            {required && (
              <span className="rounded-2xl bg-gray-500 px-3 py-0.5 text-sm text-white">{t('app:profile.required')}</span>
            )}
          </div>
        </div>
        <CardTitle className="text-2xl">{title}</CardTitle>
      </CardHeader>
      <CardContent className="my-3 space-y-3 p-0">{children}</CardContent>
      <CardFooter className="mt-3 p-0">
        <InlineLink file={file}>
          {labelPrefix}
          {linkLabel}
        </InlineLink>
      </CardFooter>
    </Card>
  );
}

export interface ProfileFieldProps {
  label: string;
  children: ReactNode;
}

function ProfileField({ label, children }: ProfileFieldProps): JSX.Element {
  return (
    <div>
      <dt className="font-semibold">{label}</dt>
      <dd className="mt-1 text-gray-500 sm:col-span-2 sm:mt-0">{children}</dd>
    </div>
  );
}
