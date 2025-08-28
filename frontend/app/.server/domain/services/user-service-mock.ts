import { Err, None, Ok, Some } from 'oxide.ts';
import type { Option, Result } from 'oxide.ts';

import type { User, UserCreate, UserUpdate, PagedUserResponse, UserQueryParams, PageMetadata } from '~/.server/domain/models';
import { createUserFromEmail, mockUsers } from '~/.server/domain/services/mockData';
import type { UserService } from '~/.server/domain/services/user-service';
import { LogFactory } from '~/.server/logging';
import { AppError } from '~/errors/app-error';
import { ErrorCodes } from '~/errors/error-codes';

const log = LogFactory.getLogger(import.meta.url);

/**
 * A utility type to make all properties of a Readonly type writable.
 */
type Writable<T> = { -readonly [P in keyof T]: T[P] };

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
 * Updates a user by their ID by MUTATING the object in place.
 * We use the Writable utility type to bypass Readonly constraints within this mock.
 *
 * @param id The ID of the user to update.
 * @param updateUserRequest The update request containing the new user data.
 * @returns The updated user object if found.
 */
function updateUserById(id: number, updateUserRequest: UserUpdate): User | undefined {
  const userToUpdate = mockUsers.find((u) => u.id === id);

  if (userToUpdate) {
    // Cast the readonly user to our new Writable<User> type.
    const mutableUser = userToUpdate as Writable<User>;

    mutableUser.businessEmailAddress = updateUserRequest.businessEmail ?? mutableUser.businessEmailAddress;
    mutableUser.businessPhoneNumber = updateUserRequest.businessPhone ?? mutableUser.businessPhoneNumber;
    mutableUser.firstName = updateUserRequest.firstName ?? mutableUser.firstName;
    mutableUser.lastName = updateUserRequest.lastName ?? mutableUser.lastName;
    mutableUser.middleName = updateUserRequest.middleName ?? mutableUser.middleName;
    mutableUser.initial = updateUserRequest.initials ?? mutableUser.initial;
    mutableUser.personalRecordIdentifier = updateUserRequest.personalRecordIdentifier ?? mutableUser.personalRecordIdentifier;

    mutableUser.lastModifiedDate = new Date().toISOString();
    mutableUser.lastModifiedBy = 'mock-user-updater';

    return userToUpdate; // Return the original object, which has now been modified.
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
            (u) => u.userType?.code === (params['user-type'] === 'hr-advisor' ? 'HRA' : params['user-type']),
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
      log.debug(`Attempting to retrieve user with ID: ${id}`);
      const user = getUserById(id);

      if (!user) {
        log.debug(`User with ID ${id} not found`);
        return Promise.resolve(Err(new AppError('User not found', ErrorCodes.PROFILE_NOT_FOUND)));
      }

      log.debug(`Successfully retrieved user with ID: ${id}`, {
        userId: user.id,
        email: user.businessEmailAddress,
      });
      return Promise.resolve(Ok(user));
    },

    /**
     * Finds a user by their ID - optional method.
     */
    findUserById: (id: number, _accessToken: string): Promise<Option<User>> => {
      log.debug(`Attempting to find user with ID: ${id}`);
      const user = getUserById(id);
      const result = user ? Some(user) : None;
      log.debug(
        `Find user result: ${user ? 'found' : 'not found'}`,
        user ? { userId: user.id, email: user.businessEmailAddress } : undefined,
      );
      return Promise.resolve(result);
    },

    /**
     * Gets the current user - mock implementation returns first HR advisor.
     */
    getCurrentUser: (_accessToken: string): Promise<Option<User>> => {
      log.debug('Attempting to retrieve current user (first HR advisor)');
      // For mock, return the first HR advisor
      const currentUser = mockUsers.find((u) => u.userType?.code === 'HRA');
      log.debug(
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
      log.debug(`Attempting to update user with ID: ${id}`, { updateData: user });
      const updatedUser = updateUserById(id, user);

      if (!updatedUser) {
        log.debug(`User with ID ${id} not found for update`);
        return Promise.resolve(Err(new AppError('User not found', ErrorCodes.PROFILE_NOT_FOUND)));
      }

      log.debug(`Successfully updated user with ID: ${id}`, {
        userId: updatedUser.id,
        email: updatedUser.businessEmailAddress,
      });
      return Promise.resolve(Ok(updatedUser));
    },

    /**
     * Registers the current user in the system.
     */
    registerCurrentUser: (user: UserCreate, _accessToken: string): Promise<Result<User, AppError>> => {
      log.debug('Attempting to register new user', { userData: user });
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
        log.debug('Successfully registered new user', {
          userId: newUser.id,
          email: newUser.businessEmailAddress,
        });
        return Promise.resolve(Ok(newUser));
      } catch (error) {
        log.debug('Failed to register current user', {
          error: error instanceof Error ? error.message : 'Unknown error',
        });
        return Promise.resolve(Err(new AppError('Failed to register current user', ErrorCodes.PROFILE_CREATE_FAILED)));
      }
    },

    /**
     * Retrieves a user by their business email address.
     * In mock, we simulate the find-or-create behavior:
     * - If user exists with email, return it
     * - If not, create a new mock user (simulating Entra ID association)
     */
    getUserByEmail: (email: string, _accessToken: string): Promise<Result<User, AppError>> => {
      log.debug(`Attempting to find or create user with email: ${email}`);

      // First, try to find existing user by email
      const existingUser = mockUsers.find((u) => u.businessEmailAddress?.toLowerCase() === email.toLowerCase());

      if (existingUser) {
        log.debug(`Found existing user with email: ${email}`, {
          userId: existingUser.id,
          email: existingUser.businessEmailAddress,
        });
        return Promise.resolve(Ok(existingUser));
      }

      // If not found, create a new user (simulating Entra ID association)
      log.debug(`User with email ${email} not found, creating new user`);

      // In a real scenario, we'd check if the email is associated with an Entra ID user
      // For mock purposes, we'll assume all @canada.ca emails are valid Entra ID users
      if (!email.toLowerCase().endsWith('@canada.ca')) {
        log.debug(`Email ${email} is not associated with a valid Entra ID user`);
        return Promise.resolve(
          Err(
            new AppError(
              `Email ${email} is not associated with an existing Microsoft Entra user`,
              ErrorCodes.PROFILE_NOT_FOUND,
            ),
          ),
        );
      }

      const newUser = createUserFromEmail(email);
      mockUsers.push(newUser);

      log.debug(`Successfully created new user with email: ${email}`, {
        userId: newUser.id,
        email: newUser.businessEmailAddress,
      });

      return Promise.resolve(Ok(newUser));
    },
  };

  return service;
}
