import * as v from 'valibot';

import { getCityService } from '~/.server/domain/services/city-service';
import { getEmploymentEquityService } from '~/.server/domain/services/employment-equity-service';
import { getEmploymentTenureService } from '~/.server/domain/services/employment-tenure-service';
import { getLanguageForCorrespondenceService } from '~/.server/domain/services/language-for-correspondence-service';
import { getLanguageRequirementService } from '~/.server/domain/services/language-requirement-service';
import { getNonAdvertisedAppointmentService } from '~/.server/domain/services/non-advertised-appointment-service';
import { getProvinceService } from '~/.server/domain/services/province-service';
import { getSelectionProcessTypeService } from '~/.server/domain/services/selection-process-type-service';
import { getWorkUnitService } from '~/.server/domain/services/workunit-service';
import { serverEnvironment } from '~/.server/environment';
import { extractUniqueBranchesFromDirectoratesNonLocalized } from '~/.server/utils/directorate-utils';
import { stringToIntegerSchema } from '~/.server/validation/string-to-integer-schema';
import { EMPLOYMENT_TENURE, LANGUAGE_REQUIREMENT_CODES, REQUIRE_OPTIONS, SELECTION_PROCESS_TYPE } from '~/domain/constants';
import { isPastOrTodayInTimeZone, isValidCalendarDate, toDateString } from '~/utils/date-utils';
import { REGEX_PATTERNS } from '~/utils/regex-utils';
import { formString } from '~/utils/string-utils';
import { optionalString } from '~/utils/validation-utils';

export type PositionInformationSchema = Awaited<ReturnType<typeof createPositionInformationSchema>>;
export type ProcessInformationSchema = Awaited<ReturnType<typeof createProcessInformationSchema>>;
export type SubmissionDetailSchema = Awaited<ReturnType<typeof createSubmissionDetailSchema>>;
export type Errors = Readonly<Record<string, [string, ...string[]] | undefined>>;

export async function createPositionInformationSchema() {
  const allProvinces = await getProvinceService().listAll();
  const allCities = await getCityService().listAll();
  const allLanguageRequirements = await getLanguageRequirementService().listAll();

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

  const selectedLanguageRequirementForRequiredLanguageLevel = allLanguageRequirements.filter((c) =>
    validLanguageRequirementForRequiredLanguageLevel.toString().includes(c.code),
  );

  const selectedLanguageRequirementForOptionalLanguageLevel = allLanguageRequirements.filter((c) =>
    validLanguageRequirementForOptionalLanguageLevel.toString().includes(c.code),
  );

  return v.pipe(
    v.intersect([
      v.object({
        positionNumber: v.pipe(
          v.string('app:position-information.errors.position-number-required'),
          v.trim(),
          v.nonEmpty('app:position-information.errors.position-number-required'),
          v.maxLength(100, 'app:position-information.errors.position-number-max'),
          v.custom((input) => {
            const value = input as string;
            const numbers = value.split(',').map((n) => n.trim());
            // Check that each position number is exactly 8 digits
            return numbers.every((n) => n.length === 8 && REGEX_PATTERNS.DIGIT_ONLY.test(n));
          }, 'app:position-information.errors.position-number-max-length'),
          v.custom((input) => {
            const value = input as string;
            const numbers = value.split(',').map((n) => n.trim());
            const uniqueNumbers = new Set(numbers);
            return uniqueNumbers.size === numbers.length;
          }, 'app:position-information.errors.position-number-duplicate'),
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
          v.maxLength(200, 'app:position-information.errors.title-en-max-length'),
        ),
        titleFr: v.pipe(
          v.string('app:position-information.errors.title-fr-required'),
          v.trim(),
          v.nonEmpty('app:position-information.errors.title-fr-required'),
          v.maxLength(200, 'app:position-information.errors.title-fr-max-length'),
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
        cities: v.pipe(
          v.array(
            v.lazy(() =>
              v.pipe(
                stringToIntegerSchema('app:position-information.errors.city-invalid'),
                v.picklist(
                  allCities.map((c) => c.id),
                  'app:position-information.errors.city-invalid',
                ),
              ),
            ),
          ),
          v.nonEmpty('app:position-information.errors.city-required'),
          v.checkItems((item, index, array) => array.indexOf(item) === index, 'app:position-information.errors.city-duplicate'),
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
              v.pipe(v.string('app:position-information.errors.language-profile.reading-comprehension-en-required'), v.trim()),
            ),
            readingFr: v.pipe(
              v.pipe(v.string('app:position-information.errors.language-profile.reading-comprehension-fr-required'), v.trim()),
            ),
            writingEn: v.pipe(
              v.pipe(v.string('app:position-information.errors.language-profile.written-expression-en-required'), v.trim()),
            ),
            writingFr: v.pipe(
              v.pipe(v.string('app:position-information.errors.language-profile.written-expression-fr-required'), v.trim()),
            ),
            oralEn: v.pipe(
              v.pipe(v.string('app:position-information.errors.language-profile.oral-proficiency-en-required'), v.trim()),
            ),
            oralFr: v.pipe(
              v.pipe(v.string('app:position-information.errors.language-profile.oral-proficiency-fr-required'), v.trim()),
            ),
          }),
        ],
        'app:position-information.errors.language-requirement-required',
      ),
    ]),
  );
}

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

export async function createSubmissionDetailSchema(view: 'hr-advisor' | 'hiring-manager') {
  const allDirectorates = await getWorkUnitService().listAll();
  const allBranchOrServiceCanadaRegions = extractUniqueBranchesFromDirectoratesNonLocalized(allDirectorates);
  const allLanguagesOfCorrespondence = await getLanguageForCorrespondenceService().listAll();

  const getIsSubmiterHiringManagerErrorMessage = (view: 'hr-advisor' | 'hiring-manager') => {
    if (view === 'hiring-manager') {
      return 'app:submission-details.errors.are-you-hiring-manager-for-request-required';
    }
    return 'app:submission-details.errors.is-submitter-hiring-manager-required';
  };
  const getIsSubmiterSubdelegateErrorMessage = (view: 'hr-advisor' | 'hiring-manager') => {
    if (view === 'hiring-manager') {
      return 'app:submission-details.errors.are-you-a-subdelegate-required';
    }
    return 'app:submission-details.errors.is-submitter-a-sub-delegate-required';
  };

  const submissionDetail = {
    hiringManagerEmailAddressSchema: v.pipe(
      v.string('app:submission-details.errors.hiring-manager-email-required'),
      v.trim(),
      v.nonEmpty('app:submission-details.errors.hiring-manager-email-required'),
      v.email('app:submission-details.errors.hiring-manager-email-invalid'),
    ),
    subDelegatedManagerEmailAddressSchema: v.pipe(
      v.string('app:submission-details.errors.sub-delegate-email-required'),
      v.trim(),
      v.nonEmpty('app:submission-details.errors.sub-delegate-email-required'),
      v.email('app:submission-details.errors.sub-delegate-email-invalid'),
    ),
    additionalContactBusinessEmailAddressSchema: v.optional(
      v.pipe(
        v.string('app:submission-details.errors.alternate-contact-email-invalid'),
        v.trim(),
        v.email('app:submission-details.errors.alternate-contact-email-invalid'),
      ),
    ),
    branchOrServiceCanadaRegionSchema: v.lazy(() =>
      v.pipe(
        stringToIntegerSchema('app:submission-details.errors.branch-or-service-canada-region-required'),
        v.picklist(
          allBranchOrServiceCanadaRegions.map(({ id }) => id),
          'app:submission-details.errors.branch-or-service-canada-region-required',
        ),
      ),
    ),
    directorateSchema: v.lazy(() =>
      v.pipe(
        stringToIntegerSchema('app:submission-details.errors.directorate-required'),
        v.picklist(
          allDirectorates.map(({ id }) => id),
          'app:submission-details.errors.directorate-required',
        ),
      ),
    ),
    languageOfCorrespondenceIdSchema: v.lazy(() =>
      v.pipe(
        stringToIntegerSchema('app:submission-details.errors.preferred-language-of-correspondence-required'),
        v.picklist(
          allLanguagesOfCorrespondence.map(({ id }) => id),
          'app:submission-details.errors.preferred-language-of-correspondence-required',
        ),
      ),
    ),
    additionalCommentSchema: v.optional(
      v.pipe(
        v.string('app:submission-details.errors.additional-information-required'),
        v.trim(),
        v.maxLength(100, 'app:submission-details.errors.additional-information-max-length'),
      ),
    ),
  };

  const baseCombinedSchema = v.intersect([
    v.object({
      branchOrServiceCanadaRegion: submissionDetail.branchOrServiceCanadaRegionSchema,
      directorate: submissionDetail.directorateSchema,
      languageOfCorrespondenceId: submissionDetail.languageOfCorrespondenceIdSchema,
      additionalComment: submissionDetail.additionalCommentSchema,
      additionalContactBusinessEmailAddress: submissionDetail.additionalContactBusinessEmailAddressSchema,
    }),
    v.variant(
      'isSubmiterHiringManager',
      [
        v.object({
          isSubmiterHiringManager: v.literal(true),
          hiringManagerEmailAddress: v.optional(submissionDetail.hiringManagerEmailAddressSchema),
          isHiringManagerASubDelegate: v.optional(
            v.boolean('app:submission-details.errors.is-hiring-manager-sub-delegate-required'),
          ),
          isSubmiterSubdelegate: v.boolean(getIsSubmiterSubdelegateErrorMessage(view)),
          subDelegatedManagerEmailAddress: v.optional(submissionDetail.subDelegatedManagerEmailAddressSchema),
        }),
        v.object({
          isSubmiterHiringManager: v.literal(false),
          isSubmiterSubdelegate: v.optional(v.boolean(getIsSubmiterSubdelegateErrorMessage(view))),
          hiringManagerEmailAddress: submissionDetail.hiringManagerEmailAddressSchema,
          isHiringManagerASubDelegate: v.boolean('app:submission-details.errors.is-hiring-manager-sub-delegate-required'),
          subDelegatedManagerEmailAddress: v.optional(submissionDetail.subDelegatedManagerEmailAddressSchema),
        }),
      ],
      getIsSubmiterHiringManagerErrorMessage(view),
    ),
  ]);

  return v.pipe(
    baseCombinedSchema,
    v.forward(
      v.check((input) => {
        const data = input as {
          isSubmiterHiringManager?: boolean;
          isSubmiterSubdelegate?: boolean;
          isHiringManagerASubDelegate?: boolean;
          subDelegatedManagerEmailAddress?: string | null;
        };

        // If isSubmiterHiringManager is true
        if (data.isSubmiterHiringManager === true) {
          // And isSubmiterSubdelegate is false, then subDelegatedManagerEmailAddress is required
          if (data.isSubmiterSubdelegate === false) {
            return (
              typeof data.subDelegatedManagerEmailAddress === 'string' && data.subDelegatedManagerEmailAddress.trim() !== ''
            );
          }
          // If isSubmiterSubdelegate is true, it's optional
          return true;
        }
        // If isSubmiterHiringManager is false
        else if (data.isSubmiterHiringManager === false) {
          // And isHiringManagerASubDelegate is false, then subDelegatedManagerEmailAddress is required
          if (data.isHiringManagerASubDelegate === false) {
            return (
              typeof data.subDelegatedManagerEmailAddress === 'string' && data.subDelegatedManagerEmailAddress.trim() !== ''
            );
          }
          // If isHiringManagerASubDelegate is true, it's optional
          return true;
        }
        // If isSubmiterHiringManager is undefined or anything else, no strict requirement here
        return true;
      }, 'app:submission-details.errors.sub-delegate-email-required'),
      ['subDelegatedManagerEmailAddress'],
    ),
  );
}

export async function createProcessInformationSchema() {
  const allSelectionProcessTypes = await getSelectionProcessTypeService().listAll();
  const allNonAdvertisedAppointments = await getNonAdvertisedAppointmentService().listAll();
  const allEmploymentTenures = await getEmploymentTenureService().listAll();
  const allEmploymentEquities = await getEmploymentEquityService().listAll();

  const selectedSelectionProcessTypeForExternalNonAdvertised = allSelectionProcessTypes.filter(
    (c) => c.id === SELECTION_PROCESS_TYPE.EXTERNAL_NON_ADVERTISED.id,
  );

  const selectedSelectionProcessTypeForInternalNonAdvertised = allSelectionProcessTypes.filter(
    (c) => c.id === SELECTION_PROCESS_TYPE.APPOINTMENT_INTERNAL_NON_ADVERTISED.id,
  );

  const selectedSelectionProcessTypesExcludingNonAdvertised = allSelectionProcessTypes.filter(
    (c) =>
      c.id !== SELECTION_PROCESS_TYPE.APPOINTMENT_INTERNAL_NON_ADVERTISED.id &&
      c.id !== SELECTION_PROCESS_TYPE.EXTERNAL_NON_ADVERTISED.id,
  );

  const selectedEmploymentTenureForIndeterminate = allEmploymentTenures.filter(
    (c) => c.code === EMPLOYMENT_TENURE.indeterminate,
  );

  const selectedEmploymentTenureForTerm = allEmploymentTenures.filter((c) => c.code === EMPLOYMENT_TENURE.term);
  const selectedNonAdvertisedAppointmentsForInternal = allNonAdvertisedAppointments.slice(0, 7);
  const selectedNonAdvertisedAppointmentsForExternal = allNonAdvertisedAppointments
    .slice(7)
    .filter((c) => c.code !== 'EXT_LCP');

  return v.pipe(
    v.intersect([
      v.object({
        selectionProcessNumber: v.optional(
          v.pipe(
            v.string('app:process-information.errors.selection-process-number-invalid'),
            v.trim(),
            v.nonEmpty('app:process-information.errors.selection-process-number-invalid'),
            v.maxLength(30, 'app:process-information.errors.selection-process-number-max-length'),
          ),
        ),
        approvalReceived: v.pipe(v.boolean('app:process-information.errors.approval-received-required')),
        workSchedule: v.pipe(
          v.string('app:process-information.errors.work-schedule-required'),
          v.trim(),
          v.nonEmpty('app:process-information.errors.work-schedule-required'),
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
              v.maxLength(200, 'app:process-information.errors.priority-entitlement-rationale-max-length'),
            ),
          }),
          v.object({
            priorityEntitlement: v.union([v.literal(false), v.null()]),
            priorityEntitlementRationale: v.optional(v.string()),
          }),
        ],
        'app:process-information.errors.priority-entitlement-required',
      ),
      v.variant(
        'selectionProcessType',
        [
          v.object({
            selectionProcessType: v.pipe(
              stringToIntegerSchema(),
              v.picklist(selectedSelectionProcessTypeForExternalNonAdvertised.map(({ id }) => id)),
            ),
            performedDuties: v.pipe(v.boolean('app:process-information.errors.performed-duties-required')),
            nonAdvertisedAppointment: v.pipe(
              stringToIntegerSchema('app:process-information.errors.non-advertised-appointment-required'),
              v.picklist(
                selectedNonAdvertisedAppointmentsForExternal.map(({ id }) => id),
                'app:process-information.errors.non-advertised-appointment-required',
              ),
            ),
          }),
          v.object({
            selectionProcessType: v.pipe(
              stringToIntegerSchema(),
              v.picklist(selectedSelectionProcessTypeForInternalNonAdvertised.map(({ id }) => id)),
            ),
            performedDuties: v.pipe(v.boolean('app:process-information.errors.performed-duties-required')),
            nonAdvertisedAppointment: v.pipe(
              stringToIntegerSchema('app:process-information.errors.non-advertised-appointment-required'),
              v.picklist(
                selectedNonAdvertisedAppointmentsForInternal.map(({ id }) => id),
                'app:process-information.errors.non-advertised-appointment-required',
              ),
            ),
          }),
          v.object({
            selectionProcessType: v.pipe(
              stringToIntegerSchema(),
              v.picklist(selectedSelectionProcessTypesExcludingNonAdvertised.map(({ id }) => id)),
            ),
            performedDuties: v.undefined(),
            nonAdvertisedAppointment: v.undefined(),
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
              stringToIntegerSchema('app:process-information.errors.projected-start-date.required-year'),
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
            projectedStartDate: optionalString(
              v.optional(
                v.pipe(
                  v.string(),
                  v.isoDate('app:process-information.errors.projected-start-date.invalid'),
                  v.custom(
                    (input) => isValidCalendarDate(input as string),
                    'app:process-information.errors.projected-start-date.invalid',
                  ),
                ),
              ),
            ),
            projectedEndDateYear: v.pipe(
              stringToIntegerSchema('app:process-information.errors.projected-end-date.required-year'),
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
            projectedEndDate: optionalString(
              v.optional(
                v.pipe(
                  v.string(),
                  v.isoDate('app:process-information.errors.projected-end-date.invalid'),
                  v.custom(
                    (input) => isValidCalendarDate(input as string),
                    'app:process-information.errors.projected-end-date.invalid',
                  ),
                  v.custom(
                    (input) => !isPastOrTodayInTimeZone(serverEnvironment.BASE_TIMEZONE, input as string),
                    'app:process-information.errors.projected-end-date.invalid-future',
                  ),
                ),
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
            preferredEmploymentEquities: v.pipe(
              v.array(
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
              v.nonEmpty('app:process-information.errors.employment-equities-required'),
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
        'app:process-information.errors.projected-end-date.invalid-before-start-date',
      ),
      ['projectedEndDate'],
    ),
  );
}

export async function parseProcessInformation(formData: FormData) {
  const priorityEntitlement = formString(formData.get('priorityEntitlement'));
  const projectedStartDateYear = formData.get('projectedStartDateYear')?.toString();
  const projectedStartDateMonth = formData.get('projectedStartDateMonth')?.toString();
  const projectedStartDateDay = formData.get('projectedStartDateDay')?.toString();
  const projectedEndDateYear = formData.get('projectedEndDateYear')?.toString();
  const projectedEndDateMonth = formData.get('projectedEndDateMonth')?.toString();
  const projectedEndDateDay = formData.get('projectedEndDateDay')?.toString();

  const formValues = {
    selectionProcessNumber: formString(formData.get('selectionProcessNumber')),
    approvalReceived: formString(formData.get('approvalReceived'))
      ? formString(formData.get('approvalReceived')) === 'on'
      : undefined,
    priorityEntitlement: priorityEntitlement
      ? priorityEntitlement === REQUIRE_OPTIONS.none
        ? null
        : priorityEntitlement === REQUIRE_OPTIONS.yes
      : undefined,
    priorityEntitlementRationale: formString(formData.get('priorityEntitlementRationale')),
    selectionProcessType: formString(formData.get('selectionProcessType')),
    performedDuties: formString(formData.get('performedDuties'))
      ? formString(formData.get('performedDuties')) === REQUIRE_OPTIONS.yes
      : undefined,
    nonAdvertisedAppointment: formString(formData.get('nonAdvertisedAppointment')),
    employmentTenure: formString(formData.get('employmentTenure')),
    projectedStartDate: toDateString(projectedStartDateYear, projectedStartDateMonth, projectedStartDateDay),
    projectedStartDateYear,
    projectedStartDateMonth,
    projectedStartDateDay,
    projectedEndDate: toDateString(projectedEndDateYear, projectedEndDateMonth, projectedEndDateDay),
    projectedEndDateYear,
    projectedEndDateMonth,
    projectedEndDateDay,
    workSchedule: formString(formData.get('workSchedule')),
    employmentEquityIdentified: formString(formData.get('employmentEquityIdentified'))
      ? formString(formData.get('employmentEquityIdentified')) === REQUIRE_OPTIONS.yes
      : undefined,
    preferredEmploymentEquities: formData.getAll('preferredEmploymentEquities'),
  };

  return {
    parseResult: v.safeParse(await createProcessInformationSchema(), formValues),
    formValues,
  };
}
