package ca.gov.dtsstn.vacman.api.data.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Repository;

import ca.gov.dtsstn.vacman.api.data.entity.ProfileEntity;

import java.util.Collection;

@Repository
public interface ProfileRepository extends AbstractBaseRepository<ProfileEntity> {

    /**
     * Returns all profiles whose HR Advisor ID matches the provided value & which fall under the given page.
     *
     * @param hrAdvisorId The ID of the HR Advisor whose profiles we are filtering for.
     * @param pageable The pagination information
     * @return A page of profiles.
     */
    Page<ProfileEntity> findAllByHrAdvisorId(Long hrAdvisorId, Pageable pageable);

    /**
     * Returns all profiles whose status is contained within the parameter {@code profileStatusCodes} & which fall under
     * the given page.
     *
     * @param profileStatusCodes A collection of status codes used for filtering the results.
     * @param pageable The pagination information.
     * @return A page of profiles.
     */
    Page<ProfileEntity> findByProfileStatusCodeIn(Collection<String> profileStatusCodes, Pageable pageable);

    /**
     * Returns all profiles whose status is contained within the parameter {@code profileStatusCodes}, whose HR Advisor
     * ID matches the provided value, and which fall under the given page.
     *
     * @param profileStatusCodes A collection of status codes used for filtering the results.
     * @param hrAdvisorId The ID of the HR Advisor whose profiles we are filtering for.
     * @param pageable The pagination information.
     * @return A page of profiles.
     */
    Page<ProfileEntity> findByProfileStatusCodeInAndHrAdvisorIdIs(Collection<String> profileStatusCodes, Long hrAdvisorId, Pageable pageable);
}