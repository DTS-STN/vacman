package ca.gov.dtsstn.vacman.api.web.model.mapper;

import org.mapstruct.Mapper;

import ca.gov.dtsstn.vacman.api.data.entity.RequestStatusEntity;
import ca.gov.dtsstn.vacman.api.web.model.RequestStatusReadModel;

@Mapper
public interface RequestStatusModelMapper {

    RequestStatusReadModel toModel(RequestStatusEntity entity);

}
