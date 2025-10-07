import type { ComponentProps, JSX } from 'react';

import { useTranslation } from 'react-i18next';

import type { RequestStatus } from '~/.server/domain/models';
import { Card, CardContent, CardHeader, CardTitle } from '~/components/card';

export interface PSCGrantedCardProps extends ComponentProps<'div'> {
  priorityClearanceNumber?: string;
  pscClearanceNumber?: string;
  requestStatus: RequestStatus;
  lang: 'en' | 'fr';
}

export function PSCGrantedCard({
  priorityClearanceNumber,
  pscClearanceNumber,
  requestStatus,
  lang,
}: PSCGrantedCardProps): JSX.Element {
  const { t } = useTranslation('app');
  return (
    <div>
      <Card className="mt-6 space-y-6 rounded bg-gray-100">
        <CardHeader>
          <CardTitle>{lang === 'en' ? requestStatus.nameEn : requestStatus.nameFr}</CardTitle>
        </CardHeader>
        <CardContent>
          {t('hr-advisor-referral-requests.vms-clearance-number')}: {priorityClearanceNumber} <br />
          {t('hr-advisor-referral-requests.psc-clearance-number')}: {pscClearanceNumber}
        </CardContent>
      </Card>
    </div>
  );
}
