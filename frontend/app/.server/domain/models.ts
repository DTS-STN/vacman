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
  provinceId: string;
  name: string;
}>;

export type ClassificationGroup = Readonly<{
  id: string;
  name: string;
  levels: ClassificationLevel[];
}>;

export type ClassificationLevel = Readonly<{
  id: string;
  name: string;
}>;

export type CurrentWFAStatus = Readonly<{
  id: string;
  nameEn: string;
  nameFr: string;
}>;

export type LocalizedCurrentWFAStatus = Readonly<{
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
  alphaCode: string;
  nameEn: string;
  nameFr: string;
}>;

export type LocalizedProvince = Readonly<{
  id: string;
  alphaCode: string;
  name: string;
}>;

export type LanguageProfileForReferral = Readonly<{
  id: string;
  nameEn: string;
  nameFr: string;
}>;

export type LocalizedLanguageProfileForReferral = Readonly<{
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
