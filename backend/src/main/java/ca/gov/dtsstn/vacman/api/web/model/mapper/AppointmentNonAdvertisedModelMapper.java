package ca.gov.dtsstn.vacman.api.web.model.mapper;

import org.mapstruct.Mapper;

import ca.gov.dtsstn.vacman.api.data.entity.AppointmentNonAdvertisedEntity;
import ca.gov.dtsstn.vacman.api.web.model.AppointmentNonAdvertisedReadModel;

@Mapper
public interface AppointmentNonAdvertisedModelMapper {

    AppointmentNonAdvertisedReadModel toModel(AppointmentNonAdvertisedEntity entity);

}
