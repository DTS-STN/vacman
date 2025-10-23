package ca.gov.dtsstn.vacman.api.data.repository;

import static org.springframework.data.jpa.domain.Specification.unrestricted;

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
		if (CollectionUtils.isEmpty(ids)) { return unrestricted(); }
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
		if (CollectionUtils.isEmpty(codes)) { return unrestricted(); }
		return (root, query, cb) -> root.get("requestStatus").get("code").in(codes);
	}

	/**
	 * JPA specification to find requests with a specific status ID.
	 */
	static Specification<RequestEntity> hasRequestStatusId(Long id) {
		return (root, query, cb) -> cb.equal(root.get("requestStatus").get("id"), id);
	}

	/**
	 * JPA specification to find requests with specific status IDs.
	 */
	static Specification<RequestEntity> hasRequestStatusIdIn(Long ... ids) {
		return hasRequestStatusIdIn(Arrays.asList(ids));
	}

	/**
	 * JPA specification to find requests with specific status IDs.
	 */
	static Specification<RequestEntity> hasRequestStatusIdIn(Collection<Long> ids) {
		if (CollectionUtils.isEmpty(ids)) { return unrestricted(); }
		return (root, query, cb) -> root.get("requestStatus").get("id").in(ids);
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
		if (CollectionUtils.isEmpty(codes)) { return unrestricted(); }
		return (root, query, cb) -> root.get("workUnit").get("code").in(codes);
	}

	/**
	 * JPA specification to find requests with a specific work-unit ID.
	 */
	static Specification<RequestEntity> hasWorkUnitId(Long id) {
		return (root, query, cb) -> cb.equal(root.get("workUnit").get("id"), id);
	}

	/**
	 * JPA specification to find requests with specific work-unit IDs.
	 */
	static Specification<RequestEntity> hasWorkUnitIdIn(Long ... ids) {
		return hasWorkUnitIdIn(Arrays.asList(ids));
	}

	/**
	 * JPA specification to find requests with specific work-unit IDs.
	 */
	static Specification<RequestEntity> hasWorkUnitIdIn(Collection<Long> ids) {
		if (CollectionUtils.isEmpty(ids)) { return unrestricted(); }
		return (root, query, cb) -> root.get("workUnit").get("id").in(ids);
	}

}
