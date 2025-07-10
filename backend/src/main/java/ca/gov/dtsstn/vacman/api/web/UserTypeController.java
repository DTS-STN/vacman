package ca.gov.dtsstn.vacman.api.web;

import static org.apache.commons.lang3.StringUtils.isNotBlank;

import java.util.List;

import org.mapstruct.factory.Mappers;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import ca.gov.dtsstn.vacman.api.config.SpringDocConfig;
import ca.gov.dtsstn.vacman.api.service.UserTypeService;
import ca.gov.dtsstn.vacman.api.web.model.CollectionModel;
import ca.gov.dtsstn.vacman.api.web.model.UserTypeReadModel;
import ca.gov.dtsstn.vacman.api.web.model.mapper.UserTypeModelMapper;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;

@RestController
@Tag(name = "User Type")
@RequestMapping({ "/api/v1/user-type" })
public class UserTypeController {

	private final UserTypeModelMapper userTypeModelMapper = Mappers.getMapper(UserTypeModelMapper.class);

	private final UserTypeService userTypeService;

	public UserTypeController(UserTypeService userTypeService) {
		this.userTypeService = userTypeService;
	}

	@GetMapping
	@SecurityRequirement(name = SpringDocConfig.AZURE_AD)
	@Operation(summary = "Get all user types or filter by code.", description = "Returns a collection of all user types, or user types filtered by code.")
	public ResponseEntity<CollectionModel<UserTypeReadModel>> getUserTypes(
			@RequestParam(required = false)
			@Parameter(description = "User type code to filter by (e.g., 'ADMIN')") String code) {

		if (isNotBlank(code)) {
			return userTypeService.getUserTypeByCode(code)
				.map(userType -> ResponseEntity.ok(new CollectionModel<>(List.of(userTypeModelMapper.toModel(userType)))))
				.orElse(ResponseEntity.ok(new CollectionModel<>(List.of())));
		}

		CollectionModel<UserTypeReadModel> result = new CollectionModel<>(userTypeService.getAllUserTypes().stream()
			.map(userTypeModelMapper::toModel)
			.toList());

		return ResponseEntity.ok(result);
	}

}
