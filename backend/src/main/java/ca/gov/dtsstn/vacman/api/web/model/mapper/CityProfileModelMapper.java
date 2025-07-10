package ca.gov.dtsstn.vacman.api.web.model.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import ca.gov.dtsstn.vacman.api.data.entity.CityProfileEntity;
import ca.gov.dtsstn.vacman.api.web.model.CityProfileReadModel;

@Mapper
public interface CityProfileModelMapper {

    @Mapping(target = "profileId", source = "profile.id")
    @Mapping(target = "cityId", source = "city.id")
    @Mapping(target = "cityCode", source = "city.code")
    @Mapping(target = "cityNameEn", source = "city.nameEn")
    @Mapping(target = "cityNameFr", source = "city.nameFr")
    CityProfileReadModel toModel(CityProfileEntity entity);

}
