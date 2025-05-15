package ca.gov.dtsstn.vacman.api.web;

import org.mapstruct.factory.Mappers;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import ca.gov.dtsstn.vacman.api.service.UserService;
import ca.gov.dtsstn.vacman.api.web.model.UserCreateModel;
import ca.gov.dtsstn.vacman.api.web.model.UserModelMapper;
import ca.gov.dtsstn.vacman.api.web.model.UsersModel;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;

@RestController
@RequestMapping({ "/api/v1/users" })
@Tag(name = "Users")
public class UsersController {

	private final UserModelMapper userModelMapper = Mappers.getMapper(UserModelMapper.class);
	private final UserService userService;

	public UsersController(UserService userService) {
		this.userService = userService;
	}

	@GetMapping
	@Operation(summary = "Get all users.")
	public UsersModel getAllUsers() {
		return new UsersModel(userModelMapper.toModels(userService.getAllUsers()));
	}

	@PostMapping
	@Operation(summary = "Create a new user.")
	public void createUser(@RequestBody @Valid UserCreateModel user) {
		userService.createUser(userModelMapper.toEntity(user));
	}

}
