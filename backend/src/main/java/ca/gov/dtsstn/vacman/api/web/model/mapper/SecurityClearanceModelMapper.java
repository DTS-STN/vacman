package ca.gov.dtsstn.vacman.api.web.model.mapper;

import org.mapstruct.Mapper;

import ca.gov.dtsstn.vacman.api.data.entity.SecurityClearanceEntity;
import ca.gov.dtsstn.vacman.api.web.model.SecurityClearanceReadModel;

@Mapper
public interface SecurityClearanceModelMapper {

    SecurityClearanceReadModel toModel(SecurityClearanceEntity entity);

}
