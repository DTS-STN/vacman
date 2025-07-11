package ca.gov.dtsstn.vacman.api.data.repository;

import java.util.Optional;

import org.springframework.data.repository.ListCrudRepository;
import org.springframework.stereotype.Repository;

import ca.gov.dtsstn.vacman.api.data.entity.LanguageRequirementEntity;

/**
 * Repository interface for managing LanguageRequirement entities.
 * Provides basic CRUD operations for language requirement lookup data.
 */
@Repository
public interface LanguageRequirementRepository extends ListCrudRepository<LanguageRequirementEntity, Long> {

    /**
     * Find a language requirement by its code.
     *
     * @param code the language requirement code
     * @return Optional containing the language requirement entity if found
     */
    Optional<LanguageRequirementEntity> findByCode(String code);
}
