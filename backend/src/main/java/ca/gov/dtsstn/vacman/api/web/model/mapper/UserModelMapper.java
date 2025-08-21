package ca.gov.dtsstn.vacman.api.web.model.mapper;

import org.mapstruct.BeanMapping;
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

	@BeanMapping(ignoreByDefault = true)
	@Mapping(target = "language.id", source = "languageId")
	UserEntity toEntity(UserCreateModel model);

	@BeanMapping(ignoreByDefault = true)
	@Mapping(target = "language.id", source = "languageId")
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

	/**
	 * Maps a language id to a {@link LanguageEntity}.
	 */
	default LanguageEntity mapLanguageId(Long id) {
		if (id == null) { return null; }
		return new LanguageEntityBuilder().id(id).build();
	}

}
