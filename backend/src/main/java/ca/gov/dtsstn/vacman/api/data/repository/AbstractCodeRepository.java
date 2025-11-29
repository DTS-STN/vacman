package ca.gov.dtsstn.vacman.api.data.repository;

import java.time.Instant;
import java.util.Collection;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.repository.NoRepositoryBean;

import ca.gov.dtsstn.vacman.api.data.entity.AbstractCodeEntity;

/**
 * Abstract repository for code entities.
 */
@NoRepositoryBean
public interface AbstractCodeRepository<T extends AbstractCodeEntity> extends AbstractBaseRepository<T> {

	/**
	 * Returns a specification that filters codes to include only those that are active (null expiry date or expiry date in the future).
	 */
	static <T extends AbstractCodeEntity> Specification<T> isActive() {
		return (root, query, cb) -> cb.or(
			cb.isNull(root.get("expiryDate")),
			cb.greaterThanOrEqualTo(root.get("expiryDate"), Instant.now())
		);
	}

	Optional<T> findByCode(String code);

	List<T> findAllByCodeIn(Collection<String> codes);

}
