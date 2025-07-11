package ca.gov.dtsstn.vacman.api.web.model.mapper;

import org.mapstruct.Mapper;

import ca.gov.dtsstn.vacman.api.data.entity.EmploymentOpportunityEntity;
import ca.gov.dtsstn.vacman.api.web.model.EmploymentOpportunityReadModel;

@Mapper
public interface EmploymentOpportunityModelMapper {

    EmploymentOpportunityReadModel toModel(EmploymentOpportunityEntity entity);

}
