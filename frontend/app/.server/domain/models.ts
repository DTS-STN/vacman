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
  language?: LanguageOfCorrespondence;
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
  languageId?: number;
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
  profileUser?: User;
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
  'page'?: number;
  'size'?: number;
  'sort'?: string[];
  'user-type'?: string;
};

export type ProfileQueryParams = {
  'page'?: number;
  'size'?: number;
  'active'?: boolean;
  'hr-advisor'?: string;
};
