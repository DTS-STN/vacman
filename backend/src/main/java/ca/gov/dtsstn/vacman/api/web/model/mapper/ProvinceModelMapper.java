package ca.gov.dtsstn.vacman.api.web.model.mapper;

import org.mapstruct.Mapper;

import ca.gov.dtsstn.vacman.api.data.entity.ProvinceEntity;
import ca.gov.dtsstn.vacman.api.web.model.ProvinceReadModel;

@Mapper(componentModel = "spring")
public interface ProvinceModelMapper {

	ProvinceReadModel toModel(ProvinceEntity entity);

}