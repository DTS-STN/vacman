import type { RouteHandle } from 'react-router';
import { Form } from 'react-router';

import { useTranslation } from 'react-i18next';

import type { Route } from './+types/somc-conditions';

import { requireAuthentication } from '~/.server/utils/auth-utils';
import { BackLink } from '~/components/back-link';
import { Button } from '~/components/button';
import { ButtonLink } from '~/components/button-link';
import { FormErrorSummary } from '~/components/error-summary';
import { InputTextarea } from '~/components/input-textarea';
import { getTranslation } from '~/i18n-config.server';
import { handle as parentHandle } from '~/routes/layout';

export const handle = {
  i18nNamespace: [...parentHandle.i18nNamespace],
} as const satisfies RouteHandle;

export function meta({ loaderData }: Route.MetaArgs) {
  return [{ title: loaderData.documentTitle }];
}

export function action({ context, params, request }: Route.ActionArgs) {
  requireAuthentication(context.session, request);

  // TODO update the current request
}

export async function loader({ context, request }: Route.LoaderArgs) {
  requireAuthentication(context.session, request);

  const { t } = await getTranslation(request, handle.i18nNamespace);

  // TODO fetch the current request

  return {
    documentTitle: t('app:somc-conditions.page-title'),
  };
}

export default function HiringManagerRequestSomcConditions({ loaderData, params }: Route.ComponentProps) {
  const { t } = useTranslation(handle.i18nNamespace);
  return (
    <>
      <BackLink
        aria-label={t('app:hiring-manager-requests.back')}
        className="mt-6"
        file="routes/hiring-manager/request/index.tsx"
        params={params}
      >
        {t('app:hiring-manager-requests.back')}
      </BackLink>
      <div className="max-w-prose">
        {/* TODO: componentize the form */}
        <h1 className="my-5 text-3xl font-semibold">{t('app:somc-conditions.page-title')}</h1>
        <FormErrorSummary>
          <Form method="post" noValidate>
            <div className="space-y-6">
              <InputTextarea
                id="english-somc"
                className="w-full"
                label={t('app:somc-conditions.english-somc-label')}
                name="englishSomc"
                helpMessage={t('app:somc-conditions.english-somc-help-message')}
                required
              />

              <InputTextarea
                id="french-somc"
                className="w-full"
                label={t('app:somc-conditions.french-somc-label')}
                name="frenchSomc"
                helpMessage={t('app:somc-conditions.french-somc-help-message')}
                required
              />
              <div className="mt-8 flex flex-row-reverse flex-wrap items-center justify-end gap-3">
                <Button name="action" variant="primary" id="save-button">
                  {t('app:form.save')}
                </Button>
                <ButtonLink
                  file="routes/hiring-manager/request/index.tsx"
                  params={params}
                  id="cancel-button"
                  variant="alternative"
                >
                  {t('app:form.cancel')}
                </ButtonLink>
              </div>
            </div>
          </Form>
        </FormErrorSummary>
      </div>
    </>
  );
}
