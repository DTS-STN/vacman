import { QueryClient } from '@tanstack/react-query';

import { LogFactory } from '~/.server/logging';
import { singleton } from '~/.server/utils/instance-registry';

const log = LogFactory.getLogger(import.meta.url);

export function getQueryClient() {
  return singleton('queryClient', () => {
    log.info('Creating new query client');

    return new QueryClient({
      defaultOptions: {
        queries: {
          staleTime: 1000 * 60 * 2, //2 mins
          gcTime: 1000 * 60 * 5, //5 mins
        },
      },
    });
  });
}
