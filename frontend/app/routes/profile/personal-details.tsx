import type { RouteHandle } from 'react-router';
import { Form } from 'react-router';

import type { Route } from './+types/personal-details';

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
  return [{ title: data?.documentTitle }];
}

export function action({ context, params, request }: Route.ActionArgs) {
  requireAllRoles(context.session, new URL(request.url), ['employee']);
  /*
  TODO: Add validation schema
  const formData = await request.formData();
  */
  throw i18nRedirect('routes/profile/index.tsx', request);
}

export async function loader({ context, request }: Route.LoaderArgs) {
  requireAllRoles(context.session, new URL(request.url), ['employee']);
  const { t } = await getTranslation(request, handle.i18nNamespace);
  return { documentTitle: t('app:index.about'), defaultValues: {} };
}

export default function PersonalDetails({ loaderData, params }: Route.ComponentProps) {
  return (
    <>
      <div className="max-w-prose">
        <h1 className="my-5 text-3xl">Personal-Details</h1>
        <Form method="post" noValidate>
          <div className="mt-8 flex flex-row-reverse flex-wrap items-center justify-end gap-3">
            <Button name="action" variant="primary" id="continue-button">
              Update
            </Button>
            <ButtonLink file="routes/profile/index.tsx" id="back-button">
              Back
            </ButtonLink>
          </div>
        </Form>
      </div>
    </>
  );
}
