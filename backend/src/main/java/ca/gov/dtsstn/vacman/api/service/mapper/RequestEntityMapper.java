package ca.gov.dtsstn.vacman.api.service.mapper;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Named;
import org.mapstruct.ReportingPolicy;

import ca.gov.dtsstn.vacman.api.data.entity.AbstractCodeEntity;
import ca.gov.dtsstn.vacman.api.data.entity.RequestEntity;
import ca.gov.dtsstn.vacman.api.data.entity.UserEntity;
import ca.gov.dtsstn.vacman.api.service.dto.RequestEventDto;

@Mapper(unmappedTargetPolicy = ReportingPolicy.ERROR)
public interface RequestEntityMapper {

	@Mapping(target = "additionalContactEmails", source = "entity", qualifiedByName = "additionalContactEmails")
	@Mapping(target = "bilingual", source = "entity", qualifiedByName = "bilingual")
	@Mapping(target = "classificationNameEn", source = "entity", qualifiedByName = "classificationNameEn")
	@Mapping(target = "classificationNameFr", source = "entity", qualifiedByName = "classificationNameFr")
	@Mapping(target = "hiringManagerEmails", source = "entity", qualifiedByName = "hiringManagerEmails")
	@Mapping(target = "hrAdvisorEmail", source = "entity", qualifiedByName = "hrAdvisorEmail")
	@Mapping(target = "languageCode", source = "entity", qualifiedByName = "languageCode")
	@Mapping(target = "languageRequirementNameEn", source = "entity", qualifiedByName = "languageRequirementNameEn")
	@Mapping(target = "languageRequirementNameFr", source = "entity", qualifiedByName = "languageRequirementNameFr")
	@Mapping(target = "location", source = "entity", qualifiedByName = "location")
	@Mapping(target = "securityClearanceNameEn", source = "entity", qualifiedByName = "securityClearanceNameEn")
	@Mapping(target = "securityClearanceNameFr", source = "entity", qualifiedByName = "securityClearanceNameFr")
	@Mapping(target = "subDelegatedManagerEmails", source = "entity", qualifiedByName = "subDelegatedManagerEmails")
	@Mapping(target = "submitterEmail", source = "entity", qualifiedByName = "submitterEmail")
	@Mapping(target = "submitterEmails", source = "entity", qualifiedByName = "submitterEmails")
	@Mapping(target = "submitterName", source = "entity", qualifiedByName = "submitterName")
	RequestEventDto toEventDto(RequestEntity entity);

	@Named("languageCode")
	default String languageCode(RequestEntity entity) {
		return Optional.ofNullable(entity.getLanguage())
			.map(AbstractCodeEntity::getCode)
			.orElse("en");
	}

	@Named("location")
	default String location(RequestEntity entity) {
		return entity.getCities().stream()
			.map(AbstractCodeEntity::getNameEn)
			.collect(Collectors.joining(", "));
	}

	@Named("classificationNameEn")
	default String classificationNameEn(RequestEntity entity) {
		return Optional.ofNullable(entity.getClassification())
			.map(AbstractCodeEntity::getNameEn)
			.orElse("N/A");
	}

	@Named("classificationNameFr")
	default String classificationNameFr(RequestEntity entity) {
		return Optional.ofNullable(entity.getClassification())
			.map(AbstractCodeEntity::getNameFr)
			.orElse("N/A");
	}

	@Named("languageRequirementNameEn")
	default String languageRequirementNameEn(RequestEntity entity) {
		return Optional.ofNullable(entity.getLanguageRequirement())
			.map(AbstractCodeEntity::getNameEn)
			.orElse("N/A");
	}

	@Named("languageRequirementNameFr")
	default String languageRequirementNameFr(RequestEntity entity) {
		return Optional.ofNullable(entity.getLanguageRequirement())
			.map(AbstractCodeEntity::getNameFr)
			.orElse("N/A");
	}

	@Named("securityClearanceNameEn")
	default String securityClearanceNameEn(RequestEntity entity) {
		return Optional.ofNullable(entity.getSecurityClearance())
			.map(AbstractCodeEntity::getNameEn)
			.orElse("N/A");
	}

	@Named("securityClearanceNameFr")
	default String securityClearanceNameFr(RequestEntity entity) {
		return Optional.ofNullable(entity.getSecurityClearance())
			.map(AbstractCodeEntity::getNameFr)
			.orElse("N/A");
	}

	@Named("submitterName")
	default String submitterName(RequestEntity entity) {
		return Optional.ofNullable(entity.getSubmitter())
			.map(submitter -> submitter.getFirstName() + " " + submitter.getLastName())
			.orElse("N/A");
	}

	@Named("submitterEmail")
	default String submitterEmail(RequestEntity entity) {
		return Optional.ofNullable(entity.getSubmitter())
			.map(UserEntity::getBusinessEmailAddress)
			.orElse("N/A");
	}

	@Named("hrAdvisorEmail")
	default String hrAdvisorEmail(RequestEntity entity) {
		return Optional.ofNullable(entity.getHrAdvisor())
			.map(UserEntity::getBusinessEmailAddress)
			.orElse(null);
	}

	@Named("submitterEmails")
	default List<String> submitterEmails(RequestEntity entity) {
		return Optional.ofNullable(entity.getSubmitter())
			.map(UserEntity::getBusinessEmailAddress)
			.map(List::of)
			.orElse(List.of());
	}

	@Named("hiringManagerEmails")
	default List<String> hiringManagerEmails(RequestEntity entity) {
		return Optional.ofNullable(entity.getHiringManager())
			.map(UserEntity::getBusinessEmailAddress)
			.map(List::of)
			.orElse(List.of());
	}

	@Named("additionalContactEmails")
	default List<String> additionalContactEmails(RequestEntity entity) {
		return Optional.ofNullable(entity.getAdditionalContact())
			.map(UserEntity::getBusinessEmailAddress)
			.map(List::of)
			.orElse(List.of());
	}

	@Named("subDelegatedManagerEmails")
	default List<String> subDelegatedManagerEmails(RequestEntity entity) {
		return Optional.ofNullable(entity.getSubDelegatedManager())
			.map(UserEntity::getBusinessEmailAddress)
			.map(List::of)
			.orElse(List.of());
	}

	@Named("bilingual")
	default Boolean bilingual(RequestEntity entity) {
		final var code = Optional.ofNullable(entity.getLanguageRequirement())
			.map(AbstractCodeEntity::getCode).orElse("");

		return "BI".equals(code) || "BNI".equals(code);
	}

}