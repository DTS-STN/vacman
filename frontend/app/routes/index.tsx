import type { Route } from './+types/index';

import { i18nRedirect } from '~/.server/utils/route-utils';

export function loader({ context, request }: Route.LoaderArgs) {
  return i18nRedirect('routes/employee/index.tsx', request);
}
