import { useState, useRef, useEffect } from 'react';
import type { ComponentProps, ReactNode } from 'react';

import { faChevronDown, faChevronUp } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useTranslation } from 'react-i18next';

import { InputCheckbox } from '~/components/input-checkbox';
import { InputError } from '~/components/input-error';
import { InputHelp } from '~/components/input-help';
import { InputLegend } from '~/components/input-legend';
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
    placeholder = 'Select options...',
    name,
    ...restDivProps
  } = props;

  const { t } = useTranslation(['gcweb']);
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const inputErrorId = `input-${id}-error`;
  const inputHelpMessageId = `input-${id}-help`;
  const inputLegendId = `input-${id}-legend`;
  const inputWrapperId = `input-${id}`;
  const dropdownId = `${id}-dropdown`;

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const handleOptionClick = (optionValue: string) => {
    const newSelectedValues = value.includes(optionValue) ? value.filter((v) => v !== optionValue) : [...value, optionValue];
    onChange(newSelectedValues);
  };

  const handleOptionKeyDown = (e: React.KeyboardEvent, optionValue: string) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleOptionClick(optionValue);
    }
  };

  const getDisplayValue = () => {
    if (value.length === 0) {
      return <span className="text-gray-500">{placeholder}</span>;
    }
    if (value.length === 1) {
      const selectedOption = options.find((opt) => opt.value === value[0]);
      return selectedOption?.label ?? placeholder;
    }
    return t('gcweb:input.input-items-selected', { count: value.length });
  };

  const ariaDescribedbyIds =
    [
      !!helpMessage && inputHelpMessageId, //
      !!ariaDescribedbyId && ariaDescribedbyId,
    ]
      .filter(Boolean)
      .join(' ') || undefined;

  return (
    <div className="relative" ref={wrapperRef} {...restDivProps}>
      <fieldset id={inputWrapperId} aria-describedby={ariaDescribedbyId}>
        <InputLegend id={inputLegendId} required={required} className="mb-2">
          {legend}
        </InputLegend>
        {errorMessage && (
          <p className="mb-2">
            <InputError id={inputErrorId}>{errorMessage}</InputError>
          </p>
        )}
        {value.map((val) => (
          <input type="hidden" name={name} key={val} value={val} />
        ))}
        {helpMessage && (
          <InputHelp id={inputHelpMessageId} className="mt-2 mb-2">
            {helpMessage}
          </InputHelp>
        )}

        <div
          id={id}
          role="combobox"
          tabIndex={disabled ? -1 : 0}
          aria-required={required ? true : undefined}
          aria-disabled={disabled}
          aria-haspopup="listbox"
          aria-expanded={isOpen}
          aria-controls={dropdownId}
          aria-invalid={!!errorMessage}
          aria-errormessage={errorMessage ? inputErrorId : undefined}
          aria-labelledby={inputLegendId}
          aria-describedby={ariaDescribedbyIds}
          onClick={disabled ? undefined : () => setIsOpen(!isOpen)}
          onKeyDown={
            disabled
              ? undefined
              : (e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault(); // Prevent space from scrolling
                    setIsOpen(!isOpen);
                  }
                }
          }
          className={cn(
            triggerBaseClassName,
            disabled && triggerDisabledClassName,
            errorMessage && triggerErrorClassName,
            className,
          )}
        >
          <span className="block truncate">{getDisplayValue()}</span>
          <span className="pointer-events-none inset-y-0 right-0 flex items-center pr-2">
            {isOpen ? (
              <FontAwesomeIcon icon={faChevronUp} className="my-auto size-3 text-gray-400" />
            ) : (
              <FontAwesomeIcon icon={faChevronDown} className="my-auto size-3 text-gray-400" />
            )}
          </span>
        </div>
        {isOpen && (
          <div id={dropdownId} role="listbox" aria-multiselectable="true" className={dropdownClassName}>
            {options.map((optionProps, index) => {
              const isSelected = value.includes(optionProps.value);
              const optionId = `${id}-multiselect-option-${index}`;

              return (
                <div
                  key={optionProps.value}
                  id={optionId}
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => handleOptionClick(optionProps.value)}
                  tabIndex={0}
                  onKeyDown={(e) => handleOptionKeyDown(e, optionProps.value)}
                  className="relative cursor-pointer p-2 text-gray-900 select-none hover:bg-gray-100 focus:bg-gray-100 focus:outline-none"
                >
                  <InputCheckbox
                    id={`${optionId}-checkbox`}
                    name={`${name}-${optionProps.value}`}
                    checked={isSelected}
                    readOnly={true}
                    required={required}
                    hasError={!!errorMessage}
                    tabIndex={-1}
                    className="pointer-events-none"
                    {...optionProps}
                  >
                    {optionProps.label}
                  </InputCheckbox>
                </div>
              );
            })}
          </div>
        )}
      </fieldset>
    </div>
  );
}
