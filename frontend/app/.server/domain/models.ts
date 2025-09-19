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

//TODO: Remove this if we can leverage the workunit model
export type Directorate = HierarchicalLookupModel<Branch>;
export type LocalizedDirectorate = LocalizedHierarchicalLookupModel<LocalizedBranch>;

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
  additionalComment?: string;
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
  additionalComment?: string;
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
};

// Request Read Model
export type RequestReadModel = Readonly<{
  // Main fields
  selectionProcessNumber?: string;
  workforceMgmtApprovalRecvd?: boolean;
  priorityEntitlement?: boolean;
  priorityEntitlementRationale?: string;
  selectionProcessType?: SelectionProcessType;
  hasPerformedSameDuties?: boolean;
  appointmentNonAdvertised?: NonAdvertisedAppointment;
  projectedStartDate?: string;
  projectedEndDate?: string;
  workSchedule?: WorkSchedule;
  equityNeeded?: boolean;
  employmentEquities?: EmploymentEquity[];
  positionNumber?: string;
  classification?: Classification;
  englishTitle?: string;
  frenchTitle?: string;
  cities?: City[];
  languageRequirement?: LanguageRequirement;
  englishLanguageProfile?: string;
  frenchLanguageProfile?: string;
  securityClearance?: SecurityClearance;
  englishStatementOfMerit?: string;
  frenchStatementOfMerit?: string;
  status?: RequestStatus;
  workUnit?: WorkUnit;
  submitter?: User;
  hiringManager?: User;
  subDelegatedManager?: User;
  hrAdvisor?: User;
  languageOfCorrespondence?: LanguageOfCorrespondence;
  employmentTenure?: EmploymentTenure;
  priorityClearanceNumber?: string;
  pscClearanceNumber?: string;
  requestNumber?: string;
  additionalComment?: string;

  // Tombstone fields
  id: number;
  createdBy?: string;
  createdDate?: string;
  lastModifiedBy?: string;
  lastModifiedDate?: string;
}>;

// Request Update Model (PATCH)
export type RequestUpdateModel = Partial<{
  additionalComment: string;
  alternateContactEmailAddress: string;
  appointmentNonAdvertisedId: number;
  classificationId: number;
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
  positionNumbers: string[];
  priorityClearanceNumber: string;
  priorityEntitlement: boolean;
  priorityEntitlementRationale: string;
  projectedEndDate: string;
  projectedStartDate: string;
  pscClearanceNumber: string;
  requestNumber: string;
  securityClearanceId: number;
  selectionProcessNumber: string;
  selectionProcessTypeId: number;
  statusId: number;
  subDelegatedManagerId: number;
  submitterId: number;
  teleworkAllowed: boolean;
  workforceMgmtApprovalRecvd: boolean;
  workScheduleId: number;
  workUnitId: number;
  cityIds: number[];
  employmentEquityIds: number[];
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
