import { useState } from 'react';

import { useTranslation } from 'react-i18next';

import { InputError } from '~/components/input-error';
import { InputHelp } from '~/components/input-help';
import { InputLabel } from '~/components/input-label';
import { cn } from '~/utils/tailwind-utils';

const inputBaseClassName =
  'block rounded-lg border-gray-500 focus:border-blue-500 focus:outline-hidden focus:ring-3 focus:ring-blue-500';
const inputDisabledClassName =
  'disabled:bg-gray-100 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-70';
const inputReadOnlyClassName =
  'read-only:bg-gray-100 read-only:pointer-events-none read-only:cursor-not-allowed read-only:opacity-70';
const inputErrorClassName = 'border-red-500 focus:border-red-500 focus:ring-red-500';

export interface InputTextareaProps
  extends OmitStrict<
    React.ComponentProps<'textarea'>,
    'aria-describedby' | 'aria-errormessage' | 'aria-invalid' | 'aria-labelledby' | 'aria-required'
  > {
  errorMessage?: string;
  helpMessage?: React.ReactNode;
  id: string;
  label: string;
  name: string;
}

export function InputTextarea({
  errorMessage,
  className,
  helpMessage,
  id,
  label,
  required,
  rows,
  maxLength,
  ...restInputProps
}: InputTextareaProps) {
  const inputErrorId = `input-${id}-error`;
  const inputHelpMessageId = `input-${id}-help`;
  const inputLabelId = `input-${id}-label`;
  const inputWrapperId = `input-${id}`;
  const { t } = useTranslation('app');

  const [characterCount, setCharacterCount] = useState(0);

  return (
    <div id={inputWrapperId} data-testid={inputWrapperId} className="form-group space-y-2">
      <InputLabel id={inputLabelId} htmlFor={id} required={required}>
        {label}
      </InputLabel>
      {errorMessage && <InputError id={inputErrorId}>{errorMessage}</InputError>}
      {helpMessage && (
        <InputHelp id={inputHelpMessageId} data-testid="input-textarea-help">
          {helpMessage}
        </InputHelp>
      )}
      <div className="relative">
        <textarea
          aria-describedby={helpMessage ? inputHelpMessageId : undefined}
          aria-errormessage={errorMessage && inputErrorId}
          aria-invalid={!!errorMessage}
          aria-labelledby={inputLabelId}
          aria-required={required}
          className={cn(
            inputBaseClassName,
            inputDisabledClassName,
            inputReadOnlyClassName,
            inputReadOnlyClassName,
            errorMessage && inputErrorClassName,
            className,
          )}
          data-testid="input-textarea"
          id={id}
          required={required}
          maxLength={maxLength}
          onChange={(e) => setCharacterCount(e.target.value.length)}
          {...restInputProps}
        />
        <span className="absolute right-0 text-sm text-gray-500" aria-live="polite" aria-atomic="true">
          {`${characterCount}/${maxLength} ${t('form.maximum-characters')}`}
        </span>
      </div>
    </div>
  );
}
