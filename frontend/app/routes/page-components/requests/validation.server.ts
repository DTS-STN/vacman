import * as v from 'valibot';

import { getCityService } from '~/.server/domain/services/city-service';
import { getClassificationService } from '~/.server/domain/services/classification-service';
import { getEmploymentEquityService } from '~/.server/domain/services/employment-equity-service';
import { getEmploymentTenureService } from '~/.server/domain/services/employment-tenure-service';
import { getLanguageForCorrespondenceService } from '~/.server/domain/services/language-for-correspondence-service';
import { getLanguageRequirementService } from '~/.server/domain/services/language-requirement-service';
import { getNonAdvertisedAppointmentService } from '~/.server/domain/services/non-advertised-appointment-service';
import { getProvinceService } from '~/.server/domain/services/province-service';
import { getSecurityClearanceService } from '~/.server/domain/services/security-clearance-service';
import { getSelectionProcessTypeService } from '~/.server/domain/services/selection-process-type-service';
import { getWorkScheduleService } from '~/.server/domain/services/work-schedule-service';
import { getWorkUnitService } from '~/.server/domain/services/workunit-service';
import { serverEnvironment } from '~/.server/environment';
import { extractUniqueBranchesFromDirectoratesNonLocalized } from '~/.server/utils/directorate-utils';
import { stringToIntegerSchema } from '~/.server/validation/string-to-integer-schema';
import { EMPLOYMENT_TENURE, REQUIRE_OPTIONS, SELECTION_PROCESS_TYPE } from '~/domain/constants';
import { isPastOrTodayInTimeZone, isValidCalendarDate, toDateString } from '~/utils/date-utils';
import { isLookupExpired } from '~/utils/lookup-utils';
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
  const allClassifications = await getClassificationService().listAll(true); // Include inactive for validation
  const allLanguageRequirements = await getLanguageRequirementService().listAll();
  const allSecurityClearances = await getSecurityClearanceService().listAll();

  return v.object({
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
    groupAndLevel: v.lazy(() =>
      v.pipe(
        stringToIntegerSchema('app:position-information.errors.group-and-level-required'),
        v.picklist(
          allClassifications.map(({ id }) => id),
          'app:position-information.errors.group-and-level-invalid',
        ),
        v.custom((classificationId) => {
          const classification = allClassifications.find((c) => c.id === classificationId);
          return classification ? !isLookupExpired(classification) : false;
        }, 'app:position-information.errors.group-and-level-expired'),
      ),
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
    languageRequirements: v.pipe(
      v.array(
        v.lazy(() =>
          v.pipe(
            stringToIntegerSchema('app:position-information.errors.language-requirement-required'),
            v.picklist(
              allLanguageRequirements.map(({ id }) => id),
              'app:position-information.errors.language-requirement-required',
            ),
          ),
        ),
      ),
      v.nonEmpty('app:position-information.errors.language-requirement-required'),
    ),
    securityRequirement: v.lazy(() =>
      v.pipe(
        stringToIntegerSchema('app:position-information.errors.security-requirement-required'),
        v.picklist(
          allSecurityClearances.map(({ id }) => id),
          'app:position-information.errors.security-requirement-invalid',
        ),
      ),
    ),
  });
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
  const allDirectorates = await getWorkUnitService().listAll(true);
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
          'app:submission-details.errors.branch-or-service-canada-region-invalid',
        ),
        v.custom((branchId) => {
          const branch = allBranchOrServiceCanadaRegions.find((c) => c.id === branchId);
          return branch ? !isLookupExpired(branch) : false;
        }, 'app:submission-details.errors.branch-or-service-canada-region-expired'),
      ),
    ),
    directorateSchema: v.lazy((input) => {
      // Get the branch ID and directorate value from form data
      const formData = (input ?? {}) as Record<string, unknown>;
      const branchId = formData.branchOrServiceCanadaRegion;
      const directorateValue = formData.directorate;

      // If branchId is not available, just do basic validation
      if (!branchId) {
        return v.pipe(stringToIntegerSchema('app:submission-details.errors.directorate-required'));
      }

      // Check if this branch has any directorates
      const branchHasDirectorates = allDirectorates.some((d) => d.parent?.id === Number(branchId));

      // If branch has directorates but directorate is empty, fail early with required error
      if (branchHasDirectorates && (!directorateValue || String(directorateValue).trim() === '')) {
        return v.pipe(
          v.string('app:submission-details.errors.directorate-required'),
          v.nonEmpty('app:submission-details.errors.directorate-required'),
        );
      }

      // If branch has directorates, validate as directorate
      // If branch has NO directorates, validate as branch (work unit without parent)
      const validIds = branchHasDirectorates
        ? allDirectorates.map(({ id }) => id)
        : [...allBranchOrServiceCanadaRegions.map(({ id }) => id), ...allDirectorates.map(({ id }) => id)];

      return v.pipe(
        stringToIntegerSchema('app:submission-details.errors.directorate-required'),
        v.picklist(validIds, 'app:submission-details.errors.directorate-invalid'),
        v.custom((workUnitId) => {
          // Check expiry for the selected work unit (could be branch or directorate)
          const workUnit = [...allBranchOrServiceCanadaRegions, ...allDirectorates].find((wu) => wu.id === workUnitId);
          return workUnit ? !isLookupExpired(workUnit) : false;
        }, 'app:submission-details.errors.directorate-expired'),
      );
    }),
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
    // Custom forward validation to ensure directorate matches the selected branch
    v.forward(
      v.check((input) => {
        const branchId = Number(input.branchOrServiceCanadaRegion);
        const directorateId = Number(input.directorate);

        // Check if branch has directorates
        const branchHasDirectorates = allDirectorates.some((d) => d.parent?.id === branchId);

        if (branchHasDirectorates) {
          // If branch has directorates, validate that directorate belongs to branch
          const directorate = allDirectorates.find((d) => d.id === directorateId);
          return directorate?.parent?.id === branchId;
        } else {
          // If branch has no directorates, directorate ID should equal branch ID
          return directorateId === branchId;
        }
      }, 'app:submission-details.errors.directorate-invalid'),
      ['directorate'],
    ),
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
  const allWorkSchedules = await getWorkScheduleService().listAll();

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
  const selectedNonAdvertisedAppointmentsForInternal = allNonAdvertisedAppointments.filter(
    (c) =>
      (c.code.startsWith('INT_') || ['LCPRL_BCLOSRE', 'LCPSG_BCLGP', 'LCPSS_BCLCS'].includes(c.code)) && c.code !== 'INT_LCP',
  );
  const selectedNonAdvertisedAppointmentsForExternal = allNonAdvertisedAppointments.filter(
    (c) =>
      (c.code.startsWith('EXT_') || ['LCPRL_BCLOSRE', 'LCPSG_BCLGP', 'LCPSS_BCLCS'].includes(c.code)) && c.code !== 'EXT_LCP',
  );

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
        workSchedule: v.lazy(() =>
          v.pipe(
            stringToIntegerSchema('app:process-information.errors.work-schedule-required'),
            v.picklist(
              allWorkSchedules.map(({ id }) => id),
              'app:process-information.errors.work-schedule-invalid',
            ),
          ),
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
            priorityEntitlement: v.literal(false),
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
            performedDuties: v.union(
              [v.literal(true), v.literal(false), v.null()],
              'app:process-information.errors.performed-duties-required',
            ),
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
            performedDuties: v.union(
              [v.literal(true), v.literal(false), v.null()],
              'app:process-information.errors.performed-duties-required',
            ),
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
  const projectedStartDateYear = formData.get('projectedStartDateYear')?.toString();
  const projectedStartDateMonth = formData.get('projectedStartDateMonth')?.toString();
  const projectedStartDateDay = formData.get('projectedStartDateDay')?.toString();
  const projectedEndDateYear = formData.get('projectedEndDateYear')?.toString();
  const projectedEndDateMonth = formData.get('projectedEndDateMonth')?.toString();
  const projectedEndDateDay = formData.get('projectedEndDateDay')?.toString();
  const performedDuties = formString(formData.get('performedDuties'));

  const formValues = {
    selectionProcessNumber: formString(formData.get('selectionProcessNumber')),
    approvalReceived: formString(formData.get('approvalReceived'))
      ? formString(formData.get('approvalReceived')) === 'on'
      : undefined,
    priorityEntitlement: formString(formData.get('priorityEntitlement'))
      ? formString(formData.get('priorityEntitlement')) === REQUIRE_OPTIONS.yes
      : undefined,
    priorityEntitlementRationale: formString(formData.get('priorityEntitlementRationale')),
    selectionProcessType: formString(formData.get('selectionProcessType')),
    performedDuties: performedDuties
      ? performedDuties === REQUIRE_OPTIONS.none
        ? null
        : performedDuties === REQUIRE_OPTIONS.yes
          ? true
          : false
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
