import { useState, useRef, useEffect } from 'react';
import type { ComponentProps, KeyboardEvent as ReactKeyboardEvent, ReactNode } from 'react';

import { faChevronDown, faChevronUp } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useTranslation } from 'react-i18next';

import { InputCheckbox } from '~/components/input-checkbox';
import { InputError } from '~/components/input-error';
import { InputHelp } from '~/components/input-help';
import { InputLegend } from '~/components/input-legend';
import type { SortOrder } from '~/utils/sort-utils';
import { sortOptions } from '~/utils/sort-utils';
import { cn } from '~/utils/tailwind-utils';

const triggerBaseClassName =
  'relative flex w-full cursor-pointer items-center justify-between rounded-lg border border-gray-500 bg-white px-3 py-2 text-left focus:border-blue-500 focus:outline-none focus:ring focus:ring-blue-500';
const triggerDisabledClassName =
  'disabled:bg-gray-100 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-70';
const triggerErrorClassName = 'border-red-500 focus:border-red-500 focus:ring-red-500';
const dropdownClassName =
  'absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none';

export interface MultiSelectOption
  extends OmitStrict<
    ComponentProps<typeof InputCheckbox>,
    'aria-describedby' | 'aria-errormessage' | 'aria-invalid' | 'aria-required' | 'id' | 'name' | 'required'
  > {
  label: ReactNode;
  value: string;
}

export interface InputMultiSelectProps extends OmitStrict<ComponentProps<'div'>, 'id' | 'onChange'> {
  ariaDescribedbyId?: string;
  value: string[];
  onChange: (selectedValues: string[]) => void;
  options: MultiSelectOption[];
  id: string;
  legend: string;
  name: string;
  errorMessage?: string;
  helpMessage?: ReactNode;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  sortOrder?: SortOrder;
}

export function InputMultiSelect(props: InputMultiSelectProps) {
  const {
    ariaDescribedbyId,
    errorMessage,
    helpMessage,
    id,
    legend,
    options,
    className,
    required,
    value,
    onChange,
    disabled,
    placeholder,
    name,
    sortOrder = 'asc',
    ...restDivProps
  } = props;

  const { t } = useTranslation(['gcweb']);
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const sortedOptions = sortOptions(options, sortOrder, 'label');

  const errorId = `${id}-error`;
  const helpId = `${id}-help`;
  const legendId = `${id}-legend`;
  const dropdownId = `${id}-dropdown`;

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsOpen(false);
        triggerRef.current?.focus();
      }
    }
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSelectOption = (optionValue: string) => {
    const newSelectedValues = value.includes(optionValue) ? value.filter((v) => v !== optionValue) : [...value, optionValue];
    onChange(newSelectedValues);
  };

  const getDisplayValue = () => {
    if (value.length === 0) {
      return <span className="text-gray-500">{placeholder}</span>;
    }
    if (value.length === 1) {
      const selectedOption = sortedOptions.find((opt) => opt.value === value[0]);
      return selectedOption?.label ?? placeholder;
    }
    return t('gcweb:input.input-items-selected', { count: value.length });
  };

  const describedBy = [helpMessage && helpId, ariaDescribedbyId].filter(Boolean).join(' ') || undefined;

  return (
    <div className={cn('relative', className)} ref={wrapperRef} {...restDivProps}>
      <fieldset>
        <InputLegend id={legendId} required={required} className="mb-2">
          {legend}
        </InputLegend>

        {errorMessage && (
          <p className="mb-2">
            <InputError id={errorId}>{errorMessage}</InputError>
          </p>
        )}
        {helpMessage && (
          <InputHelp id={helpId} className="mb-2">
            {helpMessage}
          </InputHelp>
        )}

        {value.map((selectedValue) => (
          <input key={selectedValue} type="hidden" name={name} value={selectedValue} />
        ))}

        <div
          id={id}
          role="application"
          aria-errormessage={errorMessage ? errorId : undefined}
          aria-invalid={!!errorMessage}
          aria-describedby={describedBy}
          aria-label={legend}
        >
          <button
            ref={triggerRef}
            id={id}
            type="button"
            disabled={disabled}
            aria-haspopup="true"
            aria-expanded={isOpen}
            aria-controls={dropdownId}
            aria-describedby={describedBy}
            onClick={() => setIsOpen(!isOpen)}
            className={cn(triggerBaseClassName, disabled && triggerDisabledClassName, errorMessage && triggerErrorClassName)}
          >
            <span className="block truncate">{getDisplayValue()}</span>
            <span className="pointer-events-none flex items-center">
              <FontAwesomeIcon
                icon={isOpen ? faChevronUp : faChevronDown}
                className="my-auto size-3 text-gray-400"
                aria-hidden="true"
              />
            </span>
          </button>

          {isOpen && (
            <div id={dropdownId} className={dropdownClassName}>
              {sortedOptions.map((option, index) => {
                const optionId = `${id}-option-${index}`;
                const isChecked = value.includes(option.value);

                return (
                  <div key={option.value} className="relative p-2 hover:bg-gray-100">
                    <InputCheckbox
                      id={optionId}
                      name={`${name}-${option.value}`}
                      checked={isChecked}
                      onChange={() => handleSelectOption(option.value)}
                      onKeyDown={(e: ReactKeyboardEvent<HTMLInputElement>) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleSelectOption(option.value);
                        }
                      }}
                      hasError={!!errorMessage}
                      {...option}
                    >
                      {option.label}
                    </InputCheckbox>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </fieldset>
    </div>
  );
}
