import type { RouteHandle, LoaderFunctionArgs, ActionFunctionArgs, MetaFunction } from 'react-router';
import { Form } from 'react-router';

import type { Profile } from '~/.server/domain/models';
import { getProfileService } from '~/.server/domain/services/profile-service';
import { requireAuthentication } from '~/.server/utils/auth-utils';
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
  const currentUrl = new URL(request.url);
  requireAuthentication(context.session, currentUrl);
  const authenticatedSession = context.session;
  const currentUserId = authenticatedSession.authState.idTokenClaims.oid;

  const profileService = getProfileService();
  const profileOption = await profileService.getCurrentUserProfile(authenticatedSession.authState.accessToken);

  if (profileOption.isNone()) {
    return i18nRedirect('routes/index.tsx', request);
  }

  const profile = profileOption.unwrap();

  const updatePrivacyConsent: Profile = {
    ...profile,
    privacyConsentInd: true,
  };

  await profileService.updateProfile(
    authenticatedSession.authState.accessToken,
    profile.profileId.toString(),
    currentUserId,
    updatePrivacyConsent,
  );

  return i18nRedirect('routes/employee/index.tsx', request, { params: { id: profile.profileId.toString() } });
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
            <Button variant="primary" id="continue-button">
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
