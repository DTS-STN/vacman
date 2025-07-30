import { Ok } from 'oxide.ts';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import type { LocalizedLookupModel } from '~/.server/domain/models';
import { apiClient } from '~/.server/domain/services/api-client';
import { createLookupService, createMockLookupService } from '~/.server/domain/services/shared/lookup-service-helpers';
import type { LookupServiceImplementation } from '~/.server/domain/services/shared/lookup-service-implementation';
import { standardLocalize } from '~/.server/domain/services/shared/lookup-service-implementation';
import type { MockLookupServiceImplementation } from '~/.server/domain/services/shared/mock-lookup-service-implementation';
import { AppError } from '~/errors/app-error';
import { ErrorCodes } from '~/errors/error-codes';

// Mock the API client
vi.mock('~/.server/domain/services/api-client', () => ({
  apiClient: {
    get: vi.fn(),
  },
}));

const mockApiClient = vi.mocked(apiClient);

interface TestEntity {
  id: string;
  code: string;
  nameEn: string;
  nameFr: string;
}

const mockTestData: TestEntity[] = [
  { id: '1', code: 'TEST1', nameEn: 'Test One', nameFr: 'Test Un' },
  { id: '2', code: 'TEST2', nameEn: 'Test Two', nameFr: 'Test Deux' },
];

describe('LookupServiceImplementation', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  describe('API-based service', () => {
    let service: LookupServiceImplementation<TestEntity, LocalizedLookupModel>;

    beforeEach(() => {
      service = createLookupService<TestEntity>(
        '/test-endpoint',
        'test entity',
        ErrorCodes.NO_PROVINCE_FOUND, // Using an existing error code for testing
      );
    });

    it('should retrieve all entities successfully', async () => {
      const mockResponse = { content: mockTestData };
      mockApiClient.get.mockResolvedValue(Ok(mockResponse));

      const result = await service.listAll();

      expect(result).toEqual(mockTestData);
      expect(mockApiClient.get).toHaveBeenCalledWith('/test-endpoint', 'list all test entitys');
    });

    it('should retrieve entity by ID successfully', async () => {
      mockApiClient.get.mockResolvedValue(Ok(mockTestData[0]));

      const result = await service.getById('1');

      expect(result.isOk()).toBe(true);
      expect(result.unwrap()).toEqual(mockTestData[0]);
      expect(mockApiClient.get).toHaveBeenCalledWith('/test-endpoint/1', "Get test entity with ID '1'");
    });

    it('should retrieve entity by CODE successfully', async () => {
      const mockResponse = { content: [mockTestData[0]] };
      mockApiClient.get.mockResolvedValue(Ok(mockResponse));

      const result = await service.getByCode('TEST1');

      expect(result.isOk()).toBe(true);
      expect(result.unwrap()).toEqual(mockTestData[0]);
      expect(mockApiClient.get).toHaveBeenCalledWith('/test-endpoint?code=TEST1', "get test entity with CODE 'TEST1'");
    });

    it('should return localized entities', async () => {
      const mockResponse = { content: mockTestData };
      mockApiClient.get.mockResolvedValue(Ok(mockResponse));

      const result = await service.listAllLocalized('fr');

      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({
        id: '1',
        code: 'TEST1',
        name: 'Test Un',
      });
      expect(result[1]).toEqual({
        id: '2',
        code: 'TEST2',
        name: 'Test Deux',
      });
    });

    it('should handle entity not found by CODE', async () => {
      const mockResponse = { content: [] };
      mockApiClient.get.mockResolvedValue(Ok(mockResponse));

      const result = await service.getByCode('NONEXISTENT');

      expect(result.isErr()).toBe(true);
      expect(result.unwrapErr()).toBeInstanceOf(AppError);
      expect(result.unwrapErr().message).toContain('not found');
    });

    it('should convert Result to Option for find methods', async () => {
      mockApiClient.get.mockResolvedValue(Ok(mockTestData[0]));

      const result = await service.findById('1');

      expect(result.isSome()).toBe(true);
      expect(result.unwrap()).toEqual(mockTestData[0]);
    });
  });

  describe('Mock-based service', () => {
    let mockService: MockLookupServiceImplementation<TestEntity, LocalizedLookupModel>;

    beforeEach(() => {
      mockService = createMockLookupService<TestEntity>(mockTestData, 'test entity', ErrorCodes.NO_PROVINCE_FOUND);
    });

    it('should retrieve all entities', () => {
      const result = mockService.listAll();
      expect(result).toEqual(mockTestData);
    });

    it('should retrieve entity by ID', () => {
      const result = mockService.getById('1');
      expect(result.isOk()).toBe(true);
      expect(result.unwrap()).toEqual(mockTestData[0]);
    });

    it('should retrieve entity by CODE', () => {
      const result = mockService.getByCode('TEST1');
      expect(result.isOk()).toBe(true);
      expect(result.unwrap()).toEqual(mockTestData[0]);
    });

    it('should return localized entities', () => {
      const result = mockService.listAllLocalized('en');
      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({
        id: '1',
        code: 'TEST1',
        name: 'Test One',
      });
    });

    it('should handle entity not found', () => {
      const result = mockService.getById('999');
      expect(result.isErr()).toBe(true);
      expect(result.unwrapErr()).toBeInstanceOf(AppError);
    });

    it('should convert Result to Option for find methods', () => {
      const result = mockService.findById('1');
      expect(result.isSome()).toBe(true);
      expect(result.unwrap()).toEqual(mockTestData[0]);
    });
  });

  describe('standardLocalize', () => {
    it('should localize entity to English', () => {
      const testEntity = mockTestData[0];
      if (!testEntity) throw new Error('Test data is missing');

      const result = standardLocalize(testEntity, 'en');
      expect(result).toEqual({
        id: '1',
        code: 'TEST1',
        name: 'Test One',
      });
    });

    it('should localize entity to French', () => {
      const testEntity = mockTestData[0];
      if (!testEntity) throw new Error('Test data is missing');

      const result = standardLocalize(testEntity, 'fr');
      expect(result).toEqual({
        id: '1',
        code: 'TEST1',
        name: 'Test Un',
      });
    });
  });
});
