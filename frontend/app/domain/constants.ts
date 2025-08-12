// Mapping of current WFA status
export const EMPLOYEE_WFA_STATUS = {
  affected: 'AFFECTED',
  exAffected: 'EXAFFECTED',
  opting: 'OPTING',
  exOpting: 'EXOPTING',
  surplusGRJO: 'SURPLUS_GRJO',
  exSurplusCPA: 'EXSURPLUSCPA',
  surplusOptingOptionA: 'SURPLUS_NO_GRJO',
} as const;

export const PROFILE_STATUS_CODE = {
  approved: 'APPROVED',
  pending: 'PENDING',
  incomplete: 'INCOMPLETE',
  archived: 'ARCHIVED',
} as const;

export type ProfileStatusCode = (typeof PROFILE_STATUS_CODE)[keyof typeof PROFILE_STATUS_CODE];

export const PROFILE_STATUS_ID = {
  pending: 0,
  approved: 1,
  incomplete: 2,
  archived: 3,
} as const;

export const LANGUAGE_ID = {
  en: 0,
  fr: 1,
} as const;

export const REQUIRE_OPTIONS = {
  yes: 'yes',
  no: 'no',
} as const;

export const Acronym = {
  ESDC: 'esdc',
  HR: 'hr',
  HRSB: 'hrsb',
  PIB: 'pib',
  TBS: 'tbs',
  VMS: 'vms',
} as const;

export type AcronymEnum = (typeof Acronym)[keyof typeof Acronym];

export const PROFILE_STATUS_PENDING = {
  id: 0,
  code: 'PENDING',
  nameEn: 'Pending approval',
  nameFr: "En attente d'approbation",
} as const;

export const PROFILE_STATUS_APPROVED = {
  id: 1,
  code: 'APPROVED',
  nameEn: 'Approved',
  nameFr: 'Approuvé',
} as const;

export const PROFILE_STATUS_INCOMPLETE = {
  id: 2,
  code: 'INCOMPLETE',
  nameEn: 'In progress',
  nameFr: 'En cours',
} as const;

export const PROFILE_STATUS_ARCHIVED = {
  id: 3,
  code: 'ARCHIVED',
  nameEn: 'Archived',
  nameFr: 'Archivé',
} as const;
