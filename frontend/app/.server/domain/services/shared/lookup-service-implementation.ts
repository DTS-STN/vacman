import type { Result, Option } from 'oxide.ts';
import { Err, Ok } from 'oxide.ts';

import type { LookupModel, LocalizedLookupModel } from '~/.server/domain/models';
import { apiClient } from '~/.server/domain/services/api-client';
import { LogFactory } from '~/.server/logging';
import { AppError } from '~/errors/app-error';
import type { ErrorCode } from '~/errors/error-codes';
import { getQueryClient } from '~/query-client';

const log = LogFactory.getLogger(import.meta.url);

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
   */
  private async getAll(): Promise<Result<readonly (T | null | undefined)[], AppError>> {
    const queryKey = ['lookup', this.config.apiEndpoint];
    log.info('Fetching lookup data', { endpoint: this.config.apiEndpoint });

    const queryFn = async (): Promise<readonly (T | null | undefined)[]> => {
      type ApiResponse = {
        content: readonly (T | null | undefined)[];
      };
      const context = `list all ${this.config.entityName} codes`;
      log.debug('Lookup GET', { endpoint: this.config.apiEndpoint, entity: this.config.entityName });
      const response = await apiClient.get<ApiResponse>(this.config.apiEndpoint, context);

      if (response.isErr()) {
        log.error('Failed to fetch lookup data', response.unwrapErr());
        throw response.unwrapErr();
      }

      const content = response.unwrap().content;
      log.info('Fetched lookup data', { count: content.length });
      return content;
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
      log.debug('Lookup cache fetch complete', { endpoint: this.config.apiEndpoint, count: data.length });
      return Ok(data);
    } catch (error) {
      log.error('Lookup fetch threw error', error);
      return Err(error as AppError);
    }
  }

  /**
   * Retrieves a list of all entities.
   */
  async listAll(): Promise<readonly T[]> {
    log.debug('Listing all lookup entities', { endpoint: this.config.apiEndpoint });
    const result = await this.getAll();

    if (result.isErr()) {
      throw result.unwrapErr();
    }

    const dirtyList = result.unwrap();

    // Sanitize the data before returning it.
    const sanitized = dirtyList.filter((item): item is T => {
      return item !== null && typeof item === 'object' && 'id' in item;
    });
    log.info('Sanitized lookup list', { count: sanitized.length });
    return sanitized;
  }

  /**
   * Retrieves a single entity by its ID.
   */
  async getById(id: number): Promise<Result<T, AppError>> {
    log.debug('Getting lookup by id', { endpoint: this.config.apiEndpoint, id });
    const result = await this.getAll();

    if (result.isErr()) {
      // If the fetch failed, propagate the error.
      return Err(result.unwrapErr());
    }

    const dirtyList = result.unwrap();
    const foundItem = dirtyList.find((item) => item?.id === id);

    if (foundItem) {
      log.info('Lookup entity found', { id });
      return Ok(foundItem);
    }

    // If not found, return the specific "not found" error.
    const context = `Get ${this.config.entityName} with ID '${id}'`;
    const err = new AppError(`${context} not found.`, this.config.notFoundErrorCode);
    log.warn('Lookup entity not found', { id, endpoint: this.config.apiEndpoint });
    return Err(err);
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
  async listAllLocalized(language: Language): Promise<readonly L[]> {
    log.debug('Listing all lookup entities (localized)', { endpoint: this.config.apiEndpoint, language });
    const entities = await this.listAll();
    return entities.map((entity) => this.config.localizeEntity(entity, language));
  }

  /**
   * Retrieves a single localized entity by its ID.
   */
  async getLocalizedById(id: number, language: Language): Promise<Result<L, AppError>> {
    log.debug('Getting localized lookup by id', { endpoint: this.config.apiEndpoint, id, language });
    const result = await this.getById(id);
    return result.map((entity) => this.config.localizeEntity(entity, language));
  }

  /**
   * Finds a single localized entity by its ID.
   */
  async findLocalizedById(id: number, language: Language): Promise<Option<L>> {
    log.debug('Finding localized lookup by id', { endpoint: this.config.apiEndpoint, id, language });
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
  };
}
