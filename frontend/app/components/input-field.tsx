import type React from 'react';
import { useId, useRef, useState } from 'react';
import type { ComponentProps } from 'react';

import type { IconProp } from '@fortawesome/fontawesome-svg-core';
import { faXmark } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useTranslation } from 'react-i18next';

import { InputError } from '~/components/input-error';
import { InputHelp } from '~/components/input-help';
import { InputLabel } from '~/components/input-label';
import { cn } from '~/utils/tailwind-utils';

export interface InputFieldProps extends ComponentProps<'input'> {
  errorMessage?: string;
  helpMessagePrimary?: React.ReactNode;
  helpMessagePrimaryClassName?: string;
  helpMessageSecondary?: React.ReactNode;
  helpMessageSecondaryClassName?: string;
  label: string;
  name: string;
  type?: 'email' | 'number' | 'password' | 'search' | 'tel' | 'text' | 'url';
  icon?: IconProp;
  requiredForm?: 'feminine' | 'masculine';
  ref?: React.RefObject<HTMLInputElement | null>;
}

export function InputField({
  'aria-describedby': ariaDescribedby,
  errorMessage,
  className,
  helpMessagePrimary,
  helpMessagePrimaryClassName,
  helpMessageSecondary,
  helpMessageSecondaryClassName,
  id,
  label,
  required,
  type = 'text',
  icon,
  requiredForm,
  ref,
  ...rest
}: InputFieldProps) {
  const { t } = useTranslation('gcweb');

  const baseInputRef = useRef<HTMLInputElement>(null);
  const inputRef = ref ?? baseInputRef;

  const [text, setText] = useState(rest.defaultValue ?? '');
  const requiresTextState = type === 'search';

  const defaultId = useId();
  const baseId = `input-${type}-field-${id ?? defaultId}`;
  const ids = {
    wrapper: baseId,
    label: `${baseId}-label`,
    input: `${baseId}-input`,
    error: `${baseId}-error`,
    help: {
      primary: `${baseId}-help-primary`,
      secondary: `${baseId}-help-secondary`,
    },
  };

  const ariaDescribedbyIds =
    [
      ariaDescribedby, //
      !!helpMessagePrimary && ids.help.primary,
      !!helpMessageSecondary && ids.help.secondary,
    ]
      .filter(Boolean)
      .join(' ') || undefined;

  return (
    <div id={ids.wrapper} className="space-y-2">
      <InputLabel id={ids.label} htmlFor={ids.input} required={required} requiredForm={requiredForm}>
        {label}
      </InputLabel>
      {errorMessage && (
        <p>
          <InputError id={ids.error}>{errorMessage}</InputError>
        </p>
      )}
      {helpMessagePrimary && (
        <InputHelp id={ids.help.primary} className={helpMessagePrimaryClassName}>
          {helpMessagePrimary}
        </InputHelp>
      )}
      <RelativeContainer relative={icon ?? type === 'search'}>
        {icon && (
          <div className="pointer-events-none absolute inset-y-0 start-0 flex h-full items-center ps-3">
            <FontAwesomeIcon icon={icon} />
          </div>
        )}
        <input
          ref={inputRef}
          aria-describedby={ariaDescribedbyIds}
          aria-errormessage={errorMessage ? ids.error : undefined}
          aria-invalid={errorMessage ? true : undefined}
          aria-labelledby={ids.label}
          aria-required={required ? true : undefined}
          className={cn(
            'block rounded-lg border-gray-500 focus:border-blue-500 focus:ring-3 focus:ring-blue-500 focus:outline-hidden',
            'read-only:pointer-events-none read-only:bg-gray-100 read-only:opacity-70',
            'disabled:pointer-events-none disabled:bg-gray-100 disabled:opacity-70',
            'aria-invalid:border-red-500 aria-invalid:focus:border-red-500 aria-invalid:focus:ring-red-500',
            className,
            icon ? 'ps-10' : '',
            type === 'search' ? 'pe-8' : '',
          )}
          id={ids.input}
          required={required}
          type={type}
          onInput={(e) => {
            if (requiresTextState) setText(e.currentTarget.value);
            rest.onInput?.(e);
          }}
          {...rest}
        />
        {type === 'search' && text !== '' && (
          <button
            disabled={rest.disabled}
            aria-label={t('search-bar.clear')}
            className={cn(
              'absolute inset-y-0 right-2 my-2 flex items-center text-blue-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-hidden',
              'disabled:pointer-events-none disabled:opacity-70',
            )}
            onClick={() => {
              if (!inputRef.current) return;
              // Use native setter to trigger React's change event handler
              const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value')?.set;
              nativeInputValueSetter?.call(inputRef.current, '');
              const event = new Event('input', { bubbles: true });
              inputRef.current.dispatchEvent(event);
              inputRef.current.focus();
            }}
          >
            <FontAwesomeIcon icon={faXmark} />
          </button>
        )}
      </RelativeContainer>
      {helpMessageSecondary && (
        <InputHelp id={ids.help.secondary} className={helpMessageSecondaryClassName}>
          {helpMessageSecondary}
        </InputHelp>
      )}
    </div>
  );
}

interface RelativeContainerProps {
  relative?: unknown;
  children: React.ReactNode;
}

function RelativeContainer({ relative, children }: RelativeContainerProps) {
  if (relative) {
    return <div className="relative">{children}</div>;
  }
  return <>{children}</>;
}
