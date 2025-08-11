package ca.gov.dtsstn.vacman.api.service;

import static ca.gov.dtsstn.vacman.api.security.SecurityUtils.getCurrentUserEntraId;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;

import org.springframework.context.ApplicationEventPublisher;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import ca.gov.dtsstn.vacman.api.data.entity.ProfileEntity;
import ca.gov.dtsstn.vacman.api.data.entity.ProfileEntityBuilder;
import ca.gov.dtsstn.vacman.api.data.entity.ProfileStatusEntity;
import ca.gov.dtsstn.vacman.api.data.entity.UserEntity;
import ca.gov.dtsstn.vacman.api.data.repository.*;
import ca.gov.dtsstn.vacman.api.web.exception.ResourceNotFoundException;
import ca.gov.dtsstn.vacman.api.web.model.ProfileReadModel;

import ca.gov.dtsstn.vacman.api.data.repository.ProfileRepository;
import ca.gov.dtsstn.vacman.api.data.repository.ProfileStatusRepository;
import ca.gov.dtsstn.vacman.api.event.ProfileCreateEvent;
import ca.gov.dtsstn.vacman.api.event.ProfileReadEvent;
import ca.gov.dtsstn.vacman.api.event.ProfileUpdatedEvent;

import static ca.gov.dtsstn.vacman.api.exception.ExceptionUtils.generateIdDoesNotExistException;

@Service
public class ProfileService {

	/** A collection of active profile status codes. */
	public static final Set<String> ACTIVE_PROFILE_STATUS = Set.of("APPROVED", "PENDING", "INCOMPLETE");

	/** A collection of inactive profile status codes. */
	public static final Set<String> INACTIVE_PROFILE_STATUS = Set.of("ARCHIVED");

	private final ProfileRepository profileRepository;

    private final ClassificationRepository classificationRepository;

    private final ProfileStatusRepository profileStatusRepository;

    private final ApplicationEventPublisher eventPublisher;

    private final UserService userService;

    private final WfaStatusRepository wfaStatusRepository;

    private final WorkUnitRepository workUnitRepository;

	// Keys are tied to the potential values of getProfilesByStatusAndHrId parameter isActive.
	private static final Map<Boolean, Set<String>> profileStatusSets = Map.of(
		Boolean.TRUE, ACTIVE_PROFILE_STATUS,
		Boolean.FALSE, INACTIVE_PROFILE_STATUS);

    public ProfileService(ClassificationRepository classificationRepository,
                          ProfileRepository profileRepository,
                          ProfileStatusRepository profileStatusRepository,
                          UserService userService, WfaStatusRepository wfaStatusRepository,
                          WorkUnitRepository workUnitRepository,
                          ApplicationEventPublisher eventPublisher) {
        this.classificationRepository = classificationRepository;
        this.profileRepository = profileRepository;
        this.profileStatusRepository = profileStatusRepository;
        this.userService = userService;
        this.wfaStatusRepository = wfaStatusRepository;
        this.workUnitRepository = workUnitRepository;
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
		}
		else {
			profilesPage = (hrAdvisorId == null)
				? profileRepository.findAll(pageRequest)
				: profileRepository.findAllByHrAdvisorId(hrAdvisorId, pageRequest);
		}

		if (profilesPage != null && !profilesPage.isEmpty()) {
			final var profileIds = profilesPage.getContent().stream()
				.map(ProfileEntity::getId)
				.toList();

			eventPublisher.publishEvent(new ProfileReadEvent(profileIds, null));
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
		final var profiles = (isActive != null)
			? profileRepository.findByUserMicrosoftEntraIdIsAndProfileStatusCodeIn(entraId, profileStatusSets.get(isActive))
			: profileRepository.findAllByUserMicrosoftEntraId(entraId);

		if (profiles != null && !profiles.isEmpty()) {
			final var profileIds = profiles.stream()
				.map(ProfileEntity::getId)
				.toList();

			eventPublisher.publishEvent(new ProfileReadEvent(profileIds, entraId));
		}

		return profiles;
	}

	public Optional<ProfileEntity> getProfile(long id) {
		return profileRepository.findById(id).map(profile -> {
			final var entraId = getCurrentUserEntraId().orElse("N/A");
			final var profileReadEvent = new ProfileReadEvent(List.of(profile.getId()), entraId);
			eventPublisher.publishEvent(profileReadEvent);
			return profile;
		});
	}

	/**
	 * Creates a new profile associated with the {@code user} argument. Defaults the profile status to
	 * {@code INCOMPLETE}.
	 *
	 * @param user The user who is associated with the profile.
	 * @return The new profile entity.
	 */
	public ProfileEntity createProfile(UserEntity user) {
		final var profile = profileRepository.save(new ProfileEntityBuilder()
			.user(user)
			.profileStatus(profileStatusRepository.findByCode("INCOMPLETE"))
			.build());

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
		final var profileEntity = profileRepository.findById(profileId)
			.orElseThrow(() -> new ResourceNotFoundException("Profile not found"));

		final var previousStatusId = Optional.ofNullable(profileEntity.getProfileStatus())
			.map(ProfileStatusEntity::getId)
			.orElse(null);

		final var newStatus = profileStatusRepository.findById(statusId)
			.orElseThrow(() -> new ResourceNotFoundException("Profile status not found"));

		profileEntity.setProfileStatus(newStatus);
	    return profileRepository.save(profileEntity);
    }

	/**
     * Update a profile based on the provided update model. This method validates that any IDs exist within the DB
     * before saving the entity.
     *
     * @param updateModel The updated information for the profile.
     * @param existingEntity The profile entity to be updated.
     * @return The updated profile entity.
     * @throws ResourceNotFoundException When any given ID does not exist within the DB.
     */
    public ProfileEntity updateProfile(ProfileReadModel updateModel, ProfileEntity existingEntity)
            throws ResourceNotFoundException {

        final var hrAdvisorId = updateModel.hrAdvisorId();
        if (hrAdvisorId != null
                && !hrAdvisorId.equals(existingEntity.getHrAdvisor().getId())) {
            UserEntity hrAdvisor = userService.getUserById(hrAdvisorId)
                    .orElseThrow(() -> generateIdDoesNotExistException("HR Advisor", hrAdvisorId));

            if (!hrAdvisor.getUserType().getCode().equals("hr-advisor")) {
                throw generateIdDoesNotExistException("HR Advisor", hrAdvisorId);
            }

            existingEntity.setHrAdvisor(hrAdvisor);
        }

        final var classificationId = updateModel.classification().getId();
        if (classificationId != null && !classificationId.equals(existingEntity.getClassification().getId())) {
            existingEntity.setClassification(
                    classificationRepository.findById(classificationId)
                            .orElseThrow(() -> generateIdDoesNotExistException("Classification", classificationId)));
        }

        final var workUnitId = updateModel.workUnit().getId();
        if (workUnitId != null
                && !workUnitId.equals(existingEntity.getWorkUnit().getId())) {
            existingEntity.setWorkUnit(
                    workUnitRepository.findById(workUnitId)
                            .orElseThrow(() -> generateIdDoesNotExistException("Work Unit", workUnitId)));
        }

        final var wfaStatusId = updateModel.wfaStatus().getId();
        if (wfaStatusId != null
                && !wfaStatusId.equals(existingEntity.getWfaStatus().getId())) {
            existingEntity.setWfaStatus(
                    wfaStatusRepository.findById(wfaStatusId)
                            .orElseThrow(() -> generateIdDoesNotExistException("WFA Status", wfaStatusId)));
        }

        existingEntity.setPersonalEmailAddress(updateModel.personalEmailAddress());
        existingEntity.setIsAvailableForReferral(updateModel.isAvailableForReferral());
        existingEntity.setIsInterestedInAlternation(updateModel.isInterestedInAlternation());
        existingEntity.setAdditionalComment(updateModel.additionalComment());

		var updatedEntity = profileRepository.save(existingEntity);
		eventPublisher.publishEvent(new ProfileUpdatedEvent(updatedEntity));

        return updatedEntity;
	}

}
