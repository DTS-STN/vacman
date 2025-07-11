package ca.gov.dtsstn.vacman.api.web.model.mapper;

import org.mapstruct.Mapper;

import ca.gov.dtsstn.vacman.api.data.entity.EmploymentEquityEntity;
import ca.gov.dtsstn.vacman.api.web.model.EmploymentEquityReadModel;

@Mapper
public interface EmploymentEquityModelMapper {

    EmploymentEquityReadModel toModel(EmploymentEquityEntity entity);

}
