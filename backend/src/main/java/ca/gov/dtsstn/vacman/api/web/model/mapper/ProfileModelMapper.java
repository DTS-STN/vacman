package ca.gov.dtsstn.vacman.api.web.model.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import ca.gov.dtsstn.vacman.api.data.entity.ProfileEntity;
import ca.gov.dtsstn.vacman.api.web.model.ProfileReadModel;

@Mapper(uses = { CodeModelMapper.class })
public interface ProfileModelMapper {

	@Mapping(source = "user.id", target = "userId")
	@Mapping(source = "user.microsoftEntraId", target = "microsoftEntraId")
	@Mapping(source = "user.firstName", target = "firstName")
	@Mapping(source = "user.lastName", target = "lastName")
	@Mapping(source = "hrAdvisor.id", target = "hrAdvisorId")
	ProfileReadModel toModel(ProfileEntity entity);

	@Mapping(source = "user.id", target = "userId")
	@Mapping(source = "hrAdvisor.id", target = "hrAdvisorId")
	ProfileReadModel toModelNoUserData(ProfileEntity entity);

}
