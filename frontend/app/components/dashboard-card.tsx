import type { JSX } from 'react';

import { Form } from 'react-router';

import type { IconProp } from '@fortawesome/fontawesome-svg-core';
import { faChevronRight } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import { Card, CardHeader, CardIcon, CardTitle } from '~/components/card';
import { AppLink } from '~/components/links';
import type { I18nRouteFile } from '~/i18n-routes';

interface DashboardCardProps {
  href: I18nRouteFile;
  params?: Record<string, string>;
  icon: IconProp;
  title: string;
  body?: string;
}

export function DashboardCard({ href, params, icon, title, body }: DashboardCardProps): JSX.Element {
  return (
    <Form method="post">
      <Card asChild className="flex cursor-pointer items-center gap-4 p-4 transition-colors hover:bg-gray-50 sm:p-6">
        <AppLink file={href} params={params}>
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
    </Form>
  );
}
