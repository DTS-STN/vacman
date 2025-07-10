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
import ca.gov.dtsstn.vacman.api.service.SecurityClearanceService;
import ca.gov.dtsstn.vacman.api.web.model.CollectionModel;
import ca.gov.dtsstn.vacman.api.web.model.SecurityClearanceReadModel;
import ca.gov.dtsstn.vacman.api.web.model.mapper.SecurityClearanceModelMapper;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;

@RestController
@Tag(name = "Security Clearance")
@RequestMapping({ "/api/v1/security-clearance" })
public class SecurityClearanceController {

	private final SecurityClearanceModelMapper securityClearanceModelMapper = Mappers.getMapper(SecurityClearanceModelMapper.class);

	private final SecurityClearanceService securityClearanceService;

	public SecurityClearanceController(SecurityClearanceService securityClearanceService) {
		this.securityClearanceService = securityClearanceService;
	}

	@GetMapping
	@SecurityRequirement(name = SpringDocConfig.AZURE_AD)
	@Operation(summary = "Get all security clearances or filter by code.", description = "Returns a collection of all security clearances, or security clearances filtered by code.")
	public ResponseEntity<CollectionModel<SecurityClearanceReadModel>> getSecurityClearances(
			@RequestParam(required = false)
			@Parameter(description = "Security clearance code to filter by (e.g., 'SECRET')") String code) {

		if (isNotBlank(code)) {
			return securityClearanceService.getSecurityClearanceByCode(code)
				.map(securityClearance -> ResponseEntity.ok(new CollectionModel<>(List.of(securityClearanceModelMapper.toModel(securityClearance)))))
				.orElse(ResponseEntity.ok(new CollectionModel<>(List.of())));
		}

		CollectionModel<SecurityClearanceReadModel> result = new CollectionModel<>(securityClearanceService.getAllSecurityClearances().stream()
			.map(securityClearanceModelMapper::toModel)
			.toList());

		return ResponseEntity.ok(result);
	}

}
