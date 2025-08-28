// Mapping of current WFA status
export const EMPLOYEE_WFA_STATUS = {
  affected: 'AFFECTED',
  exAffected: 'EXAFFECTED',
  opting: 'OPTING',
  exOpting: 'OPTING_EX',
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
  createdBy: 'system',
  createdDate: '2025-08-14T17:26:29.38Z',
  lastModifiedBy: 'system',
  lastModifiedDate: '2025-08-14T17:26:29.38Z',
} as const;

export const PROFILE_STATUS_APPROVED = {
  id: 1,
  code: 'APPROVED',
  nameEn: 'Approved',
  nameFr: 'Approuvé',
  createdBy: 'system',
  createdDate: '2025-08-14T17:26:29.38Z',
  lastModifiedBy: 'system',
  lastModifiedDate: '2025-08-14T17:26:29.38Z',
} as const;

export const PROFILE_STATUS_INCOMPLETE = {
  id: 2,
  code: 'INCOMPLETE',
  nameEn: 'In progress',
  nameFr: 'En cours',
  createdBy: 'system',
  createdDate: '2025-08-14T17:26:29.38Z',
  lastModifiedBy: 'system',
  lastModifiedDate: '2025-08-14T17:26:29.38Z',
} as const;

export const PROFILE_STATUS_ARCHIVED = {
  id: 3,
  code: 'ARCHIVED',
  nameEn: 'Archived',
  nameFr: 'Archivé',
  createdBy: 'system',
  createdDate: '2025-08-14T17:26:29.38Z',
  lastModifiedBy: 'system',
  lastModifiedDate: '2025-08-14T17:26:29.38Z',
} as const;

export const PREFERRED_LANGUAGE_ENGLISH = {
  id: 0,
  code: 'EN',
  nameEn: 'English',
  nameFr: 'Anglais',
} as const;

export const PREFERRED_LANGUAGE_FRENCH = {
  id: 1,
  code: 'FR',
  nameEn: 'French',
  nameFr: 'Français',
} as const;

export const LANGUAGE_REFERRAL_TYPE_BILLINGUAL = {
  id: 0,
  code: 'BILINGUAL',
  nameEn: 'Bilingual',
  nameFr: 'Bilingue',
} as const;

export const LANGUAGE_REFERRAL_TYPE_ENGLISH = {
  id: 1,
  code: 'ENGLISH',
  nameEn: 'English only',
  nameFr: 'Anglais seulement',
} as const;

export const LANGUAGE_REFERRAL_TYPE_FRENCH = {
  id: 2,
  code: 'FRENCH',
  nameEn: 'French only',
  nameFr: 'Français seulement',
} as const;

export const USER_TYPE_EMPLOYEE = {
  id: 0,
  code: 'employee',
  nameEn: 'Employee',
  nameFr: 'Employé',
} as const;

export const USER_TYPE_ADMIN = {
  id: 1,
  code: 'admin',
  nameEn: 'Administrator',
  nameFr: 'Administrateur',
} as const;

export const USER_TYPE_HIRING_MANAGER = {
  id: 2,
  code: 'hiring-manager',
  nameEn: 'Hiring Manager',
  nameFr: 'Gestionnaire de recrutement',
} as const;

export const USER_TYPE_HR_ADVISOR = {
  id: 3,
  code: 'HRA',
  nameEn: 'HR Advisor',
  nameFr: 'Conseiller en R.H.',
} as const;

export const LANGUAGE_REQUIREMENT_CODES = {
  bilingualImperative: 'BI',
  bilingualNonImperative: 'BNI',
  englishEssential: 'EE-AE',
  frenchEssential: 'FE',
  either: 'EF-AF',
  various: 'VAR',
} as const;

export const LANGUAGE_LEVEL = [
  { id: 1, value: 'A' },
  { id: 2, value: 'B' },
  { id: 3, value: 'C' },
  { id: 4, value: 'P' },
] as const;

// TODO configure these in a more friendly way for DX
export const ACTIVE_REQUEST_STATUS_IDS = [0, 1, 2, 3, 4, 5];
export const ARCHIVED_REQUEST_STATUS_IDS = [6, 7, 8];
