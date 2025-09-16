import type { Profile, RequestReadModel, User } from '~/.server/domain/models';
import {
  PREFERRED_LANGUAGE_ENGLISH,
  PREFERRED_LANGUAGE_FRENCH,
  PROFILE_STATUS_APPROVED,
  PROFILE_STATUS_INCOMPLETE,
  PROFILE_STATUS_PENDING,
  USER_TYPE_EMPLOYEE,
  USER_TYPE_HIRING_MANAGER,
  USER_TYPE_HR_ADVISOR,
} from '~/domain/constants';

/**
 * Mock user data for testing and development.
 */
const initialMockUsers: User[] = [
  {
    id: 1,
    businessEmailAddress: 'john.doe@canada.ca',
    businessPhoneNumber: '+1-613-555-0102',
    firstName: 'John',
    initial: 'M',
    lastName: 'Doe',
    middleName: 'Michael',
    microsoftEntraId: '11111111-1111-1111-1111-111111111111',
    personalRecordIdentifier: '987654321',
    language: PREFERRED_LANGUAGE_ENGLISH,
    userType: USER_TYPE_HR_ADVISOR,
    createdBy: 'system',
    createdDate: '2024-01-01T00:00:00Z',
    lastModifiedBy: 'system',
    lastModifiedDate: '2024-01-01T00:00:00Z',
  },
  {
    id: 2,
    businessEmailAddress: 'jane.doe@canada.ca',
    businessPhoneNumber: '+1-613-555-0101',
    firstName: 'Jane',
    initial: 'D',
    lastName: 'Doe',
    middleName: undefined,
    microsoftEntraId: '00000000-0000-0000-0000-000000000000',
    personalRecordIdentifier: '123456789',
    language: PREFERRED_LANGUAGE_ENGLISH,
    userType: USER_TYPE_EMPLOYEE,
    createdBy: 'system',
    createdDate: '2024-01-01T00:00:00Z',
    lastModifiedBy: 'system',
    lastModifiedDate: '2024-01-01T00:00:00Z',
  },
  {
    id: 3,
    businessEmailAddress: 'alice.smith@canada.ca',
    businessPhoneNumber: '+1-613-555-0103',
    firstName: 'Alice',
    initial: 'M',
    lastName: 'Smith',
    middleName: 'Marie',
    microsoftEntraId: '22222222-2222-2222-2222-222222222222',
    personalRecordIdentifier: '456789123',
    language: PREFERRED_LANGUAGE_FRENCH,
    userType: USER_TYPE_EMPLOYEE,
    createdBy: 'system',
    createdDate: '2024-02-15T00:00:00Z',
    lastModifiedBy: 'alice.smith',
    lastModifiedDate: '2024-03-20T00:00:00Z',
  },
  {
    id: 4,
    businessEmailAddress: 'bob.johnson@canada.ca',
    businessPhoneNumber: '+1-613-555-0104',
    firstName: 'Bob',
    initial: 'R',
    lastName: 'Johnson',
    middleName: 'Robert',
    microsoftEntraId: '33333333-3333-3333-3333-333333333333',
    personalRecordIdentifier: '789123456',
    language: PREFERRED_LANGUAGE_ENGLISH,
    userType: USER_TYPE_HIRING_MANAGER,
    createdBy: 'system',
    createdDate: '2024-03-10T00:00:00Z',
    lastModifiedBy: 'bob.johnson',
    lastModifiedDate: '2024-04-15T00:00:00Z',
  },
  {
    id: 5,
    businessEmailAddress: 'alex.tan@canada.ca',
    businessPhoneNumber: '+1-613-555-0105',
    firstName: 'Alex',
    initial: 'T',
    lastName: 'Tan',
    middleName: undefined,
    microsoftEntraId: '44444444-4444-4444-4444-444444444444',
    personalRecordIdentifier: '321654987',
    language: PREFERRED_LANGUAGE_ENGLISH,
    userType: USER_TYPE_HR_ADVISOR,
    createdBy: 'system',
    createdDate: '2024-04-20T11:45:00Z',
    lastModifiedBy: 'alex.tan',
    lastModifiedDate: '2024-05-01T10:00:00Z',
  },
  {
    id: 6,
    businessEmailAddress: 'sam.lee@canada.ca',
    businessPhoneNumber: '+1-613-555-0106',
    firstName: 'Sam',
    initial: 'L',
    lastName: 'Lee',
    middleName: undefined,
    microsoftEntraId: '55555555-5555-5555-5555-555555555555',
    personalRecordIdentifier: '111222333',
    language: PREFERRED_LANGUAGE_ENGLISH,
    userType: USER_TYPE_EMPLOYEE,
    createdBy: 'system',
    createdDate: '2024-06-01T08:00:00Z',
    lastModifiedBy: 'alex.tan',
    lastModifiedDate: '2024-05-01T10:00:00Z',
  },
  {
    id: 7,
    businessEmailAddress: 'linda.park@canada.ca',
    businessPhoneNumber: '+1-613-555-0107',
    firstName: 'Linda',
    initial: 'P',
    lastName: 'Park',
    middleName: undefined,
    microsoftEntraId: '66666666-6666-6666-6666-666666666666',
    personalRecordIdentifier: '444555666',
    language: PREFERRED_LANGUAGE_ENGLISH,
    userType: USER_TYPE_EMPLOYEE,
    createdBy: 'system',
    createdDate: '2024-06-02T09:00:00Z',
    lastModifiedBy: 'linda.park',
    lastModifiedDate: '2024-06-12T10:00:00Z',
  },
  {
    id: 8,
    businessEmailAddress: 'carlos.gomez@canada.ca',
    businessPhoneNumber: '+1-613-555-0108',
    firstName: 'Carlos',
    initial: 'G',
    lastName: 'Gomez',
    middleName: undefined,
    microsoftEntraId: '77777777-7777-7777-7777-777777777777',
    personalRecordIdentifier: '777888999',
    language: PREFERRED_LANGUAGE_ENGLISH,
    userType: USER_TYPE_EMPLOYEE,
    createdBy: 'system',
    createdDate: '2024-06-03T10:00:00Z',
    lastModifiedBy: 'carlos.gomez',
    lastModifiedDate: '2024-06-12T10:00:00Z',
  },
  {
    id: 9,
    businessEmailAddress: 'priya.singh@canada.ca',
    businessPhoneNumber: '+1-613-555-0109',
    firstName: 'Priya',
    initial: 'S',
    lastName: 'Singh',
    middleName: undefined,
    microsoftEntraId: '88888888-8888-8888-8888-888888888888',
    personalRecordIdentifier: '101112131',
    language: PREFERRED_LANGUAGE_ENGLISH,
    userType: USER_TYPE_EMPLOYEE,
    createdBy: 'system',
    createdDate: '2024-06-04T11:00:00Z',
    lastModifiedBy: 'carlos.gomez',
    lastModifiedDate: '2024-06-14T12:00:00Z',
  },
  {
    id: 10,
    businessEmailAddress: 'omar.ali@canada.ca',
    businessPhoneNumber: '+1-613-555-0110',
    firstName: 'Omar',
    initial: 'A',
    lastName: 'Ali',
    middleName: undefined,
    microsoftEntraId: '99999999-9999-9999-9999-999999999999',
    personalRecordIdentifier: '141516171',
    language: PREFERRED_LANGUAGE_ENGLISH,
    userType: USER_TYPE_EMPLOYEE,
    createdBy: 'system',
    createdDate: '2024-06-05T12:00:00Z',
    lastModifiedBy: 'omar.ali',
    lastModifiedDate: '2024-06-15T16:00:00Z',
  },
];

// Helper to get a fresh copy for test resets.
export function getInitialMockUsers(): User[] {
  return JSON.parse(JSON.stringify(initialMockUsers));
}

export const mockUsers: User[] = getInitialMockUsers();

/**
 * Mock profile data for testing and development.
 */
export function buildProfilesFromTemplates(): Profile[] {
  const profileTemplates = [
    {
      profileId: 1,
      userId: 1,
      data: {
        additionalComment: 'Looking for opportunities in software development.',
        hasConsentedToPrivacyTerms: false,
        hrAdvisorId: undefined,
        isAvailableForReferral: undefined,
        isInterestedInAlternation: undefined,
        personalEmailAddress: 'john.doe@example.com',
        personalPhoneNumber: '613-555-0001',
        languageOfCorrespondence: PREFERRED_LANGUAGE_ENGLISH,
        profileStatus: PROFILE_STATUS_INCOMPLETE,
        createdBy: 'system',
        createdDate: '2024-01-01T00:00:00Z',
        lastModifiedBy: undefined,
        lastModifiedDate: undefined,
      },
    },
    {
      profileId: 2,
      userId: 2,
      data: {
        additionalComment: undefined,
        hasConsentedToPrivacyTerms: false,
        hrAdvisorId: undefined,
        isAvailableForReferral: undefined,
        isInterestedInAlternation: undefined,
        personalEmailAddress: undefined,
        personalPhoneNumber: undefined,
        languageOfCorrespondence: undefined,
        profileStatus: PROFILE_STATUS_INCOMPLETE,
        createdBy: 'system',
        createdDate: '2024-01-01T00:00:00Z',
        lastModifiedBy: 'jane.doe',
        lastModifiedDate: '2024-01-15T10:30:00Z',
      },
    },
    {
      profileId: 3,
      userId: 3,
      data: {
        additionalComment: 'Interested in remote work.',
        hasConsentedToPrivacyTerms: true,
        hrAdvisorId: 1,
        isAvailableForReferral: false,
        isInterestedInAlternation: true,
        personalEmailAddress: 'alice.smith@example.com',
        personalPhoneNumber: '613-555-0001',
        languageOfCorrespondence: PREFERRED_LANGUAGE_ENGLISH,
        profileStatus: PROFILE_STATUS_PENDING,
        createdBy: 'system',
        createdDate: '2024-02-01T09:00:00Z',
        lastModifiedBy: 'john.smith',
        lastModifiedDate: '2024-02-10T14:00:00Z',
      },
    },
    {
      profileId: 4,
      userId: 4,
      data: {
        additionalComment: 'Fluent in French and English.',
        hasConsentedToPrivacyTerms: true,
        hrAdvisorId: 1,
        isAvailableForReferral: true,
        isInterestedInAlternation: false,
        personalEmailAddress: 'bob.johnson@example.com',
        personalPhoneNumber: '613-555-5555',
        languageOfCorrespondence: PREFERRED_LANGUAGE_FRENCH,
        profileStatus: PROFILE_STATUS_APPROVED,
        createdBy: 'system',
        createdDate: '2024-03-15T08:30:00Z',
        lastModifiedBy: 'john.smith',
        lastModifiedDate: '2024-02-10T14:00:00Z',
      },
    },
    {
      profileId: 5,
      userId: 5,
      data: {
        additionalComment: 'Open to contract roles.',
        hasConsentedToPrivacyTerms: true,
        hrAdvisorId: 5,
        isAvailableForReferral: true,
        isInterestedInAlternation: true,
        personalEmailAddress: 'alex.tan@example.com',
        personalPhoneNumber: '613-555-3333',
        languageOfCorrespondence: PREFERRED_LANGUAGE_ENGLISH,
        profileStatus: PROFILE_STATUS_APPROVED,
        createdBy: 'system',
        createdDate: '2024-04-20T11:45:00Z',
        lastModifiedBy: 'alex.tan',
        lastModifiedDate: '2024-05-01T10:00:00Z',
      },
    },
  ];
  function findUser(id: number): User | undefined {
    return mockUsers.find((u) => u.id === id);
  }

  return profileTemplates.map((template) => {
    const user = findUser(template.userId);
    if (!user) {
      throw new Error(`FATAL MOCK ERROR: User with ID ${template.userId} not found.`);
    }
    return {
      id: template.profileId,
      ...template.data,
      profileUser: user,
    };
  });
}

export const mockProfiles: Profile[] = buildProfilesFromTemplates();

/**
 * Method to generate the mock profiles array.
 * It maps over the templates, finds the corresponding user for each,
 * and combines them into a complete Profile object.
 */
export function createAndLinkNewMockProfile(accessToken: string): Profile {
  // Create a new, real User object.
  const newUserId = mockUsers.length > 0 ? Math.max(...mockUsers.map((u) => u.id)) + 1 : 1;
  const newUser: User = {
    id: newUserId,
    businessEmailAddress: `new.user.${newUserId}@example.ca`,
    firstName: 'Newly',
    lastName: 'Registered',
    initial: 'N',
    microsoftEntraId: accessToken,
    personalRecordIdentifier: String(Date.now()),
    language: PREFERRED_LANGUAGE_ENGLISH,
    userType: USER_TYPE_EMPLOYEE,
    createdBy: accessToken,
    createdDate: new Date().toISOString(),
    lastModifiedBy: accessToken,
    lastModifiedDate: new Date().toISOString(),
  };

  // Add the new user to the single source of truth.
  mockUsers.push(newUser);

  // Create the new profile that REFERENCES the new user.
  const newProfileId = mockProfiles.length > 0 ? Math.max(...mockProfiles.map((p) => p.id)) + 1 : 1;
  const newProfile: Profile = {
    id: newProfileId,
    profileStatus: PROFILE_STATUS_INCOMPLETE,
    additionalComment: 'Looking for opportunities in software development.',
    hasConsentedToPrivacyTerms: false,
    personalEmailAddress: 'personal.email@example.com',
    personalPhoneNumber: '613-938-0001',
    profileUser: newUser,
    createdBy: accessToken,
    createdDate: new Date().toISOString(),
    lastModifiedBy: accessToken,
    lastModifiedDate: new Date().toISOString(),
  };

  // Add the new profile to the single source of truth.
  mockProfiles.push(newProfile);

  return newProfile;
}

export const mockRequests: RequestReadModel[] = [
  {
    id: 1,
    selectionProcessNumber: '2024-001',
    workforceManagementApproved: true,
    priorityEntitlement: false,
    priorityEntitlementRationale: '',
    selectionProcessTypeId: 1,
    performedSameDuties: true,
    nonAdvertisedAppointmentId: 1,
    projectedStartDate: '2024-01-15',
    projectedEndDate: '2024-12-31',
    workScheduleId: 1,
    equityNeeded: true,
    employmentEquityIds: [1, 2],
    positionNumbers: ['123456'],
    classificationId: 1,
    englishTitle: 'Software Developer',
    frenchTitle: 'Développeur de logiciels',
    provinceId: 1,
    languageRequirementId: 1,
    englishLanguageProfile: 'CBC',
    frenchLanguageProfile: 'CBC',
    securityClearanceId: 1,
    englishStatementOfMerit: 'English statement of merit criteria',
    frenchStatementOfMerit: 'Critères de mérite en français',
    status: {
      id: 1,
      code: 'DRAFT',
      nameEn: 'Draft',
      nameFr: 'Brouillon',
    },
    createdBy: 'mock-user',
    createdDate: new Date().toISOString(),
    lastModifiedBy: 'mock-user',
    lastModifiedDate: new Date().toISOString(),
  },
];

export function createMockRequest(accessToken: string): RequestReadModel {
  const newId = Math.max(...mockRequests.map((r) => r.id), 0) + 1;

  return {
    id: newId,
    selectionProcessNumber: `2024-${newId.toString().padStart(3, '0')}`,
    workforceManagementApproved: false,
    priorityEntitlement: false,
    priorityEntitlementRationale: '',
    selectionProcessTypeId: 1,
    performedSameDuties: false,
    nonAdvertisedAppointmentId: 1,
    projectedStartDate: '2024-01-01',
    projectedEndDate: '2024-12-31',
    workScheduleId: 1,
    equityNeeded: false,
    employmentEquityIds: [],
    positionNumbers: ['TBD'],
    classificationId: 1,
    englishTitle: 'New Position',
    frenchTitle: 'Nouveau poste',
    provinceId: 1,
    languageRequirementId: 1,
    englishLanguageProfile: 'BBB',
    frenchLanguageProfile: 'BBB',
    securityClearanceId: 1,
    englishStatementOfMerit: 'To be determined',
    frenchStatementOfMerit: 'À déterminer',
    status: {
      id: 1,
      code: 'DRAFT',
      nameEn: 'Draft',
      nameFr: 'Brouillon',
    },
    createdBy: 'mock-user',
    createdDate: new Date().toISOString(),
    lastModifiedBy: 'mock-user',
    lastModifiedDate: new Date().toISOString(),
  };
}

export function createUserFromEmail(email: string): User {
  const timestamp = Date.now();
  const newUser = {
    id: Math.max(0, ...mockUsers.map((u) => u.id)) + 1,
    businessEmailAddress: email,
    businessPhoneNumber: '+1-613-555-' + String(timestamp).slice(-4),
    firstName: 'New',
    initial: 'U',
    lastName: 'User',
    middleName: undefined,
    microsoftEntraId: `mock-entra-${timestamp}`,
    personalRecordIdentifier: String(timestamp),
    language: {
      id: 1,
      code: 'EN',
      nameEn: 'English',
      nameFr: 'Anglais',
    },
    userType: {
      id: 2,
      code: 'EMPLOYEE',
      nameEn: 'Employee',
      nameFr: 'Employé',
    },
    createdBy: 'mock-system',
    createdDate: new Date().toISOString(),
    lastModifiedBy: 'mock-system',
    lastModifiedDate: new Date().toISOString(),
  };
  mockUsers.push(newUser);
  return newUser;
}
