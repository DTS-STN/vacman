package ca.gov.dtsstn.vacman.api.web.model.mapper;

import org.mapstruct.Mapper;

import ca.gov.dtsstn.vacman.api.data.entity.WfaStatusEntity;
import ca.gov.dtsstn.vacman.api.web.model.WfaStatusReadModel;

@Mapper
public interface WfaStatusModelMapper {

    WfaStatusReadModel toModel(WfaStatusEntity entity);

}