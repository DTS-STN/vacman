package ca.gov.dtsstn.vacman.api.data.repository;

import java.util.Collection;

import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Repository;

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
	 * JPA specification to find profiles with a status code in the given collection.
	 */
	static Specification<ProfileEntity> hasProfileStatusCodeIn(Collection<String> statuses) {
		return (root, query, cb) -> root.get("profileStatus").get("code").in(statuses);
	}

	/**
	 * JPA specification to find profiles belonging to a specific user.
	 */
	static Specification<ProfileEntity> hasUserId(Long userId) {
		return (root, query, cb) -> cb.equal(root.get("user").get("id"), userId);
	}

	/**
	 * A JPA specification to find profiles by the user's Microsoft Entra ID.
	 */
	static Specification<ProfileEntity> hasUserMicrosoftEntraId(String entraId) {
		return (root, query, cb) -> cb.equal(root.get("user").get("microsoftEntraId"), entraId);
	}

}