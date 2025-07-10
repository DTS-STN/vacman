package ca.gov.dtsstn.vacman.api.web.model.mapper;

import org.mapstruct.Mapper;

import ca.gov.dtsstn.vacman.api.data.entity.EventEntity;
import ca.gov.dtsstn.vacman.api.web.model.EventReadModel;

@Mapper
public interface EventModelMapper {

    EventReadModel toModel(EventEntity entity);

}
