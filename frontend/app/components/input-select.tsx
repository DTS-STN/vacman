import type { ComponentProps, ReactNode } from 'react';

import { InputError } from '~/components/input-error';
import { InputHelp } from '~/components/input-help';
import { InputLabel } from '~/components/input-label';
import { InputLegend } from '~/components/input-legend';
import type { SortOrder } from '~/utils/sort-utils';
import { sortOptions } from '~/utils/sort-utils';
import { cn } from '~/utils/tailwind-utils';

const inputDisabledClassName =
  'disabled:bg-gray-100 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-70';
const inputErrorClassName = 'border-red-500 focus:border-red-500 focus:ring-red-500';

const variants = {
  alternative: 'block rounded-lg border-0 focus:border-blue-500 focus:outline-none focus:ring focus:ring-blue-500',
  default: 'block rounded-lg border-gray-500 focus:border-blue-500 focus:outline-none focus:ring focus:ring-blue-500',
} as const;

export interface InputSelectProps extends OmitStrict<
  ComponentProps<'select'>,
  'aria-describedby' | 'aria-errormessage' | 'aria-invalid' | 'aria-labelledby' | 'aria-required'
> {
  ariaDescribedbyId?: string;
  errorMessage?: string;
  helpMessage?: ReactNode;
  id: string;
  label?: string;
  legendClassName?: string;
  name: string;
  options: OmitStrict<ComponentProps<'option'>, 'id'>[];
  ref?: React.Ref<HTMLSelectElement>;
  sortOrder?: SortOrder;
  variant?: keyof typeof variants;
}

export function InputSelect(props: InputSelectProps) {
  const {
    ariaDescribedbyId,
    errorMessage,
    helpMessage,
    id,
    label,
    legendClassName,
    options,
    className,
    required,
    ref,
    sortOrder = 'asc',
    variant = 'default',
    ...restInputProps
  } = props;

  const getSubId = (suffix: string) => `input-${id}-${suffix}`;

  const inputIds = {
    error: getSubId('error'),
    help: getSubId('help'),
    test: getSubId('test'),
    wrapper: getSubId('wrapper'),
    legend: getSubId('legend'),
    label: getSubId('label'),
  };

  const sortedOptions = sortOptions(options, sortOrder, 'children');

  const Container = ariaDescribedbyId ? 'fieldset' : 'div';
  const containerProps = {
    'id': inputIds.wrapper,
    'data-testid': inputIds.wrapper,
    ...(ariaDescribedbyId && { 'aria-describedby': ariaDescribedbyId }),
  };

  const describedBy = [errorMessage ? inputIds.error : '', helpMessage ? inputIds.help : ''].filter(Boolean).join(' ');

  const ariaLabelledBy = ariaDescribedbyId ? inputIds.legend : label ? inputIds.label : undefined; // Fallback if no visible label but you want to provide an accessible name

  return (
    <Container {...containerProps}>
      {ariaDescribedbyId ? (
        <InputLegend id={inputIds.legend} className={cn('mb-2', legendClassName)} required={required}>
          {label}
        </InputLegend>
      ) : (
        label && (
          <InputLabel id={inputIds.label} htmlFor={id} className="mb-2" required={required}>
            {label}
          </InputLabel>
        )
      )}

      {errorMessage && (
        <p className="mb-2">
          <InputError id={inputIds.error}>{errorMessage}</InputError>
        </p>
      )}

      <select
        ref={ref}
        aria-describedby={describedBy || undefined}
        aria-errormessage={errorMessage ? inputIds.error : undefined}
        aria-invalid={!!errorMessage}
        aria-labelledby={ariaLabelledBy}
        aria-required={required}
        className={cn(variants[variant], inputDisabledClassName, errorMessage && inputErrorClassName, className)}
        data-testid={inputIds.test}
        id={id}
        required={required}
        {...restInputProps}
      >
        {sortedOptions.map((optionProps) => (
          <option key={String(optionProps.value)} {...optionProps} />
        ))}
      </select>

      {helpMessage && (
        <InputHelp id={inputIds.help} className="mt-2" data-testid={getSubId('select-help')}>
          {helpMessage}
        </InputHelp>
      )}
    </Container>
  );
}
