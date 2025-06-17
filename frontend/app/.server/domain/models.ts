export type Branch = Readonly<{
  id: string;
  nameEn: string;
  nameFr: string;
}>;

export type LocalizedBranch = Readonly<{
  id: string;
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
  nameEn: string;
  nameFr: string;
}>;

export type LocalizedDirectorate = Readonly<{
  id: string;
  name: string;
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
  name: string;
  activeDirectoryId?: string;
  role: string;
  privacyConsentAccepted?: boolean;
  createdBy: string;
  createdDate: string;
  lastModifiedBy: string;
  lastModifiedDate: string;
}>;

export type UserCreate = Readonly<{
  name: string;
  activeDirectoryId?: string;
  role: string;
  privacyConsentAccepted?: boolean;
}>;
