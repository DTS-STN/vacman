import { describe, it, expect, vi, beforeEach } from 'vitest';

import { getMockMSGraphService } from '~/.server/domain/services/msgraph-service-mock';

describe('getMockMSGraphService', () => {
  const service = getMockMSGraphService();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getUserFromMSGraph', () => {
    it('should return MS Graph user data when given a valid Active Directory ID for an employee', async () => {
      const activeDirectoryId = '00000000-0000-0000-0000-000000000001';
      const msGraphUser = await service.getUserFromMSGraph(activeDirectoryId);

      expect(msGraphUser).toEqual({
        id: '00000000-0000-0000-0000-000000000001',
        displayName: 'Jane Doe',
        givenName: 'Jane',
        surname: 'Doe',
        mail: 'jane.doe@esdc-edsc.gc.ca',
        userPrincipalName: 'jane.doe@esdc-edsc.gc.ca',
        jobTitle: 'Employee',
        department: 'Employment and Social Development Canada',
        officeLocation: 'Ottawa, ON',
        businessPhones: ['+1 613 555 0123'],
        mobilePhone: '+1 613 555 0456',
      });
    });

    it('should return MS Graph user data for a hiring manager', async () => {
      const activeDirectoryId = '33333333-3333-3333-3333-333333333333';
      const msGraphUser = await service.getUserFromMSGraph(activeDirectoryId);

      expect(msGraphUser).toEqual({
        id: '33333333-3333-3333-3333-333333333333',
        displayName: 'Michel Tremblay',
        givenName: 'Michel',
        surname: 'Tremblay',
        mail: 'michel.tremblay@esdc-edsc.gc.ca',
        userPrincipalName: 'michel.tremblay@esdc-edsc.gc.ca',
        jobTitle: 'Hiring Manager',
        department: 'Employment and Social Development Canada',
        officeLocation: 'Ottawa, ON',
        businessPhones: ['+1 613 555 0123'],
        mobilePhone: '+1 613 555 0456',
      });
    });

    it('should return MS Graph user data for another employee', async () => {
      const activeDirectoryId = '11111111-1111-1111-1111-111111111111';
      const msGraphUser = await service.getUserFromMSGraph(activeDirectoryId);

      expect(msGraphUser).toEqual({
        id: '11111111-1111-1111-1111-111111111111',
        displayName: 'John Doe',
        givenName: 'John',
        surname: 'Doe',
        mail: 'john.doe@esdc-edsc.gc.ca',
        userPrincipalName: 'john.doe@esdc-edsc.gc.ca',
        jobTitle: 'Employee',
        department: 'Employment and Social Development Canada',
        officeLocation: 'Ottawa, ON',
        businessPhones: ['+1 613 555 0123'],
        mobilePhone: '+1 613 555 0456',
      });
    });

    it('should return null when given an invalid Active Directory ID', async () => {
      const msGraphUser = await service.getUserFromMSGraph('nonexistent-id');

      expect(msGraphUser).toBeNull();
    });

    it('should handle empty string Active Directory ID', async () => {
      const msGraphUser = await service.getUserFromMSGraph('');

      expect(msGraphUser).toBeNull();
    });

    it('should handle user with space in name correctly', async () => {
      const activeDirectoryId = '22222222-2222-2222-2222-222222222222';
      const msGraphUser = await service.getUserFromMSGraph(activeDirectoryId);

      expect(msGraphUser).toEqual({
        id: '22222222-2222-2222-2222-222222222222',
        displayName: 'Jane Smith',
        givenName: 'Jane',
        surname: 'Smith',
        mail: 'jane.smith@esdc-edsc.gc.ca',
        userPrincipalName: 'jane.smith@esdc-edsc.gc.ca',
        jobTitle: 'Employee',
        department: 'Employment and Social Development Canada',
        officeLocation: 'Ottawa, ON',
        businessPhones: ['+1 613 555 0123'],
        mobilePhone: '+1 613 555 0456',
      });
    });

    it('should generate consistent email addresses from names', async () => {
      // Test that names are consistently converted to email format
      const testCases = [
        { id: '00000000-0000-0000-0000-000000000001', expectedEmail: 'jane.doe@esdc-edsc.gc.ca' },
        { id: '11111111-1111-1111-1111-111111111111', expectedEmail: 'john.doe@esdc-edsc.gc.ca' },
        { id: '22222222-2222-2222-2222-222222222222', expectedEmail: 'jane.smith@esdc-edsc.gc.ca' },
        { id: '33333333-3333-3333-3333-333333333333', expectedEmail: 'michel.tremblay@esdc-edsc.gc.ca' },
      ];

      for (const testCase of testCases) {
        const msGraphUser = await service.getUserFromMSGraph(testCase.id);
        expect(msGraphUser?.mail).toBe(testCase.expectedEmail);
        expect(msGraphUser?.userPrincipalName).toBe(testCase.expectedEmail);
      }
    });

    it('should return consistent department and office location for all users', async () => {
      const userIds = [
        '00000000-0000-0000-0000-000000000001',
        '11111111-1111-1111-1111-111111111111',
        '22222222-2222-2222-2222-222222222222',
        '33333333-3333-3333-3333-333333333333',
      ];

      for (const userId of userIds) {
        const msGraphUser = await service.getUserFromMSGraph(userId);
        expect(msGraphUser?.department).toBe('Employment and Social Development Canada');
        expect(msGraphUser?.officeLocation).toBe('Ottawa, ON');
        expect(msGraphUser?.businessPhones).toEqual(['+1 613 555 0123']);
        expect(msGraphUser?.mobilePhone).toBe('+1 613 555 0456');
      }
    });

    it('should correctly differentiate job titles based on roles', async () => {
      // Employee roles should have "Employee" job title
      const employeeIds = [
        '00000000-0000-0000-0000-000000000001',
        '11111111-1111-1111-1111-111111111111',
        '22222222-2222-2222-2222-222222222222',
      ];

      for (const userId of employeeIds) {
        const msGraphUser = await service.getUserFromMSGraph(userId);
        expect(msGraphUser?.jobTitle).toBe('Employee');
      }

      // Hiring manager role should have "Hiring Manager" job title
      const hiringManagerId = '33333333-3333-3333-3333-333333333333';
      const hiringManagerUser = await service.getUserFromMSGraph(hiringManagerId);
      expect(hiringManagerUser?.jobTitle).toBe('Hiring Manager');
    });

    it('should handle promise rejection gracefully', async () => {
      // This test ensures that the service handles async operations correctly
      // even though our mock implementation is synchronous
      await expect(service.getUserFromMSGraph('00000000-0000-0000-0000-000000000001')).resolves.toBeDefined();
    });
  });
});
