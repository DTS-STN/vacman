package ca.gov.dtsstn.vacman.api.web.model.mapper;

import ca.gov.dtsstn.vacman.api.service.dto.MSGraphUser;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import ca.gov.dtsstn.vacman.api.data.entity.LanguageEntity;
import ca.gov.dtsstn.vacman.api.data.entity.LanguageEntityBuilder;
import ca.gov.dtsstn.vacman.api.data.entity.UserEntity;
import ca.gov.dtsstn.vacman.api.data.entity.UserEntityBuilder;
import ca.gov.dtsstn.vacman.api.web.model.UserCreateModel;
import ca.gov.dtsstn.vacman.api.web.model.UserPatchModel;
import ca.gov.dtsstn.vacman.api.web.model.UserReadModel;

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

	/**
	 * Maps a {@link UserPatchModel} to a {@link UserEntity} for a PUT/PATCH request.
	 */
	@Mapping(target = "id", ignore = true)
	@Mapping(target = "createdBy", ignore = true)
	@Mapping(target = "createdDate", ignore = true)
	@Mapping(target = "lastModifiedBy", ignore = true)
	@Mapping(target = "lastModifiedDate", ignore = true)
	@Mapping(target = "microsoftEntraId", ignore = true)
	@Mapping(target = "profiles", ignore = true)
	@Mapping(target = "userType", ignore = true)
	@Mapping(source = "businessEmail", target = "businessEmailAddress")
	@Mapping(source = "businessPhone", target = "businessPhoneNumber")
	@Mapping(source = "initials", target = "initial")
	@Mapping(source = "languageId", target = "language")
	UserEntity toEntity(UserPatchModel model);

	@Mapping(target = "id", ignore = true)
	@Mapping(source = "id", target = "microsoftEntraId")
	@Mapping(source = "givenName", target = "firstName")
	@Mapping(source = "surname", target = "lastName")
	@Mapping(source = "mail", target = "businessEmailAddress")
	UserEntity toEntity(MSGraphUser graphUser);

	/**
	 * Maps a language id to a {@link LanguageEntity}.
	 */
	default LanguageEntity mapLanguageId(Long id) {
		if (id == null) { return null; }
		return new LanguageEntityBuilder().id(id).build();
	}

}
