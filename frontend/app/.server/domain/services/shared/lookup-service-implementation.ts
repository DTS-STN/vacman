import type { Result, Option } from 'oxide.ts';
import { Err, Ok } from 'oxide.ts';

import type { LookupModel, LocalizedLookupModel } from '~/.server/domain/models';
import { apiClient } from '~/.server/domain/services/api-client';
import { AppError } from '~/errors/app-error';
import type { ErrorCode } from '~/errors/error-codes';
import { HttpStatusCodes } from '~/errors/http-status-codes';

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
   */
  async listAll(): Promise<readonly T[]> {
    type ApiResponse = {
      content: readonly T[];
    };
    const context = `list all ${this.config.entityName} codes`;
    const response = await apiClient.get<ApiResponse>(this.config.apiEndpoint, context);

    if (response.isErr()) {
      throw response.unwrapErr();
    }

    const data = response.unwrap();
    return data.content;
  }

  /**
   * Retrieves a single entity by its ID.
   */
  async getById(id: number): Promise<Result<T, AppError>> {
    const context = `Get ${this.config.entityName} with ID '${id}'`;
    const response = await apiClient.get<T>(`${this.config.apiEndpoint}/${id}`, context);

    if (response.isErr()) {
      const apiFetchError = response.unwrapErr();

      if (apiFetchError.httpStatusCode === HttpStatusCodes.NOT_FOUND) {
        return Err(new AppError(`${context} not found.`, this.config.notFoundErrorCode));
      }

      // For all other errors (500, parsing, network), just return them as is.
      return Err(apiFetchError);
    }
    return response;
  }

  /**
   * Retrieves a single entity by its CODE.
   */
  async getByCode(code: string): Promise<Result<T, AppError>> {
    const context = `get ${this.config.entityName} with CODE '${code}'`;
    type ApiResponse = {
      content: readonly T[];
    };
    const response = await apiClient.get<ApiResponse>(`${this.config.apiEndpoint}?code=${code}`, context);

    if (response.isErr()) {
      throw response.unwrapErr();
    }
    const data = response.unwrap();
    const entity = data.content[0]; // Get the first element from the response array

    if (!entity) {
      // The request was successful, but no entity with that code exists.
      return Err(new AppError(`${context} not found.`, this.config.notFoundErrorCode));
    }

    return Ok(entity);
  }

  /**
   * Finds a single entity by its ID.
   */
  async findById(id: number): Promise<Option<T>> {
    const result = await this.getById(id);
    return result.ok(); // .ok() converts Result<T, E> to Option<T>
  }

  /**
   * Finds a single entity by its CODE.
   */
  async findByCode(code: string): Promise<Option<T>> {
    const result = await this.getByCode(code);
    return result.ok();
  }

  // Localized methods

  /**
   * Retrieves a list of all entities, localized to the specified language.
   */
  async listAllLocalized(language: Language): Promise<readonly L[]> {
    const entities = await this.listAll();
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
   * Retrieves a single localized entity by its CODE.
   */
  async getLocalizedByCode(code: string, language: Language): Promise<Result<L, AppError>> {
    const result = await this.getByCode(code);
    return result.map((entity) => this.config.localizeEntity(entity, language));
  }

  /**
   * Finds a single localized entity by its ID.
   */
  async findLocalizedById(id: number, language: Language): Promise<Option<L>> {
    const result = await this.getLocalizedById(id, language);
    return result.ok();
  }

  /**
   * Finds a single localized entity by its CODE.
   */
  async findLocalizedByCode(code: string, language: Language): Promise<Option<L>> {
    const result = await this.getLocalizedByCode(code, language);
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
  };
}
