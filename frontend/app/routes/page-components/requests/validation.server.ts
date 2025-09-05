import * as v from 'valibot';

import { getCityService } from '~/.server/domain/services/city-service';
import { getDirectorateService } from '~/.server/domain/services/directorate-service';
import { getEmploymentEquityService } from '~/.server/domain/services/employment-equity-service';
import { getEmploymentTenureService } from '~/.server/domain/services/employment-tenure-service';
import { getLanguageForCorrespondenceService } from '~/.server/domain/services/language-for-correspondence-service';
import { getLanguageRequirementService } from '~/.server/domain/services/language-requirement-service';
import { getNonAdvertisedAppointmentService } from '~/.server/domain/services/non-advertised-appointment-service';
import { getProvinceService } from '~/.server/domain/services/province-service';
import { getSelectionProcessTypeService } from '~/.server/domain/services/selection-process-type-service';
import { extractUniqueBranchesFromDirectoratesNonLocalized } from '~/.server/utils/directorate-utils';
import { stringToIntegerSchema } from '~/.server/validation/string-to-integer-schema';
import { EMPLOYMENT_TENURE, LANGUAGE_REQUIREMENT_CODES, SELECTION_PROCESS_TYPE } from '~/domain/constants';
import { isValidDateString } from '~/utils/date-utils';

// Services that don't require authentication can be called at module level
const allProvinces = await getProvinceService().listAll();
const allCities = await getCityService().listAll();
const allLanguageRequirements = await getLanguageRequirementService().listAll();
const allSelectionProcessTypes = await getSelectionProcessTypeService().listAll();
const allNonAdvertisedAppointments = await getNonAdvertisedAppointmentService().listAll();
const allEmploymentTenures = await getEmploymentTenureService().listAll();
const allEmploymentEquities = await getEmploymentEquityService().listAll();

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

const selectedSelectionProcessTypeForExternalNonAdvertised = allSelectionProcessTypes
  .filter((c) => c.code === SELECTION_PROCESS_TYPE.externalNonAdvertised)
  .map((employmentTenure) => ({
    id: employmentTenure.id,
    code: employmentTenure.code,
    nameEn: employmentTenure.nameEn,
    nameFr: employmentTenure.nameFr,
  }));

const selectedSelectionProcessTypeForInternalNonAdvertised = allSelectionProcessTypes
  .filter((c) => c.code === SELECTION_PROCESS_TYPE.internalNonAdvertised)
  .map((employmentTenure) => ({
    id: employmentTenure.id,
    code: employmentTenure.code,
    nameEn: employmentTenure.nameEn,
    nameFr: employmentTenure.nameFr,
  }));

const selectedEmploymentTenureForIndeterminate = allEmploymentTenures
  .filter((c) => c.code === EMPLOYMENT_TENURE.indeterminate)
  .map((employmentTenure) => ({
    id: employmentTenure.id,
    code: employmentTenure.code,
    nameEn: employmentTenure.nameEn,
    nameFr: employmentTenure.nameFr,
  }));

const selectedEmploymentTenureForTerm = allEmploymentTenures
  .filter((c) => c.code === EMPLOYMENT_TENURE.term)
  .map((employmentTenure) => ({
    id: employmentTenure.id,
    code: employmentTenure.code,
    nameEn: employmentTenure.nameEn,
    nameFr: employmentTenure.nameFr,
  }));

const selectedNonAdvertisedAppointmentsForInternal = allNonAdvertisedAppointments.slice(0, 7).map((employmentTenure) => ({
  id: employmentTenure.id,
  code: employmentTenure.code,
  nameEn: employmentTenure.nameEn,
  nameFr: employmentTenure.nameFr,
}));

const selectedNonAdvertisedAppointmentsForExternal = allNonAdvertisedAppointments.slice(7).map((employmentTenure) => ({
  id: employmentTenure.id,
  code: employmentTenure.code,
  nameEn: employmentTenure.nameEn,
  nameFr: employmentTenure.nameFr,
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

const getIsSubmiterHiringManagerErrorMessage = (view: 'hr-advisor' | 'hiring-manager' | undefined) => {
  if (view === 'hiring-manager') {
    return 'app:submission-details.errors.are-you-hiring-manager-for-request-required';
  }
  // Default for 'hr-advisor' or if view is not provided/unexpected
  return 'app:submission-details.errors.is-submitter-hiring-manager-required';
};
export const submissionDetailSchema = (view: 'hr-advisor' | 'hiring-manager' | undefined) => {
  return v.object({
    view: v.optional(v.string()),
    isSubmiterHiringManager: v.boolean(
      getIsSubmiterHiringManagerErrorMessage(view), // Pass the view to get the correct error message
    ),
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
  });
};

export const processInformationSchema = v.pipe(
  v.intersect([
    v.object({
      selectionProcessNumber: v.pipe(
        v.string('app:process-information.errors.selection-process-number-required'),
        v.trim(),
        v.nonEmpty('app:process-information.errors.selection-process-number-required'),
      ),
      approvalReceived: v.pipe(v.boolean('app:process-information.errors.approval-received-required')),
      workSchedule: v.pipe(
        v.string('app:process-information.errors.performed-duties-required'),
        v.trim(),
        v.nonEmpty('app:process-information.errors.performed-duties-required'),
      ),
    }),
    v.variant(
      'priorityEntitlement',
      [
        v.object({
          priorityEntitlement: v.literal(true),
          priorityEntitlementRationale: v.pipe(
            v.string('app:process-information.errors.priority-entitlement-rationale-required'),
            v.trim(),
            v.nonEmpty('app:process-information.errors.priority-entitlement-rationale-required'),
          ),
        }),
        v.object({
          priorityEntitlement: v.literal(false),
          priorityEntitlementRationale: v.optional(v.string()),
        }),
      ],
      'app:process-information.errors.priority-entitlement-required',
    ),
    v.variant(
      'preferredSelectionProcessType',
      [
        v.object({
          preferredSelectionProcessType: v.pipe(
            stringToIntegerSchema(),
            v.picklist(selectedSelectionProcessTypeForExternalNonAdvertised.map(({ id }) => id)),
          ),
          performedDuties: v.pipe(v.boolean('app:process-information.errors.performed-duties-required')),
          nonAdvertisedAppointment: v.lazy(() =>
            v.pipe(
              stringToIntegerSchema('app:process-information.errors.non-advertised-appointment-required'),
              v.picklist(
                selectedNonAdvertisedAppointmentsForExternal.map(({ id }) => id),
                'app:process-information.errors.non-advertised-appointment-required',
              ),
            ),
          ),
        }),
        v.object({
          preferredSelectionProcessType: v.pipe(
            stringToIntegerSchema(),
            v.picklist(selectedSelectionProcessTypeForInternalNonAdvertised.map(({ id }) => id)),
          ),
          performedDuties: v.pipe(v.boolean('app:process-information.errors.performed-duties-required')),
          nonAdvertisedAppointment: v.lazy(() =>
            v.pipe(
              stringToIntegerSchema('app:process-information.errors.non-advertised-appointment-required'),
              v.picklist(
                selectedNonAdvertisedAppointmentsForInternal.map(({ id }) => id),
                'app:process-information.errors.non-advertised-appointment-required',
              ),
            ),
          ),
        }),
      ],
      'app:process-information.errors.selection-process-type-required',
    ),
    v.variant(
      'employmentTenure',
      [
        v.object({
          employmentTenure: v.pipe(
            stringToIntegerSchema(),
            v.picklist(selectedEmploymentTenureForIndeterminate.map(({ id }) => id)),
          ),
          projectedStartDateYear: v.optional(v.string()),
          projectedStartDateMonth: v.optional(v.string()),
          projectedStartDateDay: v.optional(v.string()),
          projectedStartDate: v.optional(v.string()),
          projectedEndDateYear: v.optional(v.string()),
          projectedEndDateMonth: v.optional(v.string()),
          projectedEndDateDay: v.optional(v.string()),
          projectedEndDate: v.optional(v.string()),
        }),
        v.object({
          employmentTenure: v.pipe(stringToIntegerSchema(), v.picklist(selectedEmploymentTenureForTerm.map(({ id }) => id))),
          projectedStartDateYear: v.pipe(
            stringToIntegerSchema('app:process-information.errors.projected-start-date.invalid-year'),
            v.minValue(1, 'app:process-information.errors.projected-start-date.invalid-year'),
          ),
          projectedStartDateMonth: v.pipe(
            stringToIntegerSchema('app:process-information.errors.projected-start-date.required-month'),
            v.minValue(1, 'app:process-information.errors.projected-start-date.invalid-month'),
            v.maxValue(12, 'app:process-information.errors.projected-start-date.invalid-month'),
          ),
          projectedStartDateDay: v.pipe(
            stringToIntegerSchema('app:process-information.errors.projected-start-date.required-day'),
            v.minValue(1, 'app:process-information.errors.projected-start-date.invalid-day'),
            v.maxValue(31, 'app:process-information.errors.projected-start-date.invalid-day'),
          ),
          projectedStartDate: v.pipe(
            v.string(),
            v.custom(
              (input) => isValidDateString(input as string),
              'app:process-information.errors.projected-start-date.invalid',
            ),
          ),
          projectedEndDateYear: v.pipe(
            stringToIntegerSchema('app:process-information.errors.projected-end-date.invalid-year'),
            v.minValue(1, 'app:process-information.errors.projected-end-date.invalid-year'),
          ),
          projectedEndDateMonth: v.pipe(
            stringToIntegerSchema('app:process-information.errors.projected-end-date.required-month'),
            v.minValue(1, 'app:process-information.errors.projected-end-date.invalid-month'),
            v.maxValue(12, 'app:process-information.errors.projected-end-date.invalid-month'),
          ),
          projectedEndDateDay: v.pipe(
            stringToIntegerSchema('app:process-information.errors.projected-end-date.required-day'),
            v.minValue(1, 'app:process-information.errors.projected-end-date.invalid-day'),
            v.maxValue(31, 'app:process-information.errors.projected-end-date.invalid-day'),
          ),
          projectedEndDate: v.pipe(
            v.string(),
            v.custom(
              (input) => isValidDateString(input as string),
              'app:process-information.errors.projected-end-date.invalid',
            ),
          ),
        }),
      ],
      'app:process-information.errors.employment-tenure-required',
    ),
    v.variant(
      'employmentEquityIdentified',
      [
        v.object({
          employmentEquityIdentified: v.literal(true),
          preferredEmploymentEquities: v.array(
            v.lazy(() =>
              v.pipe(
                stringToIntegerSchema('app:process-information.errors.employment-equities-required'),
                v.picklist(
                  allEmploymentEquities.map(({ id }) => id),
                  'app:process-information.errors.employment-equities-required',
                ),
              ),
            ),
          ),
        }),
        v.object({
          employmentEquityIdentified: v.literal(false),
          preferredEmploymentEquities: v.optional(v.array(v.number())),
        }),
      ],
      'app:process-information.errors.employment-equity-identified-required',
    ),
  ]),
  v.forward(
    v.check(
      //projectedStartDate and projectedEndDate are optional, but if both are present, then check that projectedStartDate < projectedEndDate
      (input) => !input.projectedStartDate || !input.projectedEndDate || input.projectedStartDate < input.projectedEndDate,
      'app:process-information.errors.projected-end-date.invalid-before-effective-date',
    ),
    ['projectedEndDate'],
  ),
);
