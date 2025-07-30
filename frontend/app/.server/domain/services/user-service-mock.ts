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
    getUserById: (id: string) => {
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
    id: '1',
    role: 'hr-advisor',
    networkName: '00000000-0000-0000-0000-000000000000',
    uuName: 'Jane Doe',
    firstName: 'Jane',
    middleName: undefined,
    lastName: 'Doe',
    initials: 'J.D.',
    personalRecordIdentifier: '123456789',
    businessPhone: '+1-613-555-0101',
    businessEmail: 'jane.doe@canada.ca',
    userCreated: 'system',
    dateCreated: '2024-01-01T00:00:00Z',
    userUpdated: 'system',
    dateUpdated: '2024-01-01T00:00:00Z',
  },
  {
    id: '2',
    role: 'employee',
    networkName: '11111111-1111-1111-1111-111111111111',
    uuName: 'John Doe',
    firstName: 'John',
    middleName: 'Michael',
    lastName: 'Doe',
    initials: 'J.M.D.',
    personalRecordIdentifier: '987654321',
    businessPhone: '+1-613-555-0102',
    businessEmail: 'john.doe@canada.ca',
    userCreated: 'system',
    dateCreated: '2024-01-01T00:00:00Z',
    userUpdated: 'system',
    dateUpdated: '2024-01-01T00:00:00Z',
  },
  {
    id: '3',
    role: 'employee',
    networkName: '22222222-2222-2222-2222-222222222222',
    uuName: 'Jane Smith',
    firstName: 'Jane',
    middleName: 'Elizabeth',
    lastName: 'Smith',
    initials: 'J.E.S.',
    personalRecordIdentifier: '456789123',
    businessPhone: '+1-613-555-0103',
    businessEmail: 'jane.smith@canada.ca',
    userCreated: 'system',
    dateCreated: '2024-01-02T00:00:00Z',
    userUpdated: 'system',
    dateUpdated: '2024-01-02T00:00:00Z',
  },
  {
    id: '4',
    role: 'hiring-manager',
    networkName: '33333333-3333-3333-3333-333333333333',
    uuName: 'Michel Tremblay',
    firstName: 'Michel',
    middleName: undefined,
    lastName: 'Tremblay',
    initials: 'M.T.',
    personalRecordIdentifier: '789123456',
    businessPhone: '+1-613-555-0104',
    businessEmail: 'michel.tremblay@canada.ca',
    userCreated: 'system',
    dateCreated: '2024-01-03T00:00:00Z',
    userUpdated: 'system',
    dateUpdated: '2024-01-03T00:00:00Z',
  },
  {
    id: '5',
    role: 'hr-advisor',
    networkName: '44444444-4444-4444-4444-444444444444',
    uuName: 'Sarah Baker',
    firstName: 'Sarah',
    middleName: 'Anne',
    lastName: 'Baker',
    initials: 'S.A.B.',
    personalRecordIdentifier: '321654987',
    businessPhone: '+1-613-555-0105',
    businessEmail: 'sarah.baker@canada.ca',
    userCreated: 'system',
    dateCreated: '2024-01-03T00:00:00Z',
    userUpdated: 'system',
    dateUpdated: '2024-01-03T00:00:00Z',
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
function getUserById(id: string): User {
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
  const user = mockUsers.find((u) => u.networkName === activeDirectoryId);
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
  // Extract user information from session tokens
  const idTokenClaims = session.authState.idTokenClaims;

  // Parse the name field to extract first and last name
  const fullName = idTokenClaims.name ?? '';
  const nameParts = fullName.trim().split(/\s+/);
  const firstName = nameParts[0] ?? '';
  const lastName = nameParts.length > 1 ? (nameParts[nameParts.length - 1] ?? '') : '';
  const middleName = nameParts.length > 2 ? nameParts.slice(1, -1).join(' ') : undefined;

  // Generate initials from the name
  const generateInitials = (first: string, middle?: string, last?: string): string => {
    const parts = [first, middle, last].filter(Boolean);
    return parts.map((part) => part?.charAt(0).toUpperCase()).join('.') + (parts.length > 0 ? '.' : '');
  };

  // Create the new user with data from session and defaults
  const activeDirectoryId = userData.activeDirectoryId ?? (idTokenClaims.oid as string);
  const newUser: User = {
    id: String(mockUsers.length + 1),
    role: userData.role,
    networkName: activeDirectoryId,
    uuName: fullName || `${firstName} ${lastName}`.trim() || 'Unknown User',
    firstName: firstName,
    middleName: middleName ?? undefined,
    lastName: lastName,
    initials: generateInitials(firstName, middleName, lastName) || undefined,
    personalRecordIdentifier: undefined, // This would need to be provided by the user
    businessPhone: undefined, // This would need to be provided by the user
    businessEmail: idTokenClaims.email ?? undefined,
    userCreated: activeDirectoryId,
    dateCreated: new Date().toISOString(),
    userUpdated: activeDirectoryId,
    dateUpdated: new Date().toISOString(),
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
  const userIndex = mockUsers.findIndex((u) => u.networkName === activeDirectoryId);

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
    userUpdated: 'system',
    dateUpdated: new Date().toISOString(),
  };

  // Update the user in the mock data
  (mockUsers as User[])[userIndex] = updatedUser;

  // If using local OIDC for testing, update the session roles
  if (serverEnvironment.ENABLE_DEVMODE_OIDC) {
    // Mock function to simulate updating user roles in the session for local testing.
    if (session.authState.accessTokenClaims.roles) {
      // Remove any existing employee/hiring-manager roles and add the new one
      const filteredRoles = session.authState.accessTokenClaims.roles.filter(
        (r: string) => r !== 'employee' && r !== 'hiring-manager' && r !== 'hr-advisor',
      );
      // Cast to mutable for testing purposes
      (session.authState.accessTokenClaims.roles as string[]) = [...filteredRoles, newRole];
    }
  }

  return updatedUser;
}
