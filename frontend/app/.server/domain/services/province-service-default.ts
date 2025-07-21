import type { LocalizedProvince, Province } from '~/.server/domain/models';
import { apiClient } from '~/.server/domain/services/api-client';
import type { ProvinceService } from '~/.server/domain/services/province-service';

// Centralized localization logic
function localizeProvince(province: Province, language: Language): LocalizedProvince {
  return {
    id: province.id,
    code: province.code,
    name: language === 'fr' ? province.nameFr : province.nameEn,
  };
}

// Create a single instance of the service (Singleton)
export const provinceService: ProvinceService = {
  /**
   * Retrieves a list of all provinces.
   *
   * @returns A promise that resolves to an array of province objects. The array will be empty if none are found.
   * @throws {AppError} if the API call fails for any reason (e.g., network error, server error).
   */
  async listAll(): Promise<readonly Province[]> {
    type ApiResponse = {
      content: readonly Province[];
    };
    const context = 'list all provinces';
    const response = await apiClient.get<ApiResponse>('/provinces', context);

    if (response.isErr()) {
      throw response.unwrapErr();
    }

    const data = response.unwrap();
    return data.content;
  },

  // Localized methods

  /**
   * Retrieves a list of all provinces, localized to the specified language.
   *
   * @param language The language for localization.
   * @returns A promise that resolves to an array of localized province objects.
   * @throws {AppError} if the API call fails for any reason.
   */
  async listAllLocalized(language: Language): Promise<readonly LocalizedProvince[]> {
    const provinces = await this.listAll();
    return provinces.map((province) => localizeProvince(province, language));
  },
};

export function getDefaultProvinceService(): ProvinceService {
  return provinceService;
}
