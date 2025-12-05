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
import { getQueryClient } from '~/query-client';

// Mock the API client
vi.mock('~/.server/domain/services/api-client', () => ({
  apiClient: {
    get: vi.fn(),
  },
}));

const mockApiClient = vi.mocked(apiClient);

interface TestEntity {
  id: number;
  code: string;
  nameEn: string;
  nameFr: string;
  expiryDate?: string | null;
}

const mockTestData: TestEntity[] = [
  { id: 1, code: 'TEST1', nameEn: 'Test One', nameFr: 'Test Un' },
  { id: 2, code: 'TEST2', nameEn: 'Test Two', nameFr: 'Test Deux' },
];

describe('LookupServiceImplementation', () => {
  beforeEach(() => {
    getQueryClient().clear();
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
      expect(mockApiClient.get).toHaveBeenCalledWith('/test-endpoint', 'list all test entity codes');
    });

    it('should retrieve entity by ID successfully', async () => {
      // ARRANGE: Mock the response for the LIST endpoint, because that's what getById now calls internally.
      const mockResponse = { content: mockTestData };
      mockApiClient.get.mockResolvedValue(Ok(mockResponse));

      // ACT: Call the service method.
      const result = await service.getById(1);

      // ASSERT
      // 1. Check that the operation was successful and returned the correct single item.
      expect(result.isOk()).toBe(true);
      expect(result.unwrap()).toEqual(mockTestData[0]);

      // 2. Check that the LIST endpoint was called correctly.
      expect(mockApiClient.get).toHaveBeenCalledTimes(1);
      expect(mockApiClient.get).toHaveBeenCalledWith('/test-endpoint', 'list all test entity codes');
    });

    it('should return localized entities', async () => {
      const mockResponse = { content: mockTestData };
      mockApiClient.get.mockResolvedValue(Ok(mockResponse));

      const result = await service.listAllLocalized('fr');

      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({
        id: 1,
        code: 'TEST1',
        name: 'Test Un',
      });
      expect(result[1]).toEqual({
        id: 2,
        code: 'TEST2',
        name: 'Test Deux',
      });
    });

    it('should convert Result to Option for find methods', async () => {
      const mockResponse = { content: mockTestData };
      mockApiClient.get.mockResolvedValue(Ok(mockResponse));

      const result = await service.findById(1);

      expect(result.isSome()).toBe(true);
      expect(result.unwrap()).toEqual(mockTestData[0]);
    });
  });

  describe('API-based service expiry filtering', () => {
    // Test date constants for consistency and maintainability
    const PAST_DATE = '2020-01-01T00:00:00.000Z';
    const FUTURE_DATE = '2099-12-31T23:59:59.999Z';

    const mockDataWithExpiry: TestEntity[] = [
      { id: 1, code: 'ACTIVE', nameEn: 'Active Item', nameFr: 'Article Actif', expiryDate: null },
      { id: 2, code: 'EXPIRED', nameEn: 'Expired Item', nameFr: 'Article Expiré', expiryDate: PAST_DATE },
      { id: 3, code: 'FUTURE', nameEn: 'Future Expiry', nameFr: 'Expiration Future', expiryDate: FUTURE_DATE },
      { id: 4, code: 'NO_EXPIRY', nameEn: 'No Expiry Set', nameFr: 'Sans Expiration' },
    ];

    let service: LookupServiceImplementation<TestEntity, LocalizedLookupModel>;

    beforeEach(() => {
      service = createLookupService<TestEntity>('/test-endpoint', 'test entity', ErrorCodes.NO_PROVINCE_FOUND);
    });

    it('should filter out expired entities in listAll', async () => {
      const mockResponse = { content: mockDataWithExpiry };
      mockApiClient.get.mockResolvedValue(Ok(mockResponse));

      const result = await service.listAll();

      expect(result).toHaveLength(3);
      expect(result.map((e) => e.code)).toEqual(['ACTIVE', 'FUTURE', 'NO_EXPIRY']);
      expect(result.find((e) => e.code === 'EXPIRED')).toBeUndefined();
    });

    it('should filter out expired entities in listAllLocalized', async () => {
      const mockResponse = { content: mockDataWithExpiry };
      mockApiClient.get.mockResolvedValue(Ok(mockResponse));

      const result = await service.listAllLocalized('en');

      expect(result).toHaveLength(3);
      expect(result.map((e) => e.code)).toEqual(['ACTIVE', 'FUTURE', 'NO_EXPIRY']);
      expect(result.find((e) => e.code === 'EXPIRED')).toBeUndefined();
    });

    it('should still allow getById to retrieve expired entities', async () => {
      const mockResponse = { content: mockDataWithExpiry };
      mockApiClient.get.mockResolvedValue(Ok(mockResponse));

      const result = await service.getById(2);

      expect(result.isOk()).toBe(true);
      expect(result.unwrap().code).toBe('EXPIRED');
    });

    it('should still allow findById to retrieve expired entities', async () => {
      const mockResponse = { content: mockDataWithExpiry };
      mockApiClient.get.mockResolvedValue(Ok(mockResponse));

      const result = await service.findById(2);

      expect(result.isSome()).toBe(true);
      expect(result.unwrap().code).toBe('EXPIRED');
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
      const result = mockService.getById(1);
      expect(result.isOk()).toBe(true);
      expect(result.unwrap()).toEqual(mockTestData[0]);
    });

    it('should return localized entities', () => {
      const result = mockService.listAllLocalized('en');
      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({
        id: 1,
        code: 'TEST1',
        name: 'Test One',
      });
    });

    it('should handle entity not found', () => {
      const result = mockService.getById(999);
      expect(result.isErr()).toBe(true);
      expect(result.unwrapErr()).toBeInstanceOf(AppError);
    });

    it('should convert Result to Option for find methods', () => {
      const result = mockService.findById(1);
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
        id: 1,
        code: 'TEST1',
        name: 'Test One',
      });
    });

    it('should localize entity to French', () => {
      const testEntity = mockTestData[0];
      if (!testEntity) throw new Error('Test data is missing');

      const result = standardLocalize(testEntity, 'fr');
      expect(result).toEqual({
        id: 1,
        code: 'TEST1',
        name: 'Test Un',
      });
    });
  });

  describe('Mock-based service expiry filtering', () => {
    // Test date constants for consistency and maintainability
    const PAST_DATE = '2020-01-01T00:00:00.000Z';
    const FUTURE_DATE = '2099-12-31T23:59:59.999Z';

    const mockDataWithExpiry: TestEntity[] = [
      { id: 1, code: 'ACTIVE', nameEn: 'Active Item', nameFr: 'Article Actif', expiryDate: null },
      { id: 2, code: 'EXPIRED', nameEn: 'Expired Item', nameFr: 'Article Expiré', expiryDate: PAST_DATE },
      { id: 3, code: 'FUTURE', nameEn: 'Future Expiry', nameFr: 'Expiration Future', expiryDate: FUTURE_DATE },
      { id: 4, code: 'NO_EXPIRY', nameEn: 'No Expiry Set', nameFr: 'Sans Expiration' },
    ];

    let mockService: MockLookupServiceImplementation<TestEntity, LocalizedLookupModel>;

    beforeEach(() => {
      mockService = createMockLookupService<TestEntity>(mockDataWithExpiry, 'test entity', ErrorCodes.NO_PROVINCE_FOUND);
    });

    it('should filter out expired entities in listAll', () => {
      const result = mockService.listAll();

      expect(result).toHaveLength(3);
      expect(result.map((e) => e.code)).toEqual(['ACTIVE', 'FUTURE', 'NO_EXPIRY']);
      expect(result.find((e) => e.code === 'EXPIRED')).toBeUndefined();
    });

    it('should filter out expired entities in listAllLocalized', () => {
      const result = mockService.listAllLocalized('en');

      expect(result).toHaveLength(3);
      expect(result.map((e) => e.code)).toEqual(['ACTIVE', 'FUTURE', 'NO_EXPIRY']);
      expect(result.find((e) => e.code === 'EXPIRED')).toBeUndefined();
    });

    it('should still allow getById to retrieve expired entities', () => {
      // getById should still work for expired items (for display purposes with existing data)
      const result = mockService.getById(2);

      expect(result.isOk()).toBe(true);
      expect(result.unwrap().code).toBe('EXPIRED');
    });

    it('should still allow findById to retrieve expired entities', () => {
      const result = mockService.findById(2);

      expect(result.isSome()).toBe(true);
      expect(result.unwrap().code).toBe('EXPIRED');
    });

    it('should still allow getLocalizedById to retrieve expired entities', () => {
      const result = mockService.getLocalizedById(2, 'en');

      expect(result.isOk()).toBe(true);
      expect(result.unwrap().code).toBe('EXPIRED');
    });

    it('should still allow findLocalizedById to retrieve expired entities', () => {
      const result = mockService.findLocalizedById(2, 'en');

      expect(result.isSome()).toBe(true);
      expect(result.unwrap().code).toBe('EXPIRED');
    });

    it('should return empty list when all entities are expired', () => {
      const allExpiredData: TestEntity[] = [
        { id: 1, code: 'EXPIRED1', nameEn: 'Expired 1', nameFr: 'Expiré 1', expiryDate: PAST_DATE },
        { id: 2, code: 'EXPIRED2', nameEn: 'Expired 2', nameFr: 'Expiré 2', expiryDate: '2021-06-15T12:00:00.000Z' },
      ];
      const allExpiredService = createMockLookupService<TestEntity>(
        allExpiredData,
        'test entity',
        ErrorCodes.NO_PROVINCE_FOUND,
      );

      const result = allExpiredService.listAll();

      expect(result).toHaveLength(0);
    });

    it('should return all items when none are expired', () => {
      const noExpiredData: TestEntity[] = [
        { id: 1, code: 'ACTIVE1', nameEn: 'Active 1', nameFr: 'Actif 1' },
        { id: 2, code: 'ACTIVE2', nameEn: 'Active 2', nameFr: 'Actif 2', expiryDate: null },
        { id: 3, code: 'ACTIVE3', nameEn: 'Active 3', nameFr: 'Actif 3', expiryDate: FUTURE_DATE },
      ];
      const noExpiredService = createMockLookupService<TestEntity>(noExpiredData, 'test entity', ErrorCodes.NO_PROVINCE_FOUND);

      const result = noExpiredService.listAll();

      expect(result).toHaveLength(3);
    });
  });
});
