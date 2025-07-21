import { Ok, Err } from 'oxide.ts';
import type { Result, Option } from 'oxide.ts';

import type { LocalizedBranch, Branch } from '~/.server/domain/models';
import { apiClient } from '~/.server/domain/services/api-client';
import type { BranchService } from '~/.server/domain/services/branch-service';
import { AppError } from '~/errors/app-error';
import { ErrorCodes } from '~/errors/error-codes';
import { HttpStatusCodes } from '~/errors/http-status-codes';

// Centralized localization logic
function localizeBranch(branch: Branch, language: Language): LocalizedBranch {
  return {
    id: branch.id,
    code: branch.code,
    name: language === 'fr' ? branch.nameFr : branch.nameEn,
  };
}

// Helper to convert API WorkUnit object to Branch
function toBranch(obj: Branch): Branch {
  return {
    id: obj.id.toString(),
    code: obj.code,
    nameEn: obj.nameEn,
    nameFr: obj.nameFr,
  };
}

// Create a single instance of the service (Singleton)
export const branchService: BranchService = {
  /**
   * Retrieves a list of all esdc branches.
   *
   * @returns A promise that resolves to an array of esdc branches objects. The array will be empty if none are found.
   * @throws {AppError} if the API call fails for any reason (e.g., network error, server error).
   */
  async listAll(): Promise<readonly Branch[]> {
    type ApiResponse = {
      content: readonly Branch[];
    };
    const context = 'list all esdc branches';
    const response = await apiClient.get<ApiResponse>('/work-units', context);

    if (response.isErr()) {
      throw response.unwrapErr();
    }

    const data = response.unwrap();
    // Branches: items WITHOUT a parent property
    return data.content.filter((c) => !('parent' in c)).map(toBranch);
  },

  /**
   * Retrieves a single esdc branches by its ID.
   *
   * @param id The ID of the esdc branches to retrieve.
   * @returns A `Result` containing the esdc branches object if found, or an `AppError` if not found.
   * @throws {AppError} if the API call fails for any reason other than a 404 not found.
   */
  async getById(id: string): Promise<Result<Branch, AppError>> {
    const context = `Get ESDC Branches with ID '${id}'`;
    const response = await apiClient.get<Branch>(`/work-units/${id}`, context);

    if (response.isErr()) {
      const apiFetchError = response.unwrapErr();

      if (apiFetchError.httpStatusCode === HttpStatusCodes.NOT_FOUND) {
        return Err(new AppError(`${context} not found.`, ErrorCodes.NO_BRANCH_FOUND));
      }

      // For all other errors (500, parsing, network), just return them as is.
      return Err(apiFetchError);
    }
    return response;
  },

  /**
   * Retrieves a single esdc branches by its CODE.
   *
   * @param code The CODE of the esdc branches to retrieve.
   * @returns A `Result` containing the esdc branches object if found, or an `AppError` if not found.
   * @throws {AppError} if the API call fails for any reason other than a 404 not found.
   */
  async getByCode(code: string): Promise<Result<Branch, AppError>> {
    const context = `ESDC Branches with CODE '${code}'`;
    type ApiResponse = {
      content: readonly Branch[];
    };
    const response = await apiClient.get<ApiResponse>(`/work-units?code=${code}`, context);
    if (response.isErr()) {
      throw response.unwrapErr();
    }
    const data = response.unwrap();
    const branch = data.content[0]; // Get the first element from the response array

    if (!branch) {
      // The request was successful, but no status with that code exists.
      return Err(new AppError(`'${context}' not found.`, ErrorCodes.NO_BRANCH_FOUND));
    }

    return Ok(branch);
  },

  // Localized methods

  /**
   * Retrieves a list of all esdc branches, localized to the specified language.
   *
   * @param language The language for localization.
   * @returns A promise that resolves to an array of localized esdc branche objects.
   * @throws {AppError} if the API call fails for any reason.
   */
  async listAllLocalized(language: Language): Promise<readonly LocalizedBranch[]> {
    const branches = await this.listAll();
    return branches.map((branch) => localizeBranch(branch, language));
  },

  /**
   * Retrieves a single localized esdc branch by its ID.
   *
   * @param id The ID of the esdc branch to retrieve.
   * @param language The language for localization.
   * @returns A `Result` containing the localized esdc branch object if found, or an `AppError` if not found.
   * @throws {AppError} if the API call fails for any reason other than a 404 not found.
   */
  async getLocalizedById(id: string, language: Language): Promise<Result<LocalizedBranch, AppError>> {
    const result = await this.getById(id);
    return result.map((branch) => localizeBranch(branch, language));
  },

  /**
   * Retrieves a single localized esdc branch by its CODE.
   *
   * @param code The CODE of the esdc branch to retrieve.
   * @param language The language for localization.
   * @returns A `Result` containing the localized esdc branch object if found, or an `AppError` if not found.
   * @throws {AppError} if the API call fails for any reason other than a 404 not found.
   */
  async getLocalizedByCode(code: string, language: Language): Promise<Result<LocalizedBranch, AppError>> {
    const result = await this.getByCode(code);
    return result.map((branch) => localizeBranch(branch, language));
  },

  /**
   * Finds a single localized esdc branch by its ID.
   *
   * @param id The ID of the esdc branch to find.
   * @param language The language for localization.
   * @returns An `Option` containing the localized esdc branch object if found, or `None`.
   * @throws {AppError} if the API call fails for any reason other than a 404 not found.
   */
  async findLocalizedById(id: string, language: Language): Promise<Option<LocalizedBranch>> {
    const result = await this.getLocalizedById(id, language);
    return result.ok();
  },

  /**
   * Finds a single localized esdc branch by its CODE.
   *
   * @param code The CODE of the esdc branch to find.
   * @param language The language for localization.
   * @returns An `Option` containing the localized esdc branch object if found, or `None`.
   * @throws {AppError} if the API call fails for any reason other than a 404 not found.
   */
  async findLocalizedByCode(code: string, language: Language): Promise<Option<LocalizedBranch>> {
    const result = await this.getLocalizedByCode(code, language);
    return result.ok();
  },
};
export function getDefaultBranchService(): BranchService {
  return branchService;
}
