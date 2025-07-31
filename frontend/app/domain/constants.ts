// Mapping of current WFA status
export const EMPLOYEE_WFA_STATUS = {
  affected: 'AFFECTED',
  opting: 'OPTING',
  surplusGRJO: 'SURPLUS_GRJO',
  surplusOptingOptionA: 'SURPLUS_OPTION_A',
} as const;

export const EMPLOYEE_STATUS_CODE = {
  approved: 'APPROVED',
  pending: 'PENDING',
  incomplete: 'INCOMPLETE',
  archived: 'ARCHIVED',
} as const;
