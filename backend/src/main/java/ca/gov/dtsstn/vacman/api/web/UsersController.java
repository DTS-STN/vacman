package ca.gov.dtsstn.vacman.api.web;

import java.util.List;

import org.apache.commons.lang3.StringUtils;
import org.hibernate.validator.constraints.Range;
import org.mapstruct.factory.Mappers;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.DependsOn;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PagedModel;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import ca.gov.dtsstn.vacman.api.config.SpringDocConfig;
import ca.gov.dtsstn.vacman.api.constants.AppConstants;
import ca.gov.dtsstn.vacman.api.security.SecurityManager;
import ca.gov.dtsstn.vacman.api.security.SecurityUtils;
import ca.gov.dtsstn.vacman.api.service.MSGraphService;
import ca.gov.dtsstn.vacman.api.service.UserService;
import ca.gov.dtsstn.vacman.api.web.exception.ResourceConflictException;
import ca.gov.dtsstn.vacman.api.web.exception.ResourceNotFoundException;
import ca.gov.dtsstn.vacman.api.web.exception.UnauthorizedException;
import ca.gov.dtsstn.vacman.api.web.model.UserCreateModel;
import ca.gov.dtsstn.vacman.api.web.model.UserReadModel;
import ca.gov.dtsstn.vacman.api.web.model.UserUpdateModel;
import ca.gov.dtsstn.vacman.api.web.model.mapper.UserModelMapper;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;

@RestController
@Tag(name = "Users")
@DependsOn({ SecurityManager.NAME })
@RequestMapping({ AppConstants.ApiPaths.USERS })
public class UsersController {

	private static final Logger log = LoggerFactory.getLogger(UsersController.class);

	private final MSGraphService msGraphService;

	private final UserModelMapper userModelMapper = Mappers.getMapper(UserModelMapper.class);

	private final UserService userService;

	public UsersController(MSGraphService msGraphService, UserService userService) {
		this.msGraphService = msGraphService;
		this.userService = userService;
	}

	@PostMapping({ "/me" })
	@PreAuthorize("isAuthenticated()")
	@SecurityRequirement(name = SpringDocConfig.AZURE_AD)
	@Operation(summary = "Create a new user from the supplied auth token.")
	public ResponseEntity<UserReadModel> createCurrentUser(@Valid @RequestBody UserCreateModel user) {
		log.info("Received request to create new user; request: [{}]", user);

		final var entraId = SecurityUtils.getCurrentUserEntraId()
			.orElseThrow(() -> new UnauthorizedException("Entra ID not found in security context"));

		log.debug("Checking if user with entraId=[{}] already exists", entraId);

		userService.getUserByMicrosoftEntraId(entraId).ifPresent(xxx -> {
			throw new ResourceConflictException("A user with microsoftEntraId=[" + entraId + "] already exists");
		});

		final var msGraphUser = msGraphService.getUser(entraId)
			.orElseThrow(() -> new ResourceNotFoundException("User with entraId=[" + entraId + "] not found in MSGraph"));

		log.debug("MSGraph user details: [{}]", msGraphUser);

		final var userEntity = userModelMapper.toEntityBuilder(user)
			.businessEmailAddress(msGraphUser.mail())
			.firstName(msGraphUser.givenName())
			.lastName(msGraphUser.surname())
			.microsoftEntraId(msGraphUser.id())
			.build();

		log.debug("Creating user in database...");
		final var createdUser = userModelMapper.toModel(userService.createUser(userEntity, user.languageId()));
		log.trace("Successfully created new user: [{}]", createdUser);

		return ResponseEntity.ok(createdUser);
	}

	@GetMapping({ "/me" })
	@PreAuthorize("isAuthenticated()")
	@SecurityRequirement(name = SpringDocConfig.AZURE_AD)
	@Operation(summary = "Get the current user.", description = "Returns the current user.")
	public ResponseEntity<UserReadModel> getCurrentUser() {
		log.debug("Received request to get current user");

		final var entraId = SecurityUtils.getCurrentUserEntraId()
			.orElseThrow(() -> new UnauthorizedException("Entra ID not found in security context"));

		log.debug("Fetching current user with microsoftEntraId=[{}]", entraId);

		final var user = userService.getUserByMicrosoftEntraId(entraId)
			.map(userModelMapper::toModel)
			.orElseThrow(() -> new ResourceNotFoundException("User with microsoftEntraId=[" + entraId + "] not found"));

		log.debug("Found current user: [{}]", user);

		return ResponseEntity.ok(user);
	}

	@GetMapping
	@PreAuthorize("hasAuthority('hr-advisor')")
	@SecurityRequirement(name = SpringDocConfig.AZURE_AD)
	@Operation(summary = "Get users with pagination.", description = "Returns a paginated list of users.")
	public ResponseEntity<PagedModel<UserReadModel>> getUsers(
			@RequestParam(required = false)
			@Parameter(description = "Microsoft Entra ID to filter by.")
			String microsoftEntraId,

			@RequestParam(defaultValue = "0")
			@Parameter(description = "Page number (0-based)")
			int page,

			@RequestParam(defaultValue = "20")
			@Range(min = 1, max = 100)
			@Parameter(description = "Page size (between 1 and 100)")
			int size) {
		if (StringUtils.isNotBlank(microsoftEntraId)) {
			final var users = userService.getUserByMicrosoftEntraId(microsoftEntraId)
				.map(userModelMapper::toModel)
				.map(List::of)
				.orElse(List.of());

			return ResponseEntity.ok(new PagedModel<>(new PageImpl<>(users, Pageable.ofSize(size), users.size())));
		}

		final var users = userService.getUsers(PageRequest.of(page, size)).map(userModelMapper::toModel);
		return ResponseEntity.ok(new PagedModel<>(users));
	}

	@GetMapping("/{id}")
	@Operation(summary = "Get a user by ID.")
	@SecurityRequirement(name = SpringDocConfig.AZURE_AD)
	@PreAuthorize("hasAuthority('hr-advisor') || @securityManager.canAccessUser(#id)")
	public ResponseEntity<UserReadModel> getUserById(@PathVariable Long id) {
		final var result = userService.getUserById(id)
			.map(userModelMapper::toModel)
			.orElseThrow(() -> new ResourceNotFoundException("User with id=[" + id + "] not found"));

		return ResponseEntity.ok(result);
	}

	@PatchMapping("/{id}")
	@Operation(summary = "Update an existing user.")
	@SecurityRequirement(name = SpringDocConfig.AZURE_AD)
	@PreAuthorize("hasAuthority('hr-advisor') || @securityManager.canAccessUser(#id)")
	public ResponseEntity<UserReadModel> updateUser(@PathVariable long id, @RequestBody @Valid UserUpdateModel updates) {
		userService.getUserById(id).orElseThrow(() -> new ResourceNotFoundException("User with id=[" + id + "] not found"));
		final var updatedUser = userService.updateUser(id, userModelMapper.toEntity(updates));
		return ResponseEntity.ok(userModelMapper.toModel(updatedUser));
	}

	@PutMapping("/{id}")
	@Operation(summary = "Update an existing user with authorization checks.", 
		description = "The user can only be updated if either: " +
			"1. The database user id linked to the UUID in the header token is the same as {id}, or " +
			"2. The header token has a claim to the \"hr-advisor\" security group.")
	@SecurityRequirement(name = SpringDocConfig.AZURE_AD)
	public ResponseEntity<UserReadModel> putUser(@PathVariable Long id, @RequestBody @Valid UserUpdateModel userUpdate) {
		try {
			// Check if user exists
			final var existingUser = userService.getUserById(id)
				.orElseThrow(() -> new ResourceNotFoundException("User with id=[" + id + "] not found"));

			// Check if current user is the same as the user being updated
			final var currentUserEntraId = SecurityUtils.getCurrentUserEntraId()
				.orElseThrow(() -> new UnauthorizedException("Could not extract 'oid' claim from JWT token"));

			// Check authorization - user can update if they are the same user OR have hr-advisor role
			if (!(existingUser.getMicrosoftEntraId().equals(currentUserEntraId) || SecurityUtils.hasHrAdvisorId())) {
				throw new UnauthorizedException("Not authorized to update user with id=[" + id + "]");
			}

			// Create the updated model after authorization checks
			UserUpdateModel updatedModel = new UserUpdateModel(
				id,
				userUpdate.userTypeId(),
				userUpdate.microsoftEntraId(),
				userUpdate.firstName(),
				userUpdate.middleName(),
				userUpdate.lastName(),
				userUpdate.initials(),
				userUpdate.personalRecordIdentifier(),
				userUpdate.businessPhone(),
				userUpdate.businessEmail(),
				userUpdate.languageId()
			);

			// Update the user
			final var updatedUser = userService.updateUserWithoutAuth(id, updatedModel);
			return ResponseEntity.ok(userModelMapper.toModel(updatedUser));
		} catch (ResourceNotFoundException | UnauthorizedException e) {
			// Convert both exceptions to 404 as per requirements
			throw new ResourceNotFoundException(e.getMessage());
		}
	}

}
