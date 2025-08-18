import { Err, None, Ok, Some } from 'oxide.ts';
import type { Option, Result } from 'oxide.ts';

import type { User, UserCreate, UserUpdate, PagedUserResponse, UserQueryParams, PageMetadata } from '~/.server/domain/models';
import type { UserService } from '~/.server/domain/services/user-service';
import { AppError } from '~/errors/app-error';
import { ErrorCodes } from '~/errors/error-codes';

// Debug logging utility for User Service Mock
const debugLog = (method: string, message: string, data?: unknown) => {
  console.log(`[UserService Mock] ${method}: ${message}`, data ? JSON.stringify(data, null, 2) : '');
};

/**
 * Mock user data for testing and development - Updated to match new User model.
 */
const mockUsers: readonly User[] = [
  {
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
  },
  {
    id: 2,
    businessEmailAddress: 'john.doe@canada.ca',
    businessPhoneNumber: '+1-613-555-0102',
    firstName: 'John',
    initial: 'M',
    lastName: 'Doe',
    middleName: 'Michael',
    microsoftEntraId: '11111111-1111-1111-1111-111111111111',
    personalRecordIdentifier: '987654321',
    language: {
      id: 1,
      code: 'EN',
      nameEn: 'English',
      nameFr: 'Anglais',
    },
    userType: {
      id: 1,
      code: 'EMPLOYEE',
      nameEn: 'Employee',
      nameFr: 'Employé',
    },
    createdBy: 'system',
    createdDate: '2024-01-01T00:00:00Z',
    lastModifiedBy: 'system',
    lastModifiedDate: '2024-01-01T00:00:00Z',
  },
  {
    id: 3,
    businessEmailAddress: 'alice.smith@canada.ca',
    businessPhoneNumber: '+1-613-555-0103',
    firstName: 'Alice',
    initial: 'M',
    lastName: 'Smith',
    middleName: 'Marie',
    microsoftEntraId: '22222222-2222-2222-2222-222222222222',
    personalRecordIdentifier: '456789123',
    language: {
      id: 2,
      code: 'FR',
      nameEn: 'French',
      nameFr: 'Français',
    },
    userType: {
      id: 1,
      code: 'EMPLOYEE',
      nameEn: 'Employee',
      nameFr: 'Employé',
    },
    createdBy: 'system',
    createdDate: '2024-02-15T00:00:00Z',
    lastModifiedBy: 'alice.smith',
    lastModifiedDate: '2024-03-20T00:00:00Z',
  },
  {
    id: 4,
    businessEmailAddress: 'bob.johnson@canada.ca',
    businessPhoneNumber: '+1-613-555-0104',
    firstName: 'Bob',
    initial: 'R',
    lastName: 'Johnson',
    middleName: 'Robert',
    microsoftEntraId: '33333333-3333-3333-3333-333333333333',
    personalRecordIdentifier: '789123456',
    language: {
      id: 1,
      code: 'EN',
      nameEn: 'English',
      nameFr: 'Anglais',
    },
    userType: {
      id: 2,
      code: 'MANAGER',
      nameEn: 'Manager',
      nameFr: 'Gestionnaire',
    },
    createdBy: 'system',
    createdDate: '2024-03-10T00:00:00Z',
    lastModifiedBy: 'bob.johnson',
    lastModifiedDate: '2024-04-15T00:00:00Z',
  },
  {
    id: 5,
    businessEmailAddress: 'alex.tan@canada.ca',
    businessPhoneNumber: '+1-613-555-0105',
    firstName: 'Alex',
    initial: 'T',
    lastName: 'Tan',
    middleName: undefined,
    microsoftEntraId: '44444444-4444-4444-4444-444444444444',
    personalRecordIdentifier: '321654987',
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
    createdDate: '2024-04-20T11:45:00Z',
    lastModifiedBy: 'alex.tan',
    lastModifiedDate: '2024-05-01T10:00:00Z',
  },
  {
    id: 6,
    businessEmailAddress: 'sam.lee@canada.ca',
    businessPhoneNumber: '+1-613-555-0106',
    firstName: 'Sam',
    initial: 'L',
    lastName: 'Lee',
    middleName: undefined,
    microsoftEntraId: '55555555-5555-5555-5555-555555555555',
    personalRecordIdentifier: '111222333',
    language: {
      id: 1,
      code: 'EN',
      nameEn: 'English',
      nameFr: 'Anglais',
    },
    userType: {
      id: 1,
      code: 'EMPLOYEE',
      nameEn: 'Employee',
      nameFr: 'Employé',
    },
    createdBy: 'system',
    createdDate: '2024-06-01T08:00:00Z',
    lastModifiedBy: 'alex.tan',
    lastModifiedDate: '2024-05-01T10:00:00Z',
  },
  {
    id: 7,
    businessEmailAddress: 'linda.park@canada.ca',
    businessPhoneNumber: '+1-613-555-0107',
    firstName: 'Linda',
    initial: 'P',
    lastName: 'Park',
    middleName: undefined,
    microsoftEntraId: '66666666-6666-6666-6666-666666666666',
    personalRecordIdentifier: '444555666',
    language: {
      id: 1,
      code: 'EN',
      nameEn: 'English',
      nameFr: 'Anglais',
    },
    userType: {
      id: 1,
      code: 'EMPLOYEE',
      nameEn: 'Employee',
      nameFr: 'Employé',
    },
    createdBy: 'system',
    createdDate: '2024-06-02T09:00:00Z',
    lastModifiedBy: 'linda.park',
    lastModifiedDate: '2024-06-12T10:00:00Z',
  },
  {
    id: 8,
    businessEmailAddress: 'carlos.gomez@canada.ca',
    businessPhoneNumber: '+1-613-555-0108',
    firstName: 'Carlos',
    initial: 'G',
    lastName: 'Gomez',
    middleName: undefined,
    microsoftEntraId: '77777777-7777-7777-7777-777777777777',
    personalRecordIdentifier: '777888999',
    language: {
      id: 1,
      code: 'EN',
      nameEn: 'English',
      nameFr: 'Anglais',
    },
    userType: {
      id: 1,
      code: 'EMPLOYEE',
      nameEn: 'Employee',
      nameFr: 'Employé',
    },
    createdBy: 'system',
    createdDate: '2024-06-03T10:00:00Z',
    lastModifiedBy: 'carlos.gomez',
    lastModifiedDate: '2024-06-12T10:00:00Z',
  },
  {
    id: 9,
    businessEmailAddress: 'priya.singh@canada.ca',
    businessPhoneNumber: '+1-613-555-0109',
    firstName: 'Priya',
    initial: 'S',
    lastName: 'Singh',
    middleName: undefined,
    microsoftEntraId: '88888888-8888-8888-8888-888888888888',
    personalRecordIdentifier: '101112131',
    language: {
      id: 1,
      code: 'EN',
      nameEn: 'English',
      nameFr: 'Anglais',
    },
    userType: {
      id: 1,
      code: 'EMPLOYEE',
      nameEn: 'Employee',
      nameFr: 'Employé',
    },
    createdBy: 'system',
    createdDate: '2024-06-04T11:00:00Z',
    lastModifiedBy: 'carlos.gomez',
    lastModifiedDate: '2024-06-14T12:00:00Z',
  },
  {
    id: 10,
    businessEmailAddress: 'omar.ali@canada.ca',
    businessPhoneNumber: '+1-613-555-0110',
    firstName: 'Omar',
    initial: 'A',
    lastName: 'Ali',
    middleName: undefined,
    microsoftEntraId: '99999999-9999-9999-9999-999999999999',
    personalRecordIdentifier: '141516171',
    language: {
      id: 1,
      code: 'EN',
      nameEn: 'English',
      nameFr: 'Anglais',
    },
    userType: {
      id: 1,
      code: 'EMPLOYEE',
      nameEn: 'Employee',
      nameFr: 'Employé',
    },
    createdBy: 'system',
    createdDate: '2024-06-05T12:00:00Z',
    lastModifiedBy: 'omar.ali',
    lastModifiedDate: '2024-06-15T16:00:00Z',
  },
];

/**
 * Retrieves a user by their ID from mock data.
 *
 * @param id The ID of the user to retrieve.
 * @returns The user object if found.
 */
function getUserById(id: number): User | undefined {
  return mockUsers.find((u) => u.id === id);
}

/**
 * Updates a user by their ID.
 *
 * @param id The ID of the user to update.
 * @param updateUserRequest The update request containing the new user data.
 * @returns The updated user object if found.
 */
function updateUserById(id: number, updateUserRequest: UserUpdate): User | undefined {
  const userIndex = mockUsers.findIndex((u) => u.id === id);

  if (userIndex >= 0) {
    const existingUser = mockUsers[userIndex];
    if (!existingUser) return undefined;

    // Map UserUpdate properties to User properties
    const updatedUser: User = {
      ...existingUser,
      id: existingUser.id, // Preserve the ID
      // Map UserUpdate property names to User property names
      ...(updateUserRequest.businessEmail && { businessEmailAddress: updateUserRequest.businessEmail }),
      ...(updateUserRequest.businessPhone && { businessPhoneNumber: updateUserRequest.businessPhone }),
      ...(updateUserRequest.firstName && { firstName: updateUserRequest.firstName }),
      ...(updateUserRequest.lastName && { lastName: updateUserRequest.lastName }),
      ...(updateUserRequest.middleName !== undefined && { middleName: updateUserRequest.middleName }),
      ...(updateUserRequest.initials && { initial: updateUserRequest.initials }),
      ...(updateUserRequest.personalRecordIdentifier && {
        personalRecordIdentifier: updateUserRequest.personalRecordIdentifier,
      }),
      // Language ID would need to be mapped to full language object, but not implemented in this mock for now
      lastModifiedDate: new Date().toISOString(),
    };
    (mockUsers as User[])[userIndex] = updatedUser;
    return updatedUser;
  }

  return undefined;
}

/**
 * Mock implementation function that returns UserService for testing and development.
 */
export function getMockUserService(): UserService {
  const service: UserService = {
    /**
     * Gets paginated users with optional filtering
     */
    getUsers: (params: UserQueryParams, _accessToken: string): Promise<Result<PagedUserResponse, AppError>> => {
      try {
        // Filter users based on query parameters
        let filteredUsers = [...mockUsers];

        // Apply user type filter if provided
        if (params['user-type']) {
          filteredUsers = filteredUsers.filter(
            (u) => u.userType?.code === (params['user-type'] === 'hr-advisor' ? 'HR_ADVISOR' : params['user-type']),
          );
        }

        // Handle pagination - default values
        const page = params.page ?? 0;
        const size = params.size ?? 10;

        // Simulate pagination
        const startIndex = page * size;
        const endIndex = startIndex + size;
        const paginatedUsers = filteredUsers.slice(startIndex, endIndex);

        // Create page metadata
        const totalElements = filteredUsers.length;
        const totalPages = Math.ceil(totalElements / size);

        const pageMetadata: PageMetadata = {
          size,
          totalElements,
          totalPages,
          number: page,
        };

        const response: PagedUserResponse = {
          content: paginatedUsers,
          page: pageMetadata,
        };

        return Promise.resolve(Ok(response));
      } catch {
        return Promise.resolve(Err(new AppError('Failed to get users', ErrorCodes.VACMAN_API_ERROR)));
      }
    },

    /**
     * Retrieves a specific user by their ID.
     */
    getUserById: (id: number, _accessToken: string): Promise<Result<User, AppError>> => {
      debugLog('getUserById', `Attempting to retrieve user with ID: ${id}`);
      const user = getUserById(id);

      if (!user) {
        debugLog('getUserById', `User with ID ${id} not found`);
        return Promise.resolve(Err(new AppError('User not found', ErrorCodes.PROFILE_NOT_FOUND)));
      }

      debugLog('getUserById', `Successfully retrieved user with ID: ${id}`, {
        userId: user.id,
        email: user.businessEmailAddress,
      });
      return Promise.resolve(Ok(user));
    },

    /**
     * Finds a user by their ID - optional method.
     */
    findUserById: (id: number, _accessToken: string): Promise<Option<User>> => {
      debugLog('findUserById', `Attempting to find user with ID: ${id}`);
      const user = getUserById(id);
      const result = user ? Some(user) : None;
      debugLog(
        'findUserById',
        `Find user result: ${user ? 'found' : 'not found'}`,
        user ? { userId: user.id, email: user.businessEmailAddress } : undefined,
      );
      return Promise.resolve(result);
    },

    /**
     * Gets the current user - mock implementation returns first HR advisor.
     */
    getCurrentUser: (_accessToken: string): Promise<Option<User>> => {
      debugLog('getCurrentUser', 'Attempting to retrieve current user (first HR advisor)');
      // For mock, return the first HR advisor
      const currentUser = mockUsers.find((u) => u.userType?.code === 'HR_ADVISOR');
      debugLog(
        'getCurrentUser',
        `Current user result: ${currentUser ? 'found' : 'not found'}`,
        currentUser
          ? { userId: currentUser.id, email: currentUser.businessEmailAddress, userType: currentUser.userType?.code }
          : undefined,
      );
      return Promise.resolve(currentUser ? Some(currentUser) : None);
    },

    /**
     * Updates a user by their ID.
     */
    updateUserById: (id: number, user: UserUpdate, _accessToken: string): Promise<Result<User, AppError>> => {
      debugLog('updateUserById', `Attempting to update user with ID: ${id}`, { updateData: user });
      const updatedUser = updateUserById(id, user);

      if (!updatedUser) {
        debugLog('updateUserById', `User with ID ${id} not found for update`);
        return Promise.resolve(Err(new AppError('User not found', ErrorCodes.PROFILE_NOT_FOUND)));
      }

      debugLog('updateUserById', `Successfully updated user with ID: ${id}`, {
        userId: updatedUser.id,
        email: updatedUser.businessEmailAddress,
      });
      return Promise.resolve(Ok(updatedUser));
    },

    /**
     * Registers the current user in the system.
     */
    registerCurrentUser: (user: UserCreate, _accessToken: string): Promise<Result<User, AppError>> => {
      debugLog('registerCurrentUser', 'Attempting to register new user', { userData: user });
      try {
        // Create a new user from UserCreate data
        const newUser: User = {
          id: Math.max(...mockUsers.map((u) => u.id)) + 1,
          businessEmailAddress: `user${Date.now()}@canada.ca`,
          businessPhoneNumber: '+1-613-555-0000',
          firstName: 'New',
          initial: 'U',
          lastName: 'User',
          middleName: undefined,
          microsoftEntraId: `${Date.now()}-${Math.random()}`,
          personalRecordIdentifier: String(Date.now()),
          language: {
            id: user.languageId,
            code: user.languageId === 1 ? 'EN' : 'FR',
            nameEn: user.languageId === 1 ? 'English' : 'French',
            nameFr: user.languageId === 1 ? 'Anglais' : 'Français',
          },
          userType: {
            id: 1,
            code: 'EMPLOYEE',
            nameEn: 'Employee',
            nameFr: 'Employé',
          },
          createdBy: 'system',
          createdDate: new Date().toISOString(),
          lastModifiedBy: 'system',
          lastModifiedDate: new Date().toISOString(),
        };

        (mockUsers as User[]).push(newUser);
        debugLog('registerCurrentUser', 'Successfully registered new user', {
          userId: newUser.id,
          email: newUser.businessEmailAddress,
        });
        return Promise.resolve(Ok(newUser));
      } catch (error) {
        debugLog('registerCurrentUser', 'Failed to register current user', {
          error: error instanceof Error ? error.message : 'Unknown error',
        });
        return Promise.resolve(Err(new AppError('Failed to register current user', ErrorCodes.PROFILE_CREATE_FAILED)));
      }
    },
  };

  return service;
}
