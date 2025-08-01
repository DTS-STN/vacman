import type { RouteHandle, LoaderFunctionArgs, ActionFunctionArgs, MetaFunction } from 'react-router';
import { Form } from 'react-router';

import { getUserService } from '~/.server/domain/services/user-service';
import { createUserProfile, ensureUserProfile } from '~/.server/utils/profile-utils';
import { i18nRedirect } from '~/.server/utils/route-utils';
import { Button } from '~/components/button';
import { ButtonLink } from '~/components/button-link';
import { getTranslation } from '~/i18n-config.server';
import { handle as parentHandle } from '~/routes/layout';

export const handle = {
  i18nNamespace: [...parentHandle.i18nNamespace],
} as const satisfies RouteHandle;

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  return [{ title: data?.documentTitle }];
};

export async function action({ context, request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const action = formData.get('action');

  if (action === 'accept') {
    const userService = getUserService();
    const activeDirectoryId = context.session.authState.idTokenClaims.oid;

    // Check if user already exists
    const existingUser = await userService.getUserByActiveDirectoryId(activeDirectoryId);

    if (existingUser) {
      await ensureUserProfile(activeDirectoryId);
    } else {
      // User doesn't exist, register them with privacy consent accepted
      await userService.registerUser(
        {
          activeDirectoryId,
          role: 'employee',
        },
        context.session,
      );
      await createUserProfile(activeDirectoryId);
    }

    return i18nRedirect('routes/employee/index.tsx', request);
  }

  // If declined, redirect back to dashboard selection page with current locale
  return i18nRedirect('routes/index.tsx', request);
}

export async function loader({ context, request }: LoaderFunctionArgs) {
  const { t } = await getTranslation(request, handle.i18nNamespace);
  return { documentTitle: t('app:index.register-as') };
}

export default function PrivacyConsent() {
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
            <ButtonLink file="routes/index.tsx" id="back-button">
              Decline
            </ButtonLink>
          </div>
        </Form>
      </div>
    </>
  );
}
