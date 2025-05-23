import { describe, it, expect } from 'vitest';

import { getMockProvince } from '~/.server/domain/services/province-service-mock';
import provincesData from '~/.server/resources/provinces.json';

describe('getMockProvince', () => {
  it('should return the mock provinces data', async () => {
    const service = getMockProvince();
    const provinces = await service.getProvinces();

    const expected = provincesData.content.map((province) => ({
      id: province.id,
      alphaCode: province.alphaCode,
      nameEn: province.nameEn,
      nameFr: province.nameFr,
    }));

    expect(provinces).toEqual(expected);
  });
});
