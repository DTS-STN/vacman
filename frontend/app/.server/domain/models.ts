// Generic base types for all lookup models
export type LookupModel = Readonly<{
  id: string;
  code: string;
  nameEn: string;
  nameFr: string;
}>;

export type LocalizedLookupModel = Readonly<{
  id: string;
  code: string;
  name: string;
}>;

// Generic type for lookup models with parent relationships
export type HierarchicalLookupModel<TParent = LookupModel> = LookupModel &
  Readonly<{
    parent: TParent;
  }>;

export type LocalizedHierarchicalLookupModel<TParent = LocalizedLookupModel> = LocalizedLookupModel &
  Readonly<{
    parent: TParent;
  }>;

// Type aliases for specific lookup types (for better developer experience)
export type Branch = LookupModel;
export type LocalizedBranch = LocalizedLookupModel;

// City types need special handling to maintain 'province' property name for backward compatibility
export type City = LookupModel &
  Readonly<{
    province: Province;
  }>;

export type LocalizedCity = LocalizedLookupModel &
  Readonly<{
    province: LocalizedProvince;
  }>;

export type Classification = LookupModel;
export type LocalizedClassification = LocalizedLookupModel;

export type WFAStatus = LookupModel;
export type LocalizedWFAStatus = LocalizedLookupModel;

export type Directorate = HierarchicalLookupModel<Branch>;
export type LocalizedDirectorate = LocalizedHierarchicalLookupModel<LocalizedBranch>;

export type EmploymentTenure = LookupModel;
export type LocalizedEmploymentTenure = LocalizedLookupModel;

export type OpportunityType = LookupModel;
export type LocalizedOpportunityType = LocalizedLookupModel;

export type Province = LookupModel;
export type LocalizedProvince = LocalizedLookupModel;

export type LanguageReferralType = LookupModel;
export type LocalizedLanguageReferralType = LocalizedLookupModel;

export type NonAdvertisedAppointment = LookupModel;
export type LocalizedNonAdvertisedAppointment = LocalizedLookupModel;

export type LanguageOfCorrespondence = LookupModel;
export type LocalizedLanguageOfCorrespondence = LocalizedLookupModel;

export type ProfileStatus = LookupModel;
export type LocalizedProfileStatus = LocalizedLookupModel;

export type EmploymentEquity = LookupModel;
export type LocalizedEmploymentEquity = LocalizedLookupModel;

export type User = Readonly<{
  id: string;
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
  activeDirectoryId?: string;
  role: string;
}>;

export type Profile = Readonly<{
  profileId: number;
  userId: number;
  userIdReviewedBy?: number;
  userIdApprovedBy?: number;
  priorityLevelId?: number;
  profileStatusId: number;
  privacyConsentInd?: boolean;
  userCreated: string;
  dateCreated: string;
  userUpdated?: string;
  dateUpdated?: string;
  personalInformation: UserPersonalInformation;
  employmentInformation: UserEmploymentInformation;
  referralPreferences: UserReferralPreferences;
  status?: 'pending-approval' | 'approved' | 'incomplete';
}>;

export type UserPersonalInformation = {
  surname?: string;
  givenName?: string;
  personalRecordIdentifier?: string;
  preferredLanguageId?: string;
  workEmail: string;
  personalEmail?: string;
  workPhone?: string;
  personalPhone?: string;
  additionalInformation?: string;
};
export type UserEmploymentInformation = {
  substantivePosition?: string;
  branchOrServiceCanadaRegion?: string;
  directorate?: string;
  cityId?: string;
  wfaStatus?: string;
  wfaEffectiveDate?: string;
  wfaEndDate?: string;
  hrAdvisor?: string;
};
export type UserReferralPreferences = {
  languageReferralTypeIds?: string[];
  classificationIds?: string[];
  workLocationCitiesIds?: string[];
  availableForReferralInd?: boolean;
  interestedInAlternationInd?: boolean;
  employmentTenureIds?: string[];
};
