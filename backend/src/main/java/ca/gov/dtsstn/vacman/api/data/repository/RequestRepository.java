package ca.gov.dtsstn.vacman.api.data.repository;

import java.util.Arrays;
import java.util.Collection;

import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Repository;
import org.springframework.util.CollectionUtils;

import ca.gov.dtsstn.vacman.api.data.entity.RequestEntity;

@Repository
public interface RequestRepository extends AbstractBaseRepository<RequestEntity> {

	/**
	 * JPA specification to find requests assigned to a specific HR Advisor.
	 */
	static Specification<RequestEntity> hasHrAdvisorId(Long id) {
		return (root, query, cb) -> cb.equal(root.get("hrAdvisor").get("id"), id);
	}

	/**
	 * JPA specification to find requests assigned to specific HR Advisors.
	 */
	static Specification<RequestEntity> hasHrAdvisorIdIn(Long ... ids) {
		return hasHrAdvisorIdIn(Arrays.asList(ids));
	}

	/**
	 * JPA specification to find requests assigned to specific HR Advisors.
	 */
	static Specification<RequestEntity> hasHrAdvisorIdIn(Collection<Long> ids) {
		if (CollectionUtils.isEmpty(ids)) { return Specification.unrestricted(); }
		return (root, query, cb) -> root.get("hrAdvisor").get("id").in(ids);
	}

	/**
	 * JPA specification to find requests with a specific status code.
	 */
	static Specification<RequestEntity> hasStatusCode(String code) {
		return (root, query, cb) -> cb.equal(root.get("requestStatus").get("code"), code);
	}

	/**
	 * JPA specification to find requests with specific status codes.
	 */
	static Specification<RequestEntity> hasStatusCodeIn(String ... codes) {
		return hasStatusCodeIn(Arrays.asList(codes));
	}

	/**
	 * JPA specification to find requests with specific status codes.
	 */
	static Specification<RequestEntity> hasStatusCodeIn(Collection<String> codes) {
		if (CollectionUtils.isEmpty(codes)) { return Specification.unrestricted(); }
		return (root, query, cb) -> root.get("requestStatus").get("code").in(codes);
	}

	/**
	 * JPA specification to find requests with a specific work-unit code.
	 */
	static Specification<RequestEntity> hasWorkUnitCode(String code) {
		return (root, query, cb) -> cb.equal(root.get("workUnit").get("code"), code);
	}

	/**
	 * JPA specification to find requests with specific work-unit codes.
	 */
	static Specification<RequestEntity> hasWorkUnitCodeIn(String ... codes) {
		return hasWorkUnitCodeIn(Arrays.asList(codes));
	}

	/**
	 * JPA specification to find requests with specific work-unit codes.
	 */
	static Specification<RequestEntity> hasWorkUnitCodeIn(Collection<String> codes) {
		if (CollectionUtils.isEmpty(codes)) { return Specification.unrestricted(); }
		return (root, query, cb) -> root.get("workUnit").get("code").in(codes);
	}

}
