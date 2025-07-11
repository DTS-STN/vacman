package ca.gov.dtsstn.vacman.api.web.model.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import ca.gov.dtsstn.vacman.api.data.entity.ProfileEntity;
import ca.gov.dtsstn.vacman.api.web.model.ProfileReadModel;

@Mapper
public interface ProfileModelMapper {

    @Mapping(target = "userId", source = "user.id")
    @Mapping(target = "hrAdvisorUserId", source = "hrAdvisor.id")
    @Mapping(target = "wfaStatusCode", source = "wfaStatus.code")
    @Mapping(target = "classificationCode", source = "classification.code")
    @Mapping(target = "cityCode", source = "city.code")
    @Mapping(target = "priorityLevelCode", source = "priorityLevel.code")
    @Mapping(target = "workUnitCode", source = "workUnit.code")
    @Mapping(target = "languageId", source = "language.id")
    @Mapping(target = "profileStatusCode", source = "profileStatus.code")
    ProfileReadModel toModel(ProfileEntity entity);

}
