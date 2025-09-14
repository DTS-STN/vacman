package ca.gov.dtsstn.vacman.api.data.repository;

import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Repository;

import ca.gov.dtsstn.vacman.api.data.entity.RequestEntity;

@Repository
public interface RequestRepository extends AbstractBaseRepository<RequestEntity> {

	/**
	 * JPA specification to find requests assigned to a specific HR Advisor.
	 */
	static Specification<RequestEntity> hasHrAdvisorId(Long hrAdvisorId) {
		return (root, query, cb) -> cb.equal(root.get("hrAdvisor").get("id"), hrAdvisorId);
	}
}
