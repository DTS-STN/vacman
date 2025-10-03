package ca.gov.dtsstn.vacman.api.data.repository;

import ca.gov.dtsstn.vacman.api.data.entity.MatchEntity;
import ca.gov.dtsstn.vacman.api.data.entity.RequestEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MatchRepository extends AbstractBaseRepository<MatchEntity> {
    
    /**
     * Find all matches for a specific request
     * 
     * @param request The request entity
     * @return List of match entities
     */
    List<MatchEntity> findByRequest(RequestEntity request);
    
    /**
     * Find all matches for a specific request with pagination
     * 
     * @param request The request entity
     * @param pageable Pagination information
     * @return Page of match entities
     */
    Page<MatchEntity> findByRequest(RequestEntity request, Pageable pageable);
    
    /**
     * Find a specific match for a request
     * 
     * @param request The request entity
     * @param id The match ID
     * @return Optional containing the match if found
     */
    Optional<MatchEntity> findByRequestAndId(RequestEntity request, Long id);
}