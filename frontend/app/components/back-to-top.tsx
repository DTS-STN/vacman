import { faChevronUp } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useTranslation } from 'react-i18next';

import { AnchorLink } from '~/components/links';

export function BackToTop() {
  const { t } = useTranslation(['gcweb']);
  return (
    <div>
      <AnchorLink
        anchorElementId="top"
        className="font-lato fixed right-0 bottom-0 z-10 mx-2 hidden translate-y-full items-center justify-center rounded-sm border border-slate-700 bg-slate-700 px-5 py-2.5 align-middle text-sm text-white outline-offset-4 transition-all hover:bg-sky-800 focus:-translate-y-2 focus:bg-sky-800 sm:inline-flex"
      >
        {t('gcweb:footer.back-to-top')}
      </AnchorLink>
      <AnchorLink
        anchorElementId="top"
        className="mt-2 flex w-full items-center justify-center bg-gray-100 py-3 hover:text-blue-700 hover:underline focus:text-blue-700 sm:hidden"
      >
        <span className="flex flex-nowrap space-x-2">
          <span>{t('gcweb:footer.back-to-top')}</span>
          <FontAwesomeIcon icon={faChevronUp} className="my-auto size-4" />
        </span>
      </AnchorLink>
    </div>
  );
}
