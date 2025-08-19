package ca.gov.dtsstn.vacman.api.web;

import ca.gov.dtsstn.vacman.api.web.model.*;
import org.mapstruct.factory.Mappers;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springdoc.core.annotations.ParameterObject;
import org.springframework.context.annotation.DependsOn;
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
import ca.gov.dtsstn.vacman.api.web.model.mapper.UserModelMapper;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;

import java.util.Optional;

import static ca.gov.dtsstn.vacman.api.web.exception.ResourceNotFoundException.asResourceNotFoundException;
import static ca.gov.dtsstn.vacman.api.web.exception.ResourceNotFoundException.asUserResourceNotFoundException;
import static ca.gov.dtsstn.vacman.api.web.exception.UnauthorizedException.asEntraIdUnauthorizedException;

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
				.orElseThrow(asEntraIdUnauthorizedException());

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
				.orElseThrow(asEntraIdUnauthorizedException());

		log.debug("Fetching current user with microsoftEntraId=[{}]", entraId);

		final var user = userService.getUserByMicrosoftEntraId(entraId)
				.map(userModelMapper::toModel)
				.orElseThrow(ResourceNotFoundException.asUserResourceNotFoundException("microsoftEntraId", entraId));

		log.debug("Found current user: [{}]", user);

		return ResponseEntity.ok(user);
	}

	@GetMapping
	@PreAuthorize("hasAuthority('hr-advisor') || (isAuthenticated() && #userType == 'hr-advisor')")
	@SecurityRequirement(name = SpringDocConfig.AZURE_AD)
	@Operation(summary = "Get users with pagination.", description = "Returns a paginated list of users.")
	public ResponseEntity<PagedModel<UserReadModel>> getUsers(
			@ParameterObject Pageable pageable,

			@RequestParam(name = "user-type", required = false)
			@Parameter(description = "Filter by user type.", example = "hr-advisor")
			String userType) {
		final var users = "hr-advisor".equals(userType)
			? userService.getHrAdvisors(pageable).map(userModelMapper::toModel)
			: userService.getUsers(pageable).map(userModelMapper::toModel);

		return ResponseEntity.ok(new PagedModel<>(users));
	}

	@GetMapping("/{id}")
	@Operation(summary = "Get a user by ID.")
	@SecurityRequirement(name = SpringDocConfig.AZURE_AD)
	@PreAuthorize("hasAuthority('hr-advisor') || @securityManager.canAccessUser(#id)")
	public ResponseEntity<UserReadModel> getUserById(@PathVariable Long id) {
		final var result = userService.getUserById(id)
				.map(userModelMapper::toModel)
				.orElseThrow(asResourceNotFoundException("user", id));

		return ResponseEntity.ok(result);
	}

	@PatchMapping("/{id}")
	@Operation(summary = "Update an existing user.")
	@SecurityRequirement(name = SpringDocConfig.AZURE_AD)
	@PreAuthorize("hasAuthority('hr-advisor') || @securityManager.canAccessUser(#id)")
	public ResponseEntity<UserReadModel> updateUser(@PathVariable long id, @RequestBody @Valid UserPatchModel updates) {
		userService.getUserById(id).orElseThrow(asResourceNotFoundException("user", id));
		final var updatedUser = userService.updateUser(id, userModelMapper.toEntity(updates));
		return ResponseEntity.ok(userModelMapper.toModel(updatedUser));
	}

	@PutMapping("/{id}")
	@Operation(summary = "Overwrite an existing user.")
	@SecurityRequirement(name = SpringDocConfig.AZURE_AD)
	@PreAuthorize("hasAuthority('hr-advisor') || @securityManager.canAccessUser(#id)")
	public ResponseEntity<UserReadModel> updateUser(@PathVariable Long id, @RequestBody @Valid UserPatchModel userUpdate) {
		userService.getUserById(id).orElseThrow(asResourceNotFoundException("user", id));
		final var updatedUser = userService.overwriteUser(id, userModelMapper.toEntity(userUpdate));
		return ResponseEntity.ok(userModelMapper.toModel(updatedUser));
	}

	@PostMapping("/find-or-create")
	@Operation(summary = "Using an email, search for an existing user or create a new user. The email must be associated with an existing Microsoft Entra user.")
	@SecurityRequirement(name = SpringDocConfig.AZURE_AD)
	public ResponseEntity<UserReadModel> findOrCreateUser(@Valid @RequestBody FindOrCreateModel findOrCreateRequest) {
		final var graphUser = msGraphService.getUserByEmail(findOrCreateRequest.getBusinessEmail())
				.orElseThrow(asUserResourceNotFoundException("businessEmail", findOrCreateRequest.getBusinessEmail()));

		return ResponseEntity.ok(userService.getUserByMicrosoftEntraId(graphUser.id())
				.or(() -> Optional.ofNullable(userService.createUser(userModelMapper.toEntity(graphUser), 0)))
				.map(userModelMapper::toModel)
				.orElseThrow(() -> new ResourceConflictException("Could not find or create user with email=[" + findOrCreateRequest.getBusinessEmail() + "]")));
	}

}
