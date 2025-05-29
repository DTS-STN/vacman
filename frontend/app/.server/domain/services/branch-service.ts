import type { Branch, LocalizedBranch } from '~/.server/domain/models';
import { getDefaultBranchService } from '~/.server/domain/services/branch-service-default';
import { getMockBranchService } from '~/.server/domain/services/branch-service-mock';
import { serverEnvironment } from '~/.server/environment';

export type BranchService = {
  getBranches(): Promise<readonly Branch[]>;
  getBranchById(id: string): Promise<Branch | undefined>;
  getLocalizedBranches(language: Language): Promise<readonly LocalizedBranch[]>;
  getLocalizedBranchById(id: string, language: Language): Promise<LocalizedBranch | undefined>;
};

export function getBranchService(): BranchService {
  return serverEnvironment.ENABLE_LOOKUP_FIELD_SERVICES_MOCK ? getMockBranchService() : getDefaultBranchService();
}
