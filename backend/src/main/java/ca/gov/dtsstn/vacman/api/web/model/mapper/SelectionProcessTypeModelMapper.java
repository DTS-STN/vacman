package ca.gov.dtsstn.vacman.api.web.model.mapper;

import org.mapstruct.Mapper;

import ca.gov.dtsstn.vacman.api.data.entity.SelectionProcessTypeEntity;
import ca.gov.dtsstn.vacman.api.web.model.SelectionProcessTypeReadModel;

@Mapper
public interface SelectionProcessTypeModelMapper {

    SelectionProcessTypeReadModel toModel(SelectionProcessTypeEntity entity);

}
