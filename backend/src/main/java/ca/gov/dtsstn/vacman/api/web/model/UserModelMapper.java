package ca.gov.dtsstn.vacman.api.web.model;

import java.util.List;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import ca.gov.dtsstn.vacman.api.data.entity.UserEntity;

@Mapper
public interface UserModelMapper {

	UserModel toModel(UserEntity entity);

	List<UserModel> toModels(Iterable<UserEntity> entities);

	@Mapping(target = "id", ignore = true)
	@Mapping(target = "createdBy", ignore = true)
	@Mapping(target = "createdDate", ignore = true)
	@Mapping(target = "lastModifiedBy", ignore = true)
	@Mapping(target = "lastModifiedDate", ignore = true)
	@Mapping(target = "version", ignore = true)
	UserEntity toEntity(UserCreateModel model);

}
