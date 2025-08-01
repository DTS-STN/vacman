import { describe, expect, it } from 'vitest';

import { getMockEmploymentEquityService } from '~/.server/domain/services/employment-equity-service-mock';
import { AppError } from '~/errors/app-error';
import { ErrorCodes } from '~/errors/error-codes';

const service = getMockEmploymentEquityService();

describe('getMockEmploymentEquityService', () => {
  describe('listAll', () => {
    it('should return all mock employment equity data', async () => {
      const result = await service.listAll();
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);

      // Verify structure of returned employment equity codes
      const firstEmploymentEquity = result[0];
      expect(firstEmploymentEquity).toBeDefined();
      expect(firstEmploymentEquity).toHaveProperty('id');
      expect(firstEmploymentEquity).toHaveProperty('code');
      expect(firstEmploymentEquity).toHaveProperty('nameEn');
      expect(firstEmploymentEquity).toHaveProperty('nameFr');
    });

    it('should return consistent data on multiple calls', async () => {
      const result1 = await service.listAll();
      const result2 = await service.listAll();

      expect(result1).toEqual(result2);
      expect(result1.length).toBe(result2.length);
    });
  });

  describe('getById', () => {
    it('should return an employment equity by ID', async () => {
      const all = await service.listAll();
      expect(all.length).toBeGreaterThan(0);

      const first = all[0];
      if (!first) {
        throw new Error('Expected at least one employment equity in the list');
      }

      const result = await service.getById(first.id);

      expect(result.isOk()).toBe(true);
      expect(result.unwrap().id).toBe(first.id);
      expect(result.unwrap().code).toBe(first.code);
      expect(result.unwrap().nameEn).toBe(first.nameEn);
      expect(result.unwrap().nameFr).toBe(first.nameFr);
    });

    it('should return error if employment equity ID not found', async () => {
      const result = await service.getById(25);

      expect(result.isErr()).toBe(true);
      const err = result.unwrapErr();
      expect(err).toBeInstanceOf(AppError);
      expect(err.errorCode).toBe(ErrorCodes.NO_EMPLOYMENT_EQUITY_FOUND);
      expect(err.msg).toContain('not found');
    });

    it('should handle string ID conversion correctly', async () => {
      const all = await service.listAll();
      const testEmploymentEquity = all.find((eq) => eq.id === 1);

      if (testEmploymentEquity) {
        const result = await service.getById(1);
        expect(result.isOk()).toBe(true);
        expect(result.unwrap().id).toBe(1);
      }
    });
  });

  describe('getByCode', () => {
    it('should return an employment equity by code', async () => {
      const all = await service.listAll();
      expect(all.length).toBeGreaterThan(0);

      const first = all[0];
      if (!first) {
        throw new Error('Expected at least one employment equity in the list');
      }

      const result = await service.getByCode(first.code);

      expect(result.isOk()).toBe(true);
      expect(result.unwrap()).toEqual(first);
    });

    it('should return error if employment equity code not found', async () => {
      const result = await service.getByCode('NON_EXISTENT');

      expect(result.isErr()).toBe(true);
      const err = result.unwrapErr();
      expect(err).toBeInstanceOf(AppError);
      expect(err.errorCode).toBe(ErrorCodes.NO_EMPLOYMENT_EQUITY_FOUND);
      expect(err.msg).toContain('not found');
    });

    it('should work with known codes from test data', async () => {
      const result = await service.getByCode('WOMEN');

      expect(result.isOk()).toBe(true);
      if (result.isOk()) {
        const employmentEquity = result.unwrap();
        expect(employmentEquity.code).toBe('WOMEN');
        expect(employmentEquity.nameEn).toBe('Women');
        expect(employmentEquity.nameFr).toBe('Femmes');
      }
    });
  });

  describe('findById', () => {
    it('should find an employment equity by ID using Option', async () => {
      const all = await service.listAll();
      expect(all.length).toBeGreaterThan(0);

      const first = all[0];
      if (!first) {
        throw new Error('Expected at least one employment equity in the list');
      }

      const result = await service.findById(first.id);

      expect(result.isSome()).toBe(true);
      expect(result.unwrap()).toEqual(first);
    });

    it('should return None if employment equity ID not found', async () => {
      const result = await service.findById(25);

      expect(result.isNone()).toBe(true);
    });
  });

  describe('findByCode', () => {
    it('should find an employment equity by code using Option', async () => {
      const all = await service.listAll();
      expect(all.length).toBeGreaterThan(0);

      const first = all[0];
      if (!first) {
        throw new Error('Expected at least one employment equity in the list');
      }

      const result = await service.findByCode(first.code);

      expect(result.isSome()).toBe(true);
      expect(result.unwrap()).toEqual(first);
    });

    it('should return None if employment equity code not found', async () => {
      const result = await service.findByCode('NON_EXISTENT');

      expect(result.isNone()).toBe(true);
    });
  });

  describe('listAllLocalized', () => {
    it('should return localized employment equity in English', async () => {
      const result = await service.listAllLocalized('en');

      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);

      const first = result[0];
      if (!first) {
        throw new Error('Expected at least one localized employment equity in the list');
      }

      expect(first).toHaveProperty('id');
      expect(first).toHaveProperty('code');
      expect(first).toHaveProperty('name');

      // Verify English localization
      const originalData = await service.listAll();
      const originalFirst = originalData.find((eq) => eq.id === first.id);
      if (originalFirst) {
        expect(first.name).toBe(originalFirst.nameEn);
      }
    });

    it('should return localized employment equity in French', async () => {
      const result = await service.listAllLocalized('fr');

      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);

      const first = result[0];
      if (!first) {
        throw new Error('Expected at least one localized employment equity in the list');
      }

      expect(first).toHaveProperty('name');

      // Verify French localization
      const originalData = await service.listAll();
      const originalFirst = originalData.find((eq) => eq.id === first.id);
      if (originalFirst) {
        expect(first.name).toBe(originalFirst.nameFr);
      }
    });

    it('should return same number of items as listAll', async () => {
      const allEmploymentEquity = await service.listAll();
      const localizedEn = await service.listAllLocalized('en');
      const localizedFr = await service.listAllLocalized('fr');

      expect(localizedEn.length).toBe(allEmploymentEquity.length);
      expect(localizedFr.length).toBe(allEmploymentEquity.length);
    });
  });

  describe('getLocalizedById', () => {
    it('should return localized employment equity by ID in English', async () => {
      const all = await service.listAll();
      expect(all.length).toBeGreaterThan(0);

      const first = all[0];
      if (!first) {
        throw new Error('Expected at least one employment equity in the list');
      }

      const result = await service.getLocalizedById(first.id, 'en');

      expect(result.isOk()).toBe(true);
      if (result.isOk()) {
        const localized = result.unwrap();
        expect(localized.id).toBe(first.id);
        expect(localized.code).toBe(first.code);
        expect(localized.name).toBe(first.nameEn);
      }
    });

    it('should return localized employment equity by ID in French', async () => {
      const all = await service.listAll();
      expect(all.length).toBeGreaterThan(0);

      const first = all[0];
      if (!first) {
        throw new Error('Expected at least one employment equity in the list');
      }

      const result = await service.getLocalizedById(first.id, 'fr');

      expect(result.isOk()).toBe(true);
      if (result.isOk()) {
        const localized = result.unwrap();
        expect(localized.id).toBe(first.id);
        expect(localized.code).toBe(first.code);
        expect(localized.name).toBe(first.nameFr);
      }
    });

    it('should return error if employment equity ID not found', async () => {
      const result = await service.getLocalizedById(25, 'en');

      expect(result.isErr()).toBe(true);
      const err = result.unwrapErr();
      expect(err).toBeInstanceOf(AppError);
      expect(err.errorCode).toBe(ErrorCodes.NO_EMPLOYMENT_EQUITY_FOUND);
    });
  });

  describe('getLocalizedByCode', () => {
    it('should return localized employment equity by code in English', async () => {
      const result = await service.getLocalizedByCode('WOMEN', 'en');

      expect(result.isOk()).toBe(true);
      if (result.isOk()) {
        const localized = result.unwrap();
        expect(localized.code).toBe('WOMEN');
        expect(localized.name).toBe('Women');
      }
    });

    it('should return localized employment equity by code in French', async () => {
      const result = await service.getLocalizedByCode('WOMEN', 'fr');

      expect(result.isOk()).toBe(true);
      if (result.isOk()) {
        const localized = result.unwrap();
        expect(localized.code).toBe('WOMEN');
        expect(localized.name).toBe('Femmes');
      }
    });

    it('should return error if employment equity code not found', async () => {
      const result = await service.getLocalizedByCode('NON_EXISTENT', 'en');

      expect(result.isErr()).toBe(true);
      const err = result.unwrapErr();
      expect(err).toBeInstanceOf(AppError);
      expect(err.errorCode).toBe(ErrorCodes.NO_EMPLOYMENT_EQUITY_FOUND);
    });
  });

  describe('findLocalizedById', () => {
    it('should find localized employment equity by ID using Option', async () => {
      const all = await service.listAll();
      expect(all.length).toBeGreaterThan(0);

      const first = all[0];
      if (!first) {
        throw new Error('Expected at least one employment equity in the list');
      }

      const result = await service.findLocalizedById(first.id, 'en');

      expect(result.isSome()).toBe(true);
      if (result.isSome()) {
        const localized = result.unwrap();
        expect(localized.name).toBe(first.nameEn);
      }
    });

    it('should return None if employment equity ID not found', async () => {
      const result = await service.findLocalizedById(25, 'en');

      expect(result.isNone()).toBe(true);
    });

    it('should handle both English and French localization', async () => {
      const all = await service.listAll();
      expect(all.length).toBeGreaterThan(0);

      const first = all[0];
      if (!first) {
        throw new Error('Expected at least one employment equity in the list');
      }

      const resultEn = await service.findLocalizedById(first.id, 'en');
      const resultFr = await service.findLocalizedById(first.id, 'fr');

      expect(resultEn.isSome()).toBe(true);
      expect(resultFr.isSome()).toBe(true);

      if (resultEn.isSome() && resultFr.isSome()) {
        const localizedEn = resultEn.unwrap();
        const localizedFr = resultFr.unwrap();

        expect(localizedEn.name).toBe(first.nameEn);
        expect(localizedFr.name).toBe(first.nameFr);
      }
    });
  });

  describe('findLocalizedByCode', () => {
    it('should find localized employment equity by code using Option', async () => {
      const result = await service.findLocalizedByCode('WOMEN', 'en');

      expect(result.isSome()).toBe(true);
      if (result.isSome()) {
        const localized = result.unwrap();
        expect(localized.code).toBe('WOMEN');
        expect(localized.name).toBe('Women');
      }
    });

    it('should return None if employment equity code not found', async () => {
      const result = await service.findLocalizedByCode('NON_EXISTENT', 'en');

      expect(result.isNone()).toBe(true);
    });

    it('should handle both English and French localization', async () => {
      const resultEn = await service.findLocalizedByCode('WOMEN', 'en');
      const resultFr = await service.findLocalizedByCode('WOMEN', 'fr');

      expect(resultEn.isSome()).toBe(true);
      expect(resultFr.isSome()).toBe(true);

      if (resultEn.isSome() && resultFr.isSome()) {
        const localizedEn = resultEn.unwrap();
        const localizedFr = resultFr.unwrap();

        expect(localizedEn.name).toBe('Women');
        expect(localizedFr.name).toBe('Femmes');
      }
    });
  });

  describe('error handling consistency', () => {
    it('should use consistent error codes for not found scenarios', async () => {
      const getByIdResult = await service.getById(25);
      const getByCodeResult = await service.getByCode('NON_EXISTENT');
      const getLocalizedByIdResult = await service.getLocalizedById(25, 'en');
      const getLocalizedByCodeResult = await service.getLocalizedByCode('NON_EXISTENT', 'en');

      expect(getByIdResult.isErr()).toBe(true);
      expect(getByCodeResult.isErr()).toBe(true);
      expect(getLocalizedByIdResult.isErr()).toBe(true);
      expect(getLocalizedByCodeResult.isErr()).toBe(true);

      if (
        getByIdResult.isErr() &&
        getByCodeResult.isErr() &&
        getLocalizedByIdResult.isErr() &&
        getLocalizedByCodeResult.isErr()
      ) {
        expect(getByIdResult.unwrapErr().errorCode).toBe(ErrorCodes.NO_EMPLOYMENT_EQUITY_FOUND);
        expect(getByCodeResult.unwrapErr().errorCode).toBe(ErrorCodes.NO_EMPLOYMENT_EQUITY_FOUND);
        expect(getLocalizedByIdResult.unwrapErr().errorCode).toBe(ErrorCodes.NO_EMPLOYMENT_EQUITY_FOUND);
        expect(getLocalizedByCodeResult.unwrapErr().errorCode).toBe(ErrorCodes.NO_EMPLOYMENT_EQUITY_FOUND);
      }
    });
  });

  describe('data integrity', () => {
    it('should maintain data consistency across different methods', async () => {
      const all = await service.listAll();
      expect(all.length).toBeGreaterThan(0);

      const first = all[0];
      if (!first) {
        throw new Error('Expected at least one employment equity in the list');
      }

      const getByIdResult = await service.getById(first.id);
      const getByCodeResult = await service.getByCode(first.code);
      const findByIdResult = await service.findById(first.id);
      const findByCodeResult = await service.findByCode(first.code);

      expect(getByIdResult.isOk()).toBe(true);
      expect(getByCodeResult.isOk()).toBe(true);
      expect(findByIdResult.isSome()).toBe(true);
      expect(findByCodeResult.isSome()).toBe(true);

      if (getByIdResult.isOk() && getByCodeResult.isOk() && findByIdResult.isSome() && findByCodeResult.isSome()) {
        const employmentEquity1 = getByIdResult.unwrap();
        const employmentEquity2 = getByCodeResult.unwrap();
        const employmentEquity3 = findByIdResult.unwrap();
        const employmentEquity4 = findByCodeResult.unwrap();

        expect(employmentEquity1).toEqual(employmentEquity2);
        expect(employmentEquity2).toEqual(employmentEquity3);
        expect(employmentEquity3).toEqual(employmentEquity4);
      }
    });

    it('should maintain localization consistency', async () => {
      const all = await service.listAll();
      expect(all.length).toBeGreaterThan(0);

      const first = all[0];
      if (!first) {
        throw new Error('Expected at least one employment equity in the list');
      }

      const localizedEnById = await service.getLocalizedById(first.id, 'en');
      const localizedEnByCode = await service.getLocalizedByCode(first.code, 'en');
      const localizedFrById = await service.getLocalizedById(first.id, 'fr');
      const localizedFrByCode = await service.getLocalizedByCode(first.code, 'fr');

      expect(localizedEnById.isOk()).toBe(true);
      expect(localizedEnByCode.isOk()).toBe(true);
      expect(localizedFrById.isOk()).toBe(true);
      expect(localizedFrByCode.isOk()).toBe(true);

      if (localizedEnById.isOk() && localizedEnByCode.isOk() && localizedFrById.isOk() && localizedFrByCode.isOk()) {
        const enById = localizedEnById.unwrap();
        const enByCode = localizedEnByCode.unwrap();
        const frById = localizedFrById.unwrap();
        const frByCode = localizedFrByCode.unwrap();

        expect(enById).toEqual(enByCode);
        expect(frById).toEqual(frByCode);
        expect(enById.name).toBe(first.nameEn);
        expect(frById.name).toBe(first.nameFr);
      }
    });
  });
});
