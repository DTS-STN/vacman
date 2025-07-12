package ca.gov.dtsstn.vacman.api.data.repository;

import java.util.Optional;

import org.springframework.data.repository.ListCrudRepository;
import org.springframework.stereotype.Repository;

import ca.gov.dtsstn.vacman.api.data.entity.EmploymentEquityEntity;

/**
 * Repository interface for managing EmploymentEquity entities.
 * Provides basic CRUD operations for employment equity lookup data.
 */
@Repository
public interface EmploymentEquityRepository extends ListCrudRepository<EmploymentEquityEntity, Long> {

    /**
     * Find an employment equity by its code.
     *
     * @param code the employment equity code
     * @return Optional containing the employment equity entity if found
     */
    Optional<EmploymentEquityEntity> findByCode(String code);
}
