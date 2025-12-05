import type { Result, Option } from 'oxide.ts';
import { Err, Ok } from 'oxide.ts';

import type { LookupModel, LocalizedLookupModel } from '~/.server/domain/models';
import { AppError } from '~/errors/app-error';
import type { ErrorCode } from '~/errors/error-codes';
import { isLookupExpired } from '~/utils/lookup-utils';

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
   * Retrieves a list of all entities, excluding expired ones.
   */
  listAll(): T[] {
    return this.config.data.filter((item) => !isLookupExpired(item));
  }

  /**
   * Retrieves a single entity by its ID.
   */
  getById(id: number): Result<T, AppError> {
    const entity = this.config.data.find((item) => item.id === id);

    return entity
      ? Ok(entity)
      : Err(new AppError(`${this.config.entityName} with ID '${id}' not found.`, this.config.notFoundErrorCode));
  }

  /**
   * Finds a single entity by its ID.
   */
  findById(id: number): Option<T> {
    const result = this.getById(id);
    return result.ok();
  }

  // Localized methods

  /**
   * Retrieves a list of all entities, localized to the specified language, excluding expired ones.
   */
  listAllLocalized(language: Language): L[] {
    return this.config.data
      .filter((entity) => !isLookupExpired(entity))
      .map((entity) => this.config.localizeEntity(entity, language));
  }

  /**
   * Retrieves a single localized entity by its ID.
   */
  getLocalizedById(id: number, language: Language): Result<L, AppError> {
    const result = this.getById(id);
    return result.map((entity) => this.config.localizeEntity(entity, language));
  }

  /**
   * Finds a single localized entity by its ID.
   */
  findLocalizedById(id: number, language: Language): Option<L> {
    const result = this.getLocalizedById(id, language);
    return result.ok();
  }
}
