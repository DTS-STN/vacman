import type { Profile } from '~/.server/domain/models';
import type { AuthenticatedSession } from '~/.server/utils/auth-utils';

export type ProfileService = {
  getProfile(activeDirectoryId: string): Promise<Profile | null>;
  registerProfile(activeDirectoryId: string, session: AuthenticatedSession): Promise<Profile>;
};
