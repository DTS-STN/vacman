import type { LocalizedProvince, Province } from '~/.server/domain/models';
import type { ProvinceService } from '~/.server/domain/services/province-service';
import esdcProvincesData from '~/.server/resources/provinces.json';

export function getMockProvinceService(): ProvinceService {
  return {
    listAll: () => Promise.resolve(listAll()),
    listAllLocalized: (language: Language) => Promise.resolve(listAllLocalized(language)),
  };
}

/**
 * Retrieves a list of all provinces.
 *
 * @returns A promise that resolves to an array of province objects. The array will be empty if none are found.
 * @throws {AppError} if the API call fails for any reason (e.g., network error, server error).
 */
function listAll(): Province[] {
  const provinces: Province[] = esdcProvincesData.content.map((province) => ({
    id: province.id.toString(),
    code: province.alphaCode,
    nameEn: province.nameEn,
    nameFr: province.nameFr,
  }));
  return provinces;
}

/**
 * Retrieves a list of all provinces, localized to the specified language.
 *
 * @param language The language for localization.
 * @returns A promise that resolves to an array of localized province objects.
 * @throws {AppError} if the API call fails for any reason.
 */
function listAllLocalized(language: Language): LocalizedProvince[] {
  return listAll().map((province) => ({
    id: province.id,
    code: province.code,
    name: language === 'fr' ? province.nameFr : province.nameEn,
  }));
}
