package ca.gov.dtsstn.vacman.api.service.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.ReportingPolicy;

import ca.gov.dtsstn.vacman.api.data.entity.ProfileEntity;
import ca.gov.dtsstn.vacman.api.data.entity.ProfileEntityBuilder;

@Mapper(unmappedTargetPolicy = ReportingPolicy.ERROR)
public interface ProfileEntityMapper {

	ProfileEntityBuilder toProfileEntityBuilder(ProfileEntity profile);

}
