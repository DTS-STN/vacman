package ca.gov.dtsstn.vacman.api.web;

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
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import ca.gov.dtsstn.vacman.api.config.SpringDocConfig;
import ca.gov.dtsstn.vacman.api.security.SecurityUtils;
import ca.gov.dtsstn.vacman.api.service.ProfileService;
import ca.gov.dtsstn.vacman.api.service.UserService;
import ca.gov.dtsstn.vacman.api.web.exception.ResourceConflictException;
import ca.gov.dtsstn.vacman.api.web.exception.ResourceNotFoundException;
import ca.gov.dtsstn.vacman.api.web.exception.UnauthorizedException;
import ca.gov.dtsstn.vacman.api.web.model.CollectionModel;
import ca.gov.dtsstn.vacman.api.web.model.ProfileReadModel;
import ca.gov.dtsstn.vacman.api.web.model.mapper.ProfileModelMapper;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;

@RestController
@Tag(name = "Profiles")
@DependsOn({ "securityManager" })
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
				.orElseThrow(() -> new UnauthorizedException("Entra ID not found in security context"));

			hrAdvisorId = userService.getUserByMicrosoftEntraId(entraId)
				.orElseThrow(() -> new ResourceNotFoundException("No user found for given entra ID."))
				.getId();
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
			.orElseThrow(() -> new UnauthorizedException("Entra ID not found in security context"));

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
			.orElseThrow(() -> new ResourceNotFoundException("Could not find profile with id=[" + id + "]"));

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
			.orElseThrow(() -> new UnauthorizedException("Entra ID not found in security context"));


		log.debug("Checking if user with microsoftEntraId=[{}] already exists", microsoftEntraId);
		final var existingUser = userService.getUserByMicrosoftEntraId(microsoftEntraId)
			.orElseThrow(() -> new ResourceNotFoundException("A user with microsoftEntraId=[" + microsoftEntraId + "] does not exist"));

		log.debug("Checking if user with microsoftEntraId=[{}] has an active profile", microsoftEntraId);
		if (!profileService.getProfilesByEntraId(microsoftEntraId, true).isEmpty()) {
			throw new ResourceConflictException("User with microsoftEntraId=[" + microsoftEntraId + "] has an existing active profile");
		}

		log.debug("Creating profile in database...");
		final var createdProfile = profileModelMapper.toModel(profileService.createProfile(existingUser));

		log.trace("Successfully created profile user: [{}]", createdProfile);

		return ResponseEntity.ok(createdProfile);
	}

}
