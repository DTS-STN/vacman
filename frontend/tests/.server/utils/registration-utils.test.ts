import type { Option } from 'oxide.ts';
import { Some } from 'oxide.ts';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import type { User } from '~/.server/domain/models';
import { getUserService } from '~/.server/domain/services/user-service';
import type { AuthenticatedSession } from '~/.server/utils/auth-utils';
import {
  requireRoleRegistration,
  checkHiringManagerRouteRegistration,
  checkHrAdvisorRouteRegistration,
} from '~/.server/utils/registration-utils';

vi.mock('~/.server/domain/services/user-service');
vi.mock('~/.server/utils/route-utils');

const mockSession = {
  authState: {
    accessToken: 'test-token',
  },
} as AuthenticatedSession;

const mockGetCurrentUser = vi.fn<(accessToken: string) => Promise<Option<User>>>();

const mockUser = {
  id: 1,
  businessEmailAddress: 'jane.doe@canada.ca',
  businessPhoneNumber: '+1-613-555-0101',
  firstName: 'Jane',
  initial: 'D',
  lastName: 'Doe',
  middleName: undefined,
  microsoftEntraId: '00000000-0000-0000-0000-000000000000',
  personalRecordIdentifier: '123456789',
  language: {
    id: 1,
    code: 'EN',
    nameEn: 'English',
    nameFr: 'Anglais',
  },
  userType: {
    id: 3,
    code: 'HR_ADVISOR',
    nameEn: 'HR Advisor',
    nameFr: 'Conseiller RH',
  },
  createdBy: 'system',
  createdDate: '2024-01-01T00:00:00Z',
  lastModifiedBy: 'system',
  lastModifiedDate: '2024-01-01T00:00:00Z',
};

vi.mock('~/.server/domain/services/user-service', () => ({
  getUserService: vi.fn(() => ({
    getCurrentUser: mockGetCurrentUser,
  })),
}));

vi.mock('~/.server/logging', () => ({
  LogFactory: {
    getLogger: () => ({
      debug: vi.fn(),
    }),
  },
}));

describe('requireRoleRegistration', () => {
  const mockSession = {
    authState: { accessToken: 'test-token' },
  } as AuthenticatedSession;

  const mockRequest = new Request('https://example.com');

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should allow access for correct role', async () => {
    mockGetCurrentUser.mockResolvedValue(
      Some({
        ...mockUser,
        userType: {
          id: 1,
          code: 'hiring-manager',
          nameEn: 'Hiring Manager',
          nameFr: 'Gestionnaire Embauche',
        },
      }),
    );
    await requireRoleRegistration(mockSession, mockRequest, 'hiring-manager', () => true);

    expect(mockGetCurrentUser).toHaveBeenCalledWith('test-token');
  });
});

describe('checkHiringManagerRouteRegistration', () => {
  it('should delegate to requireRoleRegistration with correct parameters', async () => {
    const mockRequest = new Request('https://example.com/en/hiring-manager');
    mockGetCurrentUser.mockResolvedValue(
      Some({
        ...mockUser,
        userType: {
          id: 1,
          code: 'hiring-manager',
          nameEn: 'Hiring Manager',
          nameFr: 'Gestionnaire Embauche',
        },
      }),
    );

    await checkHiringManagerRouteRegistration(mockSession, mockRequest);

    expect(getUserService().getCurrentUser).toHaveBeenCalled();
  });
});

describe('checkHrAdvisorRouteRegistration', () => {
  it('should delegate to requireRoleRegistration with correct parameters', async () => {
    const mockRequest = new Request('https://example.com/en/hr-advisor');
    mockGetCurrentUser.mockResolvedValue(Some(mockUser));

    await checkHrAdvisorRouteRegistration(mockSession, mockRequest);

    expect(getUserService().getCurrentUser).toHaveBeenCalled();
  });
});
