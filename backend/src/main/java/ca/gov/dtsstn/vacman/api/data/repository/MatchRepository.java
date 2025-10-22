package ca.gov.dtsstn.vacman.api.data.repository;

import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Repository;

import ca.gov.dtsstn.vacman.api.data.entity.MatchEntity;

@Repository
public interface MatchRepository extends AbstractBaseRepository<MatchEntity> {

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
}
