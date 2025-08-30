package ca.gov.dtsstn.vacman.api.service.mapper;

import static ca.gov.dtsstn.vacman.api.data.entity.AbstractBaseEntity.byId;

import java.util.Optional;

import org.mapstruct.BeanMapping;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingConstants;
import org.mapstruct.MappingTarget;
import org.mapstruct.Named;
import org.mapstruct.NullValuePropertyMappingStrategy;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Pageable;

import ca.gov.dtsstn.vacman.api.data.entity.LanguageEntity;
import ca.gov.dtsstn.vacman.api.data.entity.UserEntity;
import ca.gov.dtsstn.vacman.api.service.CodeService;

@Mapper(componentModel = MappingConstants.ComponentModel.SPRING)
public abstract class UserEntityMapper {

	@Autowired
	protected CodeService codeService;

	/**
	 * Overwrites the given target {@link UserEntity} with values from the provided source entity.
	 * Null values in the source will result in null values in the target.
	 *
	 * @param source the {@link UserEntity} containing updated field values (source of data)
	 * @param target the existing {@link UserEntity} instance to update (target of mapping)
	 * @return the updated {@link UserEntity} instance (same object as {@code target})
	 */
	@Mapping(target = "id", ignore = true)
	@Mapping(target = "createdBy", ignore = true)
	@Mapping(target = "createdDate", ignore = true)
	@Mapping(target = "lastModifiedBy", ignore = true)
	@Mapping(target = "lastModifiedDate", ignore = true)
	@Mapping(target = "microsoftEntraId", ignore = true) // microsoftEntraId is set at creation time
	@Mapping(target = "profiles", ignore = true) // profiles should be handled separately
	@Mapping(target = "userType", ignore = true) // user types are set at creation time
	@Mapping(target = "language", qualifiedByName = { "getLanguage" })
	@BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.SET_TO_NULL)
	public abstract UserEntity overwrite(UserEntity source, @MappingTarget UserEntity target);

	/**
	 * Updates the given target {@link UserEntity} with values from the provided source entity.
	 * Null values in the source are ignored, retaining the existing values from the mapping target.
	 *
	 * @param source the {@link UserEntity} containing updated field values (source of data)
	 * @param target the existing {@link UserEntity} instance to update (target of mapping)
	 * @return the updated {@link UserEntity} instance (same object as {@code target})
	 */
	@Mapping(target = "id", ignore = true)
	@Mapping(target = "createdBy", ignore = true)
	@Mapping(target = "createdDate", ignore = true)
	@Mapping(target = "lastModifiedBy", ignore = true)
	@Mapping(target = "lastModifiedDate", ignore = true)
	@Mapping(target = "microsoftEntraId", ignore = true) // microsoftEntraId is set at creation time
	@Mapping(target = "profiles", ignore = true) // profiles should be handled separately
	@Mapping(target = "userType", ignore = true) // user types are set at creation time
	@Mapping(target = "language", qualifiedByName = { "getLanguage" })
	@BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
	public abstract UserEntity update(UserEntity source, @MappingTarget UserEntity target);

	@Named("getLanguage")
	protected LanguageEntity getLanguageEntity(LanguageEntity languageEntity) {
		final var id = Optional.ofNullable(languageEntity)
			.map(LanguageEntity::getId)
			.orElse(null);

		if (id == null) { return null; }

		return codeService.getLanguages(Pageable.unpaged())
			.filter(byId(id)).stream()
			.findFirst().orElseThrow();
	}

}
