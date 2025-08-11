package ca.gov.dtsstn.vacman.api.web;

import static ca.gov.dtsstn.vacman.api.constants.AppConstants.UserFields.MS_ENTRA_ID;
import static ca.gov.dtsstn.vacman.api.exception.ExceptionUtils.generateIdDoesNotExistException;
import static ca.gov.dtsstn.vacman.api.exception.ExceptionUtils.generateUserWithFieldDoesNotExistException;

import java.util.Collection;
import java.util.Set;

import org.apache.commons.lang3.StringUtils;
import org.hibernate.validator.constraints.Range;
import org.mapstruct.factory.Mappers;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.DependsOn;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.web.PagedModel;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import ca.gov.dtsstn.vacman.api.config.SpringDocConfig;
import ca.gov.dtsstn.vacman.api.constants.AppConstants;
import ca.gov.dtsstn.vacman.api.data.entity.ProfileEntity;
import ca.gov.dtsstn.vacman.api.data.entity.UserEntity;
import ca.gov.dtsstn.vacman.api.exception.ExceptionUtils;
import ca.gov.dtsstn.vacman.api.security.SecurityManager;
import ca.gov.dtsstn.vacman.api.security.SecurityUtils;
import ca.gov.dtsstn.vacman.api.service.ProfileService;
import ca.gov.dtsstn.vacman.api.service.UserService;
import ca.gov.dtsstn.vacman.api.web.exception.ResourceConflictException;
import ca.gov.dtsstn.vacman.api.web.model.CollectionModel;
import ca.gov.dtsstn.vacman.api.web.model.ProfileReadModel;
import ca.gov.dtsstn.vacman.api.web.model.ProfileStatusUpdateModel;
import ca.gov.dtsstn.vacman.api.web.model.mapper.ProfileModelMapper;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;

@RestController
@Tag(name = "Profiles")
@DependsOn({ SecurityManager.NAME })
@RequestMapping({ "/api/v1/profiles" })
public class ProfilesController {

	private static final Logger log = LoggerFactory.getLogger(ProfilesController.class);

	private final ProfileService profileService;

	private final UserService userService;

	private final ProfileModelMapper profileModelMapper = Mappers.getMapper(ProfileModelMapper.class);

	public ProfilesController(ProfileService profileService, UserService userService) {
		this.profileService = profileService;
		this.userService = userService;
	}

	@GetMapping
	@PreAuthorize("hasAuthority('hr-advisor')")
	@SecurityRequirement(name = SpringDocConfig.AZURE_AD)
	@Operation(summary = "Retrieve a list of profiles with optional filters on active profiles, inactive profiles, and HR advisor assocation.")
	public ResponseEntity<PagedModel<ProfileReadModel>> getProfiles(
			@RequestParam(defaultValue = "0")
			@Parameter(description = "Page number (0-based")
			int page,

			@RequestParam(defaultValue = "20")
			@Range(min = 1, max = 100)
			@Parameter(description = "Page size (between 1 and 100)")
			int size,

			@RequestParam(name = "active", required = false)
			@Parameter(name = "active", description = "Return only active or inactive profiles")
			Boolean isActive,

			@RequestParam(name = "hr-advisor", required = false)
			@Parameter(name = "hr-advisor", description = "Return only the profiles that are associated with the HR advisor")
			String hrAdvisor,

			@RequestParam(name = "user-data", defaultValue = "false")
			@Parameter(name = "user-data", description = "Return user first name, last name, and email address with profile")
			boolean wantUserData) {
		// Determine the advisor ID based on the advisor param (or lack thereof).
		Long hrAdvisorId;

		if (StringUtils.isBlank(hrAdvisor)) {
			hrAdvisorId = null;
		}
		else if (hrAdvisor.equalsIgnoreCase("me")) {
			final var entraId = SecurityUtils.getCurrentUserEntraId()
				.orElseThrow(ExceptionUtils::generateCouldNotExtractOidException);

			hrAdvisorId = userService.getUserByMicrosoftEntraId(entraId)
				.map(UserEntity::getId)
				.orElseThrow(() -> generateUserWithFieldDoesNotExistException(MS_ENTRA_ID, entraId));
		}
		else {
			hrAdvisorId = Long.valueOf(hrAdvisor);
		}

		// Determine the mapping function to use.
		final var profiles = profileService.getProfilesByStatusAndHrId(PageRequest.of(page, size), isActive, hrAdvisorId)
			.map((wantUserData) ? profileModelMapper::toModel : profileModelMapper::toModelNoUserData);

		return ResponseEntity.ok(new PagedModel<>(profiles));
	}

	@GetMapping(path = "/me")
	@PreAuthorize("isAuthenticated()")
	@SecurityRequirement(name = SpringDocConfig.AZURE_AD)
	@Operation(summary = "Retrieve the profiles associated with the authenticated user with optional filters on active profiles, inactive profiles, and HR advisor association.")
	public ResponseEntity<CollectionModel<ProfileReadModel>> getProfileMe(
			@RequestParam(name = "active", required = false)
			@Parameter(name = "active", description = "Return only active or inactive profiles")
			Boolean isActive) {
		final var entraId = SecurityUtils.getCurrentUserEntraId()
			.orElseThrow(ExceptionUtils::generateCouldNotExtractOidException);

		final var profiles = profileService.getProfilesByEntraId(entraId, isActive).stream()
			.map(profileModelMapper::toModelNoUserData)
			.toList();

		return ResponseEntity.ok(new CollectionModel<>(profiles));
	}

	@GetMapping(path = "/{id}")
	@SecurityRequirement(name = SpringDocConfig.AZURE_AD)
	@PreAuthorize("hasAuthority('hr-advisor') || @securityManager.canAccessProfile(#id)")
	@Operation(summary = "Retrieve the profile specified by ID that is associated with the authenticated user.")
	public ResponseEntity<ProfileReadModel> getProfileById(@PathVariable Long id) {
		log.info("Received request to get profile; ID: [{}]", id);

		final var profile = profileService.getProfile(id)
			.map(profileModelMapper::toModel)
			.orElseThrow(() -> generateIdDoesNotExistException("profile", id));

		log.trace("Found profile: [{}]", profile);

		return ResponseEntity.ok(profile);
	}

	@PostMapping(path = "/me")
	@PreAuthorize("isAuthenticated()")
	@SecurityRequirement(name = SpringDocConfig.AZURE_AD)
	@Operation(summary = "Create a new profile associated with the authenticated user.")
	public ResponseEntity<ProfileReadModel> createCurrentUserProfile() {
		log.info("Received request to create new profile");
		final var microsoftEntraId = SecurityUtils.getCurrentUserEntraId()
			.orElseThrow(ExceptionUtils::generateCouldNotExtractOidException);

		log.debug("Checking if user with microsoftEntraId=[{}] already exists", microsoftEntraId);
		final var existingUser = userService.getUserByMicrosoftEntraId(microsoftEntraId)
			.orElseThrow(() -> generateUserWithFieldDoesNotExistException(MS_ENTRA_ID, microsoftEntraId));

		log.debug("Checking if user with microsoftEntraId=[{}] has an active profile", microsoftEntraId);
		if (!profileService.getProfilesByEntraId(microsoftEntraId, true).isEmpty()) {
			throw new ResourceConflictException("User with microsoftEntraId=[" + microsoftEntraId + "] has an existing active profile");
		}

		log.debug("Creating profile in database...");
		final var createdProfile = profileModelMapper.toModel(profileService.createProfile(existingUser));

		log.trace("Successfully created profile user: [{}]", createdProfile);

		return ResponseEntity.ok(createdProfile);
	}

	@PutMapping(path = "/{id}")
	@PreAuthorize("hasAuthority('hr-advisor')")
	@SecurityRequirement(name = SpringDocConfig.AZURE_AD)
	@Operation(summary = "Update an existing profile specified by ID.")
	public ResponseEntity<ProfileReadModel> updateProfileById(@PathVariable(name = "id") Long profileId, @Valid @RequestBody ProfileReadModel updatedProfile) {
		log.info("Received request to get profile; ID: [{}]", profileId);

		final var foundProfile = profileService.getProfile(profileId)
			.orElseThrow(() -> generateIdDoesNotExistException("profile", profileId));

		log.trace("Found profile: [{}]", foundProfile);

		final var updatedEntity = profileService.updateProfile(updatedProfile, foundProfile);

		return ResponseEntity.ok(profileModelMapper.toModelNoUserData(updatedEntity));
	}

	@PutMapping(path = "/{id}/status")
	@PreAuthorize("""
		(hasAuthority('xhr-advisor') && @securityManager.targetProfileStatusIsApprovalOrArchived(#updatedProfileStatus.code)) ||
		(@securityManager.canAccessProfile(#profileId) && @securityManager.targetProfileStatusIsPending(#updatedProfileStatus.code))
	""")
	@SecurityRequirement(name = SpringDocConfig.AZURE_AD)
	@Operation(summary = "Update an existing profile's status code specified by ID.")
	public ResponseEntity<Void> updateProfileById(@PathVariable(name = "id") Long profileId, @Valid @RequestBody ProfileStatusUpdateModel updatedProfileStatus) {
		log.info("Received request to update profile status; ID: [{}]", profileId);

		final var foundProfile = profileService.getProfile(profileId)
			.orElseThrow(() -> generateIdDoesNotExistException("profile", profileId));

		log.trace("Found profile: [{}]", foundProfile);

		final var validPretransitionStates = switch (updatedProfileStatus.getCode()) {
			case AppConstants.ProfileStatusCodes.PENDING -> Set.of(AppConstants.ProfileStatusCodes.INCOMPLETE, AppConstants.ProfileStatusCodes.APPROVED);
			case AppConstants.ProfileStatusCodes.APPROVED -> Set.of(AppConstants.ProfileStatusCodes.PENDING);
			case AppConstants.ProfileStatusCodes.ARCHIVED -> Set.of(AppConstants.ProfileStatusCodes.APPROVED);
			// This default case /shouldn't/ ever execute, since at this point we've confirmed that the target status
			// is one of three options. But, we need to handle this case regardless.
			default -> throw new ResourceConflictException("Cannot transition profile status to code=[" + updatedProfileStatus.getCode() + "]");
		};

		updateStatusToTarget(foundProfile, updatedProfileStatus.getCode(), validPretransitionStates);

		return ResponseEntity.noContent().build();
	}

	private void updateStatusToTarget(ProfileEntity profile, String targetStatus, Collection<String> validPreTransitionStates) {
		final var currentStatus = profile.getProfileStatus().getCode();
		if(!validPreTransitionStates.contains(currentStatus)) {
			throw new ResourceConflictException("Cannot transition state from code=[" + currentStatus + "] to code=[" + targetStatus + "]");
		}

		profileService.updateProfileStatus(profile, targetStatus);
	}

}
