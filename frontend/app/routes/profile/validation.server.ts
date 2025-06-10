import { parsePhoneNumberWithError } from 'libphonenumber-js';
import * as v from 'valibot';

import { getEducationLevelService } from '~/.server/domain/services/education-level-service';
import { getLanguageForCorrespondenceService } from '~/.server/domain/services/language-for-correspondence-service';
import { isValidPhone } from '~/utils/phone-utils';
import { REGEX_PATTERNS } from '~/utils/regex-utils';

const allLanguagesOfCorrespondance = await getLanguageForCorrespondenceService().getAll();
const languagesOfCorrespondence = allLanguagesOfCorrespondance.unwrap();
const allEducationLevels = await getEducationLevelService().getAll();
const educationLevels = allEducationLevels.unwrap();

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
  workPhone: v.pipe(
    v.string('app:personal-information.errors.work-phone-required'),
    v.trim(),
    v.nonEmpty('app:personal-information.errors.work-phone-required'),
    v.custom((val) => isValidPhone(val as string), 'app:personal-information.errors.work-phone-invalid'),
    v.transform((val) => parsePhoneNumberWithError(val, 'CA').formatInternational().replace(/ /g, '')),
  ),
  workPhoneExtension: v.optional(
    v.pipe(
      v.string(),
      v.trim(),
      v.regex(REGEX_PATTERNS.DIGIT_ONLY, 'app:personal-information.errors.work-phone-extension-invalid'),
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

export const employmentInformationSchema = v.object({
  substantivePosition: v.optional(v.string()),
  branchOrServiceCanadaRegion: v.optional(v.string()),
  directorate: v.optional(v.string()),
  province: v.optional(v.string()),
  city: v.optional(v.string()),
  currentWFAStatus: v.optional(v.string()),
  hrAdvisor: v.optional(v.string()),
});
