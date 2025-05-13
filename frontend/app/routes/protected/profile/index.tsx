import type { RouteHandle } from 'react-router';
import { Form, useNavigation } from 'react-router';

import type { Route } from './+types/index';

import { requireAllRoles } from '~/.server/utils/auth-utils';
import { i18nRedirect } from '~/.server/utils/route-utils';
import { Button } from '~/components/button';
import { ButtonLink } from '~/components/button-link';
import { InlineLink } from '~/components/links';
import { getTranslation } from '~/i18n-config.server';
import { handle as parentHandle } from '~/routes/protected/layout';

export const handle = {
  i18nNamespace: [...parentHandle.i18nNamespace, 'protected'],
} as const satisfies RouteHandle;

export function meta({ data }: Route.MetaArgs) {
  return [{ title: data.documentTitle }];
}

export function action({ context, params, request }: Route.ActionArgs) {
  requireAllRoles(context.session, new URL(request.url), ['employee']);
  /*
  TODO: Update redirect to correct page
  */
  throw i18nRedirect('routes/protected/profile/index.tsx', request);
}

export async function loader({ context, request }: Route.LoaderArgs) {
  requireAllRoles(context.session, new URL(request.url), ['employee']);

  const { t } = await getTranslation(request, handle.i18nNamespace);
  return { documentTitle: t('protected:index.about'), defaultValues: {} };
}

export default function EditProfile({ loaderData, params }: Route.ComponentProps) {
  const navigation = useNavigation();
  return (
    <>
      <div className="max-w-prose">
        <h1 className="my-5 text-3xl">Edit-Profile</h1>
        <Form method="post" noValidate>
          <InlineLink className="mt-6 block" file="routes/protected/profile/personal-details.tsx">
            Edit Personal Details
          </InlineLink>
          <div className="mt-8 flex flex-row-reverse flex-wrap items-center justify-end gap-3">
            <Button name="action" variant="primary" id="continue-button" disabled={navigation.state !== 'idle'}>
              Submit
            </Button>
            <ButtonLink file="routes/protected/index.tsx" id="back-button" disabled={navigation.state !== 'idle'}>
              Back
            </ButtonLink>
          </div>
        </Form>
      </div>
    </>
  );
}
