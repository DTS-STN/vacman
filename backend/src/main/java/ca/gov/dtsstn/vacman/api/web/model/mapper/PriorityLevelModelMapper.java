package ca.gov.dtsstn.vacman.api.web.model.mapper;

import org.mapstruct.Mapper;

import ca.gov.dtsstn.vacman.api.data.entity.PriorityLevelEntity;
import ca.gov.dtsstn.vacman.api.web.model.PriorityLevelReadModel;

@Mapper(componentModel = "spring")
public interface PriorityLevelModelMapper {

    PriorityLevelReadModel toModel(PriorityLevelEntity entity);

}
