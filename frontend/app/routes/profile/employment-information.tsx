import type { RouteHandle } from 'react-router';
import { data, Form } from 'react-router';

import { useTranslation } from 'react-i18next';
import * as v from 'valibot';

import type { Route } from './+types/employment-information';

import { requireAllRoles } from '~/.server/utils/auth-utils';
import { i18nRedirect } from '~/.server/utils/route-utils';
import { Button } from '~/components/button';
import { ActionDataErrorSummary } from '~/components/error-summary';
import { InlineLink } from '~/components/links';
import { HttpStatusCodes } from '~/errors/http-status-codes';
import { getTranslation } from '~/i18n-config.server';
import { handle as parentHandle } from '~/routes/layout';
import { employmentInformationSchema } from '~/routes/profile/validation.server';
import { formString } from '~/utils/string-utils';

export const handle = {
  i18nNamespace: [...parentHandle.i18nNamespace],
} as const satisfies RouteHandle;

export function meta({ data }: Route.MetaArgs) {
  return [{ title: data?.documentTitle }];
}

export async function action({ context, params, request }: Route.ActionArgs) {
  requireAllRoles(context.session, new URL(request.url), ['employee']);

  const formData = await request.formData();
  const parseResult = v.safeParse(employmentInformationSchema, {
    substantivePosition: formString(formData.get('substantivePosition')),
    branchOrServiceCanadaRegion: formString(formData.get('branchOrServiceCanadaRegion')),
    directorate: formString(formData.get('directorate')),
    province: formString(formData.get('province')),
    city: formString(formData.get('city')),
    currentWFAStatus: formString(formData.get('currentWFAStatus')),
    hrAdvisor: formString(formData.get('hrAdvisor')),
  });

  if (!parseResult.success) {
    return data(
      { errors: v.flatten<typeof employmentInformationSchema>(parseResult.issues).nested },
      { status: HttpStatusCodes.BAD_REQUEST },
    );
  }

  //TODO: Save form data after validation

  throw i18nRedirect('routes/profile/index.tsx', request);
}

export async function loader({ context, request }: Route.LoaderArgs) {
  requireAllRoles(context.session, new URL(request.url), ['employee']);
  const { t } = await getTranslation(request, handle.i18nNamespace);
  return {
    documentTitle: t('app:employmeny-information.page-title'),
    defaultValues: {
      //TODO: Replace with actual values
      substantivePosition: undefined as string | undefined,
      branchOrServiceCanadaRegion: undefined as string | undefined,
      directorate: undefined as string | undefined,
      province: undefined as string | undefined,
      city: undefined as string | undefined,
      currentWFAStatus: undefined as string | undefined,
      hrAdvisor: undefined,
    },
  };
}

export default function EmploymentInformation({ loaderData, actionData, params }: Route.ComponentProps) {
  const { t } = useTranslation(handle.i18nNamespace);
  return (
    <>
      <InlineLink className="mt-6 block" file="routes/profile/index.tsx" id="back-button">
        {`< ${t('app:profile.back')}`}
      </InlineLink>
      <div className="max-w-prose">
        <h1 className="my-5 text-3xl font-semibold">{t('app:employmeny-information.page-title')}</h1>
        <ActionDataErrorSummary actionData>
          <Form method="post" noValidate>
            <div className="space-y-6">
              <Button className="px-12" name="action" variant="primary" id="save-button">
                {t('app:form.save')}
              </Button>
            </div>
          </Form>
        </ActionDataErrorSummary>
      </div>
    </>
  );
}
