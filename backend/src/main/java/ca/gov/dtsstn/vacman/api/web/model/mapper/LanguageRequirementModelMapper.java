package ca.gov.dtsstn.vacman.api.web.model.mapper;

import org.mapstruct.Mapper;

import ca.gov.dtsstn.vacman.api.data.entity.LanguageRequirementEntity;
import ca.gov.dtsstn.vacman.api.web.model.LanguageRequirementReadModel;

@Mapper
public interface LanguageRequirementModelMapper {

    LanguageRequirementReadModel toModel(LanguageRequirementEntity entity);

}
