package ca.gov.dtsstn.vacman.api.web;

import static ca.gov.dtsstn.vacman.api.web.exception.ResourceNotFoundException.asResourceNotFoundException;
import static ca.gov.dtsstn.vacman.api.web.exception.ResourceNotFoundException.asUserResourceNotFoundException;
import static ca.gov.dtsstn.vacman.api.web.exception.UnauthorizedException.asEntraIdUnauthorizedException;
import static ca.gov.dtsstn.vacman.api.web.model.CollectionModel.toCollectionModel;
import static java.util.Collections.emptySet;

import java.util.Collection;
import java.util.Set;

import org.apache.commons.lang3.StringUtils;
import org.mapstruct.factory.Mappers;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springdoc.core.annotations.ParameterObject;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PagedModel;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.AuthorityUtils;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import ca.gov.dtsstn.vacman.api.config.SpringDocConfig;
import ca.gov.dtsstn.vacman.api.config.properties.ApplicationProperties;
import ca.gov.dtsstn.vacman.api.config.properties.EntraIdProperties.RolesProperties;
import ca.gov.dtsstn.vacman.api.config.properties.LookupCodes;
import ca.gov.dtsstn.vacman.api.config.properties.LookupCodes.ProfileStatuses;
import ca.gov.dtsstn.vacman.api.data.entity.ProfileEntity;
import ca.gov.dtsstn.vacman.api.data.entity.UserEntity;
import ca.gov.dtsstn.vacman.api.security.SecurityUtils;
import ca.gov.dtsstn.vacman.api.service.ProfileService;
import ca.gov.dtsstn.vacman.api.service.UserService;
import ca.gov.dtsstn.vacman.api.web.exception.ResourceConflictException;
import ca.gov.dtsstn.vacman.api.web.model.CollectionModel;
import ca.gov.dtsstn.vacman.api.web.model.ProfilePutModel;
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
@ApiResponses.InternalServerError
@RequestMapping({ "/api/v1/profiles" })
@SecurityRequirement(name = SpringDocConfig.AZURE_AD)
public class ProfilesController {

	private static final Logger log = LoggerFactory.getLogger(ProfilesController.class);

	private static final String PROFILE = "profile";

	private static final String FOUND_PROFILE_LOG_MSG = "Found profile: [{}]";

	private final ProfileService profileService;

	private final ProfileStatuses profileStatusCodes;

	private final RolesProperties roles;

	private final UserService userService;

	private final ProfileModelMapper profileModelMapper = Mappers.getMapper(ProfileModelMapper.class);

	public ProfilesController(
			ApplicationProperties applicationProperties,
			LookupCodes lookupCodes,
			ProfileService profileService,
			UserService userService) {
		this.roles = applicationProperties.entraId().roles();
		this.profileService = profileService;
		this.profileStatusCodes = lookupCodes.profileStatuses();
		this.userService = userService;
	}

	@GetMapping
	@ApiResponses.Ok
	@ApiResponses.AccessDeniedError
	@ApiResponses.AuthenticationError
	@PreAuthorize("hasAuthority('hr-advisor')")
	@Operation(summary = "Retrieve a list of profiles with optional filters on active profiles, inactive profiles, and HR advisor assocation.")
	public ResponseEntity<PagedModel<ProfileReadModel>> getProfiles(
			@ParameterObject
			Pageable pageable,

			@RequestParam(name = "active", required = false)
			@Parameter(name = "active", description = "Return only active or inactive profiles")
			Boolean isActive,

			@RequestParam(name = "hr-advisor", required = false)
			@Parameter(name = "hr-advisor", description = "Return only the profiles that are associated with the HR advisor")
			String hrAdvisor) {
		// Determine the advisor ID based on the advisor param (or lack thereof).
		Long hrAdvisorId;

		if (StringUtils.isBlank(hrAdvisor)) {
			hrAdvisorId = null;
		}
		else if (hrAdvisor.equalsIgnoreCase("me")) {
			final var entraId = SecurityUtils.getCurrentUserEntraId()
				.orElseThrow(asEntraIdUnauthorizedException());

			hrAdvisorId = userService.getUserByMicrosoftEntraId(entraId)
				.map(UserEntity::getId)
				.orElseThrow(asUserResourceNotFoundException("microsoftEntraId", entraId));
		}
		else {
			hrAdvisorId = Long.valueOf(hrAdvisor);
		}

		// Determine the mapping function to use.
		final var profiles = profileService.getProfilesByStatusAndHrId(pageable, isActive, hrAdvisorId)
			.map(profileModelMapper::toModel);

		return ResponseEntity.ok(new PagedModel<>(profiles));
	}

	@ApiResponses.Ok
	@GetMapping({ "/me" })
	@ApiResponses.AccessDeniedError
	@ApiResponses.AuthenticationError
	@PreAuthorize("isAuthenticated()")
	@Operation(summary = "Retrieve the profiles associated with the authenticated user with optional filters on active profiles, inactive profiles, and HR advisor association.")
	public ResponseEntity<CollectionModel<ProfileReadModel>> getProfileMe(
			@RequestParam(name = "active", required = false)
			@Parameter(name = "active", description = "Return only active or inactive profiles")
			Boolean isActive) {
		final var entraId = SecurityUtils.getCurrentUserEntraId()
			.orElseThrow(asEntraIdUnauthorizedException());

		final var profiles = profileService.getProfilesByEntraId(entraId, isActive).stream()
			.map(profileModelMapper::toModel)
			.collect(toCollectionModel());

		return ResponseEntity.ok(profiles);
	}

	@ApiResponses.Ok
	@GetMapping({ "/{id}" })
	@ApiResponses.AccessDeniedError
	@ApiResponses.AuthenticationError
	@ApiResponses.ResourceNotFoundError
	@PreAuthorize("hasAuthority('hr-advisor') || hasPermission(#id, 'PROFILE', 'READ')")
	@Operation(summary = "Retrieve the profile specified by ID that is associated with the authenticated user.")
	public ResponseEntity<ProfileReadModel> getProfileById(@PathVariable Long id) {
		log.info("Received request to get profile; ID: [{}]", id);

		final var profile = profileService.getProfileById(id)
			.map(profileModelMapper::toModel)
			.orElseThrow(asResourceNotFoundException(PROFILE, id));

		log.trace(FOUND_PROFILE_LOG_MSG, profile);

		return ResponseEntity.ok(profile);
	}

	@ApiResponses.Ok
	@PostMapping({ "/me" })
	@ApiResponses.AccessDeniedError
	@ApiResponses.AuthenticationError
	@PreAuthorize("isAuthenticated()")
	@Operation(summary = "Create a new profile associated with the authenticated user.")
	public ResponseEntity<ProfileReadModel> createCurrentUserProfile() {
		log.info("Received request to create new profile");
		final var microsoftEntraId = SecurityUtils.getCurrentUserEntraId()
			.orElseThrow(asEntraIdUnauthorizedException());

		log.debug("Checking if user with microsoftEntraId=[{}] already exists", microsoftEntraId);
		final var existingUser = userService.getUserByMicrosoftEntraId(microsoftEntraId)
			.orElseThrow(asUserResourceNotFoundException("microsoftEntraId", microsoftEntraId));

		log.debug("Checking if user with microsoftEntraId=[{}] has an active profile", microsoftEntraId);
		if (!profileService.getProfilesByEntraId(microsoftEntraId, true).isEmpty()) {
			throw new ResourceConflictException("User with microsoftEntraId=[" + microsoftEntraId + "] has an existing active profile");
		}

		log.debug("Creating profile in database...");

		final var createdProfile = profileModelMapper.toModel(
			profileService.createProfile(ProfileEntity.builder()
				.user(existingUser)
				.build()));

		log.trace("Successfully created profile user: [{}]", createdProfile);

		return ResponseEntity.ok(createdProfile);
	}

	@ApiResponses.Ok
	@PutMapping({ "/{id}" })
	@ApiResponses.AccessDeniedError
	@ApiResponses.AuthenticationError
	@ApiResponses.ResourceNotFoundError
	@Operation(summary = "Update an existing profile specified by ID.")
	@PreAuthorize("hasAuthority('hr-advisor') || hasPermission(#id, 'PROFILE', 'READ')")
	public ResponseEntity<ProfileReadModel> updateProfileById(@PathVariable Long id, @Valid @RequestBody ProfilePutModel updatedProfile) {
		log.info("Received request to get profile; ID: [{}]", id);

		final var foundProfile = profileService.getProfileById(id)
			.orElseThrow(asResourceNotFoundException(PROFILE, id));

		log.trace(FOUND_PROFILE_LOG_MSG, foundProfile);

		final var updatedEntity = profileService.updateProfile(updatedProfile, foundProfile);

		return ResponseEntity.ok(profileModelMapper.toModel(updatedEntity));
	}

	@ApiResponses.Accepted
	@PutMapping({ "/{id}/status" })
	@ApiResponses.AccessDeniedError
	@ApiResponses.AuthenticationError
	@ApiResponses.ResourceNotFoundError
	@Operation(summary = "Update an existing profile's status code specified by ID.")
	@PreAuthorize("hasAuthority('hr-advisor') || hasPermission(#id, 'PROFILE', 'UPDATE')")
	public ResponseEntity<Void> updateProfileById(@PathVariable Long id, @Valid @RequestBody ProfileStatusUpdateModel updatedProfileStatus) {
		log.info("Received request to update profile status; ID: [{}]", id);

		//
		// APPROVED and ARCHIVED statuses require that the submitter be an HR advisor
		//

		final var requiresHrAdvisor = profileStatusCodes.approved().equals(updatedProfileStatus.getCode())
			|| profileStatusCodes.archived().equals(updatedProfileStatus.getCode());

		if (requiresHrAdvisor && !isHrAdvisor()) {
			throw new AccessDeniedException("Only HR advisors can set status to APPROVED or ARCHIVED");
		}

		//
		// PENDING is the only valid status for normal (non HR advisor) employees
		//

		final var isPendingStatus = profileStatusCodes.pending().equals(updatedProfileStatus.getCode());

		if (!requiresHrAdvisor && !isPendingStatus) {
			throw new AccessDeniedException("Profile status can only be set to APPROVED");
		}

		final var foundProfile = profileService.getProfileById(id)
			.orElseThrow(asResourceNotFoundException(PROFILE, id));

		final Set<String> validPretransitionStates;
		final var code = updatedProfileStatus.getCode();

		if (code.equals(profileStatusCodes.pending())) {
			validPretransitionStates = Set.of(profileStatusCodes.incomplete(), profileStatusCodes.approved());
		}
		else if (code.equals(profileStatusCodes.approved())) {
			validPretransitionStates = Set.of(profileStatusCodes.pending());
		}
		else if (code.equals(profileStatusCodes.archived())) {
			validPretransitionStates = Set.of(profileStatusCodes.approved());
		}
		else {
			throw new ResourceConflictException("Cannot transition profile status to code=[" + code + "]");
		}

		updateStatusToTarget(foundProfile, updatedProfileStatus.getCode(), validPretransitionStates);

		return ResponseEntity.accepted().build();
	}

	/**
	 * Checks the {@code roles} claim for the presence of the {@code hr-advisor} role.
	 */
	private boolean isHrAdvisor() {
		final var userAuthorities = SecurityUtils.getCurrentAuthentication()
			.map(Authentication::getAuthorities)
			.map(AuthorityUtils::authorityListToSet)
			.orElse(emptySet());

		return userAuthorities.contains(roles.hrAdvisor());
	}

	private void updateStatusToTarget(ProfileEntity profile, String targetStatus, Collection<String> validPreTransitionStates) {
		final var currentStatus = profile.getProfileStatus().getCode();
		if(!validPreTransitionStates.contains(currentStatus)) {
			throw new ResourceConflictException("Cannot transition state from code=[" + currentStatus + "] to code=[" + targetStatus + "]");
		}

		profileService.updateProfileStatus(profile, targetStatus);
	}

}
