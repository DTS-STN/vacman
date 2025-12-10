import type { LookupModel, LocalizedLookupModel } from '~/.server/domain/models';

/**
 * Checks if a lookup model item is expired based on its expiryDate.
 * Note: This only works with LookupModel types that have expiryDate.
 * LocalizedLookupModel types don't include expiryDate, so they will always return false.
 * @param item - The lookup model item to check
 * @returns true if the item has an expiryDate in the past, false otherwise
 */
export function isLookupExpired(item: LookupModel | LocalizedLookupModel | null | undefined): boolean {
  if (!item) {
    return false;
  }

  // LocalizedLookupModel doesn't have expiryDate, so we can't check expiry
  // This is a type guard to check if the item has expiryDate property
  if (!('expiryDate' in item) || !item.expiryDate) {
    return false;
  }

  const expiryDate = new Date(item.expiryDate);
  const now = new Date();

  return expiryDate <= now;
}

/**
 * Filters out expired items from a lookup model array.
 * @param items - Array of lookup model items
 * @returns Array with only non-expired items
 */
export function filterExpiredLookups<T extends LookupModel>(items: T[]): T[] {
  return items.filter((item) => !isLookupExpired(item));
}

/**
 * Interface for input select options with expired status
 */
export interface ExpiredAwareSelectOption {
  value: string;
  children: string;
  isExpired?: boolean;
}

/**
 * Configuration for building select options with expired item handling
 */
export interface BuildExpiredAwareOptionsConfig<T extends LocalizedLookupModel> {
  /** Array of active localized lookup items (from API with includeInactive=false) */
  activeItems: readonly T[];
  /** The currently selected item from form values (may be expired) */
  selectedItem?: { id: number; nameEn: string; nameFr: string; code?: string; expiryDate?: string | null } | null;
  /** Current language for localization */
  language: Language;
  /** Translation for the "Select option" placeholder */
  selectOptionLabel: string;
}

/**
 * Builds select options with expired item handling for dropdowns.
 *
 * This utility handles the common pattern where:
 * 1. Active items are fetched from API (includeInactive=false)
 * 2. If a saved value is expired, it's manually added to the dropdown
 * 3. Expired items are marked with isExpired flag for visual styling
 *
 * @param config - Configuration object with active items, selected item, language, and labels
 * @returns Array of select options ready for InputSelect component
 *
 * @example
 * const options = buildExpiredAwareSelectOptions({
 *   activeItems: classifications,
 *   selectedItem: formValues?.classification,
 *   language: currentLanguage,
 *   selectOptionLabel: t('form.select-option'),
 * });
 */
export function buildExpiredAwareSelectOptions<T extends LocalizedLookupModel>(
  config: BuildExpiredAwareOptionsConfig<T>,
): ExpiredAwareSelectOption[] {
  const { activeItems, selectedItem, language, selectOptionLabel } = config;

  const selectOption = { id: 'select-option' as const, name: '' };

  // Check if the currently selected item exists in the active items list
  const selectedItemExists = selectedItem ? activeItems.some((item) => item.id === selectedItem.id) : false;

  // Build options array working directly with the base LocalizedLookupModel type to avoid unsafe type assertions
  type OptionItem = LocalizedLookupModel | typeof selectOption;
  const optionsToMap: OptionItem[] = [selectOption];

  // If selected item is not in the list, add it as an expired option
  if (selectedItem && !selectedItemExists) {
    const expiredItem: LocalizedLookupModel = {
      id: selectedItem.id,
      name: language === 'en' ? selectedItem.nameEn : selectedItem.nameFr,
      code: selectedItem.code ?? '',
      expiryDate: selectedItem.expiryDate ?? undefined,
    };
    optionsToMap.push(expiredItem);
  }

  // Add all active items (they satisfy LocalizedLookupModel constraint)
  for (const item of activeItems) {
    optionsToMap.push(item);
  }

  // Map to select options with expired flag
  return optionsToMap.map((item) => {
    if (item.id === 'select-option') {
      return {
        value: '',
        children: selectOptionLabel,
      };
    }

    const lookupItem = item as LocalizedLookupModel;
    const isExpired = isLookupExpired(lookupItem);

    return {
      value: String(lookupItem.id),
      children: lookupItem.name,
      isExpired: isExpired,
    };
  });
}
