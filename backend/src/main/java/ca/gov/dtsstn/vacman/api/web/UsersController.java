package ca.gov.dtsstn.vacman.api.web;

import static ca.gov.dtsstn.vacman.api.data.entity.AbstractCodeEntity.byCode;
import static ca.gov.dtsstn.vacman.api.web.exception.ResourceNotFoundException.asResourceNotFoundException;
import static ca.gov.dtsstn.vacman.api.web.exception.UnauthorizedException.asEntraIdUnauthorizedException;

import java.util.Optional;

import org.mapstruct.factory.Mappers;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springdoc.core.annotations.ParameterObject;
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
import org.springframework.web.bind.annotation.RestController;

import ca.gov.dtsstn.vacman.api.config.SpringDocConfig;
import ca.gov.dtsstn.vacman.api.config.properties.LookupCodes;
import ca.gov.dtsstn.vacman.api.config.properties.LookupCodes.UserTypes;
import ca.gov.dtsstn.vacman.api.data.entity.UserEntity;
import ca.gov.dtsstn.vacman.api.data.entity.UserTypeEntity;
import ca.gov.dtsstn.vacman.api.security.SecurityUtils;
import ca.gov.dtsstn.vacman.api.service.CodeService;
import ca.gov.dtsstn.vacman.api.service.MSGraphService;
import ca.gov.dtsstn.vacman.api.service.UserService;
import ca.gov.dtsstn.vacman.api.web.exception.ResourceConflictException;
import ca.gov.dtsstn.vacman.api.web.exception.ResourceNotFoundException;
import ca.gov.dtsstn.vacman.api.web.model.UserCreateModel;
import ca.gov.dtsstn.vacman.api.web.model.UserPatchModel;
import ca.gov.dtsstn.vacman.api.web.model.UserReadFilterModel;
import ca.gov.dtsstn.vacman.api.web.model.UserReadModel;
import ca.gov.dtsstn.vacman.api.web.model.mapper.UserModelMapper;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;

@RestController
@Tag(name = "Users")
@ApiResponses.InternalServerError
@RequestMapping({ "/api/v1/users" })
@SecurityRequirement(name = SpringDocConfig.AZURE_AD)
public class UsersController {

	private static final Logger log = LoggerFactory.getLogger(UsersController.class);

	private final CodeService codeService;

	private final MSGraphService msGraphService;

	private final UserModelMapper userModelMapper = Mappers.getMapper(UserModelMapper.class);

	private final UserService userService;

	private final UserTypes userTypes;

	public UsersController(
			CodeService codeService,
			LookupCodes lookupCodes,
			MSGraphService msGraphService,
			UserService userService) {
		this.codeService = codeService;
		this.msGraphService = msGraphService;
		this.userService = userService;
		this.userTypes = lookupCodes.userTypes();
	}

	@ApiResponses.Ok
	@PostMapping({ "/me" })
	@ApiResponses.BadRequestError
	@ApiResponses.AccessDeniedError
	@ApiResponses.AuthenticationError
	@PreAuthorize("isAuthenticated()")
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

	@ApiResponses.Ok
	@GetMapping({ "/me" })
	@ApiResponses.AccessDeniedError
	@ApiResponses.AuthenticationError
	@PreAuthorize("isAuthenticated()")
	@Operation(summary = "Get the current user.")
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
	@ApiResponses.Ok
	@ApiResponses.AccessDeniedError
	@ApiResponses.AuthenticationError
	@Operation(summary = "Get users with pagination.")
	@PreAuthorize("hasAuthority('hr-advisor') || (isAuthenticated() && #userType == 'hr-advisor')")
	public ResponseEntity<PagedModel<UserReadModel>> getUsers(@ParameterObject Pageable pageable, @ParameterObject UserReadFilterModel filter) {
		final var byHrAdvisorFilter = Optional.ofNullable(filter)
			.map(UserReadFilterModel::userType)
			.filter("hr-advisor"::equals)
			.isPresent();

		final var emailFilter = Optional.ofNullable(filter)
			.map(UserReadFilterModel::email)
			.orElse(null);

		final var exampleFilter = UserEntity.builder()
			.businessEmailAddress(emailFilter)
			.userType(UserTypeEntity.builder()
				.id(byHrAdvisorFilter ? getHrAdvisorTypeId() : null)
				.build())
			.build();

		final var users = userService.findUsers(exampleFilter, pageable)
			.map(userModelMapper::toModel);

		//
		// TODO ::: GjB ::: if an email filter was provided but no users were found...
		//                  create a user with that email address and return it
		//

		return ResponseEntity.ok(new PagedModel<>(users));
	}

	@ApiResponses.Ok
	@GetMapping({ "/{id}" })
	@ApiResponses.AccessDeniedError
	@ApiResponses.AuthenticationError
	@ApiResponses.ResourceNotFoundError
	@Operation(summary = "Get a user by ID.")
	@PreAuthorize("hasAuthority('hr-advisor') || hasPermission(#id, 'USER', 'READ')")
	public ResponseEntity<UserReadModel> getUserById(@PathVariable Long id) {
		final var result = userService.getUserById(id)
			.map(userModelMapper::toModel)
			.orElseThrow(asResourceNotFoundException("user", id));

		return ResponseEntity.ok(result);
	}

	@ApiResponses.Ok
	@PatchMapping({ "/{id}" })
	@ApiResponses.BadRequestError
	@ApiResponses.AccessDeniedError
	@ApiResponses.AuthenticationError
	@ApiResponses.ResourceNotFoundError
	@Operation(summary = "Update an existing user.")
	@PreAuthorize("hasAuthority('hr-advisor') || hasPermission(#id, 'USER', 'UPDATE')")
	public ResponseEntity<UserReadModel> updateUser(@PathVariable long id, @RequestBody @Valid UserPatchModel updates) {
		userService.getUserById(id).orElseThrow(asResourceNotFoundException("user", id));
		final var updatedUser = userService.updateUser(id, userModelMapper.toEntity(updates));
		return ResponseEntity.ok(userModelMapper.toModel(updatedUser));
	}

	@ApiResponses.Ok
	@PutMapping({ "/{id}" })
	@ApiResponses.BadRequestError
	@ApiResponses.AccessDeniedError
	@ApiResponses.AuthenticationError
	@ApiResponses.ResourceNotFoundError
	@Operation(summary = "Overwrite an existing user.")
	@PreAuthorize("hasAuthority('hr-advisor') || hasPermission(#id, 'USER', 'UPDATE')")
	public ResponseEntity<UserReadModel> updateUser(@PathVariable Long id, @RequestBody @Valid UserPatchModel userUpdate) {
		userService.getUserById(id).orElseThrow(asResourceNotFoundException("user", id));
		final var updatedUser = userService.overwriteUser(id, userModelMapper.toEntity(userUpdate));
		return ResponseEntity.ok(userModelMapper.toModel(updatedUser));
	}

	private long getHrAdvisorTypeId() {
		return codeService.getUserTypes(Pageable.unpaged())
		.filter(byCode(userTypes.hrAdvisor())).stream().findFirst()
		.map(UserTypeEntity::getId)
		.orElseThrow();
	}

}
