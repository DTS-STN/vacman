package ca.gov.dtsstn.vacman.api.service;

import ca.gov.dtsstn.vacman.api.data.entity.ProfileEntity;
import ca.gov.dtsstn.vacman.api.data.entity.UserEntity;
import ca.gov.dtsstn.vacman.api.data.repository.*;
import ca.gov.dtsstn.vacman.api.web.exception.ResourceNotFoundException;
import ca.gov.dtsstn.vacman.api.web.model.ProfileReadModel;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;

@Service
public class ProfileService {

    private final ClassificationRepository classificationRepository;

    private final ProfileRepository profileRepository;

    private final PriorityLevelRepository priorityLevelRepository;

    private final ProfileStatusRepository profileStatusRepository;

    private final UserService userService;

    private final WfaStatusRepository wfaStatusRepository;

    private final WorkUnitRepository workUnitRepository;

    // Keys are tied to the potential values of getProfilesByStatusAndHrId parameter isActive.
    private final Map<Boolean, Set<String>> profileStatusSets = Map.of(
            Boolean.TRUE, Set.of("APPROVED", "PENDING", "INCOMPLETE"),
            Boolean.FALSE, Set.of("ARCHIVED")
    );

    public ProfileService(ClassificationRepository classificationRepository,
                          ProfileRepository profileRepository,
                          PriorityLevelRepository priorityLevelRepository,
                          ProfileStatusRepository profileStatusRepository,
                          UserService userService, WfaStatusRepository wfaStatusRepository,
                          WorkUnitRepository workUnitRepository) {
        this.classificationRepository = classificationRepository;
        this.profileRepository = profileRepository;
        this.priorityLevelRepository = priorityLevelRepository;
        this.profileStatusRepository = profileStatusRepository;
        this.userService = userService;
        this.wfaStatusRepository = wfaStatusRepository;
        this.workUnitRepository = workUnitRepository;
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

    /**
     * Get a profile with the given ID & that is associated with the user with the given user ID.
     *
     * @param profileId The ID of the target profile.
     * @param userId The ID of the user who is associated with the target profile.
     * @return The profile entity, if one exists.
     */
    public Optional<ProfileEntity> getProfileByIdAndUserId(Long profileId, Long userId) {
        return profileRepository.findByIdAndUserId(profileId, userId);
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

        final var priorityLevelId = updateModel.priorityLevel().getId();
        if (priorityLevelId != null
                && !priorityLevelId.equals(existingEntity.getPriorityLevel().getId())) {
            existingEntity.setPriorityLevel(
                    priorityLevelRepository.findById(priorityLevelId)
                            .orElseThrow(() -> generateIdDoesNotExistException("Priority Level", priorityLevelId)));
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

        return profileRepository.save(existingEntity);
    }

    private static ResourceNotFoundException generateIdDoesNotExistException(String entityName, Long id) {
        return new ResourceNotFoundException(String.format("A(n) %s with id=[%d] does not exist", entityName, id));
    }
}
