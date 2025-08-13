package ca.gov.dtsstn.vacman.api.data.repository;

import java.util.Collection;
import java.util.List;
import java.util.Optional;
import java.util.Set;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Repository;

import ca.gov.dtsstn.vacman.api.data.entity.ProfileEntity;

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

	/**
	 * Returns all profiles whose user's Microsoft Entra ID matches the provided value.
	 *
	 * @param entraId The Microsoft Entra ID of the user whose profiles we are filtering for.
	 * @return A list of profiles.
	 */
	List<ProfileEntity> findAllByUserMicrosoftEntraId(String entraId);

	/**
	 * Returns all profiles whose user's Microsoft Entra ID matches the provided value & whose status is contained within
	 * the parameter {@code profileStatusCodes}.
	 *
	 * @param entraId The Microsoft Entra ID of the user whose profiles we are filtering for.
	 * @param profileStatusCodes A collection of status codes used for filtering the results.
	 * @return A list of profiles.
	 */
	List<ProfileEntity> findByUserMicrosoftEntraIdIsAndProfileStatusCodeIn(String entraId, Set<String> profileStatusCodes);

	/**
	 * Returns a profile whose ID matches the provided value & whose user has the provided user ID.
	 *
	 * @param profileId The ID of the target profile.
	 * @param userId The ID of the user whose profile we are targetting.
	 * @return The target profile, if it exists.
	 */
	Optional<ProfileEntity> findByIdAndUserId(Long profileId, Long userId);

	/**
	 * Returns the profile whose ID matches the provided value, whose user's ID matches the provided value, and whose
	 * status is contained within the parameter {@code profileStatusCodes}.
	 *
	 * @param profileId The ID of the profile being modified.
	 * @param userId The ID of the user whose profile is being modified.
	 * @param profileStatusCodes A collection of status codes used for filtering the results.
	 * @return The profile if any were found.
	 */
	Optional<ProfileEntity> findByIdAndUserIdIsAndProfileStatusCodeIn(Long profileId, Long userId, Set<String> profileStatusCodes);
}