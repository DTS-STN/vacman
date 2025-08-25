package ca.gov.dtsstn.vacman.api.web.model.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import ca.gov.dtsstn.vacman.api.data.entity.RequestEntity;
import ca.gov.dtsstn.vacman.api.web.model.RequestReadModel;

@Mapper
public interface RequestModelMapper {

	@Mapping(target = "status", source = "requestStatus")
	RequestReadModel toModel(RequestEntity request);

}
