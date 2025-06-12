import { parsePhoneNumberWithError } from 'libphonenumber-js';
import * as v from 'valibot';

import { getBranchService } from '~/.server/domain/services/branch-service';
import { getCityService } from '~/.server/domain/services/city-service';
import { getClassificationService } from '~/.server/domain/services/classification-service';
import { getDirectorateService } from '~/.server/domain/services/directorate-service';
import { getEducationLevelService } from '~/.server/domain/services/education-level-service';
import { getLanguageForCorrespondenceService } from '~/.server/domain/services/language-for-correspondence-service';
import { getProvinceService } from '~/.server/domain/services/province-service';
import { isValidPhone } from '~/utils/phone-utils';
import { REGEX_PATTERNS } from '~/utils/regex-utils';

const allLanguagesOfCorrespondance = await getLanguageForCorrespondenceService().getAll();
const languagesOfCorrespondence = allLanguagesOfCorrespondance.unwrap();
const allEducationLevels = await getEducationLevelService().getAll();
const educationLevels = allEducationLevels.unwrap();
const allSubstantivePositions = await getClassificationService().getAll();
const substantivePositions = allSubstantivePositions.unwrap();
const allBranchOrServiceCanadaRegions = await getBranchService().getAll();
const branchOrServiceCanadaRegions = allBranchOrServiceCanadaRegions.unwrap();
const directorates = await getDirectorateService().getDirectorates();
const allProvinces = await getProvinceService().getAll();
const province = allProvinces.unwrap();
const allCities = await getCityService().getAll();
const cities = allCities.unwrap();

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

export const employmentInformationSchema = v.object({
  substantivePosition: v.lazy(() =>
    v.picklist(
      substantivePositions.map(({ id }) => id),
      'app:employmeny-information.errors.substantive-group-and-level-required',
    ),
  ),
  branchOrServiceCanadaRegion: v.lazy(() =>
    v.picklist(
      branchOrServiceCanadaRegions.map(({ id }) => id),
      'app:employmeny-information.errors.branch-or-service-canada-region-required',
    ),
  ),
  directorate: v.lazy(() =>
    v.picklist(
      directorates.map(({ id }) => id),
      'app:employmeny-information.errors.directorate-required',
    ),
  ),
  province: v.lazy(() =>
    v.picklist(
      province.map(({ id }) => id),
      'app:employmeny-information.errors.provinces-required',
    ),
  ),
  city: v.lazy(() =>
    v.picklist(
      cities.map(({ id }) => id),
      'app:employmeny-information.errors.city-required',
    ),
  ),
  currentWFAStatus: v.optional(v.string()),
  hrAdvisor: v.optional(v.string()),
});
