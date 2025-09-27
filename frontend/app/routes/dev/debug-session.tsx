import type { Route } from './+types/debug-session';

export function loader({ context }: Route.LoaderArgs) {
  const { session } = context.get(context.applicationContext);
  return Response.json(session);
}
