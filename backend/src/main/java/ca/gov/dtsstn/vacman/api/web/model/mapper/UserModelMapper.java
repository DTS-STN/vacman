package ca.gov.dtsstn.vacman.api.web.model.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

import ca.gov.dtsstn.vacman.api.data.entity.UserEntity;
import ca.gov.dtsstn.vacman.api.web.model.UserCreateModel;
import ca.gov.dtsstn.vacman.api.web.model.UserReadModel;
import ca.gov.dtsstn.vacman.api.web.model.UserUpdateModel;

@Mapper(uses = { CodeModelMapper.class })
public interface UserModelMapper {

	@Mapping(source = "initial", target = "initial")
	@Mapping(source = "personalRecordIdentifier", target = "personalRecordIdentifier")
	@Mapping(source = "businessPhoneNumber", target = "businessPhoneNumber")
	@Mapping(source = "businessEmailAddress", target = "businessEmailAddress")
	@Mapping(source = "createdBy", target = "createdBy")
	@Mapping(source = "createdDate", target = "createdDate")
	@Mapping(source = "lastModifiedBy", target = "lastModifiedBy")
	@Mapping(source = "lastModifiedDate", target = "lastModifiedDate")
	UserReadModel toModel(UserEntity entity);

	@Mapping(target = "id", ignore = true)
	@Mapping(target = "createdBy", ignore = true)
	@Mapping(target = "createdDate", ignore = true)
	@Mapping(target = "lastModifiedBy", ignore = true)
	@Mapping(target = "lastModifiedDate", ignore = true)
	@Mapping(target = "userType", ignore = true)
	@Mapping(target = "language", ignore = true)
	@Mapping(target = "profiles", ignore = true)
	@Mapping(target = "businessEmailAddress", constant = "user@example.com")
	@Mapping(target = "businessPhoneNumber", constant = "555-123-4567")
	@Mapping(target = "firstName", constant = "John")
	@Mapping(target = "lastName", constant = "Doe")
	@Mapping(target = "middleName", constant = "A")
	@Mapping(target = "initial", constant = "JAD")
	@Mapping(target = "personalRecordIdentifier", constant = "12345")
	@Mapping(target = "activeDirectoryId", source = "activeDirectoryId")
	@Mapping(target = "uuid", constant = "00000000-0000-0000-0000-000000000000")
	UserEntity toEntity(UserCreateModel model);

	@Mapping(target = "id", ignore = true)
	@Mapping(target = "createdBy", ignore = true)
	@Mapping(target = "createdDate", ignore = true)
	@Mapping(target = "lastModifiedBy", ignore = true)
	@Mapping(target = "lastModifiedDate", ignore = true)
	@Mapping(target = "uuid", ignore = true)
	@Mapping(target = "userType", ignore = true)
	@Mapping(target = "language", ignore = true)
	@Mapping(target = "profiles", ignore = true)
	@Mapping(source = "firstName", target = "firstName")
	@Mapping(source = "lastName", target = "lastName")
	@Mapping(source = "activeDirectoryId", target = "activeDirectoryId")
	@Mapping(source = "businessPhone", target = "businessPhoneNumber")
	@Mapping(source = "businessEmail", target = "businessEmailAddress")
	@Mapping(source = "middleName", target = "middleName")
	@Mapping(source = "initials", target = "initial")
	@Mapping(source = "personalRecordIdentifier", target = "personalRecordIdentifier")
	void updateEntityFromModel(UserUpdateModel model, @MappingTarget UserEntity entity);

}
