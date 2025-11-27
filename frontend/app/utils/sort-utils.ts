/**
 * Sort order types for sortable components
 */
export type SortOrder = 'asc' | 'desc' | 'none';

/**
 * Sorts an array of options alphabetically while keeping placeholder options (empty values) at the beginning.
 *
 * @param options - Array of options to sort
 * @param sortOrder - Sort order: 'asc' for ascending, 'desc' for descending, 'none' for no sorting
 * @param labelKey - The key to use for sorting (defaults to 'children' for InputSelect, 'label' for InputMultiSelect)
 * @returns Sorted array with placeholders first, followed by sorted options
 *
 * @example
 * ```ts
 * const options = [
 *   { value: '', children: 'Select...' },
 *   { value: '2', children: 'Zebra' },
 *   { value: '1', children: 'Apple' }
 * ];
 * const sorted = sortOptions(options, 'asc', 'children');
 * // Result: [
 * //   { value: '', children: 'Select...' },
 * //   { value: '1', children: 'Apple' },
 * //   { value: '2', children: 'Zebra' }
 * // ]
 * ```
 */
export function sortOptions<T extends { value?: string | number | readonly string[] | undefined }>(
  options: T[],
  sortOrder: SortOrder,
  labelKey: keyof T,
): T[] {
  if (sortOrder === 'none') {
    return options;
  }

  // Separate empty value options (placeholders) from the rest
  const placeholderOptions = options.filter((opt) => !opt.value || opt.value === '');
  const regularOptions = options.filter((opt) => opt.value && opt.value !== '');

  // Sort only the regular options (create a copy to avoid mutating the filtered array)
  const sorted = [...regularOptions].sort((a, b) => {
    const textA = String(a[labelKey] ?? a.value ?? '').toLowerCase();
    const textB = String(b[labelKey] ?? b.value ?? '').toLowerCase();
    return sortOrder === 'asc' ? textA.localeCompare(textB) : textB.localeCompare(textA);
  });

  // Return placeholders first, then sorted options
  return [...placeholderOptions, ...sorted];
}
