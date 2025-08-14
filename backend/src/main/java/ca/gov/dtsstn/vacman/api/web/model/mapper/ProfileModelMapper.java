package ca.gov.dtsstn.vacman.api.web.model.mapper;

import ca.gov.dtsstn.vacman.api.data.entity.*;
import ca.gov.dtsstn.vacman.api.web.model.*;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(uses = { CodeModelMapper.class })
public interface ProfileModelMapper {

	@Mapping(source = "user", target = "profileUser")
	@Mapping(source = "hrAdvisor.id", target = "hrAdvisorId")
	@Mapping(source = "city", target = "substantiveCity")
	@Mapping(source = "language", target = "languageOfCorrespondence")
	@Mapping(source = "classification", target = "substantiveClassification")
	@Mapping(source = "workUnit", target = "substantiveWorkUnit")
	@Mapping(source = "profileCities", target = "preferredCities")
	@Mapping(source = "classificationProfiles", target = "preferredClassifications")
	@Mapping(source = "employmentOpportunities", target = "preferredEmploymentOpportunities")
	@Mapping(source = "languageReferralTypes", target = "preferredLanguages")
	ProfileReadModel toModel(ProfileEntity entity);

	@Mapping(source = "user.id", target = "profileUser.id")
	@Mapping(source = "hrAdvisor.id", target = "hrAdvisorId")
	ProfileReadModel toModelNoUserData(ProfileEntity entity);

	@Mapping(source = "city", target = ".")
	CityReadModel toCityReadModel(ProfileCityEntity entity);

	@Mapping(source = "classification", target = ".")
	ClassificationReadModel toClassificationReadModel(ClassificationProfileEntity entity);

	@Mapping(source = "employmentOpportunity", target = ".")
	EmploymentOpportunityReadModel toEmploymentOpportunityReadModel(ProfileEmploymentOpportunityEntity entity);

	@Mapping(source = "languageReferralType", target = ".")
	LanguageReferralTypeReadModel toLanguageReferralTypeReadModel(ProfileLanguageReferralTypeEntity entity);
}
