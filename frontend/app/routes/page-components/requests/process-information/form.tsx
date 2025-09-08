import { useState } from 'react';
import type { JSX } from 'react';

import type { Params } from 'react-router';
import { Form } from 'react-router';

import { useTranslation } from 'react-i18next';

import type {
  NonAdvertisedAppointment,
  LocalizedSelectionProcessType,
  LocalizedNonAdvertisedAppointment,
  LocalizedEmploymentTenure,
  LocalizedWorkSchedule,
  EmploymentTenure,
  WorkSchedule,
  LocalizedEmploymentEquity,
  EmploymentEquity,
  SelectionProcessType,
} from '~/.server/domain/models';
import { Button } from '~/components/button';
import { ButtonLink } from '~/components/button-link';
import { DatePickerField } from '~/components/date-picker-field';
import { FormErrorSummary } from '~/components/error-summary';
import { InputCheckbox } from '~/components/input-checkbox';
import { InputCheckboxes } from '~/components/input-checkboxes';
import { InputField } from '~/components/input-field';
import { InputRadios } from '~/components/input-radios';
import type { InputRadiosProps } from '~/components/input-radios';
import { InputSelect } from '~/components/input-select';
import { InputTextarea } from '~/components/input-textarea';
import { PageTitle } from '~/components/page-title';
import { EMPLOYMENT_TENURE, REQUIRE_OPTIONS, SELECTION_PROCESS_TYPE } from '~/domain/constants';
import type { I18nRouteFile } from '~/i18n-routes';
import type { Errors } from '~/routes/page-components/requests/validation.server';
import { extractValidationKey } from '~/utils/validation-utils';

export type ProcessInformation = {
  selectionProcessNumber?: string;
  approvalReceived?: boolean;
  priorityEntitlement?: boolean;
  priorityEntitlementRationale?: string;
  selectionProcessType?: SelectionProcessType;
  performedDuties?: boolean;
  nonAdvertisedAppointment?: NonAdvertisedAppointment;
  employmentTenure?: EmploymentTenure;
  projectedStartDate?: string;
  projectedEndDate?: string;
  workSchedule?: WorkSchedule;
  employmentEquityIdentified?: boolean;
  preferredEmploymentEquities?: EmploymentEquity[];
};

interface ProcessInformationFormProps {
  selectionProcessTypes: readonly LocalizedSelectionProcessType[];
  nonAdvertisedAppointments: readonly LocalizedNonAdvertisedAppointment[];
  employmentTenures: readonly LocalizedEmploymentTenure[];
  workSchedules: readonly LocalizedWorkSchedule[];
  employmentEquities: readonly LocalizedEmploymentEquity[];
  cancelLink: I18nRouteFile;
  formValues: Partial<ProcessInformation> | undefined;
  formErrors?: Errors;
  isReadOnly: boolean;
  params: Params;
}

export function ProcessInformationForm({
  selectionProcessTypes,
  nonAdvertisedAppointments,
  employmentTenures,
  workSchedules,
  employmentEquities,
  cancelLink,
  isReadOnly,
  formValues,
  formErrors,
  params,
}: ProcessInformationFormProps): JSX.Element {
  const { t: tApp } = useTranslation('app');
  const { t: tGcweb } = useTranslation('gcweb');

  const [priorityEntitlement, setPriorityEntitlement] = useState(formValues?.priorityEntitlement);
  const [selectionProcessType, setSelectionProcessType] = useState(
    selectionProcessTypes.find((c) => c.id === formValues?.selectionProcessType?.id)?.code,
  );
  const [employmentTenure, setEmploymentTenure] = useState(
    employmentTenures.find((c) => c.id === formValues?.employmentTenure?.id)?.code,
  );
  const [employmentEquityIdentified, setEmploymentEquityIdentified] = useState(formValues?.employmentEquityIdentified);

  const handlePriorityEntitlementChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedValue = event.target.value;
    setPriorityEntitlement(selectedValue === REQUIRE_OPTIONS.yes);
  };

  const handleEmploymentTenureChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedValue = event.target.value;
    const selectedTenure = employmentTenures.find((c) => c.id === Number(selectedValue))?.code;
    setEmploymentTenure(selectedTenure);
  };

  const handleEmploymentEquityIdentifiedChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedValue = event.target.value;
    setEmploymentEquityIdentified(selectedValue === REQUIRE_OPTIONS.yes);
  };

  const selectionProcessTypeOptions = [{ id: 'select-option', name: '' }, ...selectionProcessTypes].map(({ id, name }) => ({
    value: id === 'select-option' ? '' : String(id),
    children: id === 'select-option' ? tApp('form.select-option') : name,
  }));
  const internalNonAdvertisedAppointmentOptions = nonAdvertisedAppointments.slice(0, 7).map(({ id, name }) => ({
    value: String(id),
    children: name,
    defaultChecked: id === formValues?.nonAdvertisedAppointment?.id,
  }));
  const externalNonAdvertisedAppointmentOptions = nonAdvertisedAppointments.slice(7).map(({ id, name }) => ({
    value: String(id),
    children: name,
    defaultChecked: id === formValues?.nonAdvertisedAppointment?.id,
  }));
  const employmentTenureOptions = employmentTenures.map(({ id, name }) => ({
    value: String(id),
    children: name,
    onChange: handleEmploymentTenureChange,
    defaultChecked: id === formValues?.employmentTenure?.id,
  }));
  const workScheduleOptions = workSchedules.map(({ id, name }) => ({
    value: String(id),
    children: name,
    defaultChecked: id === formValues?.workSchedule?.id,
  }));
  const employmentEquityOptions = employmentEquities.map((employmentEquityOption) => ({
    value: String(employmentEquityOption.id),
    children: employmentEquityOption.name,
    defaultChecked: !!formValues?.preferredEmploymentEquities?.find((p) => p.id === employmentEquityOption.id),
  }));
  const priorityEntitlementOptions: InputRadiosProps['options'] = [
    {
      children: tGcweb('input-option.yes'),
      value: REQUIRE_OPTIONS.yes,
      onChange: handlePriorityEntitlementChange,
      defaultChecked: formValues?.priorityEntitlement === true,
    },
    {
      children: tGcweb('input-option.no'),
      value: REQUIRE_OPTIONS.no,
      onChange: handlePriorityEntitlementChange,
      defaultChecked: formValues?.priorityEntitlement === false,
    },
  ];
  const performedDutiesOptions: InputRadiosProps['options'] = [
    {
      children: tGcweb('input-option.yes'),
      value: REQUIRE_OPTIONS.yes,
      defaultChecked: formValues?.performedDuties === true,
    },
    {
      children: tGcweb('input-option.no'),
      value: REQUIRE_OPTIONS.no,
      defaultChecked: formValues?.performedDuties === false,
    },
  ];
  const employmentEquityIdentifiedOptions: InputRadiosProps['options'] = [
    {
      children: tGcweb('input-option.yes'),
      value: REQUIRE_OPTIONS.yes,
      onChange: handleEmploymentEquityIdentifiedChange,
      defaultChecked: formValues?.employmentEquityIdentified === true,
    },
    {
      children: tGcweb('input-option.no'),
      value: REQUIRE_OPTIONS.no,
      onChange: handleEmploymentEquityIdentifiedChange,
      defaultChecked: formValues?.employmentEquityIdentified === false,
    },
  ];

  return (
    <>
      <PageTitle className="after:w-14" subTitle={tApp('referral-request')}>
        {tApp('process-information.page-title')}
      </PageTitle>
      <FormErrorSummary>
        <Form method="post" noValidate>
          <div className="space-y-6">
            <InputField
              readOnly={isReadOnly}
              className="w-full"
              id="selection-process-number"
              name="selectionProcessNumber"
              label={tApp('process-information.selection-process-number')}
              defaultValue={formValues?.selectionProcessNumber}
              errorMessage={tApp(extractValidationKey(formErrors?.selectionProcessNumber))}
            />
            <InputCheckbox
              id="approval-received"
              name="approvalReceived"
              defaultChecked={formValues?.approvalReceived}
              errorMessage={tApp(extractValidationKey(formErrors?.approvalReceived))}
            >
              {tApp('process-information.approval-received')}
            </InputCheckbox>
            <InputRadios
              id="priority-entitlement"
              name="priorityEntitlement"
              legend={tApp('process-information.priority-entitlement')}
              options={priorityEntitlementOptions}
              errorMessage={tApp(extractValidationKey(formErrors?.priorityEntitlement))}
              required
            />
            {priorityEntitlement === true && (
              <InputTextarea
                id="priority-entitlement-rationale"
                className="w-full"
                label={tApp('process-information.priority-entitlement-rationale')}
                name="priorityEntitlementRationale"
                defaultValue={formValues?.priorityEntitlementRationale}
                errorMessage={tApp(extractValidationKey(formErrors?.priorityEntitlementRationale))}
                maxLength={100}
              />
            )}
            <InputSelect
              className="w-full sm:w-1/2"
              id="selection-process-type"
              name="selectionProcessType"
              label={tApp('process-information.selection-process-type')}
              options={selectionProcessTypeOptions}
              errorMessage={tApp(extractValidationKey(formErrors?.selectionProcessType))}
              value={selectionProcessType ?? ''}
              onChange={({ target }) => setSelectionProcessType(target.value)}
              required
            />
            {(selectionProcessType === SELECTION_PROCESS_TYPE.externalNonAdvertised ||
              selectionProcessType === SELECTION_PROCESS_TYPE.internalNonAdvertised) && (
              <>
                <InputRadios
                  id="performed-duties"
                  name="performedDuties"
                  legend={tApp('process-information.performed-duties')}
                  options={performedDutiesOptions}
                  errorMessage={tApp(extractValidationKey(formErrors?.performedDuties))}
                  required
                />
                <InputRadios
                  id="non-advertised-appointment"
                  name="nonAdvertisedAppointment"
                  legend={tApp('process-information.non-advertised-appointment')}
                  options={
                    selectionProcessType === SELECTION_PROCESS_TYPE.externalNonAdvertised
                      ? externalNonAdvertisedAppointmentOptions
                      : internalNonAdvertisedAppointmentOptions
                  }
                  errorMessage={tApp(extractValidationKey(formErrors?.nonAdvertisedAppointment))}
                  required
                />
              </>
            )}
            <InputRadios
              id="employment-tenure"
              name="employmentTenure"
              legend={tApp('process-information.employment-tenure')}
              options={employmentTenureOptions}
              errorMessage={tApp(extractValidationKey(formErrors?.employmentTenure))}
              required
            />
            {employmentTenure === EMPLOYMENT_TENURE.term && (
              <>
                <DatePickerField
                  defaultValue={formValues?.projectedStartDate ?? ''}
                  id="projectedStartDate"
                  legend={tApp('process-information.projected-start-date')}
                  names={{
                    day: 'projectedStartDateDay',
                    month: 'projectedStartDateMonth',
                    year: 'projectedStartDateYear',
                  }}
                  errorMessages={{
                    all: tApp(extractValidationKey(formErrors?.projectedStartDate)),
                    year: tApp(extractValidationKey(formErrors?.projectedStartDateYear)),
                    month: tApp(extractValidationKey(formErrors?.projectedStartDateMonth)),
                    day: tApp(extractValidationKey(formErrors?.projectedStartDateDay)),
                  }}
                  required
                />
                <DatePickerField
                  defaultValue={formValues?.projectedEndDate ?? ''}
                  id="projectedEndDate"
                  legend={tApp('process-information.projected-end-date')}
                  names={{
                    day: 'projectedEndDateDay',
                    month: 'projectedEndDateMonth',
                    year: 'projectedEndDateYear',
                  }}
                  errorMessages={{
                    all: tApp(extractValidationKey(formErrors?.projectedEndDate)),
                    year: tApp(extractValidationKey(formErrors?.projectedEndDateYear)),
                    month: tApp(extractValidationKey(formErrors?.projectedEndDateMonth)),
                    day: tApp(extractValidationKey(formErrors?.projectedEndDateDay)),
                  }}
                />
              </>
            )}
            <InputRadios
              id="work-schedule"
              name="workSchedule"
              legend={tApp('process-information.work-schedule')}
              options={workScheduleOptions}
              errorMessage={tApp(extractValidationKey(formErrors?.workSchedule))}
              required
            />
            <InputRadios
              id="employment-equity-identified"
              name="employmentEquityIdentified"
              legend={tApp('process-information.employment-equity-identified')}
              options={employmentEquityIdentifiedOptions}
              errorMessage={tApp(extractValidationKey(formErrors?.employmentEquityIdentified))}
              helpMessagePrimary={tApp('process-information.work-schedule-help-message')}
              required
            />
            {employmentEquityIdentified === true && (
              <InputCheckboxes
                id="preferred-employment-equities"
                errorMessage={tApp(extractValidationKey(formErrors?.preferredEmploymentEquities))}
                legend={tApp('process-information.preferred-employment-equities')}
                name="preferredEmploymentEquities"
                options={employmentEquityOptions}
                helpMessagePrimary={tApp('process-information.preferred-employment-equities-help-message')}
                required
              />
            )}
            <div className="mt-8 flex flex-row-reverse flex-wrap items-center justify-end gap-3">
              <Button name="action" variant="primary" id="save-button">
                {tApp('form.save')}
              </Button>
              <ButtonLink file={cancelLink} params={params} id="cancel-button" variant="alternative">
                {tApp('form.cancel')}
              </ButtonLink>
            </div>
          </div>
        </Form>
      </FormErrorSummary>
    </>
  );
}
