package ca.gov.dtsstn.vacman.api.service;

import ca.gov.dtsstn.vacman.api.data.entity.ProfileEntity;
import ca.gov.dtsstn.vacman.api.data.entity.ProfileStatusEntity;
import ca.gov.dtsstn.vacman.api.data.entity.UserEntity;
import ca.gov.dtsstn.vacman.api.data.repository.ProfileRepository;
import ca.gov.dtsstn.vacman.api.data.repository.ProfileStatusRepository;
import ca.gov.dtsstn.vacman.api.event.ProfileCreateEvent;
import ca.gov.dtsstn.vacman.api.event.ProfileReadEvent;
import ca.gov.dtsstn.vacman.api.event.ProfileStatusChangeEvent;
import ca.gov.dtsstn.vacman.api.event.ProfileUpdatedEvent;
import ca.gov.dtsstn.vacman.api.web.exception.ResourceNotFoundException;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.Set;

@Service
public class ProfileService {

    private final ProfileRepository profileRepository;

    private final ProfileStatusRepository profileStatusRepository;

    private final ApplicationEventPublisher eventPublisher;

    // Keys are tied to the potential values of getProfilesByStatusAndHrId parameter isActive.
    private final Map<Boolean, Set<String>> profileStatusSets = Map.of(
            Boolean.TRUE, Set.of("APPROVED", "PENDING", "INCOMPLETE"),
            Boolean.FALSE, Set.of("ARCHIVED")
    );

    public ProfileService(ProfileRepository profileRepository, 
                          ProfileStatusRepository profileStatusRepository,
                          ApplicationEventPublisher eventPublisher) {
        this.profileRepository = profileRepository;
        this.profileStatusRepository = profileStatusRepository;
        this.eventPublisher = eventPublisher;
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
        Page<ProfileEntity> profilesPage;
        if (isActive != null) {
            final var statusCodes = profileStatusSets.get(isActive);

            profilesPage = (hrAdvisorId == null)
                    ? profileRepository.findByProfileStatusCodeIn(statusCodes, pageRequest)
                    : profileRepository.findByProfileStatusCodeInAndHrAdvisorIdIs(statusCodes, hrAdvisorId, pageRequest);
        } else {
            profilesPage = (hrAdvisorId == null)
                    ? profileRepository.findAll(pageRequest)
                    : profileRepository.findAllByHrAdvisorId(hrAdvisorId, pageRequest);
        }

        if (profilesPage != null && !profilesPage.isEmpty()) {
            List<Long> profileIds = profilesPage.getContent().stream()
                    .map(ProfileEntity::getId)
                    .toList();

            eventPublisher.publishEvent(new ProfileReadEvent(profileIds, null, isActive));
        }

        return profilesPage;
    }

    /**
     * Returns all profiles that are either "active" or "inactive" depending on the argument value & that
     * have a matching Microsoft Entra ID.
     * @param entraId The Microsoft Entra ID for filtering.
     * @param isActive Filter return based on active status.
     * @return A collection of profile entities.
     */
    public List<ProfileEntity> getProfilesByEntraId(String entraId, Boolean isActive) {
        List<ProfileEntity> profiles = (isActive != null)
                ? profileRepository.findByUserMicrosoftEntraIdIsAndProfileStatusCodeIn(entraId, profileStatusSets.get(isActive))
                : profileRepository.findAllByUserMicrosoftEntraId(entraId);

        if (profiles != null && !profiles.isEmpty()) {
            List<Long> profileIds = profiles.stream()
                    .map(ProfileEntity::getId)
                    .toList();
            eventPublisher.publishEvent(new ProfileReadEvent(profileIds, entraId, isActive));
        }

        return profiles;
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

        profile = profileRepository.save(profile);

        eventPublisher.publishEvent(new ProfileCreateEvent(profile));

        return profile;
    }

    /**
     * Updates the status of a profile and emits a ProfileStatusChangeEvent.
     * TODO: This method should be called when the PUT /profiles/{id}/status endpoint is implemented.
     * @param profileId The ID of the profile to update
     * @param statusId The new status ID
     * @return The updated profile entity
     * @throws ResourceNotFoundException if the profile or status is not found
     */
    public ProfileEntity updateProfileStatus(Long profileId, Long statusId) {
        ProfileEntity profileEntity = profileRepository.findById(profileId)
            .orElseThrow(() -> new ResourceNotFoundException("Profile not found"));

        Long previousStatusId = profileEntity.getProfileStatus() != null ?
            profileEntity.getProfileStatus().getId() : null;

        ProfileStatusEntity newStatus = profileStatusRepository.findById(statusId)
            .orElseThrow(() -> new ResourceNotFoundException("Profile status not found"));
        profileEntity.setProfileStatus(newStatus);

        profileEntity = profileRepository.save(profileEntity);

        eventPublisher.publishEvent(new ProfileStatusChangeEvent(profileEntity, previousStatusId, newStatus.getId()));

        return profileEntity;
    }

    /**
     * Updates a profile and emits a ProfileUpdatedEvent.
     * TODO: This method should be called when the PUT /profiles/{id} endpoint is implemented.
     * @param profileEntity The profile entity to update
     * @return The updated profile entity
     */
    public ProfileEntity updateProfile(ProfileEntity profileEntity) {
        profileEntity = profileRepository.save(profileEntity);

        eventPublisher.publishEvent(new ProfileUpdatedEvent(profileEntity));

        return profileEntity;
    }
}
