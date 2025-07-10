package ca.gov.dtsstn.vacman.api.web.model.mapper;

import org.mapstruct.Mapper;

import ca.gov.dtsstn.vacman.api.data.entity.AssessmentResultEntity;
import ca.gov.dtsstn.vacman.api.web.model.AssessmentResultReadModel;

@Mapper
public interface AssessmentResultModelMapper {

    AssessmentResultReadModel toModel(AssessmentResultEntity entity);

}
