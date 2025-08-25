import { useMatches } from 'react-router';
import type { RouteHandle } from 'react-router';

/**
 * Custom hook that determines whether the current route's layout
 * should display its background (e.g., a background image).
 *
 * It inspects the `handle.layoutHasDecorativeBackground` property defined
 * on the active route. If no handle is present or the property
 * is not set, it defaults to `false`.
 *
 * @returns {boolean} `true` if the current route's layout has a background,
 *                    otherwise `false`.
 *
 * @example
 * // In a root layout component:
 * const layoutHasDecorativeBackground = uselayoutHasDecorativeBackground();
 *
 * return (
 *   <div className={layoutHasDecorativeBackground ? "bg-[url('/background.png')]" : ""}>
 *     <Outlet />
 *   </div>
 * );
 */
export function uselayoutHasDecorativeBackground(): boolean {
  const matches = useMatches();
  const handle = matches[matches.length - 1]?.handle as RouteHandle | undefined;
  return handle?.layoutHasDecorativeBackground ?? false;
}
