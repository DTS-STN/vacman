package ca.gov.dtsstn.vacman.api.web.model.mapper;

import org.mapstruct.Mapper;

import ca.gov.dtsstn.vacman.api.data.entity.LanguageReferralTypeEntity;
import ca.gov.dtsstn.vacman.api.web.model.LanguageReferralTypeReadModel;

@Mapper
public interface LanguageReferralTypeModelMapper {

    LanguageReferralTypeReadModel toModel(LanguageReferralTypeEntity entity);

}