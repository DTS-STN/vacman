import { QueryClient } from '@tanstack/react-query';

// Configure default options for all queries to set global staleTime and cacheTime.
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 2, //2 mins
      gcTime: 1000 * 60 * 5, //5 mins
    },
  },
});

export default queryClient;
