package ca.gov.dtsstn.vacman.api.web.model.mapper;

import org.mapstruct.Mapper;

import ca.gov.dtsstn.vacman.api.data.entity.WorkUnitEntity;
import ca.gov.dtsstn.vacman.api.web.model.WorkUnitReadModel;

@Mapper(componentModel = "spring")
public interface WorkUnitModelMapper {

	WorkUnitReadModel toModel(WorkUnitEntity entity);

}