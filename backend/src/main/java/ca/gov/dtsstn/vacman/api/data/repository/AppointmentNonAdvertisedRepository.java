package ca.gov.dtsstn.vacman.api.data.repository;

import ca.gov.dtsstn.vacman.api.data.entity.AppointmentNonAdvertisedEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * Repository interface for {@link AppointmentNonAdvertisedEntity}.
 *
 * @author VacMan Development Team
 * @since 1.0.0
 */
@Repository
public interface AppointmentNonAdvertisedRepository extends JpaRepository<AppointmentNonAdvertisedEntity, Long> {

    /**
     * Find an appointment non-advertised by its code.
     *
     * @param code the code to search for
     * @return an Optional containing the appointment non-advertised if found
     */
    Optional<AppointmentNonAdvertisedEntity> findByCode(String code);

    /**
     * Find an appointment non-advertised by its code (case-insensitive).
     *
     * @param code the code to search for
     * @return an Optional containing the appointment non-advertised if found
     */
    Optional<AppointmentNonAdvertisedEntity> findByCodeIgnoreCase(String code);

    /**
     * Check if an appointment non-advertised exists by code.
     *
     * @param code the code to check
     * @return true if an appointment non-advertised with the given code exists
     */
    boolean existsByCode(String code);

    /**
     * Check if an appointment non-advertised exists by code (case-insensitive).
     *
     * @param code the code to check
     * @return true if an appointment non-advertised with the given code exists
     */
    boolean existsByCodeIgnoreCase(String code);
}
