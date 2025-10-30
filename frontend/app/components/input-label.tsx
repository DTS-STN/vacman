import type { ComponentProps, ReactNode } from 'react';

import { useTranslation } from 'react-i18next';

import { cn } from '~/utils/tailwind-utils';

export interface InputLabelProps extends ComponentProps<'label'> {
  children: ReactNode;
  id: string;
  required?: boolean;
  /**
   * Specifies the French form of "required" to use.
   * - 'feminine' (default): uses "requise"
   * - 'masculine': uses "requis"
   * This only affects French language display; English always shows "required"
   */
  requiredForm?: 'feminine' | 'masculine';
}

export function InputLabel(props: InputLabelProps) {
  const { t } = useTranslation('gcweb');
  const { children, className, required, requiredForm = 'feminine', ...restProps } = props;

  // Determine which translation key to use based on the requiredForm prop
  const getRequiredText = () => {
    if (requiredForm === 'masculine') {
      return t('input.required-masculine');
    }
    return t('input.required');
  };

  return (
    <label className={cn('block', className)} {...restProps}>
      <span className="font-semibold">{children}</span>
      {required && (
        // Using a regular space entity (&#32;) to ensure consistent spacing before the required text,
        // preventing accidental collapse or omission in rendering.
        <>
          &#32;<span aria-hidden="true">({getRequiredText()})</span>
        </>
      )}
    </label>
  );
}
