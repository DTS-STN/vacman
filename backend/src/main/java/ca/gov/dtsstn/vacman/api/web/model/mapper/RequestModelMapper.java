package ca.gov.dtsstn.vacman.api.web.model.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

import ca.gov.dtsstn.vacman.api.data.entity.RequestEntity;
import ca.gov.dtsstn.vacman.api.web.model.RequestReadModel;
import ca.gov.dtsstn.vacman.api.web.model.RequestUpdateModel;

@Mapper(uses = { CodeModelMapper.class })
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
	@Mapping(target = "workforceMgmtApprovalRecvd", source = "workforceManagementApproved")
	@Mapping(target = "priorityEntitlement", source = "priorityEntitlement")
	@Mapping(target = "priorityEntitlementRationale", source = "priorityEntitlementRationale")
	@Mapping(target = "hasPerformedSameDuties", source = "performedSameDuties")
	@Mapping(target = "startDate", source = "projectedStartDate")
	@Mapping(target = "endDate", source = "projectedEndDate")
	@Mapping(target = "employmentEquityNeedIdentifiedIndicator", source = "equityNeeded")
	@Mapping(target = "nameEn", source = "englishTitle")
	@Mapping(target = "nameFr", source = "frenchTitle")
	@Mapping(target = "languageProfileEn", source = "englishLanguageProfile")
	@Mapping(target = "languageProfileFr", source = "frenchLanguageProfile")
	@Mapping(target = "somcAndConditionEmploymentEn", source = "englishStatementOfMerit")
	@Mapping(target = "somcAndConditionEmploymentFr", source = "frenchStatementOfMerit")
	@Mapping(target = "positionNumber", ignore = true)
	@Mapping(target = "selectionProcessType", ignore = true)
	@Mapping(target = "appointmentNonAdvertised", ignore = true)
	@Mapping(target = "workSchedule", ignore = true)
	@Mapping(target = "classification", ignore = true)
	@Mapping(target = "languageRequirement", ignore = true)
	@Mapping(target = "securityClearance", ignore = true)
	@Mapping(target = "employmentEquities", ignore = true)
	void updateEntityFromModel(RequestUpdateModel updateModel, @MappingTarget RequestEntity entity);
}
