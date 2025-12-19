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
          // Retry failed requests for better resilience
          retry: 2,
          retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
          // Network mode for better offline/slow connection handling
          networkMode: 'online',
          // Refetch on mount only if data is stale
          refetchOnMount: true,
          // Don't refetch on window focus for server-side rendering
          refetchOnWindowFocus: false,
          // Don't refetch on reconnect since staleTime handles freshness
          refetchOnReconnect: false,
        },
      },
    });
  });
}
