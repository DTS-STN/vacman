import { isValidPhoneNumber, parsePhoneNumberFromString } from 'libphonenumber-js';
import type { CountryCode } from 'libphonenumber-js';

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

/**
 * Converts a phone number string to the E.164 international format.
 *
 * @param phoneNumber The phone number string to convert (e.g., "613-938-0001").
 * @param defaultCountry The ISO 3166-1 alpha-2 country code to use as a hint if the number is not in international format (e.g., 'CA', 'US').
 * @returns The phone number in E.164 format (e.g., "+16139380001") if valid, otherwise undefined.
 */
export function toE164(phoneNumber: string | undefined | null, defaultCountry?: CountryCode): string | undefined {
  if (!phoneNumber) {
    return undefined;
  }

  // parsePhoneNumberFromString is more lenient than parsePhoneNumber
  const phone = parsePhoneNumberFromString(phoneNumber, defaultCountry ?? 'CA');

  // If the phone number is valid, return it in E.164 format. Otherwise, it returns undefined.
  return phone?.format('E.164');
}
