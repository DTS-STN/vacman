export type Branch = Readonly<{
  id: string;
  code: string;
  nameEn: string;
  nameFr: string;
}>;

export type LocalizedBranch = Readonly<{
  id: string;
  code: string;
  name: string;
}>;

export type City = Readonly<{
  id: string;
  code: string;
  nameEn: string;
  nameFr: string;
  province: Province;
}>;

export type LocalizedCity = Readonly<{
  id: string;
  code: string;
  name: string;
  province: LocalizedProvince;
}>;

export type Classification = Readonly<{
  id: string;
  name: string;
}>;

export type WFAStatus = Readonly<{
  id: string;
  nameEn: string;
  nameFr: string;
}>;

export type LocalizedWFAStatus = Readonly<{
  id: string;
  name: string;
}>;

export type Directorate = Readonly<{
  id: string;
  code: string;
  nameEn: string;
  nameFr: string;
  parent: Branch;
}>;

export type LocalizedDirectorate = Readonly<{
  id: string;
  code: string;
  name: string;
  parent: LocalizedBranch;
}>;

export type EducationLevel = Readonly<{
  id: string;
  nameEn: string;
  nameFr: string;
}>;

export type LocalizedEducationLevel = Readonly<{
  id: string;
  name: string;
}>;

export type EmploymentTenure = Readonly<{
  id: string;
  nameEn: string;
  nameFr: string;
}>;

export type LocalizedEmploymentTenure = Readonly<{
  id: string;
  name: string;
}>;

export type OpportunityType = Readonly<{
  id: string;
  nameEn: string;
  nameFr: string;
}>;

export type LocalizedOpportunityType = Readonly<{
  id: string;
  name: string;
}>;

export type Province = Readonly<{
  id: string;
  code: string;
  nameEn: string;
  nameFr: string;
}>;

export type LocalizedProvince = Readonly<{
  id: string;
  code: string;
  name: string;
}>;

export type LanguageReferralType = Readonly<{
  id: string;
  nameEn: string;
  nameFr: string;
}>;

export type LocalizedLanguageReferralType = Readonly<{
  id: string;
  name: string;
}>;

export type LanguageOfCorrespondence = Readonly<{
  id: string;
  nameEn: string;
  nameFr: string;
}>;

export type LocalizedLanguageOfCorrespondence = Readonly<{
  id: string;
  name: string;
}>;

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
  createdBy?: string;
  createdDate?: string;
  lastModifiedBy?: string;
  lastModifiedDate?: string;
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
  educationLevelId?: number;
  wfaStatusId?: number;
  classificationId?: number;
  cityId?: number;
  priorityLevelId?: number;
  workUnitId?: number;
  languageId?: number;
  profileStatusId: number;
  personalPhoneNumber?: string;
  personalEmailAddress?: string;
  privacyConsentInd?: boolean;
  availableForReferralInd?: boolean;
  interestedInAlternationInd?: boolean;
  additionalCommentTxt?: string;
  userCreated: string;
  dateCreated: string;
  userUpdated?: string;
  dateUpdated?: string;
}>;
