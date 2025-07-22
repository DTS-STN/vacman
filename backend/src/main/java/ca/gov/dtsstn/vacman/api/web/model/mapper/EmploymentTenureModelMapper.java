package ca.gov.dtsstn.vacman.api.web.model.mapper;

import org.mapstruct.Mapper;

import ca.gov.dtsstn.vacman.api.data.entity.EmploymentTenureEntity;
import ca.gov.dtsstn.vacman.api.web.model.EmploymentTenureReadModel;

@Mapper
public interface EmploymentTenureModelMapper {

	EmploymentTenureReadModel toModel(EmploymentTenureEntity entity);

}