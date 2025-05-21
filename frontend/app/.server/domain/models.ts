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
