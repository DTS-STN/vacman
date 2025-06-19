import type { Result, Option } from 'oxide.ts';
import { Err, None, Ok, Some } from 'oxide.ts';

import type { Directorate, LocalizedDirectorate } from '~/.server/domain/models';
import type { DirectorateService } from '~/.server/domain/services/directorate-service';
import workUnitData from '~/.server/resources/workUnit.json';
import { AppError } from '~/errors/app-error';
import { ErrorCodes } from '~/errors/error-codes';

export function getMockDirectorateService(): DirectorateService {
  return {
    getAll: () => Promise.resolve(getAll()),
    getById: (id: string) => Promise.resolve(getById(id)),
    findById: (id: string) => Promise.resolve(findById(id)),
    getByCode: (code: string) => Promise.resolve(getByCode(code)),
    findByCode: (code: string) => Promise.resolve(findByCode(code)),
    getAllByBranchId: (branchId: string) => Promise.resolve(getAllByBranchId(branchId)),
    getAllByBranchCode: (branchCode: string) => Promise.resolve(getAllByBranchCode(branchCode)),
    getAllLocalized: (language: Language) => Promise.resolve(getAllLocalized(language)),
    getLocalizedById: (id: string, language: Language) => Promise.resolve(getLocalizedById(id, language)),
    findLocalizedById: (id: string, language: Language) => Promise.resolve(findLocalizedById(id, language)),
    getLocalizedByCode: (code: string, language: Language) => Promise.resolve(getLocalizedByCode(code, language)),
    findLocalizedByCode: (code: string, language: Language) => Promise.resolve(findLocalizedByCode(code, language)),
  };
}

/**
 * Retrieves a list of all esdc directorates.
 *
 * @returns An array of esdc directorate objects.
 */
function getAll(): Result<readonly Directorate[], AppError> {
  const directorates: Directorate[] = workUnitData.content
    .filter((c) => c.parent !== null)
    .map((directorate) => ({
      id: directorate.id.toString(),
      code: directorate.code,
      nameEn: directorate.nameEn,
      nameFr: directorate.nameFr,
      parent: {
        id: directorate.parent.id.toString(),
        code: directorate.parent.code,
        nameEn: directorate.parent.nameEn,
        nameFr: directorate.parent.nameFr,
      },
    }));

  return Ok(directorates);
}

/**
 * Retrieves a single directorate by its ID.
 *
 * @param id The ID of the directorate to retrieve.
 * @returns The directorate object if found or {AppError} If the directorate is not found.
 */
function getById(id: string): Result<Directorate, AppError> {
  const result = getAll();

  if (result.isErr()) {
    return result;
  }

  const directorates = result.unwrap();
  const directorate = directorates.find((p) => p.id === id);

  return directorate
    ? Ok(directorate)
    : Err(new AppError(`Directorate with ID '${id}' not found.`, ErrorCodes.NO_DIRECTORATE_FOUND));
}

/**
 * Retrieves a single directorate by its ID.
 *
 * @param id The ID of the directorate to retrieve.
 * @returns The directorate object if found or undefined if not found.
 */
function findById(id: string): Option<Directorate> {
  const result = getAll();

  if (result.isErr()) {
    return None;
  }
  const directorates = result.unwrap();
  const directorate = directorates.find((p) => p.id === id);

  return directorate ? Some(directorate) : None;
}

/**
 * Retrieves a single directorate by its CODE.
 *
 * @param code The CODE of the directorate to retrieve.
 * @returns The directorate object if found or {AppError} If the directorate is not found.
 */
function getByCode(code: string): Result<Directorate, AppError> {
  const result = getAll();

  if (result.isErr()) {
    return result;
  }

  const directorates = result.unwrap();
  const directorate = directorates.find((p) => p.code === code);

  return directorate
    ? Ok(directorate)
    : Err(new AppError(`Directorate with ID '${code}' not found.`, ErrorCodes.NO_DIRECTORATE_FOUND));
}

/**
 * Retrieves a list of all directorates by branch ID.
 *
 * @param branchId The ID of the branch to retrieve directorates.
 * @returns An array of directorates objects.
 */
function getAllByBranchId(branchId: string): Result<readonly Directorate[], AppError> {
  const result = getAll();

  if (result.isErr()) {
    return result;
  }

  const allDirectorates = result.unwrap();

  const directorates = allDirectorates
    .filter((c) => c.parent.id === branchId)
    .map((directorate) => ({
      id: directorate.id.toString(),
      code: directorate.code,
      nameEn: directorate.nameEn,
      nameFr: directorate.nameFr,
      parent: {
        id: directorate.parent.id.toString(),
        code: directorate.parent.code,
        nameEn: directorate.parent.nameEn,
        nameFr: directorate.parent.nameFr,
      },
    }));

  return Ok(directorates);
}

/**
 * Retrieves a list of all directorates by branch ID.
 *
 * @param branchId The ID of the branch to retrieve directorates.
 * @returns An array of directorates objects.
 */
function getAllByBranchCode(branchCode: string): Result<readonly Directorate[], AppError> {
  const result = getAll();

  if (result.isErr()) {
    return result;
  }

  const allDirectorates = result.unwrap();

  const directorates = allDirectorates
    .filter((c) => c.parent.code === branchCode)
    .map((directorate) => ({
      id: directorate.id.toString(),
      code: directorate.code,
      nameEn: directorate.nameEn,
      nameFr: directorate.nameFr,
      parent: {
        id: directorate.parent.id.toString(),
        code: directorate.parent.code,
        nameEn: directorate.parent.nameEn,
        nameFr: directorate.parent.nameFr,
      },
    }));

  return Ok(directorates);
}

/**
 * Retrieves a single directorate by its CODE.
 *
 * @param code The CODE of the directorate to retrieve.
 * @returns The directorate object if found or undefined if not found.
 */
function findByCode(code: string): Option<Directorate> {
  const result = getAll();

  if (result.isErr()) {
    return None;
  }
  const directorates = result.unwrap();
  const directorate = directorates.find((p) => p.code === code);

  return directorate ? Some(directorate) : None;
}

/**
 * Retrieves a list of directorates localized to the specified language.
 *
 * @param language The language to localize the directorate names to.
 * @returns An array of localized directorate objects.
 */
function getAllLocalized(language: Language): Result<readonly LocalizedDirectorate[], AppError> {
  return getAll().map((directorates) =>
    directorates.map((directorate) => ({
      id: directorate.id,
      code: directorate.code,
      name: language === 'fr' ? directorate.nameFr : directorate.nameEn,
      parent: {
        id: directorate.parent.id.toString(),
        code: directorate.parent.code,
        name: language === 'fr' ? directorate.parent.nameFr : directorate.parent.nameEn,
      },
    })),
  );
}

/**
 * Retrieves a single localized directorate by its ID.
 *
 * @param id The ID of the directorate to retrieve.
 * @param language The language to localize the directorate name to.
 * @returns The localized directorate object if found or {AppError} If the directorate is not found.
 */
function getLocalizedById(id: string, language: Language): Result<LocalizedDirectorate, AppError> {
  return getAllLocalized(language).andThen((directorates) => {
    const directorate = directorates.find((c) => c.id === id);

    return directorate
      ? Ok(directorate)
      : Err(new AppError(`Localized directorate with ID '${id}' not found.`, ErrorCodes.NO_DIRECTORATE_FOUND));
  });
}

/**
 * Retrieves a single localized directorate by its ID.
 *
 * @param id The ID of the directorate to retrieve.
 * @param language The language to localize the directorate name to.
 * @returns The localized directorate object if found or undefined If the directorate is not found.
 */
function findLocalizedById(id: string, language: Language): Option<LocalizedDirectorate> {
  const result = getAllLocalized(language);

  if (result.isErr()) {
    return None;
  }
  const directorates = result.unwrap();
  const directorate = directorates.find((p) => p.id === id);

  return directorate ? Some(directorate) : None;
}

/**
 * Retrieves a single localized directorate by its code.
 *
 * @param code The code of the directorate to retrieve.
 * @param language The language to localize the directorate name to.
 * @returns The localized directorate object if found or {AppError} If the directorate is not found.
 */
function getLocalizedByCode(code: string, language: Language): Result<LocalizedDirectorate, AppError> {
  return getAllLocalized(language).andThen((directorates) => {
    const directorate = directorates.find((c) => c.code === code);

    return directorate
      ? Ok(directorate)
      : Err(new AppError(`Localized Directorate with code '${code}' not found.`, ErrorCodes.NO_DIRECTORATE_FOUND));
  });
}

/**
 * Retrieves a single localized directorate by its code.
 *
 * @param code The code of the directorate to retrieve.
 * @param language The language to localize the directorate name to.
 * @returns The localized directorate object if found or undefined If the directorate is not found.
 */
function findLocalizedByCode(code: string, language: Language): Option<LocalizedDirectorate> {
  const result = getAllLocalized(language);

  if (result.isErr()) {
    return None;
  }
  const directorates = result.unwrap();
  const directorate = directorates.find((c) => c.code === code);

  return directorate ? Some(directorate) : None;
}
