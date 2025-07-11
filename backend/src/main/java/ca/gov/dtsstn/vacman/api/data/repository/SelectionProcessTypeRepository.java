package ca.gov.dtsstn.vacman.api.data.repository;

import java.util.Optional;

import org.springframework.data.repository.ListCrudRepository;
import org.springframework.stereotype.Repository;

import ca.gov.dtsstn.vacman.api.data.entity.SelectionProcessTypeEntity;

/**
 * Repository interface for managing SelectionProcessType entities.
 * Provides basic CRUD operations for selection process type lookup data.
 */
@Repository
public interface SelectionProcessTypeRepository extends ListCrudRepository<SelectionProcessTypeEntity, Long> {

    /**
     * Find a selection process type by its code.
     *
     * @param code the selection process type code
     * @return Optional containing the selection process type entity if found
     */
    Optional<SelectionProcessTypeEntity> findByCode(String code);
}
