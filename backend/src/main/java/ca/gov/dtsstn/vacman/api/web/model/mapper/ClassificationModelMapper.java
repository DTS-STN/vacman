package ca.gov.dtsstn.vacman.api.web.model.mapper;

import org.mapstruct.Mapper;

import ca.gov.dtsstn.vacman.api.data.entity.ClassificationEntity;
import ca.gov.dtsstn.vacman.api.web.model.ClassificationReadModel;

@Mapper
public interface ClassificationModelMapper {

    ClassificationReadModel toModel(ClassificationEntity entity);

}