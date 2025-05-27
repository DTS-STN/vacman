import { useId, useRef, useState } from 'react';
import type { ChangeEvent, Dispatch, JSX, SetStateAction, KeyboardEvent, RefObject } from 'react';

import { faSearch } from '@fortawesome/free-solid-svg-icons';
import { useTranslation } from 'react-i18next';

import type { InputFieldProps } from '~/components/input-field';
import { InputField } from '~/components/input-field';
import { cn } from '~/utils/tailwind-utils';

interface SearchBarProps extends OmitStrict<InputFieldProps, 'type' | 'icon' | 'label' | 'defaultValue' | 'ref'> {
  onSearch: (search: string, setSuggestions: Dispatch<SetStateAction<string[]>>) => void;
  searchBarClassName?: string;
  suggestionClassName?: string;
  label?: string;
  defaultValue?: string;
  ref?: RefObject<HTMLInputElement | null>;
}

export function SearchBar({
  onSearch,
  searchBarClassName,
  suggestionClassName,
  label,
  defaultValue,
  ref,
  className: baseClassName,
  value: baseValue,
  onChange: baseOnChange,
  onKeyDown: baseOnKeyDown,
  onBlur: baseOnBlur,
  onFocus: baseOnFocus,
  ...searchBarProps
}: SearchBarProps): JSX.Element {
  const { t } = useTranslation(['gcweb']);
  const [search, setSearch] = useState(defaultValue ?? '');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [focused, setFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const searchRef = ref ?? inputRef;
  const containerRef = useRef<HTMLDivElement>(null);
  const suggestionId = useId();
  const showSuggestions = focused && suggestions.length > 0 && search.length > 0;

  const onBlur = () => {
    requestAnimationFrame(() => {
      if (!containerRef.current?.contains(document.activeElement)) {
        setFocused(false);
      }
    });
  };

  const onInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;
    onSearch(input, setSuggestions);
    setSearch(input);
    setFocused(true);
    baseOnChange?.(e);
  };

  const onInputKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    switch (e.key) {
      case 'ArrowDown': {
        document.getElementById(`${suggestionId}0`)?.focus();
        break;
      }
      case 'Escape': {
        e.preventDefault();
        setFocused(false);
        break;
      }
    }
    baseOnKeyDown?.(e);
  };

  const onSuggestion = (suggestion: string) => {
    setSearch(suggestion);
    setFocused(false);
  };

  const onSuggestionKeyDown = (e: KeyboardEvent<HTMLButtonElement>, index: number) => {
    switch (e.key) {
      case 'ArrowDown': {
        document.getElementById(`${suggestionId}${index + 1}`)?.focus();
        break;
      }
      case 'ArrowUp': {
        const suggestionElement = document.getElementById(`${suggestionId}${index - 1}`);
        if (suggestionElement) {
          document.getElementById(`${suggestionId}${index - 1}`)?.focus();
          break;
        }
        searchRef.current?.focus();
        break;
      }
      case 'Escape': {
        setFocused(false);
        break;
      }
    }
  };

  return (
    <div className={cn('relative', baseClassName)} ref={containerRef}>
      <InputField
        ref={searchRef}
        label={label ?? t('gcweb:search-bar.search')}
        type="search"
        className={cn('w-full rounded-lg', searchBarClassName)}
        value={baseValue ?? search}
        onChange={onInputChange}
        onKeyDown={onInputKeyDown}
        onBlur={(e) => {
          onBlur();
          baseOnBlur?.(e);
        }}
        onFocus={(e) => {
          setFocused(true);
          baseOnFocus?.(e);
        }}
        icon={faSearch}
        {...searchBarProps}
      />
      {showSuggestions && (
        <div className="absolute z-10 mt-1 w-full overflow-hidden rounded-sm border border-stone-300 bg-white shadow-2xl">
          <ul>
            {suggestions.map((value, index) => (
              <li key={value}>
                <button
                  id={`${suggestionId}${index}`}
                  tabIndex={-1}
                  type="button"
                  className={cn(
                    'inline-flex w-full border-none px-4 py-2 hover:bg-neutral-500 hover:text-white focus:bg-gray-600 focus:text-white focus:outline-none',
                    suggestionClassName,
                  )}
                  onClick={() => onSuggestion(value)}
                  onKeyDown={(e) => onSuggestionKeyDown(e, index)}
                  onBlur={onBlur}
                >
                  {value}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
