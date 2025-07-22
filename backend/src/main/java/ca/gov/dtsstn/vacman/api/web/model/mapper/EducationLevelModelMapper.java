package ca.gov.dtsstn.vacman.api.web.model.mapper;

import org.mapstruct.Mapper;

import ca.gov.dtsstn.vacman.api.data.entity.EducationLevelEntity;
import ca.gov.dtsstn.vacman.api.web.model.EducationLevelReadModel;

@Mapper
public interface EducationLevelModelMapper {

	EducationLevelReadModel toModel(EducationLevelEntity entity);

}