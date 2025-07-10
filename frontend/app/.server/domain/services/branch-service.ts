import type { Result, Option } from 'oxide.ts';

import type { Branch, LocalizedBranch } from '~/.server/domain/models';
import { getDefaultBranchService } from '~/.server/domain/services/branch-service-default';
import { getMockBranchService } from '~/.server/domain/services/branch-service-mock';
import { serverEnvironment } from '~/.server/environment';
import type { AppError } from '~/errors/app-error';

export type BranchService = {
  listAll(): Promise<readonly Branch[]>;
  getById(id: string): Promise<Result<Branch, AppError>>;
  getByCode(code: string): Promise<Result<Branch, AppError>>;
  listAllLocalized(language: Language): Promise<readonly LocalizedBranch[]>;
  getLocalizedById(id: string, language: Language): Promise<Result<LocalizedBranch, AppError>>;
  findLocalizedById(id: string, language: Language): Promise<Option<LocalizedBranch>>;
  getLocalizedByCode(code: string, language: Language): Promise<Result<LocalizedBranch, AppError>>;
  findLocalizedByCode(code: string, language: Language): Promise<Option<LocalizedBranch>>;
};

export function getBranchService(): BranchService {
  return serverEnvironment.ENABLE_LOOKUP_FIELD_SERVICES_MOCK ? getMockBranchService() : getDefaultBranchService();
}
