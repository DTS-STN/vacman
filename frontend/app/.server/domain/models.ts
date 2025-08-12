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

export type PriorityLevel = LookupModel;
export type LocalizedPriorityLevel = LocalizedLookupModel;

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

export type User = Readonly<{
  id: number;
  role: string;
  networkName: string;
  uuName: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  initials?: string;
  personalRecordIdentifier?: string;
  businessPhone?: string;
  businessEmail?: string;
  userCreated?: string;
  dateCreated?: string;
  userUpdated?: string;
  dateUpdated?: string;
}>;

export type UserCreate = Readonly<{
  languageId: number;
}>;

export type UserUpdate = Readonly<{
  id: number;
  userTypeId?: number;
  microsoftEntraId?: string;
  firstName?: string;
  middleName?: string;
  lastName?: string;
  initials?: string;
  personalRecordIdentifier?: string;
  businessPhone?: string;
  businessEmail?: string;
  languageId?: number;
}>;

export type Profile = Readonly<{
  profileId: number;
  userId: number;
  userIdReviewedBy?: number;
  userIdApprovedBy?: number;
  priorityLevelId?: number;
  profileStatus: ProfileStatus;
  privacyConsentInd?: boolean;
  userCreated: string;
  dateCreated: string;
  userUpdated?: string;
  dateUpdated?: string;
  personalInformation: UserPersonalInformation;
  employmentInformation: UserEmploymentInformation;
  referralPreferences: UserReferralPreferences;
}>;

export type UserPersonalInformation = {
  surname?: string;
  givenName?: string;
  personalRecordIdentifier?: string;
  preferredLanguageId?: number;
  workEmail: string;
  personalEmail?: string;
  workPhone?: string;
  personalPhone?: string;
  additionalInformation?: string;
};
export type UserEmploymentInformation = {
  substantivePosition?: number;
  branchOrServiceCanadaRegion?: number;
  directorate?: number;
  province?: number;
  cityId?: number;
  wfaStatus?: number;
  wfaEffectiveDate?: string;
  wfaEndDate?: string;
  hrAdvisor?: number;
};
export type UserReferralPreferences = {
  languageReferralTypeIds?: number[];
  classificationIds?: number[];
  workLocationProvince?: number;
  workLocationCitiesIds?: number[];
  availableForReferralInd?: boolean;
  interestedInAlternationInd?: boolean;
  employmentTenureIds?: number[];
};
