package ca.gov.dtsstn.vacman.api.web;

import org.mapstruct.factory.Mappers;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import ca.gov.dtsstn.vacman.api.service.UserService;
import ca.gov.dtsstn.vacman.api.web.model.UserCollectionModel;
import ca.gov.dtsstn.vacman.api.web.model.UserCreateModel;
import ca.gov.dtsstn.vacman.api.web.model.UserReadModel;
import ca.gov.dtsstn.vacman.api.web.model.mapper.UserModelMapper;
import io.swagger.v3.oas.annotations.Operation;
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
	@Operation(summary = "Get all users.")
	public UserCollectionModel getAllUsers() {
		final var users = userService.getAllUsers().stream()
			.map(userModelMapper::toModel)
			.toList();

		return new UserCollectionModel(users);
	}

	@PostMapping
	@Operation(summary = "Create a new user.")
	public UserReadModel createUser(@RequestBody @Valid UserCreateModel user) {
		return userModelMapper.toModel(userService.createUser(userModelMapper.toEntity(user)));
	}

}
