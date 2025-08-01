import type { LookupModel, LocalizedLookupModel } from '~/.server/domain/models';
import type { LookupServiceConfig } from '~/.server/domain/services/shared/lookup-service-implementation';
import { LookupServiceImplementation, standardLocalize } from '~/.server/domain/services/shared/lookup-service-implementation';
import type { MockLookupServiceConfig } from '~/.server/domain/services/shared/mock-lookup-service-implementation';
import { MockLookupServiceImplementation } from '~/.server/domain/services/shared/mock-lookup-service-implementation';
import type { ErrorCode } from '~/errors/error-codes';

/**
 * Helper function to create a lookup service with standard localization
 */
export function createLookupService<T extends LookupModel>(
  apiEndpoint: string,
  entityName: string,
  notFoundErrorCode: ErrorCode,
): LookupServiceImplementation<T, LocalizedLookupModel> {
  const config: LookupServiceConfig<T, LocalizedLookupModel> = {
    apiEndpoint,
    entityName,
    notFoundErrorCode,
    localizeEntity: standardLocalize,
  };
  return new LookupServiceImplementation(config);
}

/**
 * Helper function to create a custom lookup service with custom localization
 */
export function createCustomLookupService<T extends LookupModel, L extends LocalizedLookupModel>(
  apiEndpoint: string,
  entityName: string,
  notFoundErrorCode: ErrorCode,
  localizeEntity: (entity: T, language: Language) => L,
): LookupServiceImplementation<T, L> {
  const config: LookupServiceConfig<T, L> = {
    apiEndpoint,
    entityName,
    notFoundErrorCode,
    localizeEntity,
  };
  return new LookupServiceImplementation(config);
}

/**
 * Helper function to create a mock lookup service with standard localization
 */
export function createMockLookupService<T extends LookupModel>(
  data: T[],
  entityName: string,
  notFoundErrorCode: ErrorCode,
): MockLookupServiceImplementation<T, LocalizedLookupModel> {
  const config: MockLookupServiceConfig<T, LocalizedLookupModel> = {
    data,
    entityName,
    notFoundErrorCode,
    localizeEntity: standardLocalize,
  };
  return new MockLookupServiceImplementation(config);
}

/**
 * Helper function to create a custom mock lookup service with custom localization
 */
export function createCustomMockLookupService<T extends LookupModel, L extends LocalizedLookupModel>(
  data: T[],
  entityName: string,
  notFoundErrorCode: ErrorCode,
  localizeEntity: (entity: T, language: Language) => L,
): MockLookupServiceImplementation<T, L> {
  const config: MockLookupServiceConfig<T, L> = {
    data,
    entityName,
    notFoundErrorCode,
    localizeEntity,
  };
  return new MockLookupServiceImplementation(config);
}
