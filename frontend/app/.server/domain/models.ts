export type Branch = Readonly<{
  id: string;
  nameEn: string;
  nameFr: string;
}>;

export type LocalizedBranch = Readonly<{
  id: string;
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
