package ca.gov.dtsstn.vacman.api.data.repository;

import ca.gov.dtsstn.vacman.api.data.entity.WorkScheduleEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * Repository interface for {@link WorkScheduleEntity}.
 *
 * @author VacMan Development Team
 * @since 1.0.0
 */
@Repository
public interface WorkScheduleRepository extends JpaRepository<WorkScheduleEntity, Long> {

    /**
     * Find a work schedule by its code.
     *
     * @param code the code to search for
     * @return an Optional containing the work schedule if found
     */
    Optional<WorkScheduleEntity> findByCode(String code);

    /**
     * Find a work schedule by its code (case-insensitive).
     *
     * @param code the code to search for
     * @return an Optional containing the work schedule if found
     */
    Optional<WorkScheduleEntity> findByCodeIgnoreCase(String code);

    /**
     * Check if a work schedule exists by code.
     *
     * @param code the code to check
     * @return true if a work schedule with the given code exists
     */
    boolean existsByCode(String code);

    /**
     * Check if a work schedule exists by code (case-insensitive).
     *
     * @param code the code to check
     * @return true if a work schedule with the given code exists
     */
    boolean existsByCodeIgnoreCase(String code);
}
