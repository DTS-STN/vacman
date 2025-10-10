package ca.gov.dtsstn.vacman.api.data.repository;

import java.util.Collection;

import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Repository;
import org.springframework.util.CollectionUtils;

import ca.gov.dtsstn.vacman.api.data.entity.ProfileEntity;

@Repository
public interface ProfileRepository extends AbstractBaseRepository<ProfileEntity> {

	/**
	 * JPA specification to find profiles with preferred city IDs in the given collection.
	 */
	static Specification<ProfileEntity> hasPreferredCityIdIn(Collection<Long> cityIds) {
		if (CollectionUtils.isEmpty(cityIds)) { return AbstractBaseRepository.empty(); }
		return (root, query, cb) -> {
			final var join = root.join("preferredCities");
			return join.get("city").get("id").in(cityIds);
		};
	}

	/**
	 * JPA specification to find profiles with preferred city codes in the given collection.
	 */
	static Specification<ProfileEntity> hasPreferredCityCodeIn(Collection<String> cityCodes) {
		if (CollectionUtils.isEmpty(cityCodes)) { return AbstractBaseRepository.empty(); }
		return (root, query, cb) -> {
			final var join = root.join("preferredCities");
			return join.get("city").get("code").in(cityCodes);
		};
	}

	/**
	 * JPA specification to find profiles assigned to a specific HR Advisor.
	 */
	static Specification<ProfileEntity> hasHrAdvisorId(Long hrAdvisorId) {
		return (root, query, cb) -> cb.equal(root.get("hrAdvisor").get("id"), hrAdvisorId);
	}

	/**
	 * JPA specification to find profiles assigned to specific HR Advisors.
	 */
	static Specification<ProfileEntity> hasHrAdvisorIdIn(Collection<Long> hrAdvisorIds) {
		if (CollectionUtils.isEmpty(hrAdvisorIds)) { return AbstractBaseRepository.empty(); }
		return (root, query, cb) -> root.get("hrAdvisor").get("id").in(hrAdvisorIds);
	}

	/**
	 * JPA specification to find profiles with a preferred language referral type ID in the given collection.
	 */
	static Specification<ProfileEntity> hasPreferredLanguageIdIn(Collection<Long> languageReferralTypeIds) {
		if (CollectionUtils.isEmpty(languageReferralTypeIds)) { return AbstractBaseRepository.empty(); }
		return (root, query, cb) -> {
			final var join = root.join("preferredLanguages");
			return join.get("languageReferralType").get("id").in(languageReferralTypeIds);
		};
	}

	/**
	 * JPA specification to find profiles with a preferred language referral type code in the given collection.
	 */
	static Specification<ProfileEntity> hasPreferredLanguageCodeIn(Collection<String> languageReferralTypeCodes) {
		if (CollectionUtils.isEmpty(languageReferralTypeCodes)) { return AbstractBaseRepository.empty(); }
		return (root, query, cb) -> {
			final var join = root.join("preferredLanguages");
			return join.get("languageReferralType").get("code").in(languageReferralTypeCodes);
		};
	}

	/**
	 * JPA specification to find profiles with a preferred classification ID in the given collection.
	 */
	static Specification<ProfileEntity> hasPreferredClassificationIdIn(Collection<Long> classificationIds) {
		if (CollectionUtils.isEmpty(classificationIds)) { return AbstractBaseRepository.empty(); }
		return (root, query, cb) -> {
			final var join = root.join("preferredClassifications");
			return join.get("classification").get("id").in(classificationIds);
		};
	}

	/**
	 * JPA specification to find profiles with a preferred classification code in the given collection.
	 */
	static Specification<ProfileEntity> hasPreferredClassificationCodeIn(Collection<String> classificationCodes) {
		if (CollectionUtils.isEmpty(classificationCodes)) { return AbstractBaseRepository.empty(); }
		return (root, query, cb) -> {
			final var join = root.join("preferredClassifications");
			return join.get("classification").get("code").in(classificationCodes);
		};
	}

	/**
	 * JPA specification to find profiles with a status code in the given collection.
	 */
	static Specification<ProfileEntity> hasProfileStatusCodeIn(Collection<String> statuses) {
		if (CollectionUtils.isEmpty(statuses)) { return AbstractBaseRepository.empty(); }
		return (root, query, cb) -> root.get("profileStatus").get("code").in(statuses);
	}

	/**
	 * JPA specification to find profiles with a status code in the given collection.
	 */
	static Specification<ProfileEntity> hasProfileStatusIdIn(Collection<Long> statusIds) {
		if (CollectionUtils.isEmpty(statusIds)) { return AbstractBaseRepository.empty(); }
		return (root, query, cb) -> root.get("profileStatus").get("id").in(statusIds);
	}

	/**
	 * JPA specification to find profiles belonging to a specific user.
	 */
	static Specification<ProfileEntity> hasUserId(Long userId) {
		return (root, query, cb) -> cb.equal(root.get("user").get("id"), userId);
	}

	/**
	 * JPA specification to find profiles by the user's Microsoft Entra ID.
	 */
	static Specification<ProfileEntity> hasUserMicrosoftEntraId(String entraId) {
		return (root, query, cb) -> cb.equal(root.get("user").get("microsoftEntraId"), entraId);
	}

	/**
	 * JPA specification to find profiles that are available for referral.
	 */
	static Specification<ProfileEntity> isAvailableForReferral(boolean value) {
		return (root, query, cb) -> cb.equal(root.get("isAvailableForReferral"), value);
	}

}