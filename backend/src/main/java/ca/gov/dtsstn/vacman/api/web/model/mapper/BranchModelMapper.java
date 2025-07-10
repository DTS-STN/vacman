package ca.gov.dtsstn.vacman.api.web.model.mapper;

import org.mapstruct.Mapper;

import ca.gov.dtsstn.vacman.api.data.entity.BranchEntity;
import ca.gov.dtsstn.vacman.api.web.model.BranchReadModel;

@Mapper
public interface BranchModelMapper {

    BranchReadModel toModel(BranchEntity entity);

}