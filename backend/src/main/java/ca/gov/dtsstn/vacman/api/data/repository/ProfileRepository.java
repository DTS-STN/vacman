package ca.gov.dtsstn.vacman.api.data.repository;

import java.time.LocalDate;
import java.util.Arrays;
import java.util.Collection;

import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Repository;
import org.springframework.util.CollectionUtils;

import ca.gov.dtsstn.vacman.api.data.entity.ProfileEntity;

@Repository
public interface ProfileRepository extends AbstractBaseRepository<ProfileEntity> {

	/**
	 * JPA specification to find profiles assigned to a specific HR Advisor.
	 */
	static Specification<ProfileEntity> hasHrAdvisorId(Long id) {
		return (root, query, cb) -> cb.equal(root.get("hrAdvisor").get("id"), id);
	}

	/**
	 * JPA specification to find profiles assigned to specific HR Advisors.
	 */
	static Specification<ProfileEntity> hasHrAdvisorIdIn(Long ... ids) {
		return hasHrAdvisorIdIn(Arrays.asList(ids));
	}

	/**
	 * JPA specification to find profiles assigned to specific HR Advisors.
	 */
	static Specification<ProfileEntity> hasHrAdvisorIdIn(Collection<Long> ids) {
		if (CollectionUtils.isEmpty(ids)) { return AbstractBaseRepository.empty(); }
		return (root, query, cb) -> root.get("hrAdvisor").get("id").in(ids);
	}

	/**
	 * JPA specification to find profiles with a specific preferred city ID.
	 */
	static Specification<ProfileEntity> hasPreferredCityId(Long id) {
		return (root, query, cb) -> {
			final var join = root.join("preferredCities");
			return cb.equal(join.get("city").get("id"), id);
		};
	}

	/**
	 * JPA specification to find profiles with preferred city IDs in the given array.
	 */
	static Specification<ProfileEntity> hasPreferredCityIdIn(Long ... ids) {
		return hasPreferredCityIdIn(Arrays.asList(ids));
	}

	/**
	 * JPA specification to find profiles with preferred city IDs in the given collection.
	 */
	static Specification<ProfileEntity> hasPreferredCityIdIn(Collection<Long> ids) {
		if (CollectionUtils.isEmpty(ids)) { return AbstractBaseRepository.empty(); }
		return (root, query, cb) -> {
			final var join = root.join("preferredCities");
			return join.get("city").get("id").in(ids);
		};
	}

	/**
	 * JPA specification to find profiles with a specific preferred city code.
	 */
	static Specification<ProfileEntity> hasPreferredCityCode(String code) {
		return (root, query, cb) -> {
			final var join = root.join("preferredCities");
			return cb.equal(join.get("city").get("code"), code);
		};
	}

	/**
	 * JPA specification to find profiles with preferred city codes in the given array.
	 */
	static Specification<ProfileEntity> hasPreferredCityCodeIn(String ... codes) {
		return hasPreferredCityCodeIn(Arrays.asList(codes));
	}

	/**
	 * JPA specification to find profiles with preferred city codes in the given collection.
	 */
	static Specification<ProfileEntity> hasPreferredCityCodeIn(Collection<String> codes) {
		if (CollectionUtils.isEmpty(codes)) { return AbstractBaseRepository.empty(); }
		return (root, query, cb) -> {
			final var join = root.join("preferredCities");
			return join.get("city").get("code").in(codes);
		};
	}

	/**
	 * JPA specification to find profiles with a specific preferred classification ID.
	 */
	static Specification<ProfileEntity> hasPreferredClassificationId(Long id) {
		return (root, query, cb) -> {
			final var join = root.join("preferredClassifications");
			return cb.equal(join.get("classification").get("id"), id);
		};
	}

	/**
	 * JPA specification to find profiles with a preferred classification ID in the given array.
	 */
	static Specification<ProfileEntity> hasPreferredClassificationIdIn(Long ... ids) {
		return hasPreferredClassificationIdIn(Arrays.asList(ids));
	}

	/**
	 * JPA specification to find profiles with a preferred classification ID in the given collection.
	 */
	static Specification<ProfileEntity> hasPreferredClassificationIdIn(Collection<Long> ids) {
		if (CollectionUtils.isEmpty(ids)) { return AbstractBaseRepository.empty(); }
		return (root, query, cb) -> {
			final var join = root.join("preferredClassifications");
			return join.get("classification").get("id").in(ids);
		};
	}

	/**
	 * JPA specification to find profiles with a specific preferred classification code.
	 */
	static Specification<ProfileEntity> hasPreferredClassificationCode(String code) {
		return (root, query, cb) -> {
			final var join = root.join("preferredClassifications");
			return cb.equal(join.get("classification").get("code"), code);
		};
	}

	/**
	 * JPA specification to find profiles with a preferred classification code in the given array.
	 */
	static Specification<ProfileEntity> hasPreferredClassificationCodeIn(String ... codes) {
		return hasPreferredClassificationCodeIn(Arrays.asList(codes));
	}

	/**
	 * JPA specification to find profiles with a preferred classification code in the given collection.
	 */
	static Specification<ProfileEntity> hasPreferredClassificationCodeIn(Collection<String> codes) {
		if (CollectionUtils.isEmpty(codes)) { return AbstractBaseRepository.empty(); }
		return (root, query, cb) -> {
			final var join = root.join("preferredClassifications");
			return join.get("classification").get("code").in(codes);
		};
	}

	/**
	 * JPA specification to find profiles with a specific preferred language referral type ID.
	 */
	static Specification<ProfileEntity> hasPreferredLanguageId(Long id) {
		return (root, query, cb) -> {
			final var join = root.join("preferredLanguages");
			return cb.equal(join.get("languageReferralType").get("id"), id);
		};
	}

	/**
	 * JPA specification to find profiles with a preferred language referral type ID in the given array.
	 */
	static Specification<ProfileEntity> hasPreferredLanguageIdIn(Long ... ids) {
		return hasPreferredLanguageIdIn(Arrays.asList(ids));
	}

	/**
	 * JPA specification to find profiles with a preferred language referral type ID in the given collection.
	 */
	static Specification<ProfileEntity> hasPreferredLanguageIdIn(Collection<Long> ids) {
		if (CollectionUtils.isEmpty(ids)) { return AbstractBaseRepository.empty(); }
		return (root, query, cb) -> {
			final var join = root.join("preferredLanguages");
			return join.get("languageReferralType").get("id").in(ids);
		};
	}

	/**
	 * JPA specification to find profiles with a specific preferred language referral type code.
	 */
	static Specification<ProfileEntity> hasPreferredLanguageCode(String code) {
		return (root, query, cb) -> {
			final var join = root.join("preferredLanguages");
			return cb.equal(join.get("languageReferralType").get("code"), code);
		};
	}

	/**
	 * JPA specification to find profiles with a preferred language referral type code in the given array.
	 */
	static Specification<ProfileEntity> hasPreferredLanguageCodeIn(String ... codes) {
		return hasPreferredLanguageCodeIn(Arrays.asList(codes));
	}

	/**
	 * JPA specification to find profiles with a preferred language referral type code in the given collection.
	 */
	static Specification<ProfileEntity> hasPreferredLanguageCodeIn(Collection<String> codes) {
		if (CollectionUtils.isEmpty(codes)) { return AbstractBaseRepository.empty(); }
		return (root, query, cb) -> {
			final var join = root.join("preferredLanguages");
			return join.get("languageReferralType").get("code").in(codes);
		};
	}

	/**
	 * JPA specification to find profiles with a specific status ID.
	 */
	static Specification<ProfileEntity> hasProfileStatusId(Long id) {
		return (root, query, cb) -> cb.equal(root.get("profileStatus").get("id"), id);
	}

	/**
	 * JPA specification to find profiles with a status ID in the given array.
	 */
	static Specification<ProfileEntity> hasProfileStatusIdIn(Long ... ids) {
		return hasProfileStatusIdIn(Arrays.asList(ids));
	}

	/**
	 * JPA specification to find profiles with a status ID in the given collection.
	 */
	static Specification<ProfileEntity> hasProfileStatusIdIn(Collection<Long> ids) {
		if (CollectionUtils.isEmpty(ids)) { return AbstractBaseRepository.empty(); }
		return (root, query, cb) -> root.get("profileStatus").get("id").in(ids);
	}

	/**
	 * JPA specification to find profiles with a specific status code.
	 */
	static Specification<ProfileEntity> hasProfileStatusCode(String status) {
		return (root, query, cb) -> cb.equal(root.get("profileStatus").get("code"), status);
	}

	/**
	 * JPA specification to find profiles with a status code in the given array.
	 */
	static Specification<ProfileEntity> hasProfileStatusCodeIn(String ... statuses) {
		return hasProfileStatusCodeIn(Arrays.asList(statuses));
	}

	/**
	 * JPA specification to find profiles with a status code in the given collection.
	 */
	static Specification<ProfileEntity> hasProfileStatusCodeIn(Collection<String> statuses) {
		if (CollectionUtils.isEmpty(statuses)) { return AbstractBaseRepository.empty(); }
		return (root, query, cb) -> root.get("profileStatus").get("code").in(statuses);
	}

	/**
	 * JPA specification to find profiles belonging to a specific user.
	 */
	static Specification<ProfileEntity> hasUserId(Long id) {
		return (root, query, cb) -> cb.equal(root.get("user").get("id"), id);
	}

	/**
	 * JPA specification to find profiles by the user's Microsoft Entra ID.
	 */
	static Specification<ProfileEntity> hasUserMicrosoftEntraId(String id) {
		return (root, query, cb) -> cb.equal(root.get("user").get("microsoftEntraId"), id);
	}

	/**
	 * JPA specification to find profiles that are available for referral.
	 */
	static Specification<ProfileEntity> isAvailableForReferral(boolean value) {
		return (root, query, cb) -> cb.equal(root.get("isAvailableForReferral"), value);
	}

	/**
	 * JPA specification to find profiles where wfaEndDate is null or after the specified date (future/ongoing availability).
	 * This is used to filter profiles that are still available (haven't ended) or have no end date.
	 */
	static Specification<ProfileEntity> hasWfaEndDateNullOrAfter(LocalDate date) {
		return (root, query, cb) -> cb.or(
			cb.isNull(root.get("wfaEndDate")),
			cb.greaterThanOrEqualTo(root.get("wfaEndDate"), date));
	}

	/**
	 * JPA specification to find profiles where wfaStartDate is null or before/equal to the specified date (already started).
	 * This is used to filter profiles that have already started their WFA period or have no start date.
	 */
	static Specification<ProfileEntity> hasWfaStartDateNullOrBefore(LocalDate date) {
		return (root, query, cb) -> cb.or(
			cb.isNull(root.get("wfaStartDate")),
			cb.lessThanOrEqualTo(root.get("wfaStartDate"), date));
	}

}