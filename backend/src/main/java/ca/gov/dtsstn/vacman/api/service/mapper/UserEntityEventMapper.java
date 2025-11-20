package ca.gov.dtsstn.vacman.api.service.mapper;

import java.util.Optional;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Named;
import org.mapstruct.ReportingPolicy;

import ca.gov.dtsstn.vacman.api.data.entity.AbstractCodeEntity;
import ca.gov.dtsstn.vacman.api.data.entity.UserEntity;
import ca.gov.dtsstn.vacman.api.service.dto.UserEventDto;

@Mapper(unmappedTargetPolicy = ReportingPolicy.ERROR)
public interface UserEntityEventMapper {

	@Mapping(target = "languageCode", source = "entity", qualifiedByName = "languageCode")
	@Mapping(target = "userTypeCode", source = "entity", qualifiedByName = "userTypeCode")
	UserEventDto toEventDto(UserEntity entity);

	@Named("languageCode")
	default String languageCode(UserEntity entity) {
		return Optional.ofNullable(entity.getLanguage())
			.map(AbstractCodeEntity::getCode)
			.orElse(null);
	}

	@Named("userTypeCode")
	default String userTypeCode(UserEntity entity) {
		return Optional.ofNullable(entity.getUserType())
			.map(AbstractCodeEntity::getCode)
			.orElse(null);
	}

}