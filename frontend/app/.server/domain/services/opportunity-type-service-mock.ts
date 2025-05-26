import type { LocalizedOpportunityType, OpportunityType } from '~/.server/domain/models';
import employmentOpportunityTypes from '~/.server/resources/employmentOpportunityTypes.json';
import { AppError } from '~/errors/app-error';
import { ErrorCodes } from '~/errors/error-codes';

/**
 * Retrieves all employment opportunity types.
 *
 * @returns An array of all opportunity types.
 */
export function getOpportunityTypes(): readonly OpportunityType[] {
  return employmentOpportunityTypes.content.map((opportunityType) => ({
    id: opportunityType.id.toString(),
    nameEn: opportunityType.nameEn,
    nameFr: opportunityType.nameFr,
  }));
}

/**
 * Retrieves a single employment opportunity type by its ID.
 *
 * @param id The ID of the opportunity type to retrieve.
 * @returns The opportunity type object if found.
 * @throws {AppError} If the opportunity type is not found.
 */
export function getOpportunityTypeById(id: string): OpportunityType | undefined {
  const opportunityType = getOpportunityTypes().find((type) => type.id === id);
  if (!opportunityType) {
    throw new AppError(`Opportunity type with ID '${id}' not found.`, ErrorCodes.NO_EMPLOYMENT_OPPORTUNITY_TYPE_FOUND);
  }
  return opportunityType;
}

/**
 * Retrieves all employment opportunity types in the specified language.
 *
 * @param language The language to localize the opportunity name to.
 * @returns An array of localized opportunity types, with names in the specified language.
 */
export function getLocalizedOpportunityTypes(language: Language): readonly LocalizedOpportunityType[] {
  return getOpportunityTypes().map((opportunityType) => ({
    id: opportunityType.id,
    name: language === 'fr' ? opportunityType.nameFr : opportunityType.nameEn,
  }));
}

/**
 * Retrieves a single localized employment opportunity type by its ID.
 *
 * @param id The ID of the opportunity type to retrieve.
 * @param language The language to localize the opportunity type name to
 * @returns The localized opportunity type object if found.
 * @throws {AppError} If the opportunity type is not found.
 */
export function getLocalizedOpportunityTypeById(id: string, language: Language): LocalizedOpportunityType {
  const opportunityType = getLocalizedOpportunityTypes(language).find((type) => type.id === id);
  if (!opportunityType) {
    throw new AppError(`Opportunity type with ID '${id}' not found.`, ErrorCodes.NO_EMPLOYMENT_OPPORTUNITY_TYPE_FOUND);
  }
  return opportunityType;
}
