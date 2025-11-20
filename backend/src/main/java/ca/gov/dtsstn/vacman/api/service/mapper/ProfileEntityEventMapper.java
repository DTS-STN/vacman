package ca.gov.dtsstn.vacman.api.service.mapper;

import java.util.List;
import java.util.Optional;
import java.util.stream.Stream;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Named;
import org.mapstruct.ReportingPolicy;
import org.springframework.util.StringUtils;

import ca.gov.dtsstn.vacman.api.data.entity.AbstractCodeEntity;
import ca.gov.dtsstn.vacman.api.data.entity.ProfileEntity;
import ca.gov.dtsstn.vacman.api.data.entity.UserEntity;
import ca.gov.dtsstn.vacman.api.service.dto.ProfileEventDto;

@Mapper(unmappedTargetPolicy = ReportingPolicy.ERROR)
public interface ProfileEntityEventMapper {

	@Mapping(target = "hrAdvisorEmail", source = "entity", qualifiedByName = "hrAdvisorEmail")
	@Mapping(target = "languageOfCorrespondenceCode", source = "entity", qualifiedByName = "languageOfCorrespondenceCode")
	@Mapping(target = "personalEmailAddress", source = "entity", qualifiedByName = "personalEmailAddress")
	@Mapping(target = "profileStatusCode", source = "entity", qualifiedByName = "profileStatusCode")
	@Mapping(target = "substantiveCityNameEn", source = "entity", qualifiedByName = "substantiveCityNameEn")
	@Mapping(target = "substantiveClassificationNameEn", source = "entity", qualifiedByName = "substantiveClassificationNameEn")
	@Mapping(target = "userEmails", source = "entity", qualifiedByName = "userEmails")
	@Mapping(target = "userFirstName", source = "entity", qualifiedByName = "userFirstName")
	@Mapping(target = "userLanguageCode", source = "entity", qualifiedByName = "userLanguageCode")
	@Mapping(target = "userLastName", source = "entity", qualifiedByName = "userLastName")
	@Mapping(target = "wfaStatusCode", source = "entity", qualifiedByName = "wfaStatusCode")
	ProfileEventDto toEventDto(ProfileEntity entity);

	@Named("languageOfCorrespondenceCode")
	default String languageOfCorrespondenceCode(ProfileEntity entity) {
		return Optional.ofNullable(entity.getLanguageOfCorrespondence())
			.map(AbstractCodeEntity::getCode)
			.orElse(null);
	}

	@Named("personalEmailAddress")
	default String personalEmailAddress(ProfileEntity entity) {
		return entity.getPersonalEmailAddress();
	}

	@Named("profileStatusCode")
	default String profileStatusCode(ProfileEntity entity) {
		return Optional.ofNullable(entity.getProfileStatus())
			.map(AbstractCodeEntity::getCode)
			.orElse(null);
	}

	@Named("substantiveCityNameEn")
	default String substantiveCityNameEn(ProfileEntity entity) {
		return Optional.ofNullable(entity.getSubstantiveCity())
			.map(AbstractCodeEntity::getNameEn)
			.orElse(null);
	}

	@Named("substantiveClassificationNameEn")
	default String substantiveClassificationNameEn(ProfileEntity entity) {
		return Optional.ofNullable(entity.getSubstantiveClassification())
			.map(AbstractCodeEntity::getNameEn)
			.orElse(null);
	}

	@Named("userFirstName")
	default String userFirstName(ProfileEntity entity) {
		return Optional.ofNullable(entity.getUser())
			.map(UserEntity::getFirstName)
			.orElse(null);
	}

	@Named("userLastName")
	default String userLastName(ProfileEntity entity) {
		return Optional.ofNullable(entity.getUser())
			.map(UserEntity::getLastName)
			.orElse(null);
	}

	@Named("userLanguageCode")
	default String userLanguageCode(ProfileEntity entity) {
		return Optional.ofNullable(entity.getUser())
			.map(UserEntity::getLanguage)
			.map(AbstractCodeEntity::getCode)
			.orElse(null);
	}

	@Named("hrAdvisorEmail")
	default String hrAdvisorEmail(ProfileEntity entity) {
		return Optional.ofNullable(entity.getHrAdvisor())
			.map(UserEntity::getBusinessEmailAddress)
			.orElse(null);
	}

	@Named("userEmails")
	default List<String> userEmails(ProfileEntity entity) {
		if (entity.getUser() == null) { return List.of(); }

		final var businessEmail = Optional.ofNullable(entity.getUser().getBusinessEmailAddress()).filter(StringUtils::hasText);
		final var personalEmail = Optional.ofNullable(entity.getPersonalEmailAddress()).filter(StringUtils::hasText);

		return Stream.of(businessEmail, personalEmail)
			.filter(Optional::isPresent)
			.map(Optional::get)
			.toList();
	}

	@Named("wfaStatusCode")
	default String wfaStatusCode(ProfileEntity entity) {
		return Optional.ofNullable(entity.getWfaStatus())
			.map(AbstractCodeEntity::getCode)
			.orElse(null);
	}

}
