package ca.gov.dtsstn.vacman.api.web.model.mapper;

import org.mapstruct.Mapper;

import ca.gov.dtsstn.vacman.api.data.entity.LanguageEntity;
import ca.gov.dtsstn.vacman.api.web.model.LanguageReadModel;

@Mapper
public interface LanguageModelMapper {

	LanguageReadModel toModel(LanguageEntity entity);

}