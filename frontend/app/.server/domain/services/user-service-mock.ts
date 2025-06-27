import type { User, UserCreate } from '~/.server/domain/models';
import type { UserService } from '~/.server/domain/services/user-service';
import { serverEnvironment } from '~/.server/environment';
import type { AuthenticatedSession } from '~/.server/utils/auth-utils';
import { AppError } from '~/errors/app-error';
import { ErrorCodes } from '~/errors/error-codes';

export function getMockUserService(): UserService {
  return {
    getUsersByRole: (role: string): Promise<User[]> => {
      try {
        return Promise.resolve(getUsersByRole(role));
      } catch (error) {
        return Promise.reject(error);
      }
    },
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
    uuName: 'Jane Doe',
    activeDirectoryId: '00000000-0000-0000-0000-000000000001',
    role: 'employee',
    createdBy: 'system',
    createdDate: '2024-01-01T00:00:00Z',
    lastModifiedBy: 'system',
    lastModifiedDate: '2024-01-01T00:00:00Z',
  },
  {
    id: 2,
    uuName: 'John Doe',
    activeDirectoryId: '11111111-1111-1111-1111-111111111111',
    role: 'employee',
    createdBy: 'system',
    createdDate: '2024-01-01T00:00:00Z',
    lastModifiedBy: 'system',
    lastModifiedDate: '2024-01-01T00:00:00Z',
  },
  {
    id: 3,
    uuName: 'Jane Smith',
    activeDirectoryId: '22222222-2222-2222-2222-222222222222',
    role: 'employee',
    createdBy: 'system',
    createdDate: '2024-01-02T00:00:00Z',
    lastModifiedBy: 'system',
    lastModifiedDate: '2024-01-02T00:00:00Z',
  },
  {
    id: 4,
    uuName: 'Michel Tremblay',
    activeDirectoryId: '33333333-3333-3333-3333-333333333333',
    role: 'hiring-manager',
    createdBy: 'system',
    createdDate: '2024-01-03T00:00:00Z',
    lastModifiedBy: 'system',
    lastModifiedDate: '2024-01-03T00:00:00Z',
  },
  {
    id: 5,
    uuName: 'Sarah Baker',
    activeDirectoryId: '44444444-4444-4444-4444-444444444444',
    role: 'hr-advisor',
    createdBy: 'system',
    createdDate: '2024-01-03T00:00:00Z',
    lastModifiedBy: 'system',
    lastModifiedDate: '2024-01-03T00:00:00Z',
  },
];

/**
 * Retrieves a list of users by their role from mock data.
 *
 * @param role The ROLE of the users to retrieve.
 * @returns List of user objects.
 */
function getUsersByRole(role: string): User[] {
  const users: User[] = mockUsers.filter((u) => u.role === role);
  return users;
}

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
  // Generate a mock user with automatic ID and metadata
  const newUser: User = {
    id: mockUsers.length + 1,
    activeDirectoryId: userData.activeDirectoryId,
    role: userData.role,
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
