// Mapping of current WFA status
export const EMPLOYEE_WFA_STATUS = {
  affected: 'AFFECTED',
  opting: 'OPTING',
  surplusGRJO: 'SURPLUS_GRJO',
  surplusOptingOptionA: 'SURPLUS_OPTION_A',
} as const;

export const PROFILE_STATUS_CODE = {
  approved: 'APPROVED',
  pending: 'PENDING',
  incomplete: 'INCOMPLETE',
  archived: 'ARCHIVED',
} as const;

export const PROFILE_STATUS_ID = {
  pending: 1,
  approved: 2,
  incomplete: 3,
  archived: 4,
} as const;

export const REQUIRE_OPTIONS = {
  yes: 'yes',
  no: 'no',
} as const;
