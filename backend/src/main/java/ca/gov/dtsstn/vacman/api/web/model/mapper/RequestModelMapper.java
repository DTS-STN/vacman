package ca.gov.dtsstn.vacman.api.web.model.mapper;

import org.mapstruct.CollectionMappingStrategy;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.ReportingPolicy;

import ca.gov.dtsstn.vacman.api.data.entity.CityEntity;
import ca.gov.dtsstn.vacman.api.data.entity.EmploymentEquityEntity;
import ca.gov.dtsstn.vacman.api.data.entity.RequestEntity;
import ca.gov.dtsstn.vacman.api.web.model.RequestReadModel;
import ca.gov.dtsstn.vacman.api.web.model.RequestUpdateModel;
import ca.gov.dtsstn.vacman.api.web.model.RequestUpdateModel.CityId;
import ca.gov.dtsstn.vacman.api.web.model.RequestUpdateModel.EmploymentEquityId;

@Mapper(uses = { CodeModelMapper.class,
		UserModelMapper.class }, unmappedTargetPolicy = ReportingPolicy.ERROR, collectionMappingStrategy = CollectionMappingStrategy.ADDER_PREFERRED)
public interface RequestModelMapper {

	@Mapping(target = "englishLanguageProfile", source = "languageProfileEn")
	@Mapping(target = "englishStatementOfMerit", source = "somcAndConditionEmploymentEn")
	@Mapping(target = "englishTitle", source = "nameEn")
	@Mapping(target = "equityNeeded", source = "employmentEquityNeedIdentifiedIndicator")
	@Mapping(target = "frenchLanguageProfile", source = "languageProfileFr")
	@Mapping(target = "frenchStatementOfMerit", source = "somcAndConditionEmploymentFr")
	@Mapping(target = "frenchTitle", source = "nameFr")
	@Mapping(target = "languageOfCorrespondence", source = "language")
	@Mapping(target = "projectedEndDate", source = "endDate")
	@Mapping(target = "projectedStartDate", source = "startDate")
	@Mapping(target = "status", source = "requestStatus")
	RequestReadModel toModel(RequestEntity entity);

	@Mapping(target = "selectionProcessNumber", source = "selectionProcessNumber")
	@Mapping(target = "workforceMgmtApprovalRecvd", source = "workforceMgmtApprovalRecvd")
	@Mapping(target = "priorityEntitlement", source = "priorityEntitlement")
	@Mapping(target = "priorityEntitlementRationale", source = "priorityEntitlementRationale")
	@Mapping(target = "hasPerformedSameDuties", source = "hasPerformedSameDuties")
	@Mapping(target = "startDate", source = "projectedStartDate")
	@Mapping(target = "endDate", source = "projectedEndDate")
	@Mapping(target = "employmentEquityNeedIdentifiedIndicator", source = "equityNeeded")
	@Mapping(target = "nameEn", source = "englishTitle")
	@Mapping(target = "nameFr", source = "frenchTitle")
	@Mapping(target = "languageProfileEn", source = "englishLanguageProfile")
	@Mapping(target = "languageProfileFr", source = "frenchLanguageProfile")
	@Mapping(target = "somcAndConditionEmploymentEn", source = "englishStatementOfMerit")
	@Mapping(target = "somcAndConditionEmploymentFr", source = "frenchStatementOfMerit")
	@Mapping(target = "positionNumber", source = "positionNumbers")
	@Mapping(target = "selectionProcessType", source = "selectionProcessTypeId")
	@Mapping(target = "appointmentNonAdvertised", source = "appointmentNonAdvertisedId")
	@Mapping(target = "workSchedule", source = "workScheduleId")
	@Mapping(target = "classification", source = "classificationId")
	@Mapping(target = "languageRequirement", source = "languageRequirementId")
	@Mapping(target = "securityClearance", source = "securityClearanceId")
	@Mapping(target = "employmentEquities", ignore = true)
	@Mapping(target = "cities", ignore = true)
	@Mapping(target = "hiringManager", ignore = true)
	@Mapping(target = "hrAdvisor", ignore = true)
	@Mapping(target = "language", source = "languageOfCorrespondenceId")
	@Mapping(target = "employmentTenure", source = "employmentTenureId")
	@Mapping(target = "requestStatus", ignore = true)
	@Mapping(target = "subDelegatedManager", ignore = true)
	@Mapping(target = "submitter", ignore = true)
	@Mapping(target = "workUnit", source = "workUnitId")
	@Mapping(target = "id", ignore = true)
	@Mapping(target = "createdBy", ignore = true)
	@Mapping(target = "createdDate", ignore = true)
	@Mapping(target = "lastModifiedBy", ignore = true)
	@Mapping(target = "lastModifiedDate", ignore = true)
	@Mapping(target = "delegateIds", ignore = true)
	void updateEntityFromModel(RequestUpdateModel updateModel, @MappingTarget RequestEntity entity);

	@Mapping(target = "selectionProcessNumber", source = "selectionProcessNumber")
	@Mapping(target = "workforceMgmtApprovalRecvd", source = "workforceMgmtApprovalRecvd")
	@Mapping(target = "priorityEntitlement", source = "priorityEntitlement")
	@Mapping(target = "priorityEntitlementRationale", source = "priorityEntitlementRationale")
	@Mapping(target = "hasPerformedSameDuties", source = "hasPerformedSameDuties")
	@Mapping(target = "startDate", source = "projectedStartDate")
	@Mapping(target = "endDate", source = "projectedEndDate")
	@Mapping(target = "employmentEquityNeedIdentifiedIndicator", source = "equityNeeded")
	@Mapping(target = "nameEn", source = "englishTitle")
	@Mapping(target = "nameFr", source = "frenchTitle")
	@Mapping(target = "languageProfileEn", source = "englishLanguageProfile")
	@Mapping(target = "languageProfileFr", source = "frenchLanguageProfile")
	@Mapping(target = "somcAndConditionEmploymentEn", source = "englishStatementOfMerit")
	@Mapping(target = "somcAndConditionEmploymentFr", source = "frenchStatementOfMerit")
	@Mapping(target = "positionNumber", source = "positionNumbers")
	@Mapping(target = "selectionProcessType", source = "selectionProcessTypeId")
	@Mapping(target = "appointmentNonAdvertised", source = "appointmentNonAdvertisedId")
	@Mapping(target = "workSchedule", source = "workScheduleId")
	@Mapping(target = "classification", source = "classificationId")
	@Mapping(target = "languageRequirement", source = "languageRequirementId")
	@Mapping(target = "securityClearance", source = "securityClearanceId")
	@Mapping(target = "employmentEquities", ignore = true)
	@Mapping(target = "id", ignore = true)
	@Mapping(target = "createdBy", ignore = true)
	@Mapping(target = "createdDate", ignore = true)
	@Mapping(target = "lastModifiedBy", ignore = true)
	@Mapping(target = "lastModifiedDate", ignore = true)
	@Mapping(target = "cities", ignore = true)
	@Mapping(target = "hiringManager", ignore = true)
	@Mapping(target = "hrAdvisor", ignore = true)
	@Mapping(target = "language", source = "languageOfCorrespondenceId")
	@Mapping(target = "employmentTenure", source = "employmentTenureId")
	@Mapping(target = "requestStatus", ignore = true)
	@Mapping(target = "subDelegatedManager", ignore = true)
	@Mapping(target = "submitter", ignore = true)
	@Mapping(target = "workUnit", source = "workUnitId")
	RequestEntity requestUpdateModelToRequestEntity(RequestUpdateModel request);

	@Mapping(target = "appointmentNonAdvertisedId", source = "appointmentNonAdvertised.id")
	@Mapping(target = "cityIds", source = "cities")
	@Mapping(target = "classificationId", source = "classification.id")
	@Mapping(target = "employmentEquityIds", source = "employmentEquities")
	@Mapping(target = "employmentTenureId", source = "employmentTenure.id")
	@Mapping(target = "englishLanguageProfile", source = "languageProfileEn")
	@Mapping(target = "englishStatementOfMerit", source = "somcAndConditionEmploymentEn")
	@Mapping(target = "englishTitle", source = "nameEn")
	@Mapping(target = "equityNeeded", source = "employmentEquityNeedIdentifiedIndicator")
	@Mapping(target = "frenchLanguageProfile", source = "languageProfileFr")
	@Mapping(target = "frenchStatementOfMerit", source = "somcAndConditionEmploymentFr")
	@Mapping(target = "frenchTitle", source = "nameFr")
	@Mapping(target = "hiringManagerId", source = "hiringManager.id")
	@Mapping(target = "hrAdvisorId", source = "hrAdvisor.id")
	@Mapping(target = "languageOfCorrespondenceId", source = "language.id")
	@Mapping(target = "languageRequirementId", source = "languageRequirement.id")
	@Mapping(target = "positionNumbers", source = "positionNumber")
	@Mapping(target = "projectedEndDate", source = "endDate")
	@Mapping(target = "projectedStartDate", source = "startDate")
	@Mapping(target = "securityClearanceId", source = "securityClearance.id")
	@Mapping(target = "selectionProcessTypeId", source = "selectionProcessType.id")
	@Mapping(target = "statusId", source = "requestStatus.id")
	@Mapping(target = "subDelegatedManagerId", source = "subDelegatedManager.id")
	@Mapping(target = "submitterId", source = "submitter.id")
	@Mapping(target = "workScheduleId", source = "workSchedule.id")
	@Mapping(target = "workUnitId", source = "workUnit.id")
	RequestUpdateModel requestEntityToRequestUpdateModel(RequestEntity request);

	default Long cityIdToLong(CityId cityId) {
		return cityId == null ? null : cityId.value();
	}

	default CityId cityEntityToCityId(CityEntity city) {
		return city == null ? null : new CityId(city.getId());
	}

	default Long employmentEquityIdToLong(EmploymentEquityId employmentEquityId) {
		return employmentEquityId == null ? null : employmentEquityId.value();
	}

	default EmploymentEquityId employmentEquityEntityToEmploymentEquityId(EmploymentEquityEntity employmentEquity) {
		return employmentEquity == null ? null : new EmploymentEquityId(employmentEquity.getId());
	}
}
