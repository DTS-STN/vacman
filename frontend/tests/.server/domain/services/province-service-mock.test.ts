import { describe, it, expect } from 'vitest';

import { getMockProvinceService } from '~/.server/domain/services/province-service-mock';
import provincesData from '~/.server/resources/provinces.json';

describe('getMockProvince', () => {
  it('should return the mock provinces data', async () => {
    const service = getMockProvinceService();
    const result = await service.listAll();

    const expected = provincesData.content.map((province) => ({
      id: province.id,
      code: province.code,
      nameEn: province.nameEn,
      nameFr: province.nameFr,
    }));

    expect(result).toEqual(expected);
  });
});
