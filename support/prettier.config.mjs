/**
 * @type {import('prettier').Config}
 */
export default {
  plugins: ['@trivago/prettier-plugin-sort-imports'],
  importOrder: ['<THIRD_PARTY_MODULES>', '^[\\.]', '^[~]'],
  importOrderSeparation: true,
  printWidth: 128,
  quoteProps: 'consistent',
  semi: true,
  singleQuote: true,
  tabWidth: 2,
};
