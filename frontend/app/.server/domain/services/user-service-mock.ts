import type { User, UserCreate } from '~/.server/domain/models';
import type { UserService } from '~/.server/domain/services/user-service';
import { AppError } from '~/errors/app-error';
import { ErrorCodes } from '~/errors/error-codes';

export function getMockUserService(): UserService {
  return {
    getUserById: (id: string) => {
      try {
        return Promise.resolve(getUserById(id));
      } catch (error) {
        return Promise.reject(error);
      }
    },
    registerUser: (user: UserCreate) => Promise.resolve(registerUser(user)),
  };
}

/**
 * Mock user data for testing and development.
 */
const mockUsers: readonly User[] = [
  {
    id: '1',
    name: 'John Doe',
    createdBy: 'system',
    createdDate: '2024-01-01T00:00:00Z',
    lastModifiedBy: 'system',
    lastModifiedDate: '2024-01-01T00:00:00Z',
  },
  {
    id: '2',
    name: 'Jane Smith',
    createdBy: 'system',
    createdDate: '2024-01-02T00:00:00Z',
    lastModifiedBy: 'system',
    lastModifiedDate: '2024-01-02T00:00:00Z',
  },
  {
    id: '3',
    name: 'Michel Tremblay',
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
function getUserById(id: string): User {
  const user = mockUsers.find((u) => u.id === id);
  if (!user) {
    throw new AppError(`User with ID '${id}' not found.`, ErrorCodes.VACMAN_API_ERROR);
  }
  return user;
}

/**
 * Registers a new user with mock data.
 *
 * @param userData The user data to create.
 * @returns The created user object with generated metadata.
 */
function registerUser(userData: UserCreate): User {
  // Generate a mock user with automatic ID and metadata
  const newUser: User = {
    id: (mockUsers.length + 1).toString(),
    name: userData.name,
    createdBy: 'system',
    createdDate: new Date().toISOString(),
    lastModifiedBy: 'system',
    lastModifiedDate: new Date().toISOString(),
  };

  return newUser;
}
