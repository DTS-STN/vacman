package ca.gov.dtsstn.vacman.api.web;

import org.hibernate.validator.constraints.Range;
import org.mapstruct.factory.Mappers;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import ca.gov.dtsstn.vacman.api.config.SpringDocConfig;
import ca.gov.dtsstn.vacman.api.data.entity.UserEntity;
import ca.gov.dtsstn.vacman.api.service.UserService;
import ca.gov.dtsstn.vacman.api.web.model.UserCreateModel;
import ca.gov.dtsstn.vacman.api.web.model.UserReadModel;
import ca.gov.dtsstn.vacman.api.web.model.mapper.UserModelMapper;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;

@RestController
@Tag(name = "Users")
@RequestMapping({ "/api/v1/users" })
public class UsersController {

	private final UserModelMapper userModelMapper = Mappers.getMapper(UserModelMapper.class);

	private final UserService userService;

	public UsersController(UserService userService) {
		this.userService = userService;
	}

	@GetMapping
	@SecurityRequirement(name = SpringDocConfig.AZURE_AD)
	@Operation(summary = "Get users with pagination.", description = "Returns a paginated list of users.")
	public ResponseEntity<Page<UserReadModel>> getUsers(
			@RequestParam(defaultValue = "0")
			@Parameter(description = "Page number (0-based)")
			int page,

			@RequestParam(defaultValue = "20")
			@Range(min = 1, max = 100)
			@Parameter(description = "Page size (between 1 and 100)")
			int size) {
		Page<UserReadModel> result = userService.getUsers(PageRequest.of(page, size)).map(userModelMapper::toModel);
		return ResponseEntity.ok(result);
	}

	@PostMapping
	@Operation(summary = "Create a new user.")
	@SecurityRequirement(name = SpringDocConfig.AZURE_AD)
	public ResponseEntity<UserReadModel> createUser(@RequestBody @Valid UserCreateModel userCreate) {
		UserEntity savedUser = userService.createUser(userCreate);
		return ResponseEntity.ok(userModelMapper.toModel(savedUser));
	}


	@GetMapping("/{id}")
	@Operation(summary = "Get a user by ID.")
	@SecurityRequirement(name = SpringDocConfig.AZURE_AD)
	public ResponseEntity<UserReadModel> getUserById(@PathVariable Long id) {
		UserReadModel result = userService.getUserById(id)
			.map(userModelMapper::toModel)
			.orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User with ID '" + id + "' not found"));
		return ResponseEntity.ok(result);
	}
}
