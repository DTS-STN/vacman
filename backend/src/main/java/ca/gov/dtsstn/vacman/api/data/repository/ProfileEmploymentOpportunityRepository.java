package ca.gov.dtsstn.vacman.api.data.repository;

import ca.gov.dtsstn.vacman.api.data.entity.ProfileEmploymentOpportunityEntity;
import ca.gov.dtsstn.vacman.api.data.entity.ProfileEntity;
import ca.gov.dtsstn.vacman.api.data.entity.EmploymentOpportunityEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repository interface for {@link ProfileEmploymentOpportunityEntity}.
 *
 * @author VacMan Development Team
 * @since 1.0.0
 */
@Repository
public interface ProfileEmploymentOpportunityRepository extends JpaRepository<ProfileEmploymentOpportunityEntity, Long> {

    /**
     * Find all profile employment opportunities by profile.
     *
     * @param profile the profile to search for
     * @return a list of profile employment opportunities
     */
    List<ProfileEmploymentOpportunityEntity> findByProfile(ProfileEntity profile);

    /**
     * Find all profile employment opportunities by employment opportunity.
     *
     * @param employmentOpportunity the employment opportunity to search for
     * @return a list of profile employment opportunities
     */
    List<ProfileEmploymentOpportunityEntity> findByEmploymentOpportunity(EmploymentOpportunityEntity employmentOpportunity);

    /**
     * Find all profile employment opportunities by profile ID.
     *
     * @param profileId the profile ID to search for
     * @return a list of profile employment opportunities
     */
    List<ProfileEmploymentOpportunityEntity> findByProfileId(Long profileId);

    /**
     * Find all profile employment opportunities by employment opportunity ID.
     *
     * @param employmentOpportunityId the employment opportunity ID to search for
     * @return a list of profile employment opportunities
     */
    List<ProfileEmploymentOpportunityEntity> findByEmploymentOpportunityId(Long employmentOpportunityId);

    /**
     * Delete all profile employment opportunities by profile.
     *
     * @param profile the profile
     */
    void deleteByProfile(ProfileEntity profile);

    /**
     * Delete all profile employment opportunities by employment opportunity.
     *
     * @param employmentOpportunity the employment opportunity
     */
    void deleteByEmploymentOpportunity(EmploymentOpportunityEntity employmentOpportunity);

    /**
     * Find a profile employment opportunity by profile ID and employment opportunity ID.
     *
     * @param profileId the profile ID
     * @param employmentOpportunityId the employment opportunity ID
     * @return an optional profile employment opportunity
     */
    Optional<ProfileEmploymentOpportunityEntity> findByProfileIdAndEmploymentOpportunityId(Long profileId, Long employmentOpportunityId);
}
