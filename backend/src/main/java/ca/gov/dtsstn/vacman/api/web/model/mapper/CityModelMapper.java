package ca.gov.dtsstn.vacman.api.web.model.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import ca.gov.dtsstn.vacman.api.data.entity.CityEntity;
import ca.gov.dtsstn.vacman.api.web.model.CityReadModel;

@Mapper(uses = ProvinceModelMapper.class)
public interface CityModelMapper {

    @Mapping(target = "province", source = "province")
    CityReadModel toModel(CityEntity entity);

}
