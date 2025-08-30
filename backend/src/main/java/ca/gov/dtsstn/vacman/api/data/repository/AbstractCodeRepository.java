package ca.gov.dtsstn.vacman.api.data.repository;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

import org.springframework.data.repository.NoRepositoryBean;

import ca.gov.dtsstn.vacman.api.data.entity.AbstractCodeEntity;

/**
 * Abstract repository for code entities.
 */
@NoRepositoryBean
public interface AbstractCodeRepository<T extends AbstractCodeEntity> extends AbstractBaseRepository<T> {

	Optional<T> findByCode(String code);

	List<T> findAllByCodeIn(Collection<String> codes);

}
