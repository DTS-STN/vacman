package ca.gov.dtsstn.vacman.api.web.model.mapper;

import org.mapstruct.BeanMapping;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.NullValuePropertyMappingStrategy;

import ca.gov.dtsstn.vacman.api.data.entity.LanguageEntity;
import ca.gov.dtsstn.vacman.api.data.entity.LanguageEntityBuilder;
import ca.gov.dtsstn.vacman.api.data.entity.UserEntity;
import ca.gov.dtsstn.vacman.api.data.entity.UserEntityBuilder;
import ca.gov.dtsstn.vacman.api.data.entity.UserTypeEntity;
import ca.gov.dtsstn.vacman.api.data.entity.UserTypeEntityBuilder;
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
	UserEntity toEntity(UserCreateModel model);

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
	UserEntityBuilder toEntityBuilder(UserCreateModel model);

	@Mapping(target = "id", ignore = true)
	@Mapping(target = "createdBy", ignore = true)
	@Mapping(target = "createdDate", ignore = true)
	@Mapping(target = "lastModifiedBy", ignore = true)
	@Mapping(target = "lastModifiedDate", ignore = true)
	@Mapping(target = "microsoftEntraId", ignore = true)
	@Mapping(target = "profiles", ignore = true)
	@Mapping(source = "businessEmail", target = "businessEmailAddress")
	@Mapping(source = "businessPhone", target = "businessPhoneNumber")
	@Mapping(source = "initials", target = "initial")
	@Mapping(source = "languageId", target = "language")
	@Mapping(source = "userTypeId", target = "userType")
	@BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
	UserEntity toEntity(UserUpdateModel model);

	default LanguageEntity toLanguageEntity(Long id) {
		return id == null ? null : new LanguageEntityBuilder().id(id).build();
	}

	default UserTypeEntity toUserTypeEntity(Long id) {
		return id == null ? null : new UserTypeEntityBuilder().id(id).build();
	}

}
