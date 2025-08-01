import { useId } from 'react';
import type { ComponentProps, ReactNode } from 'react';

import { cn } from '~/utils/tailwind-utils';

export type CollapsibleSummaryProps = ComponentProps<'summary'>;

export function CollapsibleSummary({ children, className, ...props }: CollapsibleSummaryProps) {
  return (
    <summary className={cn('cursor-pointer marker:text-blue-900', className)} {...props}>
      <span className="ml-4 inline-block text-blue-900 hover:underline">{children}</span>
    </summary>
  );
}

export interface CollapsibleProps extends ComponentProps<'details'> {
  contentClassName?: string;
  summary: ReactNode;
}

export function Collapsible({ children, contentClassName, id, summary, ...props }: CollapsibleProps) {
  const uniqueId = useId();
  const summaryId = `${id ?? uniqueId}-summary`;
  const contentId = `${id ?? uniqueId}-content`;
  return (
    <details id={id ?? uniqueId} {...props}>
      <CollapsibleSummary id={summaryId}>{summary}</CollapsibleSummary>
      <div id={contentId} className={cn('mt-2 border-l-[6px] border-l-sky-800 bg-sky-50 px-6 py-4', contentClassName)}>
        {children}
      </div>
    </details>
  );
}
