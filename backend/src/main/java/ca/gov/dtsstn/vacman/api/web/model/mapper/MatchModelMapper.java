package ca.gov.dtsstn.vacman.api.web.model.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.ReportingPolicy;

import ca.gov.dtsstn.vacman.api.data.entity.MatchEntity;
import ca.gov.dtsstn.vacman.api.web.model.MatchReadModel;
import ca.gov.dtsstn.vacman.api.web.model.MatchSummaryReadModel;

@Mapper(uses = { CodeModelMapper.class, ProfileModelMapper.class }, unmappedTargetPolicy = ReportingPolicy.ERROR)
public interface MatchModelMapper {

	@Mapping(target = "profile.firstName", source = "profile.user.firstName")
	@Mapping(target = "profile.lastName", source = "profile.user.lastName")
	@Mapping(target = "request.id", source = "request.id")
	@Mapping(target = "request.requestStatus", source = "request.requestStatus")
	@Mapping(target = "request.requestDate", source = "request.createdDate")
	@Mapping(target = "request.hiringManagerFirstName", source = "request.hiringManager.firstName")
	@Mapping(target = "request.hiringManagerLastName", source = "request.hiringManager.lastName")
	@Mapping(target = "request.hiringManagerEmail", source = "request.hiringManager.businessEmailAddress")
	@Mapping(target = "request.hrAdvisorId", source = "request.hrAdvisor.id")
	@Mapping(target = "request.hrAdvisorFirstName", source = "request.hrAdvisor.firstName")
	@Mapping(target = "request.hrAdvisorLastName", source = "request.hrAdvisor.lastName")
	@Mapping(target = "request.hrAdvisorEmail", source = "request.hrAdvisor.businessEmailAddress")
	MatchSummaryReadModel toSummaryModel(MatchEntity entity);

	@Mapping(target = "request.englishLanguageProfile", source = "request.languageProfileEn")
	@Mapping(target = "request.englishStatementOfMerit", source = "request.somcAndConditionEmploymentEn")
	@Mapping(target = "request.englishTitle", source = "request.nameEn")
	@Mapping(target = "request.equityNeeded", source = "request.employmentEquityNeedIdentifiedIndicator")
	@Mapping(target = "request.frenchLanguageProfile", source = "request.languageProfileFr")
	@Mapping(target = "request.frenchStatementOfMerit", source = "request.somcAndConditionEmploymentFr")
	@Mapping(target = "request.frenchTitle", source = "request.nameFr")
	@Mapping(target = "request.hasMatches", constant = "true")
	@Mapping(target = "request.languageOfCorrespondence", source = "request.language")
	@Mapping(target = "request.projectedEndDate", source = "request.endDate")
	@Mapping(target = "request.projectedStartDate", source = "request.startDate")
	@Mapping(target = "request.status", source = "request.requestStatus")
	MatchReadModel toModel(MatchEntity entity);

}
