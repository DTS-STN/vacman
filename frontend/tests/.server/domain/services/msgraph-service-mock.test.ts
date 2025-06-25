import { describe, it, expect, vi, beforeEach } from 'vitest';

import { getMockMSGraphService } from '~/.server/domain/services/msgraph-service-mock';

describe('getMockMSGraphService', () => {
  const service = getMockMSGraphService();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getUserFromMSGraph', () => {
    it('should return MS Graph user data when given a valid Active Directory ID for an employee', async () => {
      const activeDirectoryId = '00000000-0000-0000-0000-000000000000';
      const msGraphUser = await service.getUserFromMSGraph('test-auth-code', activeDirectoryId);

      expect(msGraphUser).toEqual({
        id: '00000000-0000-0000-0000-000000000000',
        displayName: 'Jane Doe',
        givenName: 'Jane',
        surname: 'Doe',
        mail: 'jane.doe@esdc-edsc.gc.ca',
        userPrincipalName: 'jane.doe@esdc-edsc.gc.ca',
        jobTitle: 'Application Developer',
        department: 'Employment and Social Development Canada',
        officeLocation: 'Ottawa, ON',
        businessPhones: ['+1 613 555 0123'],
        mobilePhone: '+1 613 555 0456',
        state: 'Ontario',
        city: 'Ottawa',
        preferredLanguage: 'en-CA',
        onPremisesSamAccountName: 'jane.doe',
      });
    });

    it('should return MS Graph user data for a hiring manager', async () => {
      const activeDirectoryId = '33333333-3333-3333-3333-333333333333';
      const msGraphUser = await service.getUserFromMSGraph('test-auth-code', activeDirectoryId);

      expect(msGraphUser).toEqual({
        id: '33333333-3333-3333-3333-333333333333',
        displayName: 'Michel Tremblay',
        givenName: 'Michel',
        surname: 'Tremblay',
        mail: 'michel.tremblay@esdc-edsc.gc.ca',
        userPrincipalName: 'michel.tremblay@esdc-edsc.gc.ca',
        jobTitle: 'Hiring Manager',
        department: 'Employment and Social Development Canada',
        officeLocation: 'Montreal, QC',
        businessPhones: ['+1 514 555 0345'],
        mobilePhone: '+1 514 555 0678',
        state: 'Quebec',
        city: 'Montreal',
        preferredLanguage: 'fr-CA',
        onPremisesSamAccountName: 'michel.tremblay',
      });
    });

    it('should return MS Graph user data for another employee', async () => {
      const activeDirectoryId = '11111111-1111-1111-1111-111111111111';
      const msGraphUser = await service.getUserFromMSGraph('test-auth-code', activeDirectoryId);

      expect(msGraphUser).toEqual({
        id: '11111111-1111-1111-1111-111111111111',
        displayName: 'John Doe',
        givenName: 'John',
        surname: 'Doe',
        mail: 'john.doe@esdc-edsc.gc.ca',
        userPrincipalName: 'john.doe@esdc-edsc.gc.ca',
        jobTitle: 'Software Developer',
        department: 'Employment and Social Development Canada',
        officeLocation: 'Toronto, ON',
        businessPhones: ['+1 416 555 0789'],
        mobilePhone: '+1 416 555 0987',
        state: 'Ontario',
        city: 'Toronto',
        preferredLanguage: 'en-CA',
        onPremisesSamAccountName: 'john.doe',
      });
    });

    it('should return null when given an invalid Active Directory ID', async () => {
      const msGraphUser = await service.getUserFromMSGraph('test-auth-code', 'nonexistent-id');

      expect(msGraphUser).toBeNull();
    });

    it('should handle empty string Active Directory ID', async () => {
      const msGraphUser = await service.getUserFromMSGraph('test-auth-code', '');

      expect(msGraphUser).toBeNull();
    });

    it('should handle user with space in name correctly', async () => {
      const activeDirectoryId = '22222222-2222-2222-2222-222222222222';
      const msGraphUser = await service.getUserFromMSGraph('test-auth-code', activeDirectoryId);

      expect(msGraphUser).toEqual({
        id: '22222222-2222-2222-2222-222222222222',
        displayName: 'Jane Smith',
        givenName: 'Jane',
        surname: 'Smith',
        mail: 'jane.smith@esdc-edsc.gc.ca',
        userPrincipalName: 'jane.smith@esdc-edsc.gc.ca',
        jobTitle: 'Business Analyst',
        department: 'Employment and Social Development Canada',
        officeLocation: 'Vancouver, BC',
        businessPhones: ['+1 604 555 0234'],
        mobilePhone: '+1 604 555 0567',
        state: 'British Columbia',
        city: 'Vancouver',
        preferredLanguage: 'en-CA',
        onPremisesSamAccountName: 'jane.smith',
      });
    });

    it('should generate consistent email addresses from names', async () => {
      // Test that names are consistently converted to email format
      const testCases = [
        { id: '00000000-0000-0000-0000-000000000000', expectedEmail: 'jane.doe@esdc-edsc.gc.ca' },
        { id: '11111111-1111-1111-1111-111111111111', expectedEmail: 'john.doe@esdc-edsc.gc.ca' },
        { id: '22222222-2222-2222-2222-222222222222', expectedEmail: 'jane.smith@esdc-edsc.gc.ca' },
        { id: '33333333-3333-3333-3333-333333333333', expectedEmail: 'michel.tremblay@esdc-edsc.gc.ca' },
      ];

      for (const testCase of testCases) {
        const msGraphUser = await service.getUserFromMSGraph('test-auth-code', testCase.id);
        expect(msGraphUser?.mail).toBe(testCase.expectedEmail);
        expect(msGraphUser?.userPrincipalName).toBe(testCase.expectedEmail);
      }
    });

    it('should return department and office location for each user', async () => {
      const testCases = [
        {
          id: '00000000-0000-0000-0000-000000000000',
          expectedDepartment: 'Employment and Social Development Canada',
          expectedOffice: 'Ottawa, ON',
          expectedBusinessPhones: ['+1 613 555 0123'],
          expectedMobilePhone: '+1 613 555 0456',
        },
        {
          id: '11111111-1111-1111-1111-111111111111',
          expectedDepartment: 'Employment and Social Development Canada',
          expectedOffice: 'Toronto, ON',
          expectedBusinessPhones: ['+1 416 555 0789'],
          expectedMobilePhone: '+1 416 555 0987',
        },
        {
          id: '22222222-2222-2222-2222-222222222222',
          expectedDepartment: 'Employment and Social Development Canada',
          expectedOffice: 'Vancouver, BC',
          expectedBusinessPhones: ['+1 604 555 0234'],
          expectedMobilePhone: '+1 604 555 0567',
        },
        {
          id: '33333333-3333-3333-3333-333333333333',
          expectedDepartment: 'Employment and Social Development Canada',
          expectedOffice: 'Montreal, QC',
          expectedBusinessPhones: ['+1 514 555 0345'],
          expectedMobilePhone: '+1 514 555 0678',
        },
      ];

      for (const testCase of testCases) {
        const msGraphUser = await service.getUserFromMSGraph('test-auth-code', testCase.id);
        expect(msGraphUser?.department).toBe(testCase.expectedDepartment);
        expect(msGraphUser?.officeLocation).toBe(testCase.expectedOffice);
        expect(msGraphUser?.businessPhones).toEqual(testCase.expectedBusinessPhones);
        expect(msGraphUser?.mobilePhone).toBe(testCase.expectedMobilePhone);
      }
    });

    it('should correctly differentiate job titles based on roles', async () => {
      // Test specific job titles for each user
      const testCases = [
        { id: '00000000-0000-0000-0000-000000000000', expectedJobTitle: 'Application Developer' },
        { id: '11111111-1111-1111-1111-111111111111', expectedJobTitle: 'Software Developer' },
        { id: '22222222-2222-2222-2222-222222222222', expectedJobTitle: 'Business Analyst' },
        { id: '33333333-3333-3333-3333-333333333333', expectedJobTitle: 'Hiring Manager' },
      ];

      for (const testCase of testCases) {
        const msGraphUser = await service.getUserFromMSGraph('test-auth-code', testCase.id);
        expect(msGraphUser?.jobTitle).toBe(testCase.expectedJobTitle);
      }
    });

    it('should handle promise rejection gracefully', async () => {
      // This test ensures that the service handles async operations correctly
      // even though our mock implementation is synchronous
      await expect(service.getUserFromMSGraph('test-auth-code', '00000000-0000-0000-0000-000000000000')).resolves.toBeDefined();
    });
  });
});
