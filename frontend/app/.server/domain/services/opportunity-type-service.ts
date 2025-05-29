import type { LocalizedOpportunityType, OpportunityType } from '~/.server/domain/models';
import { getDefaultOpportunityTypeService } from '~/.server/domain/services/opportunity-type-service-default';
import { getMockOpportunityTypeService } from '~/.server/domain/services/opportunity-type-service-mock';
import { serverEnvironment } from '~/.server/environment';

export type OpportunityTypeService = {
  getOpportunityTypes(): Promise<readonly OpportunityType[]>;
  getOpportunityTypeById(id: string): Promise<OpportunityType | undefined>;
  getLocalizedOpportunityTypes(language: Language): Promise<readonly LocalizedOpportunityType[]>;
  getLocalizedOpportunityTypeById(id: string, language: Language): Promise<LocalizedOpportunityType | undefined>;
};

export function getOpportunityTypeService(): OpportunityTypeService {
  return serverEnvironment.ENABLE_LOOKUP_FIELD_SERVICES_MOCK
    ? getMockOpportunityTypeService()
    : getDefaultOpportunityTypeService();
}
