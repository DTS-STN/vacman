import { parsePhoneNumberWithError } from 'libphonenumber-js';
import * as v from 'valibot';
import type { BaseSchema, BaseIssue } from 'valibot';

import { getBranchService } from '~/.server/domain/services/branch-service';
import { getCityService } from '~/.server/domain/services/city-service';
import { getClassificationService } from '~/.server/domain/services/classification-service';
import { getDirectorateService } from '~/.server/domain/services/directorate-service';
import { getEducationLevelService } from '~/.server/domain/services/education-level-service';
import { getLanguageForCorrespondenceService } from '~/.server/domain/services/language-for-correspondence-service';
import { getProvinceService } from '~/.server/domain/services/province-service';
import { serverEnvironment } from '~/.server/environment';
import { stringToIntegerSchema } from '~/.server/validation/string-to-integer-schema';
import { EMPLOYEE_WFA_STATUS } from '~/domain/constants';
import { getStartOfDayInTimezone, isDateInPastOrTodayInTimeZone, isValidDateString, toISODateString } from '~/utils/date-utils';
import { isValidPhone } from '~/utils/phone-utils';
import { REGEX_PATTERNS } from '~/utils/regex-utils';
import { formString } from '~/utils/string-utils';

const allLanguagesOfCorrespondance = await getLanguageForCorrespondenceService().getAll();
const languagesOfCorrespondence = allLanguagesOfCorrespondance.unwrap();
const allEducationLevels = await getEducationLevelService().getAll();
const educationLevels = allEducationLevels.unwrap();
const allSubstantivePositions = await getClassificationService().getAll();
const substantivePositions = allSubstantivePositions.unwrap();
const allBranchOrServiceCanadaRegions = await getBranchService().getAll();
const branchOrServiceCanadaRegions = allBranchOrServiceCanadaRegions.unwrap();
const allDirectorates = await getDirectorateService().getAll();
const directorates = allDirectorates.unwrap();
const allProvinces = await getProvinceService().getAll();
const province = allProvinces.unwrap();
const allCities = await getCityService().getAll();
const cities = allCities.unwrap();
//const allWfaStatuses = await getWFAStatuses().getAll();
//const wfaStatuses = allWfaStatuses.unwrap();

export const personalInformationSchema = v.object({
  personalRecordIdentifier: v.pipe(
    v.string('app:personal-information.errors.personal-record-identifier-required'),
    v.trim(),
    v.nonEmpty('app:personal-information.errors.personal-record-identifier-required'),
    v.length(9, 'app:personal-information.errors.personal-record-identifier-invalid'),
    v.regex(REGEX_PATTERNS.DIGIT_ONLY, 'app:personal-information.errors.personal-record-identifier-invalid'),
  ),
  preferredLanguage: v.lazy(() =>
    v.picklist(
      languagesOfCorrespondence.map(({ id }) => id),
      'app:personal-information.errors.preferred-language-required',
    ),
  ),
  personalEmail: v.pipe(
    v.string('app:personal-information.errors.personal-email-required'),
    v.trim(),
    v.nonEmpty('app:personal-information.errors.personal-email-required'),
    v.email('app:personal-information.errors.personal-email-invalid'),
  ),
  workPhone: v.optional(
    v.pipe(
      v.string('app:personal-information.errors.work-phone-required'),
      v.trim(),
      v.custom((val) => isValidPhone(val as string), 'app:personal-information.errors.work-phone-invalid'),
      v.transform((val) => parsePhoneNumberWithError(val, 'CA').formatInternational().replace(/ /g, '')),
    ),
  ),
  personalPhone: v.pipe(
    v.string('app:personal-information.errors.personal-phone-required'),
    v.trim(),
    v.nonEmpty('app:personal-information.errors.personal-phone-required'),
    v.custom((val) => isValidPhone(val as string), 'app:personal-information.errors.personal-phone-invalid'),
    v.transform((val) => parsePhoneNumberWithError(val, 'CA').formatInternational().replace(/ /g, '')),
  ),
  education: v.lazy(() =>
    v.picklist(
      educationLevels.map(({ id }) => id),
      'app:personal-information.errors.education-required',
    ),
  ),
});

const validWFAStatusesForRequiredDate = [
  EMPLOYEE_WFA_STATUS.opting,
  EMPLOYEE_WFA_STATUS.surplusGRJO,
  EMPLOYEE_WFA_STATUS.surplusOptingOptionA,
] as const;

const validWFAStatusesForOptionalDate = [EMPLOYEE_WFA_STATUS.affected] as const;

export const employmentInformationSchema = v.intersect([
  v.object({
    substantivePosition: v.lazy(() =>
      v.picklist(
        substantivePositions.map(({ id }) => id),
        'app:employment-information.errors.substantive-group-and-level-required',
      ),
    ),
    branchOrServiceCanadaRegion: v.lazy(() =>
      v.picklist(
        branchOrServiceCanadaRegions.map(({ id }) => id),
        'app:employment-information.errors.branch-or-service-canada-region-required',
      ),
    ),
    directorate: v.lazy(() =>
      v.picklist(
        directorates.map(({ id }) => id),
        'app:employment-information.errors.directorate-required',
      ),
    ),
    province: v.lazy(() =>
      v.picklist(
        province.map(({ id }) => id),
        'app:employment-information.errors.provinces-required',
      ),
    ),
    city: v.lazy(() =>
      v.picklist(
        cities.map(({ id }) => id),
        'app:employment-information.errors.city-required',
      ),
    ),

    hrAdvisor: v.optional(v.string()),
  }),
  v.variant(
    'wfaStatus',
    [
      v.object({
        wfaStatus: v.picklist(validWFAStatusesForOptionalDate),
        wfaEffectiveDateYear: v.optional(v.string()),
        wfaEffectiveDateMonth: v.optional(v.string()),
        wfaEffectiveDateDay: v.optional(v.string()),
        wfaEffectiveDate: v.optional(v.string()),
        wfaEndDateYear: v.optional(v.string()),
        wfaEndDateMonth: v.optional(v.string()),
        wfaEndDateDay: v.optional(v.string()),
        wfaEndDate: v.optional(v.string()),
      }),
      v.object({
        wfaStatus: v.picklist(validWFAStatusesForRequiredDate),
        wfaEffectiveDateYear: v.pipe(
          stringToIntegerSchema('app:employment-information.errors.wfa-effective-date.required-year'),
          v.minValue(1, 'app:employment-information.errors.wfa-effective-date.invalid-year'),
          v.maxValue(
            getStartOfDayInTimezone(serverEnvironment.BASE_TIMEZONE).getFullYear(),
            'app:employment-information.errors.wfa-effective-date.invalid-year',
          ),
        ),
        wfaEffectiveDateMonth: v.pipe(
          stringToIntegerSchema('app:employment-information.errors.wfa-effective-date.required-month'),
          v.minValue(1, 'app:employment-information.errors.wfa-effective-date.invalid-month'),
          v.maxValue(12, 'app:employment-information.errors.wfa-effective-date.invalid-month'),
        ),
        wfaEffectiveDateDay: v.pipe(
          stringToIntegerSchema('app:employment-information.errors.wfa-effective-date.required-day'),
          v.minValue(1, 'app:employment-information.errors.wfa-effective-date.invalid-day'),
          v.maxValue(31, 'app:employment-information.errors.wfa-effective-date.invalid-day'),
        ),
        wfaEffectiveDate: v.pipe(
          v.string(),
          v.custom(
            (input) => isValidDateString(input as string),
            'app:employment-information.errors.wfa-effective-date.invalid',
          ),
          v.custom(
            (input) => isDateInPastOrTodayInTimeZone(serverEnvironment.BASE_TIMEZONE, input as string),
            'app:employment-information.errors.wfa-effective-date.invalid-future-date',
          ),
        ),
        wfaEndDateYear: optionalString(
          v.optional(
            v.pipe(
              stringToIntegerSchema('app:employment-information.errors.wfa-end-date.invalid-year'),
              v.minValue(1, 'app:employment-information.errors.wfa-end-date.invalid-year'),
            ),
          ),
        ),
        wfaEndDateMonth: v.optional(
          v.pipe(
            stringToIntegerSchema('app:employment-information.errors.wfa-end-date.required-month'),
            v.minValue(1, 'app:employment-information.errors.wfa-end-date.invalid-month'),
            v.maxValue(12, 'app:employment-information.errors.wfa-end-date.invalid-month'),
          ),
        ),
        wfaEndDateDay: optionalString(
          v.optional(
            v.pipe(
              stringToIntegerSchema('app:employment-information.errors.wfa-end-date.required-day'),
              v.minValue(1, 'app:employment-information.errors.wfa-end-date.invalid-day'),
              v.maxValue(31, 'app:employment-information.errors.wfa-end-date.invalid-day'),
            ),
          ),
        ),
        wfaEndDate: optionalString(
          v.optional(
            v.pipe(
              v.string(),
              v.custom((input) => isValidDateString(input as string), 'app:employment-information.errors.wfa-end-date.invalid'),
            ),
          ),
        ),
      }),
    ],
    'app:employment-information.errors.wfa-status-required',
  ),
]);

export function parseEmploymentInformation(formData: FormData) {
  const wfaEffectiveDateYear = formData.get('wfaEffectiveDateYear')?.toString();
  const wfaEffectiveDateMonth = formData.get('wfaEffectiveDateMonth')?.toString();
  const wfaEffectiveDateDay = formData.get('wfaEffectiveDateDay')?.toString();

  const wfaEndDateYear = formData.get('wfaEndDateYear')?.toString();
  const wfaEndDateMonth = formData.get('wfaEndDateMonth')?.toString();
  const wfaEndDateDay = formData.get('wfaEndDateDay')?.toString();

  const formValues = {
    substantivePosition: formString(formData.get('substantivePosition')),
    branchOrServiceCanadaRegion: formString(formData.get('branchOrServiceCanadaRegion')),
    directorate: formString(formData.get('directorate')),
    province: formString(formData.get('province')),
    city: formString(formData.get('city')),
    wfaStatus: formString(formData.get('wfaStatus')),
    wfaEffectiveDate: toDateString(wfaEffectiveDateYear, wfaEffectiveDateMonth, wfaEffectiveDateDay),
    wfaEffectiveDateYear: wfaEffectiveDateYear,
    wfaEffectiveDateMonth: wfaEffectiveDateMonth,
    wfaEffectiveDateDay: wfaEffectiveDateDay,
    wfaEndDate: toDateString(wfaEndDateYear, wfaEndDateMonth, wfaEndDateDay),
    wfaEndDateYear: wfaEndDateYear,
    wfaEndDateMonth: wfaEndDateMonth,
    wfaEndDateDay: wfaEndDateDay,
    hrAdvisor: formString(formData.get('hrAdvisor')),
  };

  return {
    parseResult: v.safeParse(employmentInformationSchema, formValues),
    formValues: {
      substantivePosition: formValues.substantivePosition,
      branchOrServiceCanadaRegion: formValues.branchOrServiceCanadaRegion,
      directorate: formValues.directorate,
      province: formValues.province,
      city: formValues.city,
      wfaStatus: formValues.wfaStatus,
      wfaEffectiveDateYear: formValues.wfaEffectiveDateYear,
      wfaEffectiveDateMonth: formValues.wfaEffectiveDateMonth,
      wfaEffectiveDateDay: formValues.wfaEffectiveDateDay,
      wfaEffectiveDate: formValues.wfaEffectiveDate,
      wfaEndDate: formValues.wfaEndDate,
      wfaEndDateYear: formValues.wfaEndDateYear,
      wfaEndDateMonth: formValues.wfaEndDateMonth,
      wfaEndDateDay: formValues.wfaEndDateDay,
      hrAdvisor: formValues.hrAdvisor,
    },
  };
}

function toDateString(year?: string, month?: string, day?: string): string {
  try {
    return toISODateString(Number(year), Number(month), Number(day));
  } catch {
    return '';
  }
}

/**
 * A custom schema that transforms an empty string to `undefined` before
 * passing it to another schema. This makes `v.optional` work correctly
 * with empty form fields.
 */
function optionalString<TOutput>(schema: BaseSchema<string | undefined, TOutput, BaseIssue<unknown>>) {
  return v.pipe(
    v.string(),
    v.transform((input) => (input.trim() === '' ? undefined : input)),
    schema,
  );
}
