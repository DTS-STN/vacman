package ca.gov.dtsstn.vacman.api.web.model.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

import ca.gov.dtsstn.vacman.api.data.entity.UserEntity;
import ca.gov.dtsstn.vacman.api.web.model.UserCreateModel;
import ca.gov.dtsstn.vacman.api.web.model.UserReadModel;
import ca.gov.dtsstn.vacman.api.web.model.UserUpdateModel;

@Mapper(componentModel = "spring")
public interface UserModelMapper {

    @Mapping(source = "userType.code", target = "role")
    @Mapping(source = "networkName", target = "networkName")
    @Mapping(source = "uuName", target = "uuName")
    @Mapping(source = "firstName", target = "firstName")
    @Mapping(source = "middleName", target = "middleName")
    @Mapping(source = "lastName", target = "lastName")
    @Mapping(source = "initial", target = "initials")
    @Mapping(source = "personalRecordIdentifier", target = "personalRecordIdentifier")
    @Mapping(source = "businessPhoneNumber", target = "businessPhone")
    @Mapping(source = "businessEmailAddress", target = "businessEmail")
    @Mapping(source = "createdBy", target = "userCreated")
    @Mapping(target = "dateCreated", expression = "java(entity.getCreatedDate() != null ? entity.getCreatedDate().toString() : null)")
    @Mapping(source = "lastModifiedBy", target = "userUpdated")
    @Mapping(target = "dateUpdated", expression = "java(entity.getLastModifiedDate() != null ? entity.getLastModifiedDate().toString() : null)")
    UserReadModel toModel(UserEntity entity);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "createdBy", ignore = true)
    @Mapping(target = "createdDate", ignore = true)
    @Mapping(target = "lastModifiedBy", ignore = true)
    @Mapping(target = "lastModifiedDate", ignore = true)
    @Mapping(source = "activeDirectoryId", target = "uuName")
    @Mapping(target = "userType", ignore = true)
    @Mapping(target = "language", ignore = true)
    @Mapping(target = "profiles", ignore = true)
    @Mapping(target = "businessEmailAddress", source = "activeDirectoryId")
    @Mapping(target = "businessPhoneNumber", constant = "555-123-4567")
    @Mapping(target = "firstName", constant = "John")
    @Mapping(target = "lastName", constant = "Doe")
    @Mapping(target = "middleName", constant = "A")
    @Mapping(target = "initial", constant = "JAD")
    @Mapping(target = "personalRecordIdentifier", constant = "12345")
    @Mapping(target = "networkName", source = "activeDirectoryId")
    UserEntity toEntity(UserCreateModel model);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "createdBy", ignore = true)
    @Mapping(target = "createdDate", ignore = true)
    @Mapping(target = "lastModifiedBy", ignore = true)
    @Mapping(target = "lastModifiedDate", ignore = true)
    @Mapping(target = "uuName", ignore = true)
    @Mapping(target = "userType", ignore = true)
    @Mapping(target = "language", ignore = true)
    @Mapping(target = "profiles", ignore = true)
    @Mapping(source = "firstName", target = "firstName")
    @Mapping(source = "lastName", target = "lastName")
    @Mapping(source = "networkName", target = "networkName")
    @Mapping(source = "businessPhone", target = "businessPhoneNumber")
    @Mapping(source = "businessEmail", target = "businessEmailAddress")
    @Mapping(source = "middleName", target = "middleName")
    @Mapping(source = "initials", target = "initial")
    @Mapping(source = "personalRecordIdentifier", target = "personalRecordIdentifier")
    void updateEntityFromModel(UserUpdateModel model, @MappingTarget UserEntity entity);
}
