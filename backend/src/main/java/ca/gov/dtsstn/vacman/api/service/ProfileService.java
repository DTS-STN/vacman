package ca.gov.dtsstn.vacman.api.service;

import ca.gov.dtsstn.vacman.api.data.entity.ProfileEntity;
import ca.gov.dtsstn.vacman.api.data.entity.UserEntity;
import ca.gov.dtsstn.vacman.api.data.repository.ProfileRepository;
import ca.gov.dtsstn.vacman.api.data.repository.ProfileStatusRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;

@Service
public class ProfileService {

    /** A collection of active profile status codes. */
    public static final Set<String> ACTIVE_PROFILE_STATUS = Set.of("APPROVED", "PENDING", "INCOMPLETE");

    /** A collection of inactive profile status codes. */
    public static final Set<String> INACTIVE_PROFILE_STATUS = Set.of("ARCHIVED");

    private final ProfileRepository profileRepository;

    private final ProfileStatusRepository profileStatusRepository;

    // Keys are tied to the potential values of getProfilesByStatusAndHrId parameter isActive.
    private static final Map<Boolean, Set<String>> profileStatusSets = Map.of(
            Boolean.TRUE, ACTIVE_PROFILE_STATUS,
            Boolean.FALSE, INACTIVE_PROFILE_STATUS
    );

    public ProfileService(ProfileRepository profileRepository, ProfileStatusRepository profileStatusRepository) {
        this.profileRepository = profileRepository;
        this.profileStatusRepository = profileStatusRepository;
    }

    /**
     * Returns all profiles that are either "active" or "inactive" depending on the argument value. Optionally,
     * allows for the HR Advisor's ID to be used as an additional filter.
     *
     * @param pageRequest Pagination information.
     * @param isActive Filter return based on active status.
     * @param hrAdvisorId Optional ID for additional filtering. Can be set to {@code null}.
     * @return A paginated collection of profile entities.
     */
    public Page<ProfileEntity> getProfilesByStatusAndHrId(PageRequest pageRequest, Boolean isActive, Long hrAdvisorId) {
        // Dispatch DB call based on presence of isActive & advisor ID
        if (isActive != null) {
            final var statusCodes = profileStatusSets.get(isActive);

            return (hrAdvisorId == null)
                    ? profileRepository.findByProfileStatusCodeIn(statusCodes, pageRequest)
                    : profileRepository.findByProfileStatusCodeInAndHrAdvisorIdIs(statusCodes, hrAdvisorId, pageRequest);
        } else {
            return (hrAdvisorId == null)
                    ? profileRepository.findAll(pageRequest)
                    : profileRepository.findAllByHrAdvisorId(hrAdvisorId, pageRequest);
        }
    }

    /**
     * Returns all profiles that are either "active" or "inactive" depending on the argument value & that
     * have a matching Microsoft Entra ID.
     * @param entraId The Microsoft Entra ID for filtering.
     * @param isActive Filter return based on active status.
     * @return A collection of profile entities.
     */
    public List<ProfileEntity> getProfilesByEntraId(String entraId, Boolean isActive) {
        return (isActive != null)
                ? profileRepository.findByUserMicrosoftEntraIdIsAndProfileStatusCodeIn(entraId, profileStatusSets.get(isActive))
                : profileRepository.findAllByUserMicrosoftEntraId(entraId);
    }

    /**
     * Returns a profile by ID assuming the user's ID matches & the profile is active.
     *
     * @param profileId The target profile's ID.
     * @param userId The ID of the user associated with the target profile.
     * @return The profile matching the above requirements, if any.
     */
    public Optional<ProfileEntity> getActiveProfileByIdAndUserId(Long profileId, Long userId) {
        return profileRepository.findByIdAndUserIdIsAndProfileStatusCodeIn(profileId, userId, ACTIVE_PROFILE_STATUS);
    }

    /**
     * Creates a new profile associated with the {@code user} argument. Defaults the profile status to
     * {@code INCOMPLETE}.
     *
     * @param user The user who is associated with the profile.
     * @return The new profile entity.
     */
    public ProfileEntity createProfile(UserEntity user) {
        var incompleteStatus = profileStatusRepository.findByCode("INCOMPLETE");

        ProfileEntity profile = new ProfileEntity();
        profile.setUser(user);
        profile.setProfileStatus(incompleteStatus);

        return profileRepository.save(profile);
    }
}
