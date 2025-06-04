import type { Directorate, LocalizedDirectorate } from '~/.server/domain/models';
import type { DirectorateService } from '~/.server/domain/services/directorate-service';
import esdcDirectorateData from '~/.server/resources/directorate.json';
import { AppError } from '~/errors/app-error';
import { ErrorCodes } from '~/errors/error-codes';

export function getMockDirectorateService(): DirectorateService {
  return {
    getDirectorates: () => Promise.resolve(getDirectorates()),
    getDirectorateById: (id: string) => Promise.resolve(getDirectorateById(id)),
    getLocalizedDirectorates: (language: Language) => Promise.resolve(getLocalizedDirectorates(language)),
    getLocalizedDirectorateById: (id: string, language: Language) => Promise.resolve(getLocalizedDirectorateById(id, language)),
  };
}

/**
 * Retrieves a list of all esdc directorates.
 *
 * @returns An array of esdc directorate objects.
 */
function getDirectorates(): readonly Directorate[] {
  return esdcDirectorateData.content.map((directorate) => ({
    id: directorate.id.toString(),
    nameEn: directorate.nameEn,
    nameFr: directorate.nameFr,
  }));
}

/**
 * Retrieves a single directorate by its ID.
 *
 * @param id The ID of the directorate to retrieve.
 * @returns The directorate object if found.
 * @throws {AppError} If the directorate is not found.
 */
function getDirectorateById(id: string): Directorate {
  const directorate = getDirectorates().find((p) => p.id === id);
  if (!directorate) {
    throw new AppError(`Directorate with ID '${id}' not found.`, ErrorCodes.NO_DIRECTORATE_FOUND);
  }
  return directorate;
}

/**
 * Retrieves a list of directorates localized to the specified language.
 *
 * @param language The language to localize the directorate names to.
 * @returns An array of localized directorate objects.
 */
function getLocalizedDirectorates(language: Language): readonly LocalizedDirectorate[] {
  return getDirectorates()
    .map((directorate) => ({
      id: directorate.id.toString(),
      name: language === 'fr' ? directorate.nameFr : directorate.nameEn,
    }))
    .sort((a, b) => a.name.localeCompare(b.name, language, { sensitivity: 'base' }));
}

/**
 * Retrieves a single localized directorate by its ID.
 *
 * @param id The ID of the directorate to retrieve.
 * @param language The language to localize the directorate name to.
 * @returns The localized directorate object if found.
 * @throws {AppError} If the directorate is not found.
 */
function getLocalizedDirectorateById(id: string, language: Language): LocalizedDirectorate {
  const directorate = getLocalizedDirectorates(language).find((p) => p.id === id);
  if (!directorate) {
    throw new AppError(`Localized directorate with ID '${id}' not found.`, ErrorCodes.NO_DIRECTORATE_FOUND);
  }
  return directorate;
}
