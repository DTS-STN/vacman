import { parsePhoneNumberWithError } from 'libphonenumber-js';
import type { BaseIssue, BaseSchema } from 'valibot';
import * as v from 'valibot';

import type { User } from '~/.server/domain/models';
import { getCityService } from '~/.server/domain/services/city-service';
import { getClassificationService } from '~/.server/domain/services/classification-service';
import { getDirectorateService } from '~/.server/domain/services/directorate-service';
import { getLanguageForCorrespondenceService } from '~/.server/domain/services/language-for-correspondence-service';
import { getLanguageReferralTypeService } from '~/.server/domain/services/language-referral-type-service';
import { getProvinceService } from '~/.server/domain/services/province-service';
import { getWFAStatuses } from '~/.server/domain/services/wfa-status-service';
import { extractUniqueBranchesFromDirectoratesNonLocalized } from '~/.server/utils/directorate-utils';
import { stringToIntegerSchema } from '~/.server/validation/string-to-integer-schema';
import { EMPLOYEE_WFA_STATUS } from '~/domain/constants';
import { isValidDateString, toISODateString } from '~/utils/date-utils';
import { isValidPhone } from '~/utils/phone-utils';
import { REGEX_PATTERNS } from '~/utils/regex-utils';
import { formString } from '~/utils/string-utils';

export type EmploymentInformationSchema = Awaited<ReturnType<typeof createEmploymentInformationSchema>>;
export type PersonalInformationSchema = Awaited<ReturnType<typeof createPersonalInformationSchema>>;
export type ReferralPreferencesSchema = Awaited<ReturnType<typeof createReferralPreferencesSchema>>;
export type Errors = Readonly<Record<string, [string, ...string[]] | undefined>>;

export async function createEmploymentInformationSchema(hrAdvisors: User[]) {
  const allSubstantivePositions = await getClassificationService().listAll();
  const allDirectorates = await getDirectorateService().listAll();
  const allBranchOrServiceCanadaRegions = extractUniqueBranchesFromDirectoratesNonLocalized(allDirectorates);
  const allProvinces = await getProvinceService().listAll();
  const allCities = await getCityService().listAll();
  const allWfaStatus = await getWFAStatuses().listAll();

  const validWFAStatusesForRequiredDate = [
    EMPLOYEE_WFA_STATUS.opting,
    EMPLOYEE_WFA_STATUS.exOpting,
    EMPLOYEE_WFA_STATUS.surplusOptingOptionA,
    EMPLOYEE_WFA_STATUS.exSurplusCPA,
  ] as const;

  const validWFAStatusesForOptionalDate = [
    EMPLOYEE_WFA_STATUS.affected,
    EMPLOYEE_WFA_STATUS.exAffected,
    EMPLOYEE_WFA_STATUS.surplusGRJO,
  ] as const;

  const selectedValidWfaStatusesForRequiredDate = allWfaStatus.filter((c) =>
    validWFAStatusesForRequiredDate.toString().includes(c.code),
  );

  const selectedValidWfaStatusesForOptionalDate = allWfaStatus.filter((c) =>
    validWFAStatusesForOptionalDate.toString().includes(c.code),
  );

  return v.pipe(
    v.intersect([
      v.object({
        substantiveClassification: v.lazy(() =>
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
        wfaStartDateYear: v.pipe(
          stringToIntegerSchema('app:employment-information.errors.wfa-effective-date.required-year'),
          v.minValue(1, 'app:employment-information.errors.wfa-effective-date.invalid-year'),
        ),
        wfaStartDateMonth: v.pipe(
          stringToIntegerSchema('app:employment-information.errors.wfa-effective-date.required-month'),
          v.minValue(1, 'app:employment-information.errors.wfa-effective-date.invalid-month'),
          v.maxValue(12, 'app:employment-information.errors.wfa-effective-date.invalid-month'),
        ),
        wfaStartDateDay: v.pipe(
          stringToIntegerSchema('app:employment-information.errors.wfa-effective-date.required-day'),
          v.minValue(1, 'app:employment-information.errors.wfa-effective-date.invalid-day'),
          v.maxValue(31, 'app:employment-information.errors.wfa-effective-date.invalid-day'),
        ),
        wfaStartDate: v.pipe(
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
            ),
          ),
        ),
        hrAdvisorId: v.lazy(() =>
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
        [['wfaStartDate'], ['wfaEndDate']],
        //wfaStartDate and wfaEndDate are optional, but if both are present, then check that wfaStartDate < wfaEndDate
        (input) => !input.wfaStartDate || !input.wfaEndDate || input.wfaStartDate < input.wfaEndDate,
        'app:employment-information.errors.wfa-end-date.invalid-before-effective-date',
      ),
      ['wfaEndDate'],
    ),
  );
}

export async function createPersonalInformationSchema() {
  const allLanguagesOfCorrespondence = await getLanguageForCorrespondenceService().listAll();
  return v.object({
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
    languageOfCorrespondenceId: v.lazy(() =>
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
}

export async function createReferralPreferencesSchema() {
  const allLanguageReferralTypes = await getLanguageReferralTypeService().listAll();
  const allSubstantivePositions = await getClassificationService().listAll();
  const allProvinces = await getProvinceService().listAll();
  const allCities = await getCityService().listAll();

  return v.object({
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
  });
}

export async function parseEmploymentInformation(formData: FormData, hrAdvisors: User[]) {
  const wfaStartDateYear = formData.get('wfaStartDateYear')?.toString();
  const wfaStartDateMonth = formData.get('wfaStartDateMonth')?.toString();
  const wfaStartDateDay = formData.get('wfaStartDateDay')?.toString();
  const wfaEndDateYear = formData.get('wfaEndDateYear')?.toString();
  const wfaEndDateMonth = formData.get('wfaEndDateMonth')?.toString();
  const wfaEndDateDay = formData.get('wfaEndDateDay')?.toString();

  const formValues = {
    substantiveClassification: formString(formData.get('substantiveClassification')),
    branchOrServiceCanadaRegion: formString(formData.get('branchOrServiceCanadaRegion')),
    directorate: formString(formData.get('directorate')),
    provinceId: formString(formData.get('province')),
    cityId: formString(formData.get('cityId')),
    wfaStatusId: formString(formData.get('wfaStatus')),
    wfaStartDate: toDateString(wfaStartDateYear, wfaStartDateMonth, wfaStartDateDay),
    wfaStartDateYear,
    wfaStartDateMonth,
    wfaStartDateDay,
    wfaEndDate: toDateString(wfaEndDateYear, wfaEndDateMonth, wfaEndDateDay),
    wfaEndDateYear,
    wfaEndDateMonth,
    wfaEndDateDay,
    hrAdvisorId: formString(formData.get('hrAdvisorId')),
  };

  return {
    parseResult: v.safeParse(await createEmploymentInformationSchema(hrAdvisors), formValues),
    formValues: {
      substantiveClassification: formValues.substantiveClassification,
      branchOrServiceCanadaRegion: formValues.branchOrServiceCanadaRegion,
      directorate: formValues.directorate,
      provinceId: formValues.provinceId,
      cityId: formValues.cityId,
      wfaStatusId: formValues.wfaStatusId,
      wfaStartDateYear: formValues.wfaStartDateYear,
      wfaStartDateMonth: formValues.wfaStartDateMonth,
      wfaStartDateDay: formValues.wfaStartDateDay,
      wfaStartDate: formValues.wfaStartDate,
      wfaEndDate: formValues.wfaEndDate,
      wfaEndDateYear: formValues.wfaEndDateYear,
      wfaEndDateMonth: formValues.wfaEndDateMonth,
      wfaEndDateDay: formValues.wfaEndDateDay,
      hrAdvisorId: formValues.hrAdvisorId,
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
