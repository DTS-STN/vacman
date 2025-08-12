import type { ComponentProps, JSX } from 'react';

import type { Params } from 'react-router';

import type { IconProp } from '@fortawesome/fontawesome-svg-core';
import { faChevronRight } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import { Card, CardHeader, CardIcon, CardTitle } from '~/components/card';
import { AppLink } from '~/components/links';
import type { I18nRouteFile } from '~/i18n-routes';

type DashboardCardProps = ComponentProps<typeof AppLink> & {
  file: I18nRouteFile;
  params?: Params;
  icon: IconProp;
  title: string;
  body?: string;
};

export function DashboardCard({ file, params, icon, title, body, ...props }: DashboardCardProps): JSX.Element {
  return (
    <Card asChild className="flex cursor-pointer items-center gap-4 p-4 transition-colors hover:bg-gray-50 sm:p-6">
      <AppLink file={file} params={params} {...props}>
        <CardIcon icon={icon} />
        <div className="flex flex-col gap-2">
          <CardHeader asChild className="p-0">
            <span>
              <CardTitle asChild className="flex items-center gap-2">
                <span role="heading" aria-level={2}>
                  {title}
                  <FontAwesomeIcon icon={faChevronRight} />
                </span>
              </CardTitle>
            </span>
          </CardHeader>
          {body && <div>{body}</div>}
        </div>
      </AppLink>
    </Card>
  );
}
