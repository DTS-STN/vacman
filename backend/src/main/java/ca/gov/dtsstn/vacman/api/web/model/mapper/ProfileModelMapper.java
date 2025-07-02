package ca.gov.dtsstn.vacman.api.web.model.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import ca.gov.dtsstn.vacman.api.data.entity.ProfileEntity;
import ca.gov.dtsstn.vacman.api.web.model.UserCreateModel;

@Mapper(componentModel = "spring")
public interface ProfileModelMapper {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "createdBy", ignore = true)
    @Mapping(target = "createdDate", ignore = true)
    @Mapping(target = "lastModifiedBy", ignore = true)
    @Mapping(target = "lastModifiedDate", ignore = true)
    @Mapping(source = "privacyConsentAccepted", target = "hasAcceptedPrivacyTerms")
    @Mapping(target = "notificationPurpose", ignore = true)
    @Mapping(target = "profileStatus", ignore = true)
    ProfileEntity toEntity(UserCreateModel model);
}