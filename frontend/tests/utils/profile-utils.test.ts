import { describe, expect, it } from 'vitest';

import type { Profile } from '~/.server/domain/models';
import { mapProfileToPutModel, mapProfileToPutModelWithOverrides } from '~/.server/utils/profile-utils';

describe('profile-utils', () => {
  const mockProfile: Profile = {
    id: 1,
    hasConsentedToPrivacyTerms: false,
    hrAdvisorId: 2,
    isAvailableForReferral: true,
    isInterestedInAlternation: false,
    personalEmailAddress: 'test@example.com',
    personalPhoneNumber: '555-123-4567',
    languageOfCorrespondence: { id: 1, code: 'EN', nameEn: 'English', nameFr: 'Anglais' },
    profileStatus: { id: 1, code: 'ACTIVE', nameEn: 'Active', nameFr: 'Actif' },
    profileUser: {
      id: 1,
      firstName: 'John',
      lastName: 'Doe',
      businessEmailAddress: 'john.doe@example.com',
      language: { id: 1, code: 'EN', nameEn: 'English', nameFr: 'Anglais' },
      userType: { id: 1, code: 'EMPLOYEE', nameEn: 'Employee', nameFr: 'Employé' },
    },
    substantiveCity: {
      id: 10,
      code: 'OTT',
      nameEn: 'Ottawa',
      nameFr: 'Ottawa',
      provinceTerritory: { id: 1, code: 'ON', nameEn: 'Ontario', nameFr: 'Ontario' },
    },
    substantiveClassification: { id: 5, code: 'CS-01', nameEn: 'Computer Systems 01', nameFr: 'Systèmes informatiques 01' },
    substantiveWorkUnit: {
      id: 3,
      code: 'DTS',
      nameEn: 'Digital Technology Solutions',
      nameFr: 'Solutions technologiques numériques',
      parent: null,
    },
    wfaStatus: { id: 1, code: 'ACTIVE', nameEn: 'Active', nameFr: 'Actif' },
    wfaStartDate: '2024-01-01T00:00:00Z',
    wfaEndDate: '2024-12-31T23:59:59Z',
    preferredCities: [
      {
        id: 10,
        code: 'OTT',
        nameEn: 'Ottawa',
        nameFr: 'Ottawa',
        provinceTerritory: { id: 1, code: 'ON', nameEn: 'Ontario', nameFr: 'Ontario' },
      },
      {
        id: 20,
        code: 'TOR',
        nameEn: 'Toronto',
        nameFr: 'Toronto',
        provinceTerritory: { id: 1, code: 'ON', nameEn: 'Ontario', nameFr: 'Ontario' },
      },
    ],
    preferredClassifications: [
      { id: 5, code: 'CS-01', nameEn: 'Computer Systems 01', nameFr: 'Systèmes informatiques 01' },
      { id: 6, code: 'CS-02', nameEn: 'Computer Systems 02', nameFr: 'Systèmes informatiques 02' },
    ],
    preferredEmploymentOpportunities: [
      { id: 1, code: 'TERM', nameEn: 'Term', nameFr: 'Durée déterminée' },
      { id: 2, code: 'INDETERMINATE', nameEn: 'Indeterminate', nameFr: 'Durée indéterminée' },
    ],
    preferredLanguages: [
      { id: 1, code: 'EN', nameEn: 'English', nameFr: 'Anglais' },
      { id: 2, code: 'FR', nameEn: 'French', nameFr: 'Français' },
    ],
    createdBy: 'system',
    createdDate: '2024-01-01T00:00:00Z',
    lastModifiedBy: 'system',
    lastModifiedDate: '2024-01-01T00:00:00Z',
  };

  describe('mapProfileToPutModel', () => {
    it('should map all profile fields to put model format', () => {
      const result = mapProfileToPutModel(mockProfile);

      expect(result).toEqual({
        cityId: 10,
        classificationId: 5,
        hasConsentedToPrivacyTerms: false,
        hrAdvisorId: 2,
        isAvailableForReferral: true,
        isInterestedInAlternation: false,
        languageOfCorrespondenceId: 1,
        personalEmailAddress: 'test@example.com',
        personalPhoneNumber: '555-123-4567',
        preferredCities: [10, 20],
        preferredClassification: [5, 6],
        preferredEmploymentOpportunities: [1, 2],
        preferredLanguages: [1, 2],
        wfaEndDate: '2024-12-31T23:59:59Z',
        wfaStartDate: '2024-01-01T00:00:00Z',
        wfaStatusId: 1,
        workUnitId: 3,
      });
    });

    it('should handle missing optional fields gracefully', () => {
      const minimalProfile: Profile = {
        id: 1,
        profileUser: {
          id: 1,
          firstName: 'John',
          lastName: 'Doe',
          businessEmailAddress: 'john.doe@example.com',
          language: { id: 1, code: 'EN', nameEn: 'English', nameFr: 'Anglais' },
          userType: { id: 1, code: 'EMPLOYEE', nameEn: 'Employee', nameFr: 'Employé' },
        },
      };

      const result = mapProfileToPutModel(minimalProfile);

      expect(result).toEqual({
        cityId: undefined,
        classificationId: undefined,
        hasConsentedToPrivacyTerms: undefined,
        hrAdvisorId: undefined,
        isAvailableForReferral: undefined,
        isInterestedInAlternation: undefined,
        languageOfCorrespondenceId: undefined,
        personalEmailAddress: undefined,
        personalPhoneNumber: undefined,
        preferredCities: undefined,
        preferredClassification: undefined,
        preferredEmploymentOpportunities: undefined,
        preferredLanguages: undefined,
        wfaEndDate: undefined,
        wfaStartDate: undefined,
        wfaStatusId: undefined,
        workUnitId: undefined,
      });
    });

    it('should handle empty arrays correctly', () => {
      const profileWithEmptyArrays: Profile = {
        ...mockProfile,
        preferredCities: [],
        preferredClassifications: [],
        preferredEmploymentOpportunities: [],
        preferredLanguages: [],
      };

      const result = mapProfileToPutModel(profileWithEmptyArrays);

      expect(result.preferredCities).toEqual([]);
      expect(result.preferredClassification).toEqual([]);
      expect(result.preferredEmploymentOpportunities).toEqual([]);
      expect(result.preferredLanguages).toEqual([]);
    });
  });

  describe('mapProfileToPutModelWithOverrides', () => {
    it('should preserve all existing values and apply overrides', () => {
      const overrides = {
        hasConsentedToPrivacyTerms: true,
        personalEmailAddress: 'updated@example.com',
      };

      const result = mapProfileToPutModelWithOverrides(mockProfile, overrides);

      expect(result).toEqual({
        cityId: 10,
        classificationId: 5,
        hasConsentedToPrivacyTerms: true, // overridden
        hrAdvisorId: 2,
        isAvailableForReferral: true,
        isInterestedInAlternation: false,
        languageOfCorrespondenceId: 1,
        personalEmailAddress: 'updated@example.com', // overridden
        personalPhoneNumber: '555-123-4567',
        preferredCities: [10, 20],
        preferredClassification: [5, 6],
        preferredEmploymentOpportunities: [1, 2],
        preferredLanguages: [1, 2],
        wfaEndDate: '2024-12-31T23:59:59Z',
        wfaStartDate: '2024-01-01T00:00:00Z',
        wfaStatusId: 1,
        workUnitId: 3,
      });
    });

    it('should work with empty overrides', () => {
      const result = mapProfileToPutModelWithOverrides(mockProfile, {});
      const expectedResult = mapProfileToPutModel(mockProfile);

      expect(result).toEqual(expectedResult);
    });

    it('should handle array overrides correctly', () => {
      const overrides = {
        preferredCities: [30, 40], // Different city IDs
        preferredClassification: [7], // Different classification ID
      };

      const result = mapProfileToPutModelWithOverrides(mockProfile, overrides);

      expect(result.preferredCities).toEqual([30, 40]);
      expect(result.preferredClassification).toEqual([7]);
      // Other fields should remain unchanged
      expect(result.preferredEmploymentOpportunities).toEqual([1, 2]);
      expect(result.preferredLanguages).toEqual([1, 2]);
    });
  });
});
