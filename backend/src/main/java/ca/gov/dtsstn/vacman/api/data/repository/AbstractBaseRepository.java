package ca.gov.dtsstn.vacman.api.data.repository;

import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.repository.NoRepositoryBean;

/**
 * Abstract base repository for common CRUD operations.
 *
 * @param <T> The type of the entity.
 */
@NoRepositoryBean
public interface AbstractBaseRepository<T> extends JpaRepository<T, Long>, JpaSpecificationExecutor<T> {

	/**
	 * A conjunction (with zero conjuncts). Always evaluates to true.
	 */
	static <T> Specification<T> empty() {
		return (root, query, cb) -> cb.conjunction();
	}

}
