import type { RequestEventType } from '~/domain/constants';

// Generic base types for all lookup models
export type LookupModel = Readonly<{
  id: number;
  code: string;
  nameEn: string;
  nameFr: string;
}>;

export type LocalizedLookupModel = Readonly<{
  id: number;
  code: string;
  name: string;
}>;

// Generic type for lookup models with parent relationships
export type HierarchicalLookupModel<TParent = LookupModel | null> = LookupModel &
  Readonly<{
    parent: TParent | null;
  }>;

export type LocalizedHierarchicalLookupModel<TParent = LocalizedLookupModel | null> = LocalizedLookupModel &
  Readonly<{
    parent: TParent | null;
  }>;

// Type aliases for specific lookup types (for better developer experience)
export type Branch = LookupModel;
export type LocalizedBranch = LocalizedLookupModel;

// City types need special handling to maintain 'province' property name for backward compatibility
export type City = LookupModel &
  Readonly<{
    provinceTerritory: Province;
  }>;

export type LocalizedCity = LocalizedLookupModel &
  Readonly<{
    provinceTerritory: LocalizedProvince;
  }>;

export type Classification = LookupModel;
export type LocalizedClassification = LocalizedLookupModel;

export type WFAStatus = LookupModel;
export type LocalizedWFAStatus = LocalizedLookupModel;

export type EmploymentTenure = LookupModel;
export type LocalizedEmploymentTenure = LocalizedLookupModel;

export type EmploymentOpportunityType = LookupModel;
export type LocalizedEmploymentOpportunityType = LocalizedLookupModel;

export type Province = LookupModel;
export type LocalizedProvince = LocalizedLookupModel;

export type LanguageReferralType = LookupModel;
export type LocalizedLanguageReferralType = LocalizedLookupModel;

export type LanguageRequirement = LookupModel;
export type LocalizedLanguageRequirement = LocalizedLookupModel;

export type NonAdvertisedAppointment = LookupModel;
export type LocalizedNonAdvertisedAppointment = LocalizedLookupModel;

export type LanguageOfCorrespondence = LookupModel;
export type LocalizedLanguageOfCorrespondence = LocalizedLookupModel;

export type ProfileStatus = LookupModel;
export type LocalizedProfileStatus = LocalizedLookupModel;

export type RequestStatus = LookupModel;
export type LocalizedRequestStatus = LocalizedLookupModel;

export type RequestStatusUpdate = Readonly<{
  eventType: RequestEventType;
}>;

export type SecurityClearance = LookupModel;
export type LocalizedSecurityClearance = LocalizedLookupModel;

export type SelectionProcessType = LookupModel;
export type LocalizedSelectionProcessType = LocalizedLookupModel;

export type UserType = LookupModel;
export type LocalizedUserType = LocalizedLookupModel;

export type WorkSchedule = LookupModel;
export type LocalizedWorkSchedule = LocalizedLookupModel;

export type EmploymentEquity = LookupModel;
export type LocalizedEmploymentEquity = LocalizedLookupModel;

export type MatchFeedback = LookupModel;
export type LocalizedMatchFeedback = LocalizedLookupModel;

export type MatchStatus = LookupModel;
export type LocalizedMatchStatus = LocalizedLookupModel;

export type WorkUnit = HierarchicalLookupModel;
export type LocalizedWorkUnit = LocalizedHierarchicalLookupModel;

// User Models - Based on OpenAPI User schema
export type User = Readonly<{
  id: number;
  businessEmailAddress?: string;
  businessPhoneNumber?: string;
  firstName?: string;
  initial?: string;
  lastName?: string;
  middleName?: string;
  microsoftEntraId?: string;
  personalRecordIdentifier?: string;
  language: LanguageOfCorrespondence;
  userType?: UserType;
  createdBy?: string;
  createdDate?: string;
  lastModifiedBy?: string;
  lastModifiedDate?: string;
}>;

export type UserCreate = Readonly<{
  languageId: number;
}>;

export type UserUpdate = Readonly<{
  businessEmail?: string;
  businessPhone?: string;
  firstName?: string;
  initials?: string;
  languageId: number;
  lastName?: string;
  middleName?: string;
  personalRecordIdentifier?: string;
}>;

// User Response Models
export type PagedUserResponse = Readonly<{
  content: User[];
  page: PageMetadata;
}>;

export type PageMetadata = Readonly<{
  number: number;
  size: number;
  totalElements: number;
  totalPages: number;
}>;

// Profile Models - Based on OpenAPI ProfileReadModel schema
export type Profile = Readonly<{
  id: number;
  hasConsentedToPrivacyTerms?: boolean;
  hrAdvisorId?: number;
  isAvailableForReferral?: boolean;
  isInterestedInAlternation?: boolean;
  personalEmailAddress?: string;
  personalPhoneNumber?: string;
  languageOfCorrespondence?: LanguageOfCorrespondence;
  profileStatus?: ProfileStatus;
  profileUser: User;
  substantiveCity?: City;
  substantiveClassification?: Classification;
  substantiveWorkUnit?: WorkUnit;
  wfaStatus?: WFAStatus;
  wfaStartDate?: string;
  wfaEndDate?: string;
  preferredCities?: City[];
  preferredClassifications?: Classification[];
  preferredEmploymentOpportunities?: EmploymentOpportunityType[];
  preferredLanguages?: LanguageReferralType[];
  createdBy?: string;
  createdDate?: string;
  lastModifiedBy?: string;
  lastModifiedDate?: string;
}>;

// Profile PUT Model - Based on OpenAPI ProfilePutModel schema
// Used for updating profiles via PUT /api/v1/profiles/{id}
export type ProfilePutModel = Readonly<{
  cityId?: number;
  classificationId?: number;
  hasConsentedToPrivacyTerms?: boolean;
  hrAdvisorId?: number;
  isAvailableForReferral?: boolean;
  isInterestedInAlternation?: boolean;
  languageOfCorrespondenceId?: number;
  preferredLanguages?: number[];
  personalEmailAddress?: string;
  personalPhoneNumber?: string;
  preferredCities?: number[];
  preferredClassification?: number[];
  preferredEmploymentOpportunities?: number[];
  wfaStatusId?: number;
  wfaStartDate?: string;
  wfaEndDate?: string;
  workUnitId?: number;
}>;

// Profile Response Models
export type PagedProfileResponse = Readonly<{
  content: Profile[];
  page: PageMetadata;
}>;

// For collection endpoints (small, finite datasets i.e. getCurrentUserProfiles)
export type CollectionProfileResponse = Readonly<{
  content: Profile[];
}>;

// Profile Status Update Model
export type ProfileStatusUpdate = Readonly<{
  id?: number;
  code?: string;
  nameEn?: string;
  nameFr?: string;
  createdBy?: string;
  createdDate?: string;
  lastModifiedBy?: string;
  lastModifiedDate?: string;
}>;

// API Query Parameters
export type UserQueryParams = {
  page?: number;
  size?: number;
  sort?: string[];
  userType?: string;
  email?: string;
};

export type ProfileQueryParams = {
  page?: number;
  size?: number;
  active?: boolean;
  hrAdvisorId?: string;
  statusIds?: number[];
  sort?: string;
};

// Request Read Model
export type RequestReadModel = Readonly<{
  // Main fields
  additionalComment?: string;
  alternateContactEmailAddress?: string;
  appointmentNonAdvertised?: NonAdvertisedAppointment;
  cities?: City[];
  classification?: Classification;
  employmentEquities?: EmploymentEquity[];
  employmentTenure?: EmploymentTenure;
  englishLanguageProfile?: string;
  englishStatementOfMerit?: string;
  englishTitle?: string;
  equityNeeded?: boolean;
  hasMatches?: boolean;
  frenchLanguageProfile?: string;
  frenchStatementOfMerit?: string;
  frenchTitle?: string;
  hasPerformedSameDuties?: boolean;
  hiringManager?: User;
  hrAdvisor?: User;
  languageOfCorrespondence?: LanguageOfCorrespondence;
  languageRequirement?: LanguageRequirement;
  positionNumber?: string;
  priorityClearanceNumber?: string;
  priorityEntitlement?: boolean;
  priorityEntitlementRationale?: string;
  projectedEndDate?: string;
  projectedStartDate?: string;
  pscClearanceNumber?: string;
  securityClearance?: SecurityClearance;
  selectionProcessNumber?: string;
  selectionProcessType?: SelectionProcessType;
  status?: RequestStatus;
  subDelegatedManager?: User;
  submitter?: User;
  teleworkAllowed?: boolean;
  workSchedule?: WorkSchedule;
  workUnit?: WorkUnit;
  workforceMgmtApprovalRecvd?: boolean;

  // Tombstone fields
  id: number;
  createdBy?: string;
  createdDate?: string;
  lastModifiedBy?: string;
  lastModifiedDate?: string;
}>;

export type CityId = {
  value: number;
};

export type EmploymentEquityId = {
  value: number;
};

// Request Update Model
export type RequestUpdateModel = Partial<{
  additionalComment: string;
  alternateContactEmailAddress: string;
  appointmentNonAdvertisedId: number;
  cityIds: CityId[];
  classificationId: number;
  employmentEquityIds: EmploymentEquityId[];
  employmentTenureId: number;
  englishLanguageProfile: string;
  englishStatementOfMerit: string;
  englishTitle: string;
  equityNeeded: boolean;
  frenchLanguageProfile: string;
  frenchStatementOfMerit: string;
  frenchTitle: string;
  hasPerformedSameDuties: boolean;
  hiringManagerId: number;
  hrAdvisorId: number;
  languageOfCorrespondenceId: number;
  languageRequirementId: number;
  positionNumbers: string;
  priorityClearanceNumber: string;
  priorityEntitlement: boolean;
  priorityEntitlementRationale: string;
  projectedEndDate: string;
  projectedStartDate: string;
  pscClearanceNumber: string;
  securityClearanceId: number;
  selectionProcessNumber: string;
  selectionProcessTypeId: number;
  statusId: number;
  subDelegatedManagerId: number;
  submitterId: number;
  teleworkAllowed: boolean;
  workScheduleId: number;
  workUnitId: number;
  workforceMgmtApprovalRecvd: boolean;
}>;

// Request Response Models
export type PagedRequestResponse = Readonly<{
  content: RequestReadModel[];
  page: PageMetadata;
}>;

export type CollectionRequestResponse = Readonly<{
  content: RequestReadModel[];
}>;

// API Query Parameters for Requests
export type RequestQueryParams = {
  page?: number;
  size?: number;
  sort?: string[];
  status?: string;
  classification?: string;
  province?: string;
};

// Match Read Model
export type MatchReadModel = Readonly<{
  // Main fields
  profile?: Profile;
  request?: RequestReadModel;
  matchStatus?: MatchStatus;
  matchFeedback?: MatchFeedback;
  hiringManagerComment?: string;
  hrAdvisorComment?: string;

  // Tombstone fields
  id: number;
  createdBy?: string;
  createdDate?: string;
  lastModifiedBy?: string;
  lastModifiedDate?: string;
}>;

// Match Update Model
export type MatchUpdateModel = Partial<{
  profileId: number;
  requestId: number;
  statusId: number;
  matchFeedbackId: number;
  hiringManagerComment: string;
  hrAdvisorComment: string;
}>;

// Lightweight read model for matches with nested records for related entities.
export type ProfileSummary = Readonly<{
  id: number;
  firstName?: string;
  lastName?: string;
  wfaStatus?: WFAStatus;
}>;

export type RequestSummary = Readonly<{
  id: number;
  requestStatus?: RequestStatus;
  requestDate?: string;
  hiringManagerFirstName?: string;
  hiringManagerLastName?: string;
  hiringManagerEmail?: string;
  hrAdvisorId?: number;
  hrAdvisorFirstName?: string;
  hrAdvisorLastName?: string;
  hrAdvisorEmail?: string;
}>;

export type MatchSummaryReadModel = Readonly<{
  // Main fields
  profile?: ProfileSummary;
  request?: RequestSummary; // Consider removing it as request will be fetched separatly
  matchStatus?: MatchStatus;
  matchFeedback?: MatchFeedback;
  hiringManagerComment?: string;
  hrAdvisorComment?: string;

  // Tombstone fields
  id: number;
  createdDate?: string;
}>;

// Match Response Models
export type CollectionMatchResponse = Readonly<{
  content: MatchSummaryReadModel[];
}>;
