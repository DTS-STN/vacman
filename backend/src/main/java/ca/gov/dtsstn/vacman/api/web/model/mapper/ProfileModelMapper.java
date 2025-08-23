package ca.gov.dtsstn.vacman.api.web.model.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import ca.gov.dtsstn.vacman.api.data.entity.ClassificationProfileEntity;
import ca.gov.dtsstn.vacman.api.data.entity.ProfileCityEntity;
import ca.gov.dtsstn.vacman.api.data.entity.ProfileEmploymentOpportunityEntity;
import ca.gov.dtsstn.vacman.api.data.entity.ProfileEntity;
import ca.gov.dtsstn.vacman.api.data.entity.ProfileLanguageReferralTypeEntity;
import ca.gov.dtsstn.vacman.api.web.model.CityReadModel;
import ca.gov.dtsstn.vacman.api.web.model.ClassificationReadModel;
import ca.gov.dtsstn.vacman.api.web.model.EmploymentOpportunityReadModel;
import ca.gov.dtsstn.vacman.api.web.model.LanguageReferralTypeReadModel;
import ca.gov.dtsstn.vacman.api.web.model.ProfileReadModel;

@Mapper(uses = { CodeModelMapper.class })
public interface ProfileModelMapper {

	@Mapping(source = "user", target = "profileUser")
	@Mapping(source = "hrAdvisor.id", target = "hrAdvisorId")
	ProfileReadModel toModel(ProfileEntity entity);

	@Mapping(source = "city", target = ".")
	CityReadModel toCityReadModel(ProfileCityEntity entity);

	@Mapping(source = "classification", target = ".")
	ClassificationReadModel toClassificationReadModel(ClassificationProfileEntity entity);

	@Mapping(source = "employmentOpportunity", target = ".")
	EmploymentOpportunityReadModel toEmploymentOpportunityReadModel(ProfileEmploymentOpportunityEntity entity);

	@Mapping(source = "languageReferralType", target = ".")
	LanguageReferralTypeReadModel toLanguageReferralTypeReadModel(ProfileLanguageReferralTypeEntity entity);

}
