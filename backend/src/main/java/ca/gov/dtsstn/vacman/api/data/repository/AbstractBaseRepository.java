package ca.gov.dtsstn.vacman.api.data.repository;

import org.springframework.data.repository.ListCrudRepository;
import org.springframework.data.repository.ListPagingAndSortingRepository;
import org.springframework.data.repository.NoRepositoryBean;
import org.springframework.data.repository.query.ListQueryByExampleExecutor;

/**
 * Abstract base repository for common CRUD operations.
 *
 * @param <T> The type of the entity.
 */
@NoRepositoryBean
public interface AbstractBaseRepository<T> extends ListCrudRepository<T, Long>, ListPagingAndSortingRepository<T, Long>, ListQueryByExampleExecutor<T> {}
