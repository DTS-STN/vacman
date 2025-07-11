package ca.gov.dtsstn.vacman.api.data.repository;

import ca.gov.dtsstn.vacman.api.data.entity.RequestEmploymentEquityEntity;
import ca.gov.dtsstn.vacman.api.data.entity.RequestEntity;
import ca.gov.dtsstn.vacman.api.data.entity.EmploymentEquityEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Repository interface for {@link RequestEmploymentEquityEntity}.
 *
 * @author VacMan Development Team
 * @since 1.0.0
 */
@Repository
public interface RequestEmploymentEquityRepository extends JpaRepository<RequestEmploymentEquityEntity, Long> {

    /**
     * Find all request employment equities by request.
     *
     * @param request the request to search for
     * @return a list of request employment equities
     */
    List<RequestEmploymentEquityEntity> findByRequest(RequestEntity request);

    /**
     * Find all request employment equities by employment equity.
     *
     * @param employmentEquity the employment equity to search for
     * @return a list of request employment equities
     */
    List<RequestEmploymentEquityEntity> findByEmploymentEquity(EmploymentEquityEntity employmentEquity);

    /**
     * Find all request employment equities by request ID.
     *
     * @param requestId the request ID to search for
     * @return a list of request employment equities
     */
    List<RequestEmploymentEquityEntity> findByRequestId(Long requestId);

    /**
     * Find all request employment equities by employment equity ID.
     *
     * @param employmentEquityId the employment equity ID to search for
     * @return a list of request employment equities
     */
    List<RequestEmploymentEquityEntity> findByEmploymentEquityId(Long employmentEquityId);

    /**
     * Delete all request employment equities by request.
     *
     * @param request the request
     */
    void deleteByRequest(RequestEntity request);

    /**
     * Delete all request employment equities by employment equity.
     *
     * @param employmentEquity the employment equity
     */
    void deleteByEmploymentEquity(EmploymentEquityEntity employmentEquity);
}
