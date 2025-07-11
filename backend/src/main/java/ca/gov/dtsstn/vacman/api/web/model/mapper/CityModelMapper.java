package ca.gov.dtsstn.vacman.api.web.model.mapper;

import org.mapstruct.Mapper;

import ca.gov.dtsstn.vacman.api.data.entity.CityEntity;
import ca.gov.dtsstn.vacman.api.web.model.CityReadModel;

@Mapper(componentModel = "spring", uses = {ProvinceModelMapper.class})
public interface CityModelMapper {

    CityReadModel toModel(CityEntity entity);

}
