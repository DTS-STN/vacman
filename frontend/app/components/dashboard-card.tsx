import type { ComponentProps, JSX } from 'react';

import type { Params } from 'react-router';

import type { FlipProp, IconProp } from '@fortawesome/fontawesome-svg-core';
import { faChevronRight, faSpinner } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import { Card, CardHeader, CardIcon, CardTitle } from '~/components/card';
import { AppLink } from '~/components/links';
import { useLinkLoading } from '~/hooks/use-loading';
import type { I18nRouteFile } from '~/i18n-routes';
import { cn } from '~/utils/tailwind-utils';

type DashboardCardProps = ComponentProps<typeof AppLink> & {
  file: I18nRouteFile;
  params?: Params;
  icon: IconProp;
  title: string;
  body?: string;
  iconFlip?: FlipProp;
};

export function DashboardCard({ file, params, icon, iconFlip, title, body, ...props }: DashboardCardProps): JSX.Element {
  const isLoading = useLinkLoading(file, params);
  return (
    <Card
      asChild
      className={cn(
        'flex cursor-pointer items-center gap-4 p-4 transition-colors hover:bg-gray-50 sm:p-6',
        isLoading ? 'pointer-events-none animate-pulse cursor-not-allowed select-none' : '',
      )}
    >
      <AppLink file={file} params={params} {...props} disabled={isLoading}>
        <CardIcon icon={icon} iconFlip={iconFlip} />
        <div className="flex flex-col gap-2">
          <CardHeader asChild className="p-0">
            <span>
              <CardTitle asChild className="flex items-center gap-2">
                <span>
                  {title}
                  <FontAwesomeIcon icon={faChevronRight} />
                </span>
              </CardTitle>
            </span>
          </CardHeader>
          {body && <div>{body}</div>}
        </div>
        {isLoading && <FontAwesomeIcon className="ml-1" icon={faSpinner} spin={true} />}
      </AppLink>
    </Card>
  );
}
