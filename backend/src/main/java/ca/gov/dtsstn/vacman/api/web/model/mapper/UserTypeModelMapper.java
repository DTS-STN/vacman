package ca.gov.dtsstn.vacman.api.web.model.mapper;

import org.mapstruct.Mapper;

import ca.gov.dtsstn.vacman.api.data.entity.UserTypeEntity;
import ca.gov.dtsstn.vacman.api.web.model.UserTypeReadModel;

@Mapper
public interface UserTypeModelMapper {

    UserTypeReadModel toModel(UserTypeEntity entity);

}
