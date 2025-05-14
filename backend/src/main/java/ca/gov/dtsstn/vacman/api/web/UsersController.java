package ca.gov.dtsstn.vacman.api.web;

import java.util.List;
import java.util.UUID;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import ca.gov.dtsstn.vacman.api.data.entity.UserEntity;
import ca.gov.dtsstn.vacman.api.data.entity.UserEntityBuilder;
import ca.gov.dtsstn.vacman.api.service.UserService;
import ca.gov.dtsstn.vacman.api.web.model.CreateUserModel;

@RestController
@RequestMapping({ "/api/v1/users" })
public class UsersController {

	private final UserService userService;

	public UsersController(UserService userService) {
		this.userService = userService;
	}

	@GetMapping
	public List<UserEntity> getAllUsers() {
		return userService.getAllUsers();
	}

	@PostMapping
	public void createUser(@RequestBody CreateUserModel model) {
		userService.createUser(UserEntityBuilder.builder()
			.id(UUID.randomUUID().toString())
			.name(model.name())
			.isNew(true)
			.build());
	}

}
