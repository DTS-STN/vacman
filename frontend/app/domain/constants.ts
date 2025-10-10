// Mapping of current WFA status
export const EMPLOYEE_WFA_STATUS = {
  affected: 'AFFECTED',
  exAffected: 'EXAFFECTED',
  opting: 'OPTING',
  exOpting: 'OPTING_EX',
  surplusGRJO: 'SURPLUS_GRJO',
  exSurplusCPA: 'EXSURPLUSCPA',
  surplusOptingOptionA: 'SURPLUS_NO_GRJO',
  relocation: 'RELOCATION',
  alternateDeliveryInitiative: 'ALTERNATE_DELIVERY_INITIATIVE',
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

export const PROFILE_STATUS = {
  PENDING: {
    id: 0,
    code: 'PENDING',
    nameEn: 'Pending approval',
    nameFr: "En attente d'approbation",
  },
  APPROVED: {
    id: 1,
    code: 'APPROVED',
    nameEn: 'Approved',
    nameFr: 'Approuvé',
  },
  INCOMPLETE: {
    id: 2,
    code: 'INCOMPLETE',
    nameEn: 'In progress',
    nameFr: 'En cours',
  },
  ARCHIVED: {
    id: 3,
    code: 'ARCHIVED',
    nameEn: 'Archived',
    nameFr: 'Archivé',
  },
} as const;

export type ProfileStatus = keyof typeof PROFILE_STATUS;

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

export const REQUEST_CATEGORY = {
  active: 'active',
  inactive: 'inactive',
} as const;

export const REQUEST_STATUSES = [
  {
    id: 0,
    code: 'DRAFT',
    category: REQUEST_CATEGORY.active,
  },
  {
    id: 1,
    code: 'SUBMIT',
    category: REQUEST_CATEGORY.active,
  },
  {
    id: 2,
    code: 'HR_REVIEW',
    category: REQUEST_CATEGORY.active,
  },
  {
    id: 3,
    code: 'NO_MATCH_HR_REVIEW',
    category: REQUEST_CATEGORY.active,
  },
  {
    id: 4,
    code: 'FDBK_PENDING',
    category: REQUEST_CATEGORY.active,
  },
  {
    id: 5,
    code: 'FDBK_PEND_APPR',
    category: REQUEST_CATEGORY.active,
  },
  {
    id: 6,
    code: 'PENDING_PSC',
    category: REQUEST_CATEGORY.active,
  },
  {
    id: 7,
    code: 'PENDING_PSC_NO_VMS',
    category: REQUEST_CATEGORY.active,
  },
  {
    id: 8,
    code: 'CLR_GRANTED',
    category: REQUEST_CATEGORY.inactive,
  },
  {
    id: 9,
    code: 'PSC_GRANTED',
    category: REQUEST_CATEGORY.inactive,
  },
  {
    id: 10,
    code: 'CANCELLED',
    category: REQUEST_CATEGORY.inactive,
  },
] as const;

type StatusCode = (typeof REQUEST_STATUSES)[number]['code'];
// prettier-ignore
export const REQUEST_STATUS_CODE = Object.fromEntries(
  REQUEST_STATUSES.map((status) => [status.code, status.code])
) as Record<StatusCode,StatusCode>;

export const EMPLOYMENT_TENURE = {
  term: 'TERM',
  indeterminate: 'INDETERMINATE',
} as const;

export const SELECTION_PROCESS_TYPE = {
  APPOINTMENT: {
    id: 0,
    code: 'AEP',
    nameEn: 'Appointment - ESDC Priority',
    nameFr: "Nomination - Priorité d'EDSC",
  },
  APPOINTMENT_OTHER_DEPT_PRIORITY: {
    id: 1,
    code: 'AODP',
    nameEn: 'Appointment - Other Department Priority',
    nameFr: 'Nomination - Priorité autre ministère',
  },
  EXTERNAL_ADVERTISE: {
    id: 2,
    code: 'AEA',
    nameEn: 'Appointment - External Advertised (from outside the public service)',
    nameFr: "Nomination - Externe annoncé (de l'extérieur de la fonction publique)",
  },
  EXTERNAL_NON_ADVERTISED: {
    id: 3,
    code: 'AENA',
    nameEn: 'Appointment - External Non-Advertised (from outside the public service)',
    nameFr: "Nomination - Externe non-annoncé (de l'extérieur de la fonction publique)",
  },
  APPOINTMENT_INTERNAL_ADVERTISED: {
    id: 4,
    code: 'AIA',
    nameEn: 'Appointment - Internal Advertised (from inside the public service)',
    nameFr: 'Nomination - Interne annoncé (au sein de la fonction publique)',
  },
  APPOINTMENT_INTERNAL_NON_ADVERTISED: {
    id: 5,
    code: 'AINA',
    nameEn: 'Appointment - Internal Non-Advertised (from inside the public service)',
    nameFr: 'Nomination - Interne non-annoncé (au sein de la fonction publique)',
  },
  INITIATE_AN_ADVERTISED_PROCESS: {
    id: 6,
    code: 'IAP',
    nameEn: 'Initiate an Avertised Process (Internal or External)',
    nameFr: "Initiation d'un processus annoncé (Interne ou externe)",
  },
  DEPLOYMENT_ESDC_PRIORITY: {
    id: 7,
    code: 'DEP',
    nameEn: 'Deployment - ESDC Priority',
    nameFr: "Mutation - Priorité d'EDSC",
  },
  DEPLOYMENT_WITHIN_ESDC: {
    id: 8,
    code: 'DWE',
    nameEn: 'Deployment - From within ESDC',
    nameFr: 'Mutation - Au sein de EDSC',
  },
  DEPLOYMENT_FROM_OTHER_DEPT: {
    id: 9,
    code: 'DAD',
    nameEn: 'Deployment - From another department/agency',
    nameFr: "Mutation - D'un autre ministère",
  },
  DEPLOYMENT_INDETERMINATE: {
    id: 10,
    code: 'DIE',
    nameEn: 'Deployment - Indeterminate (refer to exceptions)',
    nameFr: 'Mutation - Durée indéterminée (veuillez consulter les exceptions)',
  },
} as const;

export const REQUEST_EVENT_TYPE = {
  submitted: 'requestSubmitted',
  pickedUp: 'requestPickedUp',
  vmsNotRequired: 'vmsNotRequired',
  submitFeedback: 'submitFeedback',
  pscNotRequired: 'pscNotRequired',
  pscRequired: 'pscRequired',
  complete: 'complete',
} as const;

export type RequestEventType = (typeof REQUEST_EVENT_TYPE)[keyof typeof REQUEST_EVENT_TYPE];
