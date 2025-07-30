import type { Result, Option } from 'oxide.ts';
import { Err, Ok } from 'oxide.ts';

import type { LookupModel, LocalizedLookupModel } from '~/.server/domain/models';
import { AppError } from '~/errors/app-error';
import type { ErrorCode } from '~/errors/error-codes';

/**
 * Configuration for mock lookup service implementation
 */
export interface MockLookupServiceConfig<T extends LookupModel, L extends LocalizedLookupModel> {
  /** Static data array */
  data: T[];
  /** Context description for error messages (e.g., 'classification') */
  entityName: string;
  /** Error code to use when entity is not found */
  notFoundErrorCode: ErrorCode;
  /** Function to localize an entity */
  localizeEntity: (entity: T, language: Language) => L;
}

/**
 * Shared implementation for mock lookup services
 */
export class MockLookupServiceImplementation<T extends LookupModel, L extends LocalizedLookupModel> {
  private config: MockLookupServiceConfig<T, L>;

  constructor(config: MockLookupServiceConfig<T, L>) {
    this.config = config;
  }

  /**
   * Retrieves a list of all entities.
   */
  listAll(): T[] {
    return this.config.data;
  }

  /**
   * Retrieves a single entity by its ID.
   */
  getById(id: string): Result<T, AppError> {
    const entity = this.config.data.find((item) => item.id === id);

    return entity
      ? Ok(entity)
      : Err(new AppError(`${this.config.entityName} with ID '${id}' not found.`, this.config.notFoundErrorCode));
  }

  /**
   * Retrieves a single entity by its CODE.
   */
  getByCode(code: string): Result<T, AppError> {
    const entity = this.config.data.find((item) => item.code === code);

    return entity
      ? Ok(entity)
      : Err(new AppError(`${this.config.entityName} with CODE '${code}' not found.`, this.config.notFoundErrorCode));
  }

  /**
   * Finds a single entity by its ID.
   */
  findById(id: string): Option<T> {
    const result = this.getById(id);
    return result.ok();
  }

  /**
   * Finds a single entity by its CODE.
   */
  findByCode(code: string): Option<T> {
    const result = this.getByCode(code);
    return result.ok();
  }

  // Localized methods

  /**
   * Retrieves a list of all entities, localized to the specified language.
   */
  listAllLocalized(language: Language): L[] {
    return this.config.data.map((entity) => this.config.localizeEntity(entity, language));
  }

  /**
   * Retrieves a single localized entity by its ID.
   */
  getLocalizedById(id: string, language: Language): Result<L, AppError> {
    const result = this.getById(id);
    return result.map((entity) => this.config.localizeEntity(entity, language));
  }

  /**
   * Retrieves a single localized entity by its CODE.
   */
  getLocalizedByCode(code: string, language: Language): Result<L, AppError> {
    const result = this.getByCode(code);
    return result.map((entity) => this.config.localizeEntity(entity, language));
  }

  /**
   * Finds a single localized entity by its ID.
   */
  findLocalizedById(id: string, language: Language): Option<L> {
    const result = this.getLocalizedById(id, language);
    return result.ok();
  }

  /**
   * Finds a single localized entity by its CODE.
   */
  findLocalizedByCode(code: string, language: Language): Option<L> {
    const result = this.getLocalizedByCode(code, language);
    return result.ok();
  }
}
