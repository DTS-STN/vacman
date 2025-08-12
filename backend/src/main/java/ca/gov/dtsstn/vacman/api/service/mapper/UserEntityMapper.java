package ca.gov.dtsstn.vacman.api.service.mapper;

import org.mapstruct.BeanMapping;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.NullValuePropertyMappingStrategy;

import ca.gov.dtsstn.vacman.api.data.entity.ProfileEntity;
import ca.gov.dtsstn.vacman.api.data.entity.UserEntity;
import ca.gov.dtsstn.vacman.api.data.entity.UserTypeEntity;

@Mapper
public interface UserEntityMapper {

	UserEntity clone(UserEntity source);

	@BeanMapping(ignoreByDefault = true)
	@Mapping(target = "id", source = "id")
	ProfileEntity cloneId(ProfileEntity source);

	@BeanMapping(ignoreByDefault = true)
	@Mapping(target = "id", source = "id")
	UserTypeEntity cloneId(UserTypeEntity source);

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
	@BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.SET_TO_NULL)
	UserEntity overwrite(UserEntity source, @MappingTarget UserEntity target);

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
	@BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
	UserEntity update(UserEntity source, @MappingTarget UserEntity target);

}
