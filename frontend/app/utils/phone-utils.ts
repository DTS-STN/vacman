import { isValidPhoneNumber } from 'libphonenumber-js';

/**
 * Validates phone number based on the following conditions:
 * - Validates Canadian phone number if digit length is less than or equal to 11
 * - Validates international phone number if digit length is greater than 11
 *
 * Format phone number to international format if valid
 *
 * @param phoneNumber - The phone string to be validated.
 * @returns `true` if the string is a valid phone number, `false` otherwise.
 */
export function isValidPhone(phoneNumber: string): boolean {
  if (!phoneNumber) return false;
  const phoneDigits = extractDigits(phoneNumber);

  // Determine validation type based on digit length
  const requiresCanadianValidation = phoneDigits.length <= 11;

  // Validate based on number format
  const isValid = requiresCanadianValidation //
    ? isValidPhoneNumber(phoneNumber, 'CA')
    : isValidPhoneNumber(phoneNumber);

  // Return early if valid
  return isValid;
}

/**
 * Extracts only digits from a string by removing all non-digit characters
 * @param input - The input string to process
 * @returns A string containing only digits (0-9)
 * @example
 * extractDigits("123-456-7890") // returns "1234567890"
 */
export function extractDigits(input: string) {
  return input.match(/\d/g)?.join('') ?? '';
}
