package ca.gov.dtsstn.vacman.api.web.model.mapper;

import org.mapstruct.Mapper;

import ca.gov.dtsstn.vacman.api.data.entity.WorkScheduleEntity;
import ca.gov.dtsstn.vacman.api.web.model.WorkScheduleReadModel;

@Mapper(componentModel = "spring")
public interface WorkScheduleModelMapper {

    WorkScheduleReadModel toModel(WorkScheduleEntity entity);

}
