import type { User, UserCreate, UserUpdate } from '~/.server/domain/models';
import type { UserService } from '~/.server/domain/services/user-service';
import { AppError } from '~/errors/app-error';
import { ErrorCodes } from '~/errors/error-codes';

export function getMockUserService(): UserService {
  return {
    getUsersByRole: (role: string, accessToken: string): Promise<User[]> => {
      try {
        return Promise.resolve(getUsersByRole(role));
      } catch (error) {
        return Promise.reject(error);
      }
    },
    getUserById: (id: number, accessToken: string) => {
      try {
        return Promise.resolve(getUserById(id));
      } catch (error) {
        return Promise.reject(error);
      }
    },
    getCurrentUser: (accessToken: string): Promise<User> => {
      try {
        const user = mockUsers[0];
        if (!user) return Promise.reject(new Error('No mock users available'));
        return Promise.resolve(user);
      } catch (error) {
        return Promise.reject(error);
      }
    },
    registerCurrentUser: (user: UserCreate, accessToken: string): Promise<User> => {
      try {
        return Promise.resolve(registerCurrentUser(user, accessToken));
      } catch (error) {
        return Promise.reject(error);
      }
    },
    updateUser: (user: UserUpdate, accessToken: string): Promise<User> => {
      try {
        return Promise.resolve(updateUser(user));
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
    id: 2,
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
    id: 3,
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
    id: 4,
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
    id: 5,
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
function getUserById(id: number): User {
  const user = mockUsers.find((u) => u.id === id);
  if (!user) {
    throw new AppError(`User with ID '${id}' not found.`, ErrorCodes.VACMAN_API_ERROR);
  }
  return user;
}

/**
 * Registers a new user with mock data.
 *
 * @param userData The user data to create (including role).
 * @param session The authenticated session.
 * @returns The created user object with generated metadata.
 */
function registerCurrentUser(userData: UserCreate, accessToken: string): User {
  // Parse the name field to extract first and last name
  const fullName = 'Test User';
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
  const activeDirectoryId = 'mock-active-directory-id';
  const newUser: User = {
    id: mockUsers.length + 1,
    role: 'employee',
    networkName: activeDirectoryId,
    uuName: fullName,
    firstName: firstName,
    middleName: middleName ?? undefined,
    lastName: lastName,
    initials: generateInitials(firstName, middleName, lastName) || undefined,
    personalRecordIdentifier: undefined, // This would need to be provided by the user
    businessPhone: undefined, // This would need to be provided by the user
    businessEmail: 'test.user@canada.ca',
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
 * Updates a user in the mock data.
 *
 * @param userData The user data to update.
 * @returns The updated user object.
 * @throws {AppError} If the user is not found.
 */
function updateUser(userData: UserUpdate): User {
  const userIndex = mockUsers.findIndex((u) => u.id === userData.id);
  if (userIndex === -1) {
    throw new AppError(`User with ID '${userData.id}' not found.`, ErrorCodes.VACMAN_API_ERROR);
  }

  const existingUser = mockUsers[userIndex];
  if (!existingUser) {
    throw new AppError(`User with ID '${userData.id}' not found.`, ErrorCodes.VACMAN_API_ERROR);
  }

  // Create updated user with existing data and new data merged
  const updatedUser: User = {
    ...existingUser,
    firstName: userData.firstName ?? existingUser.firstName,
    middleName: userData.middleName ?? existingUser.middleName,
    lastName: userData.lastName ?? existingUser.lastName,
    initials: userData.initials ?? existingUser.initials,
    personalRecordIdentifier: userData.personalRecordIdentifier ?? existingUser.personalRecordIdentifier,
    businessPhone: userData.businessPhone ?? existingUser.businessPhone,
    businessEmail: userData.businessEmail ?? existingUser.businessEmail,
    userUpdated: 'mock-active-directory-id',
    dateUpdated: new Date().toISOString(),
  };

  // Update the mock data
  (mockUsers as User[])[userIndex] = updatedUser;

  return updatedUser;
}
