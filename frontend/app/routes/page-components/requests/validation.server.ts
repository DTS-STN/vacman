import * as v from 'valibot';

import { getCityService } from '~/.server/domain/services/city-service';
import { getDirectorateService } from '~/.server/domain/services/directorate-service';
import { getLanguageForCorrespondenceService } from '~/.server/domain/services/language-for-correspondence-service';
import { getLanguageRequirementService } from '~/.server/domain/services/language-requirement-service';
import { getProvinceService } from '~/.server/domain/services/province-service';
import { extractUniqueBranchesFromDirectoratesNonLocalized } from '~/.server/utils/directorate-utils';
import { stringToIntegerSchema } from '~/.server/validation/string-to-integer-schema';
import { LANGUAGE_REQUIREMENT_CODES } from '~/domain/constants';

// Services that don't require authentication can be called at module level
const allProvinces = await getProvinceService().listAll();
const allCities = await getCityService().listAll();
const allLanguageRequirements = await getLanguageRequirementService().listAll();

export type Errors = Readonly<Record<string, [string, ...string[]] | undefined>>;

const validLanguageRequirementForRequiredLanguageLevel = [
  LANGUAGE_REQUIREMENT_CODES.bilingualImperative,
  LANGUAGE_REQUIREMENT_CODES.bilingualNonImperative,
] as const;

const validLanguageRequirementForOptionalLanguageLevel = [
  LANGUAGE_REQUIREMENT_CODES.englishEssential,
  LANGUAGE_REQUIREMENT_CODES.frenchEssential,
  LANGUAGE_REQUIREMENT_CODES.either,
  LANGUAGE_REQUIREMENT_CODES.various,
] as const;

const selectedLanguageRequirementForRequiredLanguageLevel = allLanguageRequirements
  .filter((c) => validLanguageRequirementForRequiredLanguageLevel.toString().includes(c.code))
  .map((languageRequirement) => ({
    id: languageRequirement.id,
    code: languageRequirement.code,
    nameEn: languageRequirement.nameEn,
    nameFr: languageRequirement.nameFr,
  }));

const selectedLanguageRequirementForOptionalLanguageLevel = allLanguageRequirements
  .filter((c) => validLanguageRequirementForOptionalLanguageLevel.toString().includes(c.code))
  .map((languageRequirement) => ({
    id: languageRequirement.id,
    code: languageRequirement.code,
    nameEn: languageRequirement.nameEn,
    nameFr: languageRequirement.nameFr,
  }));

export const positionInformationSchema = v.pipe(
  v.intersect([
    v.object({
      positionNumber: v.pipe(
        v.string('app:position-information.errors.position-number-required'),
        v.trim(),
        v.nonEmpty('app:position-information.errors.position-number-required'),
        v.custom((input) => {
          const value = input as string;
          const numbers = value.split(',').map((n) => n.trim());
          return numbers.every((n) => n.length === 6); // TODO: Need to confirm validation
        }, 'app:position-information.errors.position-number-max-length'),
      ),
      groupAndLevel: v.pipe(
        v.string('app:position-information.errors.group-and-level-required'),
        v.trim(),
        v.nonEmpty('app:position-information.errors.group-and-level-required'),
      ),
      titleEn: v.pipe(
        v.string('app:position-information.errors.title-en-required'),
        v.trim(),
        v.nonEmpty('app:position-information.errors.title-en-required'),
      ),
      titleFr: v.pipe(
        v.string('app:position-information.errors.title-fr-required'),
        v.trim(),
        v.nonEmpty('app:position-information.errors.title-fr-required'),
      ),
      province: v.lazy(() =>
        v.pipe(
          stringToIntegerSchema('app:position-information.errors.provinces-required'),
          v.picklist(
            allProvinces.map(({ id }) => id),
            'app:position-information.errors.provinces-required',
          ),
        ),
      ),
      city: v.lazy(() =>
        v.pipe(
          stringToIntegerSchema('app:position-information.errors.city-required'),
          v.picklist(
            allCities.map(({ id }) => id),
            'app:position-information.errors.city-required',
          ),
        ),
      ),
      securityRequirement: v.pipe(
        v.string('app:position-information.errors.security-requirement-required'),
        v.trim(),
        v.nonEmpty('app:position-information.errors.security-requirement-required'),
      ),
    }),
    v.variant(
      'languageRequirement',
      [
        v.object({
          languageRequirement: v.pipe(
            stringToIntegerSchema(),
            v.picklist(selectedLanguageRequirementForOptionalLanguageLevel.map(({ id }) => id)),
          ),
          readingEn: v.optional(v.string()),
          readingFr: v.optional(v.string()),
          writingEn: v.optional(v.string()),
          writingFr: v.optional(v.string()),
          oralEn: v.optional(v.string()),
          oralFr: v.optional(v.string()),
        }),
        v.object({
          languageRequirement: v.pipe(
            stringToIntegerSchema(),
            v.picklist(selectedLanguageRequirementForRequiredLanguageLevel.map(({ id }) => id)),
          ),
          readingEn: v.pipe(
            v.pipe(v.string('app:position-information.errors.language-profile.reading-comprehension-required'), v.trim()),
          ),
          readingFr: v.pipe(
            v.pipe(v.string('app:position-information.errors.language-profile.reading-comprehension-required'), v.trim()),
          ),
          writingEn: v.pipe(
            v.pipe(v.string('app:position-information.errors.language-profile.written-expression-required'), v.trim()),
          ),
          writingFr: v.pipe(
            v.pipe(v.string('app:position-information.errors.language-profile.written-expression-required'), v.trim()),
          ),
          oralEn: v.pipe(
            v.pipe(v.string('app:position-information.errors.language-profile.oral-proficiency-required'), v.trim()),
          ),
          oralFr: v.pipe(
            v.pipe(v.string('app:position-information.errors.language-profile.oral-proficiency-required'), v.trim()),
          ),
        }),
      ],
      'app:position-information.errors.language-requirement-required',
    ),
  ]),
);

export const somcConditionsSchema = v.pipe(
  v.object({
    englishStatementOfMerit: v.pipe(
      v.string('app:somc-conditions.errors.english-somc-required'),
      v.trim(),
      v.nonEmpty('app:somc-conditions.errors.english-somc-required'),
    ),
    frenchStatementOfMerit: v.pipe(
      v.string('app:somc-conditions.errors.french-somc-required'),
      v.trim(),
      v.nonEmpty('app:somc-conditions.errors.french-somc-required'),
    ),
  }),
);

const allDirectorates = await getDirectorateService().listAll();
const allBranchOrServiceCanadaRegions = extractUniqueBranchesFromDirectoratesNonLocalized(allDirectorates);
const allLanguagesOfCorrespondence = await getLanguageForCorrespondenceService().listAll();

export const submissionDetailSchema = v.pipe(
  v.object({
    branchOrServiceCanadaRegion: v.lazy(() =>
      v.pipe(
        stringToIntegerSchema('app:submission-details.errors.branch-or-service-canada-region-required'),
        v.picklist(
          allBranchOrServiceCanadaRegions.map(({ id }) => id),
          'app:submission-details.errors.branch-or-service-canada-region-required',
        ),
      ),
    ),
    directorate: v.lazy(() =>
      v.pipe(
        stringToIntegerSchema('app:submission-details.errors.directorate-required'),
        v.picklist(
          allDirectorates.map(({ id }) => id),
          'app:submission-details.errors.directorate-required',
        ),
      ),
    ),
    languageOfCorrespondenceId: v.lazy(() =>
      v.pipe(
        stringToIntegerSchema('app:submission-details.errors.preferred-language-of-correspondence-required'),
        v.picklist(
          allLanguagesOfCorrespondence.map(({ id }) => id),
          'app:submission-details.errors.preferred-language-of-correspondence-required',
        ),
      ),
    ),
    additionalComment: v.optional(
      v.pipe(
        v.string('app:submission-details.errors.additional-information-required'),
        v.trim(),
        v.maxLength(100, 'app:submission-details.errors.additional-information-max-length'),
      ),
    ),
  }),
);
