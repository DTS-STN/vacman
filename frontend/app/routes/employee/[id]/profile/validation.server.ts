import { parsePhoneNumberWithError } from 'libphonenumber-js';
import * as v from 'valibot';
import type { BaseSchema, BaseIssue } from 'valibot';

import { getBranchService } from '~/.server/domain/services/branch-service';
import { getCityService } from '~/.server/domain/services/city-service';
import { getClassificationService } from '~/.server/domain/services/classification-service';
import { getDirectorateService } from '~/.server/domain/services/directorate-service';
import { getEmploymentTenureService } from '~/.server/domain/services/employment-tenure-service';
import { getLanguageForCorrespondenceService } from '~/.server/domain/services/language-for-correspondence-service';
import { getLanguageReferralTypeService } from '~/.server/domain/services/language-referral-type-service';
import { getProvinceService } from '~/.server/domain/services/province-service';
import { getUserService } from '~/.server/domain/services/user-service';
import { getWFAStatuses } from '~/.server/domain/services/wfa-status-service';
import { serverEnvironment } from '~/.server/environment';
import { stringToIntegerSchema } from '~/.server/validation/string-to-integer-schema';
import { EMPLOYEE_WFA_STATUS } from '~/domain/constants';
import { getStartOfDayInTimezone, isDateInPastOrTodayInTimeZone, isValidDateString, toISODateString } from '~/utils/date-utils';
import { isValidPhone } from '~/utils/phone-utils';
import { REGEX_PATTERNS } from '~/utils/regex-utils';
import { formString } from '~/utils/string-utils';

const allLanguagesOfCorrespondence = await getLanguageForCorrespondenceService().listAll();
const allSubstantivePositions = await getClassificationService().listAll();
const allWfaStatus = await getWFAStatuses().listAll();
const allBranchOrServiceCanadaRegions = await getBranchService().listAll();
const allDirectorates = await getDirectorateService().listAll();
const allProvinces = await getProvinceService().listAll();
const allCities = await getCityService().listAll();
const hrAdvisors = await getUserService().getUsersByRole('hr-advisor');
const allLanguageReferralTypes = await getLanguageReferralTypeService().listAll();
const allEmploymentTenures = await getEmploymentTenureService().listAll();

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
      allLanguagesOfCorrespondence.map(({ id }) => String(id)),
      'app:personal-information.errors.preferred-language-required',
    ),
  ),
  workEmail: v.pipe(
    v.string('app:personal-information.errors.work-email-required'),
    v.trim(),
    v.nonEmpty('app:personal-information.errors.work-email-required'),
    v.email('app:personal-information.errors.work-email-invalid'),
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
  additionalInformation: v.optional(
    v.pipe(
      v.string('app:personal-information.errors.additional-information-required'),
      v.trim(),
      v.length(100, 'app:personal-information.errors.additional-information-max-length'),
    ),
  ),
});

const validWFAStatusesForRequiredDate = [
  EMPLOYEE_WFA_STATUS.opting,
  EMPLOYEE_WFA_STATUS.surplusGRJO,
  EMPLOYEE_WFA_STATUS.surplusOptingOptionA,
] as const;

const validWFAStatusesForOptionalDate = [EMPLOYEE_WFA_STATUS.affected] as const;

const selectedValidWfaStatusesForRequiredDate = allWfaStatus
  .filter((c) => validWFAStatusesForRequiredDate.toString().includes(c.code))
  .map((status) => ({
    id: status.id.toString(),
    code: status.code,
    nameEn: status.nameEn,
    nameFr: status.nameFr,
  }));

const selectedValidWfaStatusesForOptionalDate = allWfaStatus
  .filter((c) => validWFAStatusesForOptionalDate.toString().includes(c.code))
  .map((status) => ({
    id: status.id.toString(),
    code: status.code,
    nameEn: status.nameEn,
    nameFr: status.nameFr,
  }));

export const employmentInformationSchema = v.pipe(
  v.intersect([
    v.object({
      substantivePosition: v.lazy(() =>
        v.picklist(
          allSubstantivePositions.map(({ id }) => String(id)),
          'app:employment-information.errors.substantive-group-and-level-required',
        ),
      ),
      branchOrServiceCanadaRegion: v.lazy(() =>
        v.picklist(
          allBranchOrServiceCanadaRegions.map(({ id }) => String(id)),
          'app:employment-information.errors.branch-or-service-canada-region-required',
        ),
      ),
      directorate: v.lazy(() =>
        v.picklist(
          allDirectorates.map(({ id }) => String(id)),
          'app:employment-information.errors.directorate-required',
        ),
      ),
      province: v.lazy(() =>
        v.picklist(
          allProvinces.map(({ id }) => String(id)),
          'app:employment-information.errors.provinces-required',
        ),
      ),
      city: v.lazy(() =>
        v.picklist(
          allCities.map(({ id }) => String(id)),
          'app:employment-information.errors.city-required',
        ),
      ),

      hrAdvisor: v.lazy(() =>
        v.picklist(
          hrAdvisors.map(({ id }) => id.toString()),
          'app:employment-information.errors.hr-advisor-required',
        ),
      ),
    }),
    v.variant(
      'wfaStatus',
      [
        v.object({
          wfaStatus: v.picklist(selectedValidWfaStatusesForOptionalDate.map(({ id }) => String(id))),
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
          wfaStatus: v.picklist(selectedValidWfaStatusesForRequiredDate.map(({ id }) => String(id))),
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
            v.trim(),
            v.transform((input) => (input === '' ? undefined : input)),
            v.optional(
              v.pipe(
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
                v.custom(
                  (input) => isValidDateString(input as string),
                  'app:employment-information.errors.wfa-end-date.invalid',
                ),
              ),
            ),
          ),
        }),
      ],
      'app:employment-information.errors.wfa-status-required',
    ),
  ]),
  v.forward(
    v.partialCheck(
      [['wfaEffectiveDate'], ['wfaEndDate']],
      //wfaEffectiveDate and wfaEndDate are optional, but if both are present, then check that wfaEffectiveDate < wfaEndDate
      (input) => !input.wfaEffectiveDate || !input.wfaEndDate || input.wfaEffectiveDate < input.wfaEndDate,
      'app:employment-information.errors.wfa-end-date.invalid-before-effective-date',
    ),
    ['wfaEndDate'],
  ),
);

export const refferralPreferencesSchema = v.object({
  languageReferralTypes: v.pipe(
    v.array(
      v.lazy(() =>
        v.picklist(
          allLanguageReferralTypes.map((l) => String(l.id)),
          'app:referral-preferences.errors.language-referral-type-invalid',
        ),
      ),
    ),
    v.nonEmpty('app:referral-preferences.errors.language-referral-type-required'),
    v.checkItems(
      (item, index, array) => array.indexOf(item) === index,
      'app:referral-preferences.errors.language-referral-type-duplicate',
    ),
  ),
  classifications: v.pipe(
    v.array(
      v.lazy(() =>
        v.picklist(
          allSubstantivePositions.map((c) => String(c.id)),
          'app:referral-preferences.errors.classification-invalid',
        ),
      ),
    ),
    v.nonEmpty('app:referral-preferences.errors.classification-required'),
    v.checkItems(
      (item, index, array) => array.indexOf(item) === index,
      'app:referral-preferences.errors.classification-duplicate',
    ),
  ),
  workLocationProvince: v.lazy(() =>
    v.picklist(
      allProvinces.map(({ id }) => String(id)),
      'app:referral-preferences.errors.work-location-province-required',
    ),
  ),
  workLocationCities: v.pipe(
    v.array(
      v.lazy(() =>
        v.picklist(
          allCities.map((c) => String(c.id)),
          'app:referral-preferences.errors.work-location-city-invalid',
        ),
      ),
    ),
    v.nonEmpty('app:referral-preferences.errors.work-location-city-required'),
    v.checkItems(
      (item, index, array) => array.indexOf(item) === index,
      'app:referral-preferences.errors.work-location-city-duplicate',
    ),
  ),
  referralAvailibility: v.boolean('app:referral-preferences.errors.referral-availibility-required'),
  alternateOpportunity: v.boolean('app:referral-preferences.errors.alternate-opportunity-required'),
  employmentTenures: v.pipe(
    v.array(
      v.lazy(() =>
        v.picklist(
          allEmploymentTenures.map((e) => String(e.id)),
          'app:referral-preferences.errors.employment-tenure-invalid',
        ),
      ),
    ),
    v.nonEmpty('app:referral-preferences.errors.employment-tenure-required'),
    v.checkItems(
      (item, index, array) => array.indexOf(item) === index,
      'app:referral-preferences.errors.employment-tenure-duplicate',
    ),
  ),
});

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
