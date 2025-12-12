package ca.gov.dtsstn.vacman.api.data.repository;

import static org.springframework.data.jpa.domain.Specification.unrestricted;

import java.util.Arrays;
import java.util.Collection;
import java.util.Optional;

import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Repository;
import org.springframework.util.CollectionUtils;

import ca.gov.dtsstn.vacman.api.data.entity.RequestEntity;

@Repository
public interface RequestRepository extends AbstractBaseRepository<RequestEntity> {

	@NonNull
	@EntityGraph(attributePaths = {
		"cities",
		"classification",
		"languageRequirements",
		"securityClearance",
		"submitter"
	})
	Optional<RequestEntity> findById(@NonNull Long id);

	/**
	 * JPA specification to find requests with a specific additional contact.
	 */
	static Specification<RequestEntity> hasAdditionalContactId(Long id) {
		return (root, query, cb) -> cb.equal(root.get("additionalContact").get("id"), id);
	}

	/**
	 * JPA specification to find requests with specific additional contacts.
	 */
	static Specification<RequestEntity> hasAdditionalContactIdIn(Long ... ids) {
		return hasAdditionalContactIdIn(Arrays.asList(ids));
	}

	/**
	 * JPA specification to find requests with specific additional contacts.
	 */
	static Specification<RequestEntity> hasAdditionalContactIdIn(Collection<Long> ids) {
		if (CollectionUtils.isEmpty(ids)) { return unrestricted(); }
		return (root, query, cb) -> root.get("additionalContact").get("id").in(ids);
	}

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

	/**
	 * JPA specification to find requests submitted by a specific user.
	 */
	static Specification<RequestEntity> hasSubmitterId(Long id) {
		return (root, query, cb) -> cb.equal(root.get("submitter").get("id"), id);
	}

	/**
	 * JPA specification to find requests submitted by specific users.
	 */
	static Specification<RequestEntity> hasSubmitterIdIn(Long ... ids) {
		return hasSubmitterIdIn(Arrays.asList(ids));
	}

	/**
	 * JPA specification to find requests submitted by specific users.
	 */
	static Specification<RequestEntity> hasSubmitterIdIn(Collection<Long> ids) {
		if (CollectionUtils.isEmpty(ids)) { return unrestricted(); }
		return (root, query, cb) -> root.get("submitter").get("id").in(ids);
	}

	/**
	 * JPA specification to find requests with a specific hiring manager.
	 */
	static Specification<RequestEntity> hasHiringManagerId(Long id) {
		return (root, query, cb) -> cb.equal(root.get("hiringManager").get("id"), id);
	}

	/**
	 * JPA specification to find requests with specific hiring managers.
	 */
	static Specification<RequestEntity> hasHiringManagerIdIn(Long ... ids) {
		return hasHiringManagerIdIn(Arrays.asList(ids));
	}

	/**
	 * JPA specification to find requests with specific hiring managers.
	 */
	static Specification<RequestEntity> hasHiringManagerIdIn(Collection<Long> ids) {
		if (CollectionUtils.isEmpty(ids)) { return unrestricted(); }
		return (root, query, cb) -> root.get("hiringManager").get("id").in(ids);
	}

	/**
	 * JPA specification to find requests with a specific sub-delegated manager.
	 */
	static Specification<RequestEntity> hasSubDelegatedManagerId(Long id) {
		return (root, query, cb) -> cb.equal(root.get("subDelegatedManager").get("id"), id);
	}

	/**
	 * JPA specification to find requests with specific sub-delegated managers.
	 */
	static Specification<RequestEntity> hasSubDelegatedManagerIdIn(Long ... ids) {
		return hasSubDelegatedManagerIdIn(Arrays.asList(ids));
	}

	/**
	 * JPA specification to find requests with specific sub-delegated managers.
	 */
	static Specification<RequestEntity> hasSubDelegatedManagerIdIn(Collection<Long> ids) {
		if (CollectionUtils.isEmpty(ids)) { return unrestricted(); }
		return (root, query, cb) -> root.get("subDelegatedManager").get("id").in(ids);
	}

	/**
	 * JPA specification to find requests with specific classification IDs.
	 */

	static Specification<RequestEntity> hasClassificationIdIn(Collection<Long> ids) {
		if (CollectionUtils.isEmpty(ids)) { return unrestricted(); }
		return (root, query, cb) -> root.get("classification").get("id").in(ids);
	}

	/**
	 * JPA specification to find requests by request ID.
	 */
	static Specification<RequestEntity> hasId(Long id) {
		if (id == null) { return unrestricted(); }
		return (root, query, cb) -> cb.equal(root.get("id"), id);
	}
}
