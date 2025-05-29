import type { LocalizedProvince, Province } from '~/.server/domain/models';
import type { ProvinceService } from '~/.server/domain/services/province-service';
import esdcProvincesData from '~/.server/resources/provinces.json';
import { AppError } from '~/errors/app-error';
import { ErrorCodes } from '~/errors/error-codes';

export function getMockProvince(): ProvinceService {
  return {
    getProvinces: () => Promise.resolve(getProvinces()),
    getProvinceById: (id: string) => Promise.resolve(getProvinceById(id)),
    getProvinceByAlphaCode: (alphaCode: string) => Promise.resolve(getProvinceByAlphaCode(alphaCode)),
    getLocalizedProvinces: (language: Language) => Promise.resolve(getLocalizedProvinces(language)),
    getLocalizedProvinceById: (id: string, language: Language) => Promise.resolve(getLocalizedProvinceById(id, language)),
    getLocalizedProvinceByAlphaCode: (alphaCode: string, language: Language) =>
      Promise.resolve(getLocalizedProvinceByAlphaCode(alphaCode, language)),
  };
}

/**
 * Retrieves a list of all provinces.
 *
 * @returns An array of province objects.
 */
function getProvinces(): readonly Province[] {
  return esdcProvincesData.content.map((province) => ({
    id: province.id,
    alphaCode: province.alphaCode,
    nameEn: province.nameEn,
    nameFr: province.nameFr,
  }));
}

/**
 * Retrieves a single province by its ID.
 *
 * @param id The ID of the province to retrieve.
 * @returns The province object if found.
 * @throws {AppError} If the province is not found.
 */
function getProvinceById(id: string): Province {
  const province = getProvinces().find((p) => p.id === id);
  if (!province) {
    throw new AppError(`Province with ID '${id}' not found.`, ErrorCodes.NO_PROVINCE_FOUND);
  }
  return province;
}

/**
 * Retrieves a single province by its alphaCode.
 *
 * @param alphaCode The alphaCode of the province to retrieve (ex. 'ON').
 * @returns The province object if found.
 * @throws {AppError} If the province is not found.
 */
function getProvinceByAlphaCode(alphaCode: string): Province {
  const province = getProvinces().find((p) => p.alphaCode === alphaCode);
  if (!province) {
    throw new AppError(`Province with alphaCode '${alphaCode}' not found.`, ErrorCodes.NO_PROVINCE_FOUND);
  }
  return province;
}

/**
 * Retrieves a list of provinces localized to the specified language.
 *
 * @param language The language to localize the province names to.
 * @returns An array of localized province objects.
 */
function getLocalizedProvinces(language: Language): readonly LocalizedProvince[] {
  return getProvinces()
    .map((province) => ({
      id: province.id,
      alphaCode: province.alphaCode,
      name: language === 'fr' ? province.nameFr : province.nameEn,
    }))
    .sort((a, b) => a.name.localeCompare(b.name, language, { sensitivity: 'base' }));
}

/**
 * Retrieves a single localized province by its ID.
 *
 * @param id The ID of the province to retrieve.
 * @param language The language to localize the province name to.
 * @returns The localized province object if found.
 * @throws {AppError} If the province is not found.
 */
function getLocalizedProvinceById(id: string, language: Language): LocalizedProvince {
  const province = getLocalizedProvinces(language).find((p) => p.id === id);
  if (!province) {
    throw new AppError(`Localized province with ID '${id}' not found.`, ErrorCodes.NO_PROVINCE_FOUND);
  }
  return province;
}

/**
 * Retrieves a single localized province by its alphaCode.
 *
 * @param alphaCode The alphaCode of the province to retrieve (ex. 'ON').
 * @param language The language to localize the province name to.
 * @returns The localized province object if found.
 * @throws {AppError} If the province is not found.
 */
function getLocalizedProvinceByAlphaCode(alphaCode: string, language: Language): LocalizedProvince {
  const province = getLocalizedProvinces(language).find((p) => p.alphaCode === alphaCode);
  if (!province) {
    throw new AppError(`Localized province with alphaCode '${alphaCode}' not found.`, ErrorCodes.NO_PROVINCE_FOUND);
  }
  return province;
}
