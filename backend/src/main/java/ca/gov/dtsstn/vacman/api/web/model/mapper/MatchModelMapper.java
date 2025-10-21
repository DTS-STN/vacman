package ca.gov.dtsstn.vacman.api.web.model.mapper;

import org.mapstruct.CollectionMappingStrategy;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.ReportingPolicy;

import ca.gov.dtsstn.vacman.api.data.entity.MatchEntity;
import ca.gov.dtsstn.vacman.api.web.model.MatchSummaryReadModel;

@Mapper(uses = { CodeModelMapper.class }, 
	unmappedTargetPolicy = ReportingPolicy.ERROR)
public interface MatchModelMapper {

	@Mapping(target = "profile.id", source = "profile.id")
	@Mapping(target = "profile.firstName", source = "profile.user.firstName")
	@Mapping(target = "profile.lastName", source = "profile.user.lastName")
	@Mapping(target = "profile.wfaStatus", source = "profile.wfaStatus")

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

	MatchSummaryReadModel toModel(MatchEntity entity);
}
