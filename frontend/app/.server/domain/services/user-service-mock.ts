import type { User, UserCreate } from '~/.server/domain/models';
import type { UserService } from '~/.server/domain/services/user-service';
import { serverEnvironment } from '~/.server/environment';
import type { AuthenticatedSession } from '~/.server/utils/auth-utils';
import { AppError } from '~/errors/app-error';
import { ErrorCodes } from '~/errors/error-codes';

export function getMockUserService(): UserService {
  return {
    getUserById: (id: number) => {
      try {
        return Promise.resolve(getUserById(id));
      } catch (error) {
        return Promise.reject(error);
      }
    },
    getUserByActiveDirectoryId: (activeDirectoryId: string) => {
      try {
        return Promise.resolve(getUserByActiveDirectoryId(activeDirectoryId));
      } catch (error) {
        return Promise.reject(error);
      }
    },
    registerUser: (user: UserCreate, session: AuthenticatedSession) => Promise.resolve(registerUser(user, session)),
    updateUserRole: (activeDirectoryId: string, newRole: string, session: AuthenticatedSession) => {
      try {
        return Promise.resolve(updateUserRole(activeDirectoryId, newRole, session));
      } catch (error) {
        return Promise.reject(error);
      }
    },
  };
}

/**
 * Mock user data for testing and development.
 */
const mockUsers: readonly User[] = [
  {
    id: 1,
    name: 'Jane Doe',
    activeDirectoryId: '00000000-0000-0000-0000-000000000001',
    role: 'employee',
    privacyConsentAccepted: true,
    createdBy: 'system',
    createdDate: '2024-01-01T00:00:00Z',
    lastModifiedBy: 'system',
    lastModifiedDate: '2024-01-01T00:00:00Z',
  },
  {
    id: 2,
    name: 'John Doe',
    activeDirectoryId: '11111111-1111-1111-1111-111111111111',
    role: 'employee',
    privacyConsentAccepted: true,
    createdBy: 'system',
    createdDate: '2024-01-01T00:00:00Z',
    lastModifiedBy: 'system',
    lastModifiedDate: '2024-01-01T00:00:00Z',
  },
  {
    id: 3,
    name: 'Jane Smith',
    activeDirectoryId: '22222222-2222-2222-2222-222222222222',
    role: 'employee',
    privacyConsentAccepted: true,
    createdBy: 'system',
    createdDate: '2024-01-02T00:00:00Z',
    lastModifiedBy: 'system',
    lastModifiedDate: '2024-01-02T00:00:00Z',
  },
  {
    id: 4,
    name: 'Michel Tremblay',
    activeDirectoryId: '33333333-3333-3333-3333-333333333333',
    role: 'hiring-manager',
    privacyConsentAccepted: true,
    createdBy: 'system',
    createdDate: '2024-01-03T00:00:00Z',
    lastModifiedBy: 'system',
    lastModifiedDate: '2024-01-03T00:00:00Z',
  },
];

/**
 * Retrieves a user by their ID from mock data.
 *
 * @param id The ID of the user to retrieve.
 * @returns The user object if found.
 * @throws {AppError} If the user is not found.
 */
function getUserById(id: number): User {
  const user = mockUsers.find((u) => u.id === id);
  if (!user) {
    throw new AppError(`User with ID '${id}' not found.`, ErrorCodes.VACMAN_API_ERROR);
  }
  return user;
}

/**
 * Retrieves a user by their Active Directory ID from mock data.
 *
 * @param activeDirectoryId The Active Directory ID of the user to retrieve.
 * @returns The user object if found, null otherwise.
 */
function getUserByActiveDirectoryId(activeDirectoryId: string): User | null {
  const user = mockUsers.find((u) => u.activeDirectoryId === activeDirectoryId);
  return user ?? null;
}

/**
 * Registers a new user with mock data.
 *
 * @param userData The user data to create (including role).
 * @param session The authenticated session.
 * @returns The created user object with generated metadata.
 */
function registerUser(userData: UserCreate, session: AuthenticatedSession): User {
  // Extract role from user data
  const role = userData.role as 'employee' | 'hiring-manager';
  // If using local OIDC for testing, update the session roles
  if (serverEnvironment.ENABLE_DEVMODE_OIDC) {
    // Mock function to simulate updating user roles in the session for local testing.
    if (session.authState.accessTokenClaims.roles) {
      // Remove any existing employee/hiring-manager roles and add the new one
      const filteredRoles = session.authState.accessTokenClaims.roles.filter(
        (r: string) => r !== 'employee' && r !== 'hiring-manager',
      );
      // Cast to mutable for testing purposes
      (session.authState.accessTokenClaims.roles as string[]) = [...filteredRoles, role];
    }
  }
  // Generate a mock user with automatic ID and metadata
  const newUser: User = {
    id: mockUsers.length + 1,
    name: userData.name,
    activeDirectoryId: userData.activeDirectoryId,
    role: userData.role,
    ...(userData.privacyConsentAccepted !== undefined && { privacyConsentAccepted: userData.privacyConsentAccepted }),
    createdBy: 'system',
    createdDate: new Date().toISOString(),
    lastModifiedBy: 'system',
    lastModifiedDate: new Date().toISOString(),
  };

  // Add the new user to the mock data for persistence
  (mockUsers as User[]).push(newUser);

  return newUser;
}

/**
 * Updates a user's role identified by their Active Directory ID.
 *
 * @param activeDirectoryId The Active Directory ID of the user to update.
 * @param newRole The new role to assign to the user.
 * @param session The authenticated session.
 * @returns The updated user object.
 * @throws {AppError} If the user is not found.
 */
function updateUserRole(activeDirectoryId: string, newRole: string, session: AuthenticatedSession): User {
  const userIndex = mockUsers.findIndex((u) => u.activeDirectoryId === activeDirectoryId);

  if (userIndex === -1) {
    throw new AppError(`User with Active Directory ID '${activeDirectoryId}' not found.`, ErrorCodes.VACMAN_API_ERROR);
  }

  const currentUser = mockUsers[userIndex];
  if (!currentUser) {
    throw new AppError(`User with Active Directory ID '${activeDirectoryId}' not found.`, ErrorCodes.VACMAN_API_ERROR);
  }

  const updatedUser: User = {
    ...currentUser,
    role: newRole,
    lastModifiedBy: 'system',
    lastModifiedDate: new Date().toISOString(),
  };

  // Update the user in the mock data
  (mockUsers as User[])[userIndex] = updatedUser;

  // If using local OIDC for testing, update the session roles
  if (serverEnvironment.ENABLE_DEVMODE_OIDC) {
    // Mock function to simulate updating user roles in the session for local testing.
    if (session.authState.accessTokenClaims.roles) {
      // Remove any existing employee/hiring-manager roles and add the new one
      const filteredRoles = session.authState.accessTokenClaims.roles.filter(
        (r: string) => r !== 'employee' && r !== 'hiring-manager',
      );
      // Cast to mutable for testing purposes
      (session.authState.accessTokenClaims.roles as string[]) = [...filteredRoles, newRole];
    }
  }

  return updatedUser;
}
