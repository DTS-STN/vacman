package ca.gov.dtsstn.vacman.api.web;

import org.mapstruct.factory.Mappers;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import ca.gov.dtsstn.vacman.api.config.SpringDocConfig;
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

	private static final int DEFAULT_PAGE_SIZE = 2;

	public UsersController(UserService userService) {
		this.userService = userService;
	}

	@GetMapping
	@Operation(summary = "Get users with pagination.")
	@SecurityRequirement(name = SpringDocConfig.AZURE_AD)
	public Page<UserReadModel> getUsers(
			@Parameter(description = "Page number (0-based)") @RequestParam(defaultValue = "0") int page,
			@Parameter(description = "Page size") @RequestParam(defaultValue = "2") int size) {

		size = Math.min(size, DEFAULT_PAGE_SIZE);

		return userService.getUsers(PageRequest.of(page, size))
				.map(userModelMapper::toModel);
	}

	@PostMapping
	@Operation(summary = "Create a new user.")
	@SecurityRequirement(name = SpringDocConfig.AZURE_AD)
	public UserReadModel createUser(@RequestBody @Valid UserCreateModel user) {
		return userModelMapper.toModel(userService.createUser(userModelMapper.toEntity(user)));
	}

}
