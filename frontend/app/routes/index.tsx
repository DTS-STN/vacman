import type { RouteHandle } from 'react-router';

import type { Route } from './+types/index';

import { i18nRedirect } from '~/.server/utils/route-utils';
import { handle as parentHandle } from '~/routes/layout';

export const handle = {
  i18nNamespace: [...parentHandle.i18nNamespace],
} as const satisfies RouteHandle;

export function loader({ context, request }: Route.LoaderArgs) {
  return i18nRedirect('routes/employee/index.tsx', request);
}
