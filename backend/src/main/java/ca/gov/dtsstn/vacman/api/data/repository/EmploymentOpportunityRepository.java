package ca.gov.dtsstn.vacman.api.data.repository;

import java.util.Optional;

import org.springframework.data.repository.ListCrudRepository;
import org.springframework.stereotype.Repository;

import ca.gov.dtsstn.vacman.api.data.entity.EmploymentOpportunityEntity;

/**
 * Repository interface for managing EmploymentOpportunity entities.
 * Provides basic CRUD operations for employment opportunity lookup data.
 */
@Repository
public interface EmploymentOpportunityRepository extends ListCrudRepository<EmploymentOpportunityEntity, Long> {

    /**
     * Find an employment opportunity by its code.
     *
     * @param code the employment opportunity code
     * @return Optional containing the employment opportunity entity if found
     */
    Optional<EmploymentOpportunityEntity> findByCode(String code);
}
