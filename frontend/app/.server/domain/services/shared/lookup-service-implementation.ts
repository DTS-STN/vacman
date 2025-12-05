import type { Result, Option } from 'oxide.ts';
import { Err, Ok } from 'oxide.ts';

import type { LookupModel, LocalizedLookupModel } from '~/.server/domain/models';
import { apiClient } from '~/.server/domain/services/api-client';
import { AppError } from '~/errors/app-error';
import type { ErrorCode } from '~/errors/error-codes';
import { getQueryClient } from '~/query-client';

/**
 * Configuration for lookup service implementation
 */
export interface LookupServiceConfig<T extends LookupModel, L extends LocalizedLookupModel> {
  /** Base API endpoint (e.g., '/codes/classifications') */
  apiEndpoint: string;
  /** Context description for error messages (e.g., 'classification') */
  entityName: string;
  /** Error code to use when entity is not found */
  notFoundErrorCode: ErrorCode;
  /** Function to localize an entity */
  localizeEntity: (entity: T, language: Language) => L;
}

/**
 * Shared implementation for lookup services
 */
export class LookupServiceImplementation<T extends LookupModel, L extends LocalizedLookupModel> {
  private config: LookupServiceConfig<T, L>;

  constructor(config: LookupServiceConfig<T, L>) {
    this.config = config;
  }

  /**
   * Retrieves a list of all entities.
   * It returns a Result to handle fetch errors without throwing.
   *
   * @param includeInactive - Optional parameter to include inactive/expired entities.
   *   - When `true`: Appends `?includeInactive=true` to the API endpoint to fetch both active and expired entities.
   *   - When `false` or `undefined` (default): Uses the base endpoint without query parameters, returning only active entities.
   *
   * Usage:
   * - Loaders (dropdowns): Don't pass parameter → returns only active entities
   * - Validation: Pass `true` → returns active + expired entities to validate saved expired values
   */
  private async getAll(includeInactive?: boolean): Promise<Result<readonly (T | null | undefined)[], AppError>> {
    let endpoint = this.config.apiEndpoint;

    if (includeInactive) {
      // Use URL to properly handle query parameters
      const url = new URL(endpoint, 'http://dummy.base'); // Use dummy base for relative URLs
      url.searchParams.set('includeInactive', 'true');
      endpoint = url.pathname + url.search;
    }

    const queryKey = ['lookup', endpoint];

    const queryFn = async (): Promise<readonly (T | null | undefined)[]> => {
      type ApiResponse = {
        content: readonly (T | null | undefined)[];
      };
      const context = `list all ${this.config.entityName} codes`;
      const response = await apiClient.get<ApiResponse>(endpoint, context);

      if (response.isErr()) {
        throw response.unwrapErr();
      }

      return response.unwrap().content;
    };

    // Provide the generic types to fetchQuery
    try {
      const data = await getQueryClient().fetchQuery<
        readonly (T | null | undefined)[],
        AppError,
        readonly (T | null | undefined)[],
        (string | undefined)[]
      >({
        queryKey,
        queryFn,
      });
      return Ok(data);
    } catch (error) {
      return Err(error as AppError);
    }
  }

  /**
   * Retrieves a list of all entities.
   */
  async listAll(includeInactive?: boolean): Promise<readonly T[]> {
    const result = await this.getAll(includeInactive);

    if (result.isErr()) {
      throw result.unwrapErr();
    }

    const dirtyList = result.unwrap();

    // Sanitize the data before returning it.
    return dirtyList.filter((item): item is T => {
      return item !== null && typeof item === 'object' && 'id' in item;
    });
  }

  /**
   * Retrieves a single entity by its ID.
   */
  async getById(id: number): Promise<Result<T, AppError>> {
    const result = await this.getAll();

    if (result.isErr()) {
      // If the fetch failed, propagate the error.
      return Err(result.unwrapErr());
    }

    const dirtyList = result.unwrap();
    const foundItem = dirtyList.find((item) => item?.id === id);

    if (foundItem) {
      return Ok(foundItem);
    }

    // If not found, return the specific "not found" error.
    const context = `Get ${this.config.entityName} with ID '${id}'`;
    return Err(new AppError(`${context} not found.`, this.config.notFoundErrorCode));
  }

  /**
   * Finds a single entity by its ID.
   */
  async findById(id: number): Promise<Option<T>> {
    const result = await this.getById(id);
    return result.ok(); // .ok() converts Result<T, E> to Option<T>
  }

  // Localized methods

  /**
   * Retrieves a list of all entities, localized to the specified language.
   */
  async listAllLocalized(language: Language, includeInactive?: boolean): Promise<readonly L[]> {
    const entities = await this.listAll(includeInactive);
    return entities.map((entity) => this.config.localizeEntity(entity, language));
  }

  /**
   * Retrieves a single localized entity by its ID.
   */
  async getLocalizedById(id: number, language: Language): Promise<Result<L, AppError>> {
    const result = await this.getById(id);
    return result.map((entity) => this.config.localizeEntity(entity, language));
  }

  /**
   * Finds a single localized entity by its ID.
   */
  async findLocalizedById(id: number, language: Language): Promise<Option<L>> {
    const result = await this.getLocalizedById(id, language);
    return result.ok();
  }
}

/**
 * Helper function to create a standard localization function
 */
export function createLocalizationFunction<T extends LookupModel, L extends LocalizedLookupModel>(
  transform: (entity: T, name: string) => L,
): (entity: T, language: Language) => L {
  return (entity: T, language: Language): L => {
    const name = language === 'fr' ? entity.nameFr : entity.nameEn;
    return transform(entity, name);
  };
}

/**
 * Standard localization function for entities with id, code, and name
 */
export function standardLocalize<T extends LookupModel>(entity: T, language: Language): LocalizedLookupModel {
  return {
    id: entity.id,
    code: entity.code,
    name: language === 'fr' ? entity.nameFr : entity.nameEn,
    expiryDate: entity.expiryDate,
  };
}
