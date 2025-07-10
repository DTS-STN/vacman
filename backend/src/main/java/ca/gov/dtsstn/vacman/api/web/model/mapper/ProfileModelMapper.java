package ca.gov.dtsstn.vacman.api.web.model.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import ca.gov.dtsstn.vacman.api.data.entity.ProfileEntity;
import ca.gov.dtsstn.vacman.api.web.model.ProfileReadModel;

@Mapper
public interface ProfileModelMapper {

    @Mapping(target = "userId", source = "user.id")
    @Mapping(target = "approvedByUserId", source = "approvedBy.id")
    @Mapping(target = "reviewedByUserId", source = "reviewedBy.id")
    @Mapping(target = "cityCode", source = "city.code")
    @Mapping(target = "classificationCode", source = "classification.code")
    @Mapping(target = "educationLevelCode", source = "educationLevel.code")
    @Mapping(target = "languageCode", source = "language.code")
    @Mapping(target = "priorityLevelCode", source = "priorityLevel.code")
    @Mapping(target = "profileStatusCode", source = "profileStatus.code")
    @Mapping(target = "wfaStatusCode", source = "wfaStatus.code")
    @Mapping(target = "workUnitCode", source = "workUnit.code")
    ProfileReadModel toModel(ProfileEntity entity);

}
