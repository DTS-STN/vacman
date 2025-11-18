import { useMemo } from 'react';

import { useLanguage } from '~/hooks/use-language';
import { formatDateTimeForTimezone } from '~/utils/date-utils';

export function useFormattedDate(date: string | Date | undefined, timeZone: string) {
  const { currentLanguage } = useLanguage();
  return useMemo(() => {
    return date ? formatDateTimeForTimezone(date, timeZone, currentLanguage) : '0000-00-00 00:00';
  }, [date, timeZone, currentLanguage]);
}
