import type { Directorate, LocalizedDirectorate } from '~/.server/domain/models';
import { getDefaultDirectorateService } from '~/.server/domain/services/directorate-service-default';
import { getMockDirectorateService } from '~/.server/domain/services/directorate-service-mock';
import { serverEnvironment } from '~/.server/environment';

export type DirectorateService = {
  getDirectorates(): Promise<readonly Directorate[]>;
  getDirectorateById(id: string): Promise<Directorate | undefined>;
  getLocalizedDirectorates(language: Language): Promise<readonly LocalizedDirectorate[]>;
  getLocalizedDirectorateById(id: string, language: Language): Promise<LocalizedDirectorate | undefined>;
};

export function getDirectorateService(): DirectorateService {
  return serverEnvironment.ENABLE_LOOKUP_FIELD_SERVICES_MOCK ? getMockDirectorateService() : getDefaultDirectorateService();
}
