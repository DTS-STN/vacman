import type { RouteHandle } from 'react-router';
import { data, Form } from 'react-router';

import { useTranslation } from 'react-i18next';
import * as v from 'valibot';

import type { Route } from './+types/referral-preferences';

import { i18nRedirect } from '~/.server/utils/route-utils';
import { Button } from '~/components/button';
import { ButtonLink } from '~/components/button-link';
import { ActionDataErrorSummary } from '~/components/error-summary';
import { InlineLink } from '~/components/links';
import { HttpStatusCodes } from '~/errors/http-status-codes';
import { getTranslation } from '~/i18n-config.server';
import { refferralPreferencesSchema } from '~/routes/employee/profile/validation.server';
import { handle as parentHandle } from '~/routes/layout';
import { formString } from '~/utils/string-utils';

export const handle = {
  i18nNamespace: [...parentHandle.i18nNamespace],
} as const satisfies RouteHandle;

export function meta({ data }: Route.MetaArgs) {
  return [{ title: data?.documentTitle }];
}

export async function action({ context, params, request }: Route.ActionArgs) {
  // Since parent layout ensures authentication, we can safely cast the session
  const formData = await request.formData();
  const parseResult = v.safeParse(refferralPreferencesSchema, {
    languageReferralTypes: formString(formData.get('languageReferralTypes')),
    classification: formString(formData.get('classification')),
    workLocations: formString(formData.get('workLocations')),
    referralAvailibility: formString(formData.get('referralAvailibility')),
    alternateOpportunity: formString(formData.get('alternateOpportunity')),
    employmentTenures: formString(formData.get('employmentTenures')),
  });

  if (!parseResult.success) {
    return data(
      { errors: v.flatten<typeof refferralPreferencesSchema>(parseResult.issues).nested },
      { status: HttpStatusCodes.BAD_REQUEST },
    );
  }

  //TODO: Save form data & work email after validation, workEmail: context.session.authState.idTokenClaims.email

  throw i18nRedirect('routes/employee/profile/index.tsx', request);
}

export async function loader({ context, request }: Route.LoaderArgs) {
  // Since parent layout ensures authentication, we can safely cast the session
  const { t } = await getTranslation(request, handle.i18nNamespace);
  return {
    documentTitle: t('app:referral-preferences.page-title'),
    defaultValues: {
      //TODO: Replace with actual values
      languageReferralTypes: undefined as string[] | undefined,
      classification: undefined as string[] | undefined,
      workLocations: undefined as string[] | undefined,
      referralAvailibility: undefined as string | undefined,
      alternateOpportunity: undefined as string | undefined,
      employmentTenures: undefined as string[] | undefined,
    },
  };
}

export default function PersonalDetails({ loaderData, params }: Route.ComponentProps) {
  const { t } = useTranslation(handle.i18nNamespace);
  return (
    <>
      <InlineLink className="mt-6 block" file="routes/employee/profile/index.tsx" id="back-button">
        {`< ${t('app:profile.back')}`}
      </InlineLink>
      <div className="max-w-prose">
        <h1 className="my-5 text-3xl">{t('app:referral-preferences.page-title')}</h1>
        <ActionDataErrorSummary actionData>
          <Form method="post" noValidate>
            <div className="space-y-6">
              <div className="mt-8 flex flex-row-reverse flex-wrap items-center justify-end gap-3">
                <Button name="action" variant="primary" id="save-button">
                  {t('app:form.save')}
                </Button>
                <ButtonLink file="routes/employee/profile/index.tsx" id="cancel-button" variant="alternative">
                  {t('app:form.cancel')}
                </ButtonLink>
              </div>
            </div>
          </Form>
        </ActionDataErrorSummary>
      </div>
    </>
  );
}
