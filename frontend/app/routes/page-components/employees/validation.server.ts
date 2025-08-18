import { parsePhoneNumberWithError } from 'libphonenumber-js';
import * as v from 'valibot';
import type { BaseSchema, BaseIssue } from 'valibot';

import { getCityService } from '~/.server/domain/services/city-service';
import { getClassificationService } from '~/.server/domain/services/classification-service';
import { getDirectorateService } from '~/.server/domain/services/directorate-service';
import { getEmploymentOpportunityTypeService } from '~/.server/domain/services/employment-opportunity-type-service';
import { getLanguageForCorrespondenceService } from '~/.server/domain/services/language-for-correspondence-service';
import { getLanguageReferralTypeService } from '~/.server/domain/services/language-referral-type-service';
import { getProvinceService } from '~/.server/domain/services/province-service';
import { getWFAStatuses } from '~/.server/domain/services/wfa-status-service';
import { serverEnvironment } from '~/.server/environment';
import { extractUniqueBranchesFromDirectoratesNonLocalized } from '~/.server/utils/directorate-utils';
import { getHrAdvisors } from '~/.server/utils/profile-utils';
import { stringToIntegerSchema } from '~/.server/validation/string-to-integer-schema';
import { EMPLOYEE_WFA_STATUS } from '~/domain/constants';
import { getStartOfDayInTimezone, isDateInPastOrTodayInTimeZone, isValidDateString, toISODateString } from '~/utils/date-utils';
import { isValidPhone } from '~/utils/phone-utils';
import { REGEX_PATTERNS } from '~/utils/regex-utils';
import { formString } from '~/utils/string-utils';

// Services that don't require authentication can be called at module level
const allLanguagesOfCorrespondence = await getLanguageForCorrespondenceService().listAll();
const allSubstantivePositions = await getClassificationService().listAll();
const allWfaStatus = await getWFAStatuses().listAll();
const allDirectorates = await getDirectorateService().listAll();
const allBranchOrServiceCanadaRegions = extractUniqueBranchesFromDirectoratesNonLocalized(allDirectorates);
const allProvinces = await getProvinceService().listAll();
const allCities = await getCityService().listAll();
const allLanguageReferralTypes = await getLanguageReferralTypeService().listAll();
const allEmploymentOpportunities = await getEmploymentOpportunityTypeService().listAll();

// Function to create employment information schema with HR advisors
export async function createEmploymentInformationSchema(accessToken: string, formData?: FormData) {
  const hrAdvisors = await getHrAdvisors(accessToken);

  return v.pipe(
    v.intersect([
      v.object({
        substantivePosition: v.lazy(() =>
          v.pipe(
            stringToIntegerSchema('app:employment-information.errors.substantive-group-and-level-required'),
            v.picklist(
              allSubstantivePositions.map(({ id }) => id),
              'app:employment-information.errors.substantive-group-and-level-required',
            ),
          ),
        ),
        branchOrServiceCanadaRegion: v.lazy(() =>
          v.pipe(
            stringToIntegerSchema('app:employment-information.errors.branch-or-service-canada-region-required'),
            v.picklist(
              allBranchOrServiceCanadaRegions.map(({ id }) => id),
              'app:employment-information.errors.branch-or-service-canada-region-required',
            ),
          ),
        ),
        directorate: v.lazy(() =>
          v.pipe(
            stringToIntegerSchema('app:employment-information.errors.directorate-required'),
            v.picklist(
              allDirectorates.map(({ id }) => id),
              'app:employment-information.errors.directorate-required',
            ),
          ),
        ),
        provinceId: v.lazy(() =>
          v.pipe(
            stringToIntegerSchema('app:employment-information.errors.provinces-required'),
            v.picklist(
              allProvinces.map(({ id }) => id),
              'app:employment-information.errors.provinces-required',
            ),
          ),
        ),
        cityId: v.lazy(() =>
          v.pipe(
            stringToIntegerSchema('app:employment-information.errors.city-required'),
            v.picklist(
              allCities.map(({ id }) => id),
              'app:employment-information.errors.city-required',
            ),
          ),
        ),
        hrAdvisor: v.lazy(() =>
          v.pipe(
            stringToIntegerSchema('app:employment-information.errors.hr-advisor-required'),
            v.picklist(
              hrAdvisors.map(({ id }) => Number(id)),
              'app:employment-information.errors.hr-advisor-required',
            ),
          ),
        ),
      }),
      v.variant(
        'wfaStatusId',
        [
          v.object({
            wfaStatusId: v.pipe(
              stringToIntegerSchema(),
              v.picklist(selectedValidWfaStatusesForOptionalDate.map(({ id }) => id)),
            ),
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
            wfaStatusId: v.pipe(
              stringToIntegerSchema(),
              v.picklist(selectedValidWfaStatusesForRequiredDate.map(({ id }) => id)),
            ),
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
}

// Export type alias for backward compatibility
export type EmploymentInformationSchema = Awaited<ReturnType<typeof createEmploymentInformationSchema>>;

export type Errors = Readonly<Record<string, [string, ...string[]] | undefined>>;

export const personalInformationSchema = v.object({
  firstName: v.pipe(
    v.string('app:personal-information.errors.surname-required'),
    v.trim(),
    v.nonEmpty('app:personal-information.errors.surname-required'),
  ),
  lastName: v.pipe(
    v.string('app:personal-information.errors.givenName-required'),
    v.trim(),
    v.nonEmpty('app:personal-information.errors.givenName-required'),
  ),
  personalRecordIdentifier: v.pipe(
    v.string('app:personal-information.errors.personal-record-identifier-required'),
    v.trim(),
    v.nonEmpty('app:personal-information.errors.personal-record-identifier-required'),
    v.length(9, 'app:personal-information.errors.personal-record-identifier-invalid'),
    v.regex(REGEX_PATTERNS.DIGIT_ONLY, 'app:personal-information.errors.personal-record-identifier-invalid'),
  ),
  languageOfCorrespondence: v.lazy(() =>
    v.pipe(
      stringToIntegerSchema('app:personal-information.errors.language-of-correspondence-required'),
      v.picklist(
        allLanguagesOfCorrespondence.map(({ id }) => id),
        'app:personal-information.errors.language-of-correspondence-required',
      ),
    ),
  ),
  businessEmailAddress: v.pipe(
    v.string('app:personal-information.errors.work-email-required'),
    v.trim(),
    v.nonEmpty('app:personal-information.errors.work-email-required'),
    v.email('app:personal-information.errors.work-email-invalid'),
  ),
  personalEmailAddress: v.pipe(
    v.string('app:personal-information.errors.personal-email-required'),
    v.trim(),
    v.nonEmpty('app:personal-information.errors.personal-email-required'),
    v.email('app:personal-information.errors.personal-email-invalid'),
  ),
  businessPhoneNumber: v.optional(
    v.pipe(
      v.string('app:personal-information.errors.work-phone-required'),
      v.trim(),
      v.custom((val) => isValidPhone(val as string), 'app:personal-information.errors.work-phone-invalid'),
      v.transform((val) => parsePhoneNumberWithError(val, 'CA').formatInternational().replace(/ /g, '')),
    ),
  ),
  personalPhoneNumber: v.pipe(
    v.string('app:personal-information.errors.personal-phone-required'),
    v.trim(),
    v.nonEmpty('app:personal-information.errors.personal-phone-required'),
    v.custom((val) => isValidPhone(val as string), 'app:personal-information.errors.personal-phone-invalid'),
    v.transform((val) => parsePhoneNumberWithError(val, 'CA').formatInternational().replace(/ /g, '')),
  ),
  additionalComment: v.optional(
    v.pipe(
      v.string('app:personal-information.errors.additional-information-required'),
      v.trim(),
      v.maxLength(100, 'app:personal-information.errors.additional-information-max-length'),
    ),
  ),
});

const validWFAStatusesForRequiredDate = [
  EMPLOYEE_WFA_STATUS.opting,
  EMPLOYEE_WFA_STATUS.surplusGRJO,
  EMPLOYEE_WFA_STATUS.surplusOptingOptionA,
  EMPLOYEE_WFA_STATUS.exOpting,
  EMPLOYEE_WFA_STATUS.exSurplusCPA,
] as const;

const validWFAStatusesForOptionalDate = [EMPLOYEE_WFA_STATUS.affected, EMPLOYEE_WFA_STATUS.exAffected] as const;

const selectedValidWfaStatusesForRequiredDate = allWfaStatus
  .filter((c) => validWFAStatusesForRequiredDate.toString().includes(c.code))
  .map((status) => ({
    id: status.id,
    code: status.code,
    nameEn: status.nameEn,
    nameFr: status.nameFr,
  }));

const selectedValidWfaStatusesForOptionalDate = allWfaStatus
  .filter((c) => validWFAStatusesForOptionalDate.toString().includes(c.code))
  .map((status) => ({
    id: status.id,
    code: status.code,
    nameEn: status.nameEn,
    nameFr: status.nameFr,
  }));

export const referralPreferencesSchema = v.object({
  preferredLanguages: v.pipe(
    v.array(
      v.lazy(() =>
        v.pipe(
          stringToIntegerSchema('app:referral-preferences.errors.language-referral-type-invalid'),
          v.picklist(
            allLanguageReferralTypes.map((l) => l.id),
            'app:referral-preferences.errors.language-referral-type-invalid',
          ),
        ),
      ),
    ),
    v.nonEmpty('app:referral-preferences.errors.language-referral-type-required'),
    v.checkItems(
      (item, index, array) => array.indexOf(item) === index,
      'app:referral-preferences.errors.language-referral-type-duplicate',
    ),
  ),
  preferredClassifications: v.pipe(
    v.array(
      v.lazy(() =>
        v.pipe(
          stringToIntegerSchema('app:referral-preferences.errors.classification-invalid'),
          v.picklist(
            allSubstantivePositions.map((c) => c.id),
            'app:referral-preferences.errors.classification-invalid',
          ),
        ),
      ),
    ),
    v.nonEmpty('app:referral-preferences.errors.classification-required'),
    v.checkItems(
      (item, index, array) => array.indexOf(item) === index,
      'app:referral-preferences.errors.classification-duplicate',
    ),
  ),
  preferredProvince: v.lazy(() =>
    v.pipe(
      stringToIntegerSchema('app:referral-preferences.errors.work-location-province-required'),
      v.picklist(
        allProvinces.map(({ id }) => id),
        'app:referral-preferences.errors.work-location-province-required',
      ),
    ),
  ),
  preferredCities: v.pipe(
    v.array(
      v.lazy(() =>
        v.pipe(
          stringToIntegerSchema('app:referral-preferences.errors.work-location-city-invalid'),
          v.picklist(
            allCities.map((c) => c.id),
            'app:referral-preferences.errors.work-location-city-invalid',
          ),
        ),
      ),
    ),
    v.nonEmpty('app:referral-preferences.errors.work-location-city-required'),
    v.checkItems(
      (item, index, array) => array.indexOf(item) === index,
      'app:referral-preferences.errors.work-location-city-duplicate',
    ),
  ),
  isAvailableForReferral: v.boolean('app:referral-preferences.errors.referral-availibility-required'),
  isInterestedInAlternation: v.boolean('app:referral-preferences.errors.alternate-opportunity-required'),
  preferredEmploymentOpportunities: v.pipe(
    v.array(
      v.lazy(() =>
        v.pipe(
          stringToIntegerSchema('app:referral-preferences.errors.employment-tenure-invalid'),
          v.picklist(
            allEmploymentOpportunities.map((e) => e.id),
            'app:referral-preferences.errors.employment-tenure-invalid',
          ),
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

export async function parseEmploymentInformation(formData: FormData, accessToken: string) {
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
    provinceId: formString(formData.get('province')),
    cityId: formString(formData.get('cityId')),
    wfaStatusId: formString(formData.get('wfaStatus')),
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

  const employmentInformationSchema = await createEmploymentInformationSchema(accessToken, formData);

  return {
    parseResult: v.safeParse(employmentInformationSchema, formValues),
    formValues: {
      substantivePosition: formValues.substantivePosition,
      branchOrServiceCanadaRegion: formValues.branchOrServiceCanadaRegion,
      directorate: formValues.directorate,
      provinceId: formValues.provinceId,
      cityId: formValues.cityId,
      wfaStatusId: formValues.wfaStatusId,
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
