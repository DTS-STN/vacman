import type { ComponentProps, ReactNode } from 'react';

import { useTranslation } from 'react-i18next';

import { cn } from '~/utils/tailwind-utils';

export interface InputLegendProps extends ComponentProps<'legend'> {
  children: ReactNode;
  required?: boolean;
  childrenClassName?: string;
  /**
   * Specifies the French form of "required" to use.
   * - 'feminine' (default): uses "requise"
   * - 'masculine': uses "requis"
   * This only affects French language display; English always shows "required"
   */
  requiredForm?: 'feminine' | 'masculine';
}

export function InputLegend(props: InputLegendProps) {
  const { t } = useTranslation('gcweb');
  const { children, className, required, childrenClassName, requiredForm = 'feminine', ...restProps } = props;

  // Determine which translation key to use based on the requiredForm prop
  const getRequiredText = () => {
    if (requiredForm === 'masculine') {
      return t('input.required-masculine');
    }
    return t('input.required');
  };

  return (
    <legend className={cn('block', className)} {...restProps}>
      <span className={cn('font-semibold', childrenClassName)}>{children}</span>
      {required && (
        // Using a regular space entity (&#32;) to ensure consistent spacing before the required text,
        // preventing accidental collapse or omission in rendering.
        <>
          &#32;<span aria-hidden="true">({getRequiredText()})</span>
        </>
      )}
    </legend>
  );
}
