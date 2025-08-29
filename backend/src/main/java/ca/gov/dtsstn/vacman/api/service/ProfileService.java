package ca.gov.dtsstn.vacman.api.service;

import static ca.gov.dtsstn.vacman.api.data.repository.ProfileRepository.hasHrAdvisorId;
import static ca.gov.dtsstn.vacman.api.data.repository.ProfileRepository.hasProfileStatusCodeIn;
import static ca.gov.dtsstn.vacman.api.data.repository.ProfileRepository.hasUserMicrosoftEntraId;
import static ca.gov.dtsstn.vacman.api.security.SecurityUtils.getCurrentUserEntraId;
import static ca.gov.dtsstn.vacman.api.web.exception.ResourceConflictException.asResourceConflictException;
import static ca.gov.dtsstn.vacman.api.web.exception.ResourceNotFoundException.asResourceNotFoundException;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;

import org.springframework.context.ApplicationEventPublisher;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import ca.gov.dtsstn.vacman.api.data.entity.ProfileEntity;
import ca.gov.dtsstn.vacman.api.data.entity.UserEntity;
import ca.gov.dtsstn.vacman.api.data.entity.UserTypeEntity.UserTypeCodes;
import ca.gov.dtsstn.vacman.api.data.repository.CityRepository;
import ca.gov.dtsstn.vacman.api.data.repository.ClassificationRepository;
import ca.gov.dtsstn.vacman.api.data.repository.EmploymentOpportunityRepository;
import ca.gov.dtsstn.vacman.api.data.repository.LanguageReferralTypeRepository;
import ca.gov.dtsstn.vacman.api.data.repository.LanguageRepository;
import ca.gov.dtsstn.vacman.api.data.repository.ProfileRepository;
import ca.gov.dtsstn.vacman.api.data.repository.ProfileStatusRepository;
import ca.gov.dtsstn.vacman.api.data.repository.WfaStatusRepository;
import ca.gov.dtsstn.vacman.api.data.repository.WorkUnitRepository;
import ca.gov.dtsstn.vacman.api.event.ProfileCreateEvent;
import ca.gov.dtsstn.vacman.api.event.ProfileReadEvent;
import ca.gov.dtsstn.vacman.api.event.ProfileStatusChangeEvent;
import ca.gov.dtsstn.vacman.api.event.ProfileUpdatedEvent;
import ca.gov.dtsstn.vacman.api.web.exception.ResourceNotFoundException;
import ca.gov.dtsstn.vacman.api.web.model.ProfilePutModel;

@Service
public class ProfileService {

	/** A collection of active profile status codes. */
	public static final Set<String> ACTIVE_PROFILE_STATUS = Set.of("APPROVED", "PENDING", "INCOMPLETE");

	/** A collection of inactive profile status codes. */
	public static final Set<String> INACTIVE_PROFILE_STATUS = Set.of("ARCHIVED");

	private final ProfileRepository profileRepository;

	private final LanguageRepository languageRepository;

	private final ClassificationRepository classificationRepository;

	private final CityRepository cityRepository;

	private final ProfileStatusRepository profileStatusRepository;

	private final EmploymentOpportunityRepository employmentOpportunityRepository;

	private final ApplicationEventPublisher eventPublisher;

	private final UserService userService;

	private final WfaStatusRepository wfaStatusRepository;

	private final WorkUnitRepository workUnitRepository;

	private final LanguageReferralTypeRepository languageReferralTypeRepository;

	// Keys are tied to the potential values of getProfilesByStatusAndHrId parameter isActive.
	private static final Map<Boolean, Set<String>> profileStatusSets = Map.of(
		Boolean.TRUE, ACTIVE_PROFILE_STATUS,
		Boolean.FALSE, INACTIVE_PROFILE_STATUS
	);

	public ProfileService(
			ClassificationRepository classificationRepository,
			ProfileRepository profileRepository,
			LanguageRepository languageRepository,
			CityRepository cityRepository,
			ProfileStatusRepository profileStatusRepository,
			EmploymentOpportunityRepository employmentOpportunityRepository,
			UserService userService,
			WfaStatusRepository wfaStatusRepository,
			WorkUnitRepository workUnitRepository,
			ApplicationEventPublisher eventPublisher,
			LanguageReferralTypeRepository languageReferralTypeRepository) {
		this.classificationRepository = classificationRepository;
		this.profileRepository = profileRepository;
		this.languageRepository = languageRepository;
		this.cityRepository = cityRepository;
		this.profileStatusRepository = profileStatusRepository;
		this.employmentOpportunityRepository = employmentOpportunityRepository;
		this.userService = userService;
		this.wfaStatusRepository = wfaStatusRepository;
		this.workUnitRepository = workUnitRepository;
		this.eventPublisher = eventPublisher;
		this.languageReferralTypeRepository = languageReferralTypeRepository;
	}

	/**
	 * Returns all profiles that are either "active" or "inactive" depending on the argument value. Optionally,
	 * allows for the HR Advisor's ID to be used as an additional filter.
	 *
	 * @param pageable Pagination information.
	 * @param isActive Filter return based on active status.
	 * @param hrAdvisorId Optional ID for additional filtering. Can be set to {@code null}.
	 * @return A paginated collection of profile entities.
	 */
	public Page<ProfileEntity> getProfilesByStatusAndHrId(Pageable pageable, Boolean isActive, Long hrAdvisorId) {
		// Dispatch DB call based on presence of isActive & advisor ID
		Page<ProfileEntity> profilesPage;

		if (isActive != null) {
			final var statusCodes = profileStatusSets.get(isActive);

			profilesPage = (hrAdvisorId == null)
				? profileRepository.findAll(hasProfileStatusCodeIn(statusCodes), pageable)
				: profileRepository.findAll(hasHrAdvisorId(hrAdvisorId).and(hasProfileStatusCodeIn(statusCodes)), pageable);
		}
		else {
			profilesPage = (hrAdvisorId == null)
				? profileRepository.findAll(pageable)
				: profileRepository.findAll(hasHrAdvisorId(hrAdvisorId), pageable);
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
			? profileRepository.findAll(hasUserMicrosoftEntraId(entraId).and(hasProfileStatusCodeIn(profileStatusSets.get(isActive))))
			: profileRepository.findAll(hasUserMicrosoftEntraId(entraId));

		if (profiles != null && !profiles.isEmpty()) {
			final var profileIds = profiles.stream()
				.map(ProfileEntity::getId)
				.toList();

			eventPublisher.publishEvent(new ProfileReadEvent(profileIds, entraId));
		}

		return profiles;
	}

	public Optional<ProfileEntity> getProfileById(long id) {
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
		final var incompleteStatus = profileStatusRepository.findByCode("INCOMPLETE").orElseThrow();

		final var profile = profileRepository.save(ProfileEntity.builder()
			.user(user)
			.profileStatus(incompleteStatus)
			.build());

		eventPublisher.publishEvent(new ProfileCreateEvent(profile));

		return profile;
	}

	/**
	 * Updates an existing profile to the target status code.
	 *
	 * @param existingProfile The profile entity to be updated.
	 * @param statusCode The code the profile will be updated to use.
	 */
	public void updateProfileStatus(ProfileEntity existingProfile, String statusCode) {
		final var previousStatusId = existingProfile.getProfileStatus().getId();
		final var newStatus = profileStatusRepository.findByCode(statusCode)
			.orElseThrow(asResourceNotFoundException("profileStatus", "code", statusCode));

		existingProfile.setProfileStatus(newStatus);
		final var updatedProfile = profileRepository.save(existingProfile);
		eventPublisher.publishEvent(new ProfileStatusChangeEvent(updatedProfile, previousStatusId, newStatus.getId()));
	}

	/**
	 * Update a profile based on the provided update model. This method validates that any IDs exist within the DB
	 * before saving the entity.
	 *
	 * @param updateModel The updated information for the profile.
	 * @param profile The profile entity to be updated.
	 * @return The updated profile entity.
	 * @throws ResourceNotFoundException When any given ID does not exist within the DB.
	 */
	public ProfileEntity updateProfile(ProfilePutModel updateModel, ProfileEntity profile) {
		profile.setWfaStartDate(updateModel.wfaStartDate());
		profile.setWfaEndDate(updateModel.wfaEndDate());
		profile.setPersonalPhoneNumber((updateModel.personalPhoneNumber()));
		profile.setPersonalEmailAddress(updateModel.personalEmailAddress());
		profile.setIsAvailableForReferral(updateModel.isAvailableForReferral());
		profile.setIsInterestedInAlternation(updateModel.isInterestedInAlternation());
		profile.setHasConsentedToPrivacyTerms(updateModel.hasConsentedToPrivacyTerms());
		profile.setAdditionalComment(updateModel.additionalComment());

		Optional.ofNullable(updateModel.hrAdvisorId()).ifPresent(id -> {
			profile.setHrAdvisor(userService.getUserById(id)
				.filter(user -> UserTypeCodes.HR_ADVISOR.equals(user.getUserType().getCode()))
				.orElseThrow(asResourceConflictException("HR Advisor", id)));
		});

		profile.setPreferredCities(updateModel.preferredCities().stream()
			.map(cityRepository::getReferenceById)
			.toList());

		profile.setPreferredClassifications(updateModel.preferredClassification().stream()
			.map(classificationRepository::getReferenceById)
			.toList());

		profile.setPreferredEmploymentOpportunities(updateModel.preferredEmploymentOpportunities().stream()
			.map(employmentOpportunityRepository::getReferenceById)
			.toList());

		profile.setPreferredLanguages(updateModel.preferredLanguages().stream()
			.map(languageReferralTypeRepository::getReferenceById)
			.toList());

		Optional.ofNullable(updateModel.languageOfCorrespondenceId())
			.map(languageRepository::getReferenceById)
			.ifPresent(profile::setLanguageOfCorrespondence);

		Optional.ofNullable(updateModel.classificationId())
			.map(classificationRepository::getReferenceById)
			.ifPresent(profile::setSubstantiveClassification);

		Optional.ofNullable(updateModel.cityId())
			.map(cityRepository::getReferenceById)
			.ifPresent(profile::setSubstantiveCity);

		Optional.ofNullable(updateModel.workUnitId())
			.map(workUnitRepository::getReferenceById)
			.ifPresent(profile::setSubstantiveWorkUnit);

		Optional.ofNullable(updateModel.wfaStatusId())
			.map(wfaStatusRepository::getReferenceById)
			.ifPresent(profile::setWfaStatus);

		final var updatedEntity = profileRepository.save(profile);
		eventPublisher.publishEvent(new ProfileUpdatedEvent(updatedEntity));

		return updatedEntity;
	}

}
