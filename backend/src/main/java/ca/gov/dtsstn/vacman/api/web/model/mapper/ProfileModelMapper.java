package ca.gov.dtsstn.vacman.api.web.model.mapper;

import org.mapstruct.Mapper;

import ca.gov.dtsstn.vacman.api.data.entity.ProfileEntity;
import ca.gov.dtsstn.vacman.api.web.model.ProfileReadModel;

@Mapper(componentModel = "spring", uses = {
    UserModelMapper.class,
    WfaStatusModelMapper.class,
    ClassificationModelMapper.class,
    CityModelMapper.class,
    PriorityLevelModelMapper.class,
    WorkUnitModelMapper.class,
    LanguageModelMapper.class,
    ProfileStatusModelMapper.class
})
public interface ProfileModelMapper {

    ProfileReadModel toModel(ProfileEntity entity);

}
