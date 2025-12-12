package ca.gov.dtsstn.vacman.api.data.repository;

import static org.springframework.data.jpa.domain.Specification.unrestricted;

import java.util.Arrays;
import java.util.Collection;

import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.stereotype.Repository;
import org.springframework.util.CollectionUtils;
import org.springframework.util.StringUtils;

import ca.gov.dtsstn.vacman.api.data.entity.MatchEntity;

@Repository
public interface MatchRepository extends AbstractBaseRepository<MatchEntity> {

	/**
	 * Find all matches for a specific request ID with eager loading of related entities.
	 *
	 * @param requestId The request ID
	 * @return List of matches
	 */
	@EntityGraph(attributePaths = {
		"matchFeedback",
		"matchStatus",
		"profile",
		"profile.languageOfCorrespondence",
		"profile.user"
	})
	Collection<MatchEntity> findAllByRequestId(Long requestId);

	/**
	 * Delete all matches for a specific request ID
	 *
	 * @param requestId The request ID
	 */
	void deleteByRequestId(Long requestId);

	/**
	 * Specification to find matches by request ID
	 *
	 * @param requestId The request ID
	 * @return Specification for matching by request ID
	 */
	static Specification<MatchEntity> hasRequestId(Long requestId) {
		return (root, query, cb) -> cb.equal(root.get("request").get("id"), requestId);
	}

	/**
	 * Specification to find matches by profile ID
	 *
	 * @param profileId The profile ID
	 * @return Specification for matching by profile ID
	 */
	static Specification<MatchEntity> hasProfileId(Long profileId) {
		return (root, query, cb) -> cb.equal(root.get("profile").get("id"), profileId);
	}

	/**
	 * JPA Specification to find matches by a set of match feedback IDs
	 *
	 * @param ids The set of match feedback IDs
	 * @return Specification for matching by match feedback IDs
	 */
	static Specification<MatchEntity> hasMatchFeedbackIdIn(Long ... ids) {
		return hasMatchFeedbackIdIn(Arrays.asList(ids));
	}

	/**
	 * JPA Specification to find matches by a set of match feedback IDs
	 *
	 * @param ids The set of match feedback IDs
	 * @return Specification for matching by match feedback IDs
	 */
	static Specification<MatchEntity> hasMatchFeedbackIdIn(Collection<Long> ids) {
		if (CollectionUtils.isEmpty(ids)) { return unrestricted(); }
		return (root, query, cb) -> root.get("matchFeedback").get("id").in(ids);
	}

	static Specification<MatchEntity> hasProfileFirstNameContaining(String firstName) {
		return (root, query, cb) -> {
			if (!StringUtils.hasText(firstName)) { return null; }

			return cb.like(
				cb.lower(root.get("profile").get("user").get("firstName")),
				"%" + firstName.toLowerCase() + "%"
			);
		};
	}

	static Specification<MatchEntity> hasProfileMiddleNameContaining(String middleName) {
		return (root, query, cb) -> {
			if (!StringUtils.hasText(middleName)) { return null; }

			return cb.like(
				cb.lower(root.get("profile").get("user").get("middleName")),
				"%" + middleName.toLowerCase() + "%"
			);
		};
	}

	static Specification<MatchEntity> hasProfileLastNameContaining(String lastName) {
		return (root, query, cb) -> {
			if (!StringUtils.hasText(lastName)) { return null; }

			return cb.like(
				cb.lower(root.get("profile").get("user").get("lastName")),
				"%" + lastName.toLowerCase() + "%"
			);
		};
	}

	static Specification<MatchEntity> hasProfileWfaStatusIdIn(Long ... ids) {
		return hasProfileWfaStatusIdIn(Arrays.asList(ids));
	}

	static Specification<MatchEntity> hasProfileWfaStatusIdIn(Collection<Long> ids) {
		if (CollectionUtils.isEmpty(ids)) { return unrestricted(); }
		return (root, query, cb) -> root.get("profile").get("wfaStatus").get("id").in(ids);
	}

}
