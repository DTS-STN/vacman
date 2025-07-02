package ca.gov.dtsstn.vacman.api.web.model.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import ca.gov.dtsstn.vacman.api.data.entity.UserEntity;
import ca.gov.dtsstn.vacman.api.web.model.UserCreateModel;
import ca.gov.dtsstn.vacman.api.web.model.UserReadModel;

@Mapper(componentModel = "spring")
public interface UserModelMapper {

    @Mapping(source = "uuid", target = "activeDirectoryId")
    @Mapping(source = "userType.code", target = "role")
    @Mapping(source = "profile.hasAcceptedPrivacyTerms", target = "privacyConsentAccepted")
    UserReadModel toModel(UserEntity entity);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "createdBy", ignore = true)
    @Mapping(target = "createdDate", ignore = true)
    @Mapping(target = "lastModifiedBy", ignore = true)
    @Mapping(target = "lastModifiedDate", ignore = true)
    @Mapping(source = "activeDirectoryId", target = "uuid")
    @Mapping(target = "userType", ignore = true)
    @Mapping(target = "businessEmailAddress", source = "activeDirectoryId")
    @Mapping(target = "businessPhoneNumber", constant = "TBD")
    @Mapping(target = "firstName", expression = "java(model.name().split(\" \")[0])")
    @Mapping(target = "lastName", expression = "java(model.name().substring(model.name().indexOf(\" \") + 1))")
    @Mapping(target = "networkName", source = "activeDirectoryId")
    @Mapping(target = "profile", ignore = true)
    UserEntity toEntity(UserCreateModel model);
}
