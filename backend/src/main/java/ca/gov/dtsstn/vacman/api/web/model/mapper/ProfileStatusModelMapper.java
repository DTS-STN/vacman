package ca.gov.dtsstn.vacman.api.web.model.mapper;

import org.mapstruct.Mapper;

import ca.gov.dtsstn.vacman.api.data.entity.ProfileStatusEntity;
import ca.gov.dtsstn.vacman.api.web.model.ProfileStatusReadModel;

@Mapper(componentModel = "spring")
public interface ProfileStatusModelMapper {

    ProfileStatusReadModel toModel(ProfileStatusEntity entity);

}
