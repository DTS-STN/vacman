package ca.gov.dtsstn.vacman.api.service;

import static ca.gov.dtsstn.vacman.api.security.SecurityUtils.getCurrentUserEntraId;
import static ca.gov.dtsstn.vacman.api.web.exception.ResourceNotFoundException.asResourceNotFoundException;

import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.function.Function;
import java.util.stream.Collectors;

import org.springframework.context.ApplicationEventPublisher;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import ca.gov.dtsstn.vacman.api.data.entity.ClassificationProfileEntityBuilder;
import ca.gov.dtsstn.vacman.api.data.entity.ProfileCityEntityBuilder;
import ca.gov.dtsstn.vacman.api.data.entity.ProfileEmploymentOpportunityEntity;
import ca.gov.dtsstn.vacman.api.data.entity.ProfileEntity;
import ca.gov.dtsstn.vacman.api.data.entity.ProfileEntityBuilder;
import ca.gov.dtsstn.vacman.api.data.entity.ProfileLanguageReferralTypeEntityBuilder;
import ca.gov.dtsstn.vacman.api.data.entity.UserEntity;
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
import ca.gov.dtsstn.vacman.api.web.exception.ResourceConflictException;
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
	 * Updates an existing profile to the target status code.
	 *
	 * @param existingProfile The profile entity to be updated.
	 * @param statusCode The code the profile will be updated to use.
	 */
	public void updateProfileStatus(ProfileEntity existingProfile, String statusCode) {
		final var previousStatusId = existingProfile.getProfileStatus().getId();
		final var newStatus = profileStatusRepository.findByCode(statusCode) ;

		existingProfile.setProfileStatus(newStatus);
		final var updatedProfile = profileRepository.save(existingProfile);
		eventPublisher.publishEvent(new ProfileStatusChangeEvent(updatedProfile, previousStatusId, newStatus.getId()));
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
	public ProfileEntity updateProfile(ProfilePutModel updateModel, ProfileEntity existingEntity) {
		Optional.ofNullable(updateModel.hrAdvisorId()).ifPresent(id ->
				existingEntity.setHrAdvisor(userService.getUserById(id)
						.filter(user -> user.getUserType().getCode().equals("HRA"))
						.orElseThrow(asResourceNotFoundException("HR Advisor", updateModel.hrAdvisorId()))));

		Optional.ofNullable(updateModel.languageOfCorrespondenceId()).ifPresent(id ->
				existingEntity.setLanguage(languageRepository.findById(id)
						.orElseThrow(asResourceNotFoundException("Language", updateModel.languageOfCorrespondenceId()))));

		Optional.ofNullable(updateModel.classificationId()).ifPresent(id ->
				existingEntity.setClassification(classificationRepository.findById(id)
						.orElseThrow(asResourceNotFoundException("Classification", updateModel.classificationId()))));

		Optional.ofNullable(updateModel.cityId()).ifPresent(id ->
				existingEntity.setCity(cityRepository.findById(id)
						.orElseThrow(asResourceNotFoundException("City", updateModel.cityId()))));

		Optional.ofNullable(updateModel.workUnitId()).ifPresent(id ->
				existingEntity.setWorkUnit(workUnitRepository.findById(id)
						.orElseThrow(asResourceNotFoundException("Work Unit", updateModel.workUnitId()))));

		Optional.ofNullable(updateModel.wfaStatusId()).ifPresent(id ->
				existingEntity.setWfaStatus(wfaStatusRepository.findById(id)
						.orElseThrow(asResourceNotFoundException("WFA Status", updateModel.wfaStatusId()))));

		syncPreferredCities(updateModel, existingEntity);
		syncPreferredClassifications(updateModel, existingEntity);
		syncPreferredEmploymentOpportunities(updateModel, existingEntity);
		syncPreferredLanguages(updateModel, existingEntity);

		existingEntity.setWfaStartDate(updateModel.wfaStartDate());
		existingEntity.setWfaEndDate(updateModel.wfaEndDate());
		existingEntity.setPersonalPhoneNumber((updateModel.personalPhoneNumber()));
		existingEntity.setPersonalEmailAddress(updateModel.personalEmailAddress());
		existingEntity.setIsAvailableForReferral(updateModel.isAvailableForReferral());
		existingEntity.setIsInterestedInAlternation(updateModel.isInterestedInAlternation());
		existingEntity.setHasConsentedToPrivacyTerms(updateModel.hasConsentedToPrivacyTerms());
		existingEntity.setAdditionalComment(updateModel.additionalComment());

		final var updatedEntity = profileRepository.save(existingEntity);
		eventPublisher.publishEvent(new ProfileUpdatedEvent(updatedEntity));

		return updatedEntity;
	}

	/**
	 * Updates a {@link ProfileEntity}'s associative entity based on the given parameters.
	 * <p/>
	 * This method computes the delta between the current state and expected state off the associative entity,
	 * adds that which is missing, and removes that which needs to be removed. While this <em>is</em> complex for
	 * associations that should be relatively small per profile, the simpler solution of clearing and adding to the
	 * association's {@link Set} does not work due to how Hibernate orders it's operations. Hibernate will
	 * execute it's inserts before deletions, which can lead to violations of the unique key constraint in these
	 * associative entities. <a href="https://hibernate.atlassian.net/browse/HHH-2801">See HHH-2801 for other details</a>.
	 *
	 * @param incomingIds A list of IDs representing the state after the sync has completed.
	 * @param currentAssociations The current associative entities related to the target profile.
	 * @param getAssociatedId A function to retrieve the ID of the underlying entity from the associative entity.
	 * @param createAssociation A function to create an associative entity between the target profile and the target related entity.
	 * @param fetchEntitiesByIds A function to retrieve all target entities by ID.
	 * @param <E> The underlying entity type that has a relationship with the profile.
	 * @param <A> The target associative entity type.
	 */
	private <E, A> void syncAssociations(Set<Long> incomingIds,
			Set<A> currentAssociations,
			Function<A, Long> getAssociatedId,
			Function<E, A> createAssociation,
			Function<Set<Long>, List<E>> fetchEntitiesByIds,
			String associationName) {
		// We allow empty incoming IDs to move forward. This effectively is treated as a "remove all" option.
		if (incomingIds == null || incomingIds.contains(null)) {
			throw new ResourceConflictException("Cannot assign " + associationName + " with null value(s).");
		}

		final var currentIds = currentAssociations.stream()
			.map(getAssociatedId)
			.collect(Collectors.toSet());

		// Return early if there are no changes to make.
		if (incomingIds.equals(currentIds)) {
			return;
		}

		// Compute the delta between the incoming IDs and current IDs.
		final var idsToAdd = new HashSet<>(incomingIds);
		idsToAdd.removeAll(currentIds);

		final var idsToRemove = new HashSet<>(currentIds);
		idsToRemove.removeAll(incomingIds);

		final var entitiesToAdd = fetchEntitiesByIds.apply(idsToAdd);
		final var foundIds = entitiesToAdd.stream()
			.map(e -> getAssociatedId.apply(createAssociation.apply(e)))
			.collect(Collectors.toSet());

		// If any IDs did not exist, we will not get an exception from fetchAllById. Instead, we check for the
		// absence of a returned ID from the asked-for IDs and throw our own exception.
		final var missingIds = new HashSet<>(idsToAdd);
		missingIds.removeAll(foundIds);

		if (!missingIds.isEmpty()) {
			final var sb = new StringBuilder();
			sb.append("A(n) entity for association ").append(associationName).append(" where id(s)=[ ");
			for (final var missingId : missingIds) {
				sb.append(missingId).append(" ");
			}
			sb.append("] do(es) not exist");
			throw new ResourceConflictException(sb.toString());
		}

		// Remove all associations that are no longer required.
		currentAssociations.removeIf(a -> idsToRemove.contains(getAssociatedId.apply(a)));

		// Add all associations that are now required.
		for (final E entity : entitiesToAdd) {
			currentAssociations.add(createAssociation.apply(entity));
		}

	}

	private void syncPreferredCities(ProfilePutModel updateModel, ProfileEntity existingEntity) {
		syncAssociations(
			updateModel.preferredCities(),
			existingEntity.getProfileCities(),
			pc -> pc.getCity().getId(),
			city -> new ProfileCityEntityBuilder()
				.profile(existingEntity)
				.city(city)
				.build(),
			cityRepository::findAllById,
			"ProfileCities");
	}

	private void syncPreferredClassifications(ProfilePutModel updateModel, ProfileEntity existingEntity) {
		syncAssociations(
			updateModel.preferredClassification(),
			existingEntity.getClassificationProfiles(),
			cp -> cp.getClassification().getId(),
			classification -> new ClassificationProfileEntityBuilder()
				.profile(existingEntity)
				.classification(classification)
				.build(),
			classificationRepository::findAllById,
			"ClassificationProfiles");
	}

	private void syncPreferredEmploymentOpportunities(ProfilePutModel updateModel, ProfileEntity existingEntity) {
		syncAssociations(
			updateModel.preferredEmploymentOpportunities(),
			existingEntity.getEmploymentOpportunities(),
			peoe -> peoe.getEmploymentOpportunity().getId(),
			empOpp -> {
				final var peoe = new ProfileEmploymentOpportunityEntity();
				peoe.setProfile(existingEntity);
				peoe.setEmploymentOpportunity(empOpp);
				return peoe;
			},
			employmentOpportunityRepository::findAllById,
			"ProfileEmploymentOpportunities");
	}

	private void syncPreferredLanguages(ProfilePutModel updateModel, ProfileEntity existingEntity) {
		syncAssociations(
			updateModel.preferredLanguages(),
			existingEntity.getLanguageReferralTypes(),
			lrt -> lrt.getLanguageReferralType().getId(),
			lrte -> new ProfileLanguageReferralTypeEntityBuilder()
				.profile(existingEntity)
				.languageReferralType(lrte)
				.build(),
			languageReferralTypeRepository::findAllById,
			"ProfileLanguageReferralTypes");
	}

}
