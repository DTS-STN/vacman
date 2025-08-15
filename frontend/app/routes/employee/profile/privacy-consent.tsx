import type { JSX } from 'react';

import type { RouteHandle } from 'react-router';
import { Form } from 'react-router';

import { useTranslation } from 'react-i18next';

import type { Route } from './+types/privacy-consent';

import type { ProfilePutModel } from '~/.server/domain/models';
import { getProfileService } from '~/.server/domain/services/profile-service';
import { requireAuthentication } from '~/.server/utils/auth-utils';
import { i18nRedirect } from '~/.server/utils/route-utils';
import { Button } from '~/components/button';
import { ButtonLink } from '~/components/button-link';
import { HtmlAbbreviation } from '~/components/html-abbreviation';
import { InlineLink } from '~/components/links';
import { Acronym } from '~/domain/constants';
import { getTranslation } from '~/i18n-config.server';
import { handle as parentHandle } from '~/routes/layout';

export const handle = {
  i18nNamespace: [...parentHandle.i18nNamespace],
} as const satisfies RouteHandle;

export function meta({ loaderData }: Route.MetaArgs) {
  return [{ title: loaderData?.documentTitle }];
}

export async function action({ context, request }: Route.ActionArgs) {
  requireAuthentication(context.session, request);

  const profileService = getProfileService();
  const profileParams = { active: true };
  const profileResult = await getProfileService().getCurrentUserProfiles(profileParams, context.session.authState.accessToken);

  if (profileResult.isErr()) {
    return i18nRedirect('routes/index.tsx', request);
  }

  const profiles = profileResult.unwrap().content;
  if (profiles.length === 0) {
    return i18nRedirect('routes/index.tsx', request);
  }

  // Get the first (most recent) profile
  const profile = profiles[0];
  if (!profile) {
    return i18nRedirect('routes/index.tsx', request);
  }

  const updatePrivacyConsent: ProfilePutModel = {
    hasConsentedToPrivacyTerms: true,
  };

  await profileService.updateProfileById(profile.id, updatePrivacyConsent, context.session.authState.accessToken);

  return i18nRedirect('routes/employee/index.tsx', request);
}

export async function loader({ context, request }: Route.LoaderArgs) {
  requireAuthentication(context.session, request);
  const { lang, t } = await getTranslation(request, handle.i18nNamespace);
  return { documentTitle: t('app:index.register-as'), lang: lang };
}

export default function PrivacyConsent({ loaderData }: Route.ComponentProps) {
  const { t } = useTranslation(handle.i18nNamespace);
  return (
    <>
      <div className="max-w-prose">
        <h1 className="my-5 text-3xl font-semibold">{t('app:privacy-consent.privacy-notice-statement')}</h1>
        <Form method="post" noValidate>
          {loaderData.lang === 'fr' ? <PrivacyFr /> : <PrivacyEn />}
          <div className="mt-8 flex flex-row-reverse flex-wrap items-center justify-end gap-3">
            <Button variant="primary" id="continue-button">
              {t('app:privacy-consent.accept')}
            </Button>
            <ButtonLink file="routes/index.tsx" id="back-button">
              {t('app:privacy-consent.decline')}
            </ButtonLink>
          </div>
        </Form>
      </div>
    </>
  );
}

function PrivacyEn(): JSX.Element {
  return (
    <div className="space-y-6">
      <p>
        Personal information is collected to facilitate your redeployment using the{' '}
        <HtmlAbbreviation acronymEnum={Acronym.ESDC} /> Vacancy Management System (
        <HtmlAbbreviation acronymEnum={Acronym.VMS} />
        ). Using the <HtmlAbbreviation acronymEnum={Acronym.VMS} />, the Human Resources Services Branch (
        <HtmlAbbreviation acronymEnum={Acronym.HRSB} />) can review, approve and update your profile to assist you in being
        referred to job opportunities submitted by hiring managers. Access to the <HtmlAbbreviation acronymEnum={Acronym.VMS} />{' '}
        is limited to <HtmlAbbreviation acronymEnum={Acronym.HR} /> professionals and hiring managers to whom your profile has
        been referred.
      </p>
      <p>
        Information from the <HtmlAbbreviation acronymEnum={Acronym.VMS} /> may be used to generate depersonalized reports for
        submission to <HtmlAbbreviation acronymEnum={Acronym.ESDC} />
        &apos;s upper management, Treasury Board of Canada Secretariat (<HtmlAbbreviation acronymEnum={Acronym.TBS} />
        ), and bargaining agents for monitoring, auditing and statistical purposes.
      </p>
      <p>
        Personal information may also be used by <HtmlAbbreviation acronymEnum={Acronym.ESDC} /> for non-administrative purposes
        in accordance with paragraph 8(2) (a) of the Privacy Act for the following activities: reporting and statistical
        analysis.
      </p>
      <p className="font-semibold">
        Registration in the <HtmlAbbreviation acronymEnum={Acronym.VMS} /> is voluntary, and you may, without prejudice, refuse.
        If you do not consent to the sharing of your personal information, <HtmlAbbreviation acronymEnum={Acronym.ESDC} /> will
        not be able to use the <HtmlAbbreviation acronymEnum={Acronym.VMS} /> to identify possible job opportunities for you.
      </p>
      <p>
        In accordance with the provisions of the Privacy Act, the personal information collected in the{' '}
        <HtmlAbbreviation acronymEnum={Acronym.VMS} /> is described in the Personal Information Bank (
        <HtmlAbbreviation acronymEnum={Acronym.PIB} />){' '}
        <InlineLink to="https://www.canada.ca/en/treasury-board-secretariat/services/access-information-privacy/access-information/info-source/standard-personal-information-banks.html#pse902">
          Staffing - PSE 902
        </InlineLink>
        . The full text of this <HtmlAbbreviation acronymEnum={Acronym.PIB} /> is published in the{' '}
        <HtmlAbbreviation acronymEnum={Acronym.TBS} />{' '}
        <InlineLink to="https://www.canada.ca/en/treasury-board-secretariat/services/access-information-privacy/access-information/info-source/standard-personal-information-banks.html">
          Info Source
        </InlineLink>{' '}
        publication.
      </p>
      <p>
        In accordance with the Privacy Act, you have the right to access your own personal information and request corrections
        to it. This includes information contained in the <HtmlAbbreviation acronymEnum={Acronym.VMS} />.
      </p>
      <p>
        You have the right to file a complaint with the Privacy Commissioner of Canada regarding{' '}
        <HtmlAbbreviation acronymEnum={Acronym.ESDC} />
        &apos;s handling of your personal information. For more information on privacy issues and the Privacy Act in general,
        consult the Privacy Commissioner at 1-800-282-1376.
      </p>
      <h2 className="font-lato text-2xl font-bold">Authorization</h2>
      <p>
        Having read and understood this Privacy Notice Statement, I hereby authorize{' '}
        <HtmlAbbreviation acronymEnum={Acronym.ESDC} /> to use and disclose any personal information I submit for the purpose of
        administering my departmental priority entitlement.
      </p>
    </div>
  );
}

function PrivacyFr(): JSX.Element {
  return (
    <div className="space-y-6">
      <p>
        Des renseignements personnels sont recueillis pour faciliter votre réaffectation à l&apos;aide du Système de gestion des
        postes vacants (<HtmlAbbreviation acronymEnum={Acronym.VMS} />) d&apos;
        <HtmlAbbreviation acronymEnum={Acronym.ESDC} />. À l&apos;aide du <HtmlAbbreviation acronymEnum={Acronym.VMS} />, la
        Direction générale des services de ressources humaines (<HtmlAbbreviation acronymEnum={Acronym.HRSB} />) peut examiner,
        approuver et mettre à jour votre profil afin de vous aider à être présenté-e-s aux possibilités d&apos;emploi soumises
        par les gestionnaires d&apos;embauche. L&apos;accès au <HtmlAbbreviation acronymEnum={Acronym.VMS} /> est limité aux
        professionnels des <HtmlAbbreviation acronymEnum={Acronym.HR} /> et aux gestionnaires d&apos;embauche auxquels votre
        profil a été présenté.
      </p>
      <p>
        Les renseignements provenant du <HtmlAbbreviation acronymEnum={Acronym.VMS} /> peuvent être utilisés pour produire des
        rapports dépersonnalisés qui seront présentés à la haute gestion d&apos;
        <HtmlAbbreviation acronymEnum={Acronym.ESDC} />, au Secrétariat du Conseil du Trésor du Canada (
        <HtmlAbbreviation acronymEnum={Acronym.TBS} />) et aux agents négociateurs à des fins de surveillance, de vérification
        et de statistiques.
      </p>
      <p>
        Les renseignements personnels peuvent également être utilisés par <HtmlAbbreviation acronymEnum={Acronym.ESDC} /> à des
        fins non administratives conformément à l&apos;alinéa 8(2)a) de la Loi sur la protection des renseignements personnels
        pour les activités suivantes : rapports et analyses statistiques.
      </p>
      <p className="font-semibold">
        L&apos;inscription au <HtmlAbbreviation acronymEnum={Acronym.VMS} /> est volontaire, et vous pouvez, sans préjudice,
        refuser. Si vous ne consentez pas à la communication de vos renseignements personnels,{' '}
        <HtmlAbbreviation acronymEnum={Acronym.ESDC} /> ne sera pas en mesure d&apos;utiliser le{' '}
        <HtmlAbbreviation acronymEnum={Acronym.VMS} /> pour vous identifier des possibilités d&apos;emploi.
      </p>
      <p>
        Conformément aux dispositions de la Loi sur la protection des renseignements personnels, les renseignements personnels
        recueillis dans le <HtmlAbbreviation acronymEnum={Acronym.VMS} /> sont décrits dans le fichier de renseignements
        personnels (<HtmlAbbreviation acronymEnum={Acronym.PIB} />){' '}
        <InlineLink to="https://www.canada.ca/fr/secretariat-conseil-tresor/services/acces-information-protection-reseignements-personnels/acces-information/info-source/fichiers-renseignements-personnels-ordinaires.html#poe9021">
          Dotation - POE 902
        </InlineLink>
        . Le texte intégral de ce <HtmlAbbreviation acronymEnum={Acronym.PIB} /> est publié dans la publication{' '}
        <InlineLink to="https://www.canada.ca/fr/secretariat-conseil-tresor/services/acces-information-protection-reseignements-personnels/acces-information/info-source/fichiers-renseignements-personnels-ordinaires.html">
          Info Source
        </InlineLink>{' '}
        du <HtmlAbbreviation acronymEnum={Acronym.TBS} /> . Conformément à la Loi sur la protection des renseignements
        personnels, vous avez le droit d&apos;accéder à vos renseignements personnels et d&apos;en demander la correction. Cela
        inclut les informations contenues dans le <HtmlAbbreviation acronymEnum={Acronym.VMS} />.
      </p>
      <p>
        Vous avez le droit de déposer une plainte auprès du Commissariat à la protection de la vie privée du Canada concernant
        le traitement de vos renseignements personnels par <HtmlAbbreviation acronymEnum={Acronym.ESDC} />. Pour en apprendre
        davantage sur les questions de protection de la vie privée et la Loi sur la protection des renseignements personnels en
        général, veuillez consulter le Commissariat à la protection de la vie privée au 1-800-282-1376.
      </p>
      <h2 className="font-lato text-2xl font-bold">Autorisation</h2>
      <p>
        Après avoir lu et compris le présent énoncé de confidentialité, j&apos;autorise par la présente{' '}
        <HtmlAbbreviation acronymEnum={Acronym.ESDC} /> à utiliser et à communiquer tous les renseignements personnels que je
        soumets aux fins de l&apos;administration de mon droit de priorité ministériel.
      </p>
    </div>
  );
}
