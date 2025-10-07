import type { ComponentProps, JSX } from 'react';

import { useTranslation } from 'react-i18next';

import type { RequestStatus } from '~/.server/domain/models';
import { Card, CardContent, CardHeader, CardTitle } from '~/components/card';
import { REQUEST_STATUS_CODE } from '~/domain/constants';

export interface ClearanceGrantedCardProps extends ComponentProps<'div'> {
  priorityClearanceNumber?: string;
  pscClearanceNumber?: string;
  requestStatus: RequestStatus;
  lang: 'en' | 'fr';
}

export function ClearanceGrantedCard({
  priorityClearanceNumber,
  pscClearanceNumber,
  requestStatus,
  lang,
}: ClearanceGrantedCardProps): JSX.Element {
  const { t } = useTranslation('app');

  return (
    <>
      {(requestStatus.code === REQUEST_STATUS_CODE.PSC_GRANTED || requestStatus.code === REQUEST_STATUS_CODE.CLR_GRANTED) && (
        <div>
          <Card className="mt-6 space-y-6 rounded bg-gray-100">
            <CardHeader>
              <CardTitle>{lang === 'en' ? requestStatus.nameEn : requestStatus.nameFr}</CardTitle>
            </CardHeader>
            <CardContent>
              {labelWithColon(t('hr-advisor-referral-requests.vms-clearance-number'), lang)} {priorityClearanceNumber} <br />
              {requestStatus.code === REQUEST_STATUS_CODE.PSC_GRANTED && (
                <>
                  {labelWithColon(t('hr-advisor-referral-requests.psc-clearance-number'), lang)} {pscClearanceNumber}
                </>
              )}
              {/* TODO: display View candidates link when the matches are available and the request status id is PSC_GRANTED */}
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
}

function labelWithColon(label: string, lang: 'en' | 'fr') {
  return lang === 'fr' ? `${label}\u00A0:` : `${label}:`;
}
