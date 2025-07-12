package ca.gov.dtsstn.vacman.api.web.model.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import ca.gov.dtsstn.vacman.api.data.entity.RequestEntity;
import ca.gov.dtsstn.vacman.api.web.model.RequestReadModel;

@Mapper
public interface RequestModelMapper {

    @Mapping(target = "securityClearanceCode", source = "securityClearance.code")
    @Mapping(target = "workUnitCode", source = "workUnit.code")
    @Mapping(target = "classificationCode", source = "classification.code")
    @Mapping(target = "requestStatusCode", source = "requestStatus.code")
    RequestReadModel toModel(RequestEntity entity);

}
