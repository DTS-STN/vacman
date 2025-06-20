package ca.gov.dtsstn.vacman.api.web.model.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import ca.gov.dtsstn.vacman.api.data.entity.CityEntity;
import ca.gov.dtsstn.vacman.api.web.model.CityReadModel;

@Mapper
public interface CityModelMapper {

    @Mapping(target = "provinceCode", source = "province.code")
    CityReadModel toModel(CityEntity entity);

}
