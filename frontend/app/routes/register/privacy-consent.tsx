import type { RouteHandle } from 'react-router';
import { Form } from 'react-router';

import type { Route } from './+types/privacy-consent';

import { requireAllRoles } from '~/.server/utils/auth-utils';
import { i18nRedirect } from '~/.server/utils/route-utils';
import { Button } from '~/components/button';
import { ButtonLink } from '~/components/button-link';
import { getTranslation } from '~/i18n-config.server';
import { handle as parentHandle } from '~/routes/layout';

export const handle = {
  i18nNamespace: [...parentHandle.i18nNamespace],
} as const satisfies RouteHandle;

export function meta({ data }: Route.MetaArgs) {
  return [{ title: data.documentTitle }];
}

export function action({ context, params, request }: Route.ActionArgs) {
  requireAllRoles(context.session, new URL(request.url), ['employee']);
  /*
  TODO: Add validation schema
  const formData = await request.formData();
  */
  throw i18nRedirect('routes/index.tsx', request);
  /* 
  TODO: send POST request to register the user as employee
  */
}

export async function loader({ context, request }: Route.LoaderArgs) {
  requireAllRoles(context.session, new URL(request.url), ['employee']);

  const { t } = await getTranslation(request, handle.i18nNamespace);
  return { documentTitle: t('app:index.about'), defaultValues: {} };
}

export default function PrivacyConsent({ loaderData, params }: Route.ComponentProps) {
  return (
    <>
      <div className="max-w-prose">
        <h1 className="my-5 text-3xl">Privacy consent</h1>
        <Form method="post" noValidate>
          <p>
            Lorem ipsum dolor sit amet consectetur adipiscing elit. Quisque faucibus ex sapien vitae pellentesque sem placerat.
            In id cursus mi pretium tellus duis convallis. Tempus leo eu aenean sed diam urna tempor. Pulvinar vivamus fringilla
            lacus nec metus bibendum egestas. Iaculis massa nisl malesuada lacinia integer nunc posuere. Ut hendrerit semper vel
            class aptent taciti sociosqu. Ad litora torquent per conubia nostra inceptos himenaeos. Lorem ipsum dolor sit amet
            consectetur adipiscing elit. Quisque faucibus ex sapien vitae pellentesque sem placerat. In id cursus mi pretium
            tellus duis convallis. Tempus leo eu aenean sed diam urna tempor. Pulvinar vivamus fringilla lacus nec metus
            bibendum egestas. Iaculis massa nisl malesuada lacinia integer nunc posuere. Ut hendrerit semper vel class aptent
            taciti sociosqu. Ad litora torquent per conubia nostra inceptos himenaeos.
          </p>
          <div className="mt-8 flex flex-row-reverse flex-wrap items-center justify-end gap-3">
            <Button name="action" variant="primary" id="continue-button">
              Accept
            </Button>
            <ButtonLink file="routes/register/index.tsx" id="back-button">
              Decline
            </ButtonLink>
          </div>
        </Form>
      </div>
    </>
  );
}
