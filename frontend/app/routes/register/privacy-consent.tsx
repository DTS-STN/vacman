import type { RouteHandle } from 'react-router';
import { Form, redirect } from 'react-router';

import type { Route } from './+types/privacy-consent';

import { getUserService } from '~/.server/domain/services/user-service';
import { requireAuthentication } from '~/.server/utils/auth-utils';
import { requireUnregisteredUser } from '~/.server/utils/user-registration-utils';
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

export async function action({ context, request }: Route.ActionArgs) {
  // Ensure user is authenticated (no specific roles required)
  requireAuthentication(context.session, new URL(request.url));

  const formData = await request.formData();
  const action = formData.get('action');

  if (action === 'accept') {
    // Register the user as an employee after accepting privacy consent
    const userService = getUserService();
    const activeDirectoryId = context.session.authState.idTokenClaims.sub;
    const name = context.session.authState.idTokenClaims.name ?? 'Unknown User';

    await userService.registerUser({
      name,
      activeDirectoryId,
    });

    // Get the return URL from the query parameters or default to dashboard
    const url = new URL(request.url);
    const returnTo = url.searchParams.get('returnto') ?? '/en/';

    return redirect(returnTo);
  }

  // If declined, redirect back to registration page
  return redirect('/en/register');
}

export async function loader({ context, request }: Route.LoaderArgs) {
  requireAuthentication(context.session, new URL(request.url));
  await requireUnregisteredUser(context.session, new URL(request.url));

  const { t } = await getTranslation(request, handle.i18nNamespace);
  return { documentTitle: t('app:register.page-title') };
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
            <Button name="action" value="accept" variant="primary" id="continue-button">
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
