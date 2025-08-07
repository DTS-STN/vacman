import type { Result, Option } from 'oxide.ts';

import type { SecurityClearance, LocalizedSecurityClearance } from '~/.server/domain/models';
import { getDefaultSecurityClearanceService } from '~/.server/domain/services/security-clearance-service-default';
import { getMockSecurityClearanceService } from '~/.server/domain/services/security-clearance-service-mock';
import { serverEnvironment } from '~/.server/environment';
import type { AppError } from '~/errors/app-error';

export type SecurityClearanceService = {
  listAll(): Promise<readonly SecurityClearance[]>;
  getById(id: number): Promise<Result<SecurityClearance, AppError>>;
  findById(id: number): Promise<Option<SecurityClearance>>;
  listAllLocalized(language: Language): Promise<readonly LocalizedSecurityClearance[]>;
  getLocalizedById(id: number, language: Language): Promise<Result<LocalizedSecurityClearance, AppError>>;
  findLocalizedById(id: number, language: Language): Promise<Option<LocalizedSecurityClearance>>;
};

export function getSecurityClearanceService(): SecurityClearanceService {
  return serverEnvironment.ENABLE_LOOKUP_FIELD_SERVICES_MOCK
    ? getMockSecurityClearanceService()
    : getDefaultSecurityClearanceService();
}
