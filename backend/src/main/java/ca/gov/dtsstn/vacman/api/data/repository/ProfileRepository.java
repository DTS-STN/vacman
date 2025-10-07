package ca.gov.dtsstn.vacman.api.data.repository;

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
	static Specification<ProfileEntity> isAvailableForReferral() {
		return (root, query, cb) -> cb.equal(root.get("isAvailableForReferral"), true);
	}

}