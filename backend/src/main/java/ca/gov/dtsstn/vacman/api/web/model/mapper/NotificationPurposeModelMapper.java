package ca.gov.dtsstn.vacman.api.web.model.mapper;

import org.mapstruct.Mapper;

import ca.gov.dtsstn.vacman.api.data.entity.NotificationPurposeEntity;
import ca.gov.dtsstn.vacman.api.web.model.NotificationPurposeReadModel;

@Mapper
public interface NotificationPurposeModelMapper {

    NotificationPurposeReadModel toModel(NotificationPurposeEntity entity);

}
