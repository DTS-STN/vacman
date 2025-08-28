package ca.gov.dtsstn.vacman.api.web.model.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import ca.gov.dtsstn.vacman.api.data.entity.RequestEntity;
import ca.gov.dtsstn.vacman.api.web.model.RequestReadModel;

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

}