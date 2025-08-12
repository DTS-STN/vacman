import { Err, None, Ok, Some } from 'oxide.ts';
import type { Option, Result } from 'oxide.ts';

import type { User, UserCreate, UserUpdate } from '~/.server/domain/models';
import type { UserService } from '~/.server/domain/services/user-service';
import { AppError } from '~/errors/app-error';
import { ErrorCodes } from '~/errors/error-codes';

export function getMockUserService(): UserService {
  const service: UserService = {
    getUsersByRole: (role: string, accessToken: string): Promise<Result<User[], AppError>> => {
      try {
        const users = getUsersByRole(role);
        return Promise.resolve(Ok(users));
      } catch (error) {
        return Promise.resolve(Err(error as AppError));
      }
    },
    
    getUserById: (id: number, accessToken: string): Promise<Result<User, AppError>> => {
      try {
        const user = getUserById(id);
        return Promise.resolve(Ok(user));
      } catch (error) {
        return Promise.resolve(Err(error as AppError));
      }
    },

    findUserById: async (id: number, accessToken: string): Promise<Option<User>> => {
      const result = await service.getUserById(id, accessToken);
      return result.ok();
    },

    getCurrentUser: (accessToken: string): Promise<Option<User>> => {
      try {
        const user = mockUsers[0];
        if (!user) return Promise.resolve(None);
        return Promise.resolve(Some(user));
      } catch (_error) {
        return Promise.resolve(None);
      }
    },
    
    registerCurrentUser: (user: UserCreate, accessToken: string): Promise<Result<User, AppError>> => {
      try {
        const newUser = registerCurrentUser(user, accessToken);
        return Promise.resolve(Ok(newUser));
      } catch (error) {
        return Promise.resolve(Err(error as AppError));
      }
    },
    
    updateUser: (user: UserUpdate, accessToken: string): Promise<Result<User, AppError>> => {
      try {
        const updatedUser = updateUser(user);
        return Promise.resolve(Ok(updatedUser));
      } catch (error) {
        return Promise.resolve(Err(error as AppError));
      }
    },
  };

  return service;
}

/**
 * Mock user data for testing and development.
 */
const mockUsers: readonly User[] = [
  {
    id: 1,
    uuName: 'Jane Doe',
    networkName: '00000000-0000-0000-0000-000000000000',
    role: 'hr-advisor',
    userCreated: 'system',
    dateCreated: '2024-01-01T00:00:00Z',
    userUpdated: 'system',
    dateUpdated: '2024-01-01T00:00:00Z',
    firstName: 'Jane',
    middleName: undefined,
    lastName: 'Doe',
    initials: 'J.D.',
    personalRecordIdentifier: '123456789',
    businessPhone: '+1-613-555-0101',
    businessEmail: 'jane.doe@canada.ca',
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
    userUpdated: 'jane.doe',
    dateUpdated: '2024-01-15T10:30:00Z',
  },
  {
    id: 3,
    role: 'employee',
    networkName: '22222222-2222-2222-2222-222222222222',
    uuName: 'lname fname',
    firstName: 'lname',
    middleName: undefined,
    lastName: 'fname',
    initials: 'l.f.',
    personalRecordIdentifier: '987654321',
    businessPhone: '613-555-1234',
    businessEmail: 'john.smith@email.ca',
    userCreated: 'system',
    dateCreated: '2024-02-01T09:00:00Z',
    userUpdated: 'john.smith',
    dateUpdated: '2024-02-10T14:00:00Z',
  },
  {
    id: 4,
    role: 'hiring-manager',
    networkName: '33333333-3333-3333-3333-333333333333',
    uuName: 'Marie Curie',
    firstName: 'Marie',
    middleName: undefined,
    lastName: 'Curie',
    initials: 'M.C.',
    personalRecordIdentifier: '555555555',
    businessPhone: '613-555-5555',
    businessEmail: 'marie.curie@email.ca',
    userCreated: 'system',
    dateCreated: '2024-03-15T08:30:00Z',
    userUpdated: 'john.smith',
    dateUpdated: '2024-02-10T14:00:00Z',
  },
  {
    id: 5,
    role: 'hr-advisor',
    networkName: '44444444-4444-4444-4444-444444444444',
    uuName: 'Alex Tan',
    firstName: 'Alex',
    middleName: undefined,
    lastName: 'Tan',
    initials: 'A.T.',
    personalRecordIdentifier: '222333444',
    businessPhone: '613-555-2222',
    businessEmail: 'alex.tan@email.ca',
    userCreated: 'system',
    dateCreated: '2024-04-20T11:45:00Z',
    userUpdated: 'alex.tan',
    dateUpdated: '2024-05-01T10:00:00Z',
  },
  {
    id: 6,
    role: 'employee',
    networkName: '55555555-5555-5555-5555-555555555555',
    uuName: 'Sam Lee',
    firstName: 'Sam',
    middleName: undefined,
    lastName: 'Lee',
    initials: 'S.L.',
    personalRecordIdentifier: '111222333',
    businessPhone: '613-555-1001',
    businessEmail: 'sam.lee@example.com',
    userCreated: 'system',
    dateCreated: '2024-06-01T08:00:00Z',
    userUpdated: 'alex.tan',
    dateUpdated: '2024-05-01T10:00:00Z',
  },
  {
    id: 7,
    role: 'employee',
    networkName: '66666666-6666-6666-6666-666666666666',
    uuName: 'Linda Park',
    firstName: 'Linda',
    middleName: undefined,
    lastName: 'Park',
    initials: 'L.P.',
    personalRecordIdentifier: '444555666',
    businessPhone: '613-555-2001',
    businessEmail: 'linda.park@example.com',
    userCreated: 'system',
    dateCreated: '2024-06-02T09:00:00Z',
    userUpdated: 'linda.park',
    dateUpdated: '2024-06-12T10:00:00Z',
  },
  {
    id: 8,
    role: 'employee',
    networkName: '77777777-7777-7777-7777-777777777777',
    uuName: 'Carlos Gomez',
    firstName: 'Carlos',
    middleName: undefined,
    lastName: 'Gomez',
    initials: 'C.G.',
    personalRecordIdentifier: '777888999',
    businessPhone: '613-555-3001',
    businessEmail: 'carlos.gomez@example.com',
    userCreated: 'system',
    dateCreated: '2024-06-03T10:00:00Z',
    userUpdated: 'carlos.gomez',
    dateUpdated: '2024-06-12T10:00:00Z',
  },
  {
    id: 9,
    role: 'employee',
    networkName: '88888888-8888-8888-8888-888888888888',
    uuName: 'Priya Singh',
    firstName: 'Priya',
    middleName: undefined,
    lastName: 'Singh',
    initials: 'P.S.',
    personalRecordIdentifier: '101112131',
    businessPhone: '613-555-4001',
    businessEmail: 'priya.singh@example.com',
    userCreated: 'system',
    dateCreated: '2024-06-04T11:00:00Z',
    userUpdated: 'carlos.gomez',
    dateUpdated: '2024-06-14T12:00:00Z',
  },
  {
    id: 10,
    role: 'employee',
    networkName: '99999999-9999-9999-9999-999999999999',
    uuName: 'Mohammed Ijaz',
    firstName: 'Mohammed',
    middleName: undefined,
    lastName: 'Ijaz',
    initials: 'M.I.',
    personalRecordIdentifier: '141516171',
    businessPhone: '613-555-5001',
    businessEmail: 'mohammedi@example.com',
    userCreated: 'system',
    dateCreated: '2024-06-05T12:00:00Z',
    userUpdated: 'mohammed.ijaz',
    dateUpdated: '2024-06-14T12:00:00Z',
  },
  {
    id: 11,
    role: 'employee',
    networkName: 'AAAAAAAA-AAAA-AAAA-AAAA-AAAAAAAAAAAA',
    uuName: 'Emily Neil',
    firstName: 'Emily',
    middleName: undefined,
    lastName: 'Neil',
    initials: 'E.N.',
    personalRecordIdentifier: '181920212',
    businessPhone: '613-555-6001',
    businessEmail: 'emily.chen@example.com',
    userCreated: 'system',
    dateCreated: '2024-06-06T13:00:00Z',
    userUpdated: 'mohammed.alfarsi',
    dateUpdated: '2024-06-16T14:00:00Z',
  },
  {
    id: 12,
    role: 'employee',
    networkName: 'BBBBBBBB-BBBB-BBBB-BBBB-BBBBBBBBBBBB',
    uuName: 'Olivia Brown',
    firstName: 'Olivia',
    middleName: undefined,
    lastName: 'Brown',
    initials: 'O.B.',
    personalRecordIdentifier: '222324252',
    businessPhone: '613-555-7001',
    businessEmail: 'olivia.brown@example.com',
    userCreated: 'system',
    dateCreated: '2024-06-07T14:00:00Z',
    userUpdated: 'olivia.brown',
    dateUpdated: '2024-10-14T12:00:00Z',
  },
  {
    id: 13,
    role: 'employee',
    networkName: 'CCCCCCCC-CCCC-CCCC-CCCC-CCCCCCCCCCCC',
    uuName: 'David Kim',
    firstName: 'David',
    middleName: undefined,
    lastName: 'Kim',
    initials: 'D.K.',
    personalRecordIdentifier: '262728292',
    businessPhone: '613-555-8001',
    businessEmail: 'david.kim@example.com',
    userCreated: 'system',
    dateCreated: '2024-06-08T15:00:00Z',
    userUpdated: 'olivia.brown',
    dateUpdated: '2024-07-08T16:00:00Z',
  },
  {
    id: 14,
    role: 'employee',
    networkName: 'DDDDDDDD-DDDD-DDDD-DDDD-DDDDDDDDDDDD',
    uuName: 'Sofia Rossi',
    firstName: 'Sofia',
    middleName: undefined,
    lastName: 'Rossi',
    initials: 'S.R.',
    personalRecordIdentifier: '303132333',
    businessPhone: '613-555-9001',
    businessEmail: 'sofia.rossi@example.com',
    userCreated: 'system',
    dateCreated: '2024-06-09T16:00:00Z',
    userUpdated: 'sofia.rossi',
    dateUpdated: '2024-07-08T16:00:00Z',
  },
  {
    id: 15,
    role: 'employee',
    networkName: 'EEEEEEEE-EEEE-EEEE-EEEE-EEEEEEEEEEEE',
    uuName: 'Tom Muller',
    firstName: 'Tom',
    middleName: undefined,
    lastName: 'Muller',
    initials: 'T.M.',
    personalRecordIdentifier: '343536373',
    businessPhone: '613-555-9101',
    businessEmail: 'tom.muller@example.com',
    userCreated: 'system',
    dateCreated: '2024-06-10T17:00:00Z',
    userUpdated: 'sofia.rossi',
    dateUpdated: '2024-07-12T18:00:00Z',
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
