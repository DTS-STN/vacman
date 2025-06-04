import type { Result, Option } from 'oxide.ts';

import type { Branch, LocalizedBranch } from '~/.server/domain/models';
import { getDefaultBranchService } from '~/.server/domain/services/branch-service-default';
import { getMockBranchService } from '~/.server/domain/services/branch-service-mock';
import { serverEnvironment } from '~/.server/environment';
import type { AppError } from '~/errors/app-error';

export type BranchService = {
  getAll(): Promise<Result<readonly Branch[], AppError>>;
  getById(id: string): Promise<Result<Branch, AppError>>;
  findById(id: string): Promise<Option<Branch>>;
  getLocalized(language: Language): Promise<Result<readonly LocalizedBranch[], AppError>>;
  getLocalizedById(id: string, language: Language): Promise<Result<LocalizedBranch, AppError>>;
};

export function getBranchService(): BranchService {
  return serverEnvironment.ENABLE_LOOKUP_FIELD_SERVICES_MOCK ? getMockBranchService() : getDefaultBranchService();
}
