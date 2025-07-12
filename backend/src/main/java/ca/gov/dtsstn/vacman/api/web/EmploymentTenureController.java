package ca.gov.dtsstn.vacman.api.web;

import static org.apache.commons.lang3.StringUtils.isNotBlank;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import ca.gov.dtsstn.vacman.api.config.SpringDocConfig;
import ca.gov.dtsstn.vacman.api.service.EmploymentTenureService;
import ca.gov.dtsstn.vacman.api.web.model.CollectionModel;
import ca.gov.dtsstn.vacman.api.web.model.EmploymentTenureReadModel;
import ca.gov.dtsstn.vacman.api.web.model.mapper.EmploymentTenureModelMapper;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;

@RestController
@Tag(name = "Employment Tenure")
@RequestMapping({ "/api/v1/employment-tenure" })
public class EmploymentTenureController {

	private final EmploymentTenureModelMapper employmentTenureModelMapper;

	private final EmploymentTenureService employmentTenureService;

	public EmploymentTenureController(EmploymentTenureService employmentTenureService, EmploymentTenureModelMapper employmentTenureModelMapper) {
		this.employmentTenureService = employmentTenureService;
		this.employmentTenureModelMapper = employmentTenureModelMapper;
	}

	@GetMapping
	@SecurityRequirement(name = SpringDocConfig.AZURE_AD)
	@Operation(summary = "Get all employment tenure types or filter by code.", description = "Returns a collection of all employment tenure types, or employment tenure types filtered by code.")
	public ResponseEntity<CollectionModel<EmploymentTenureReadModel>> getEmploymentTenures(
			@RequestParam(required = false)
			@Parameter(description = "Employment tenure code to filter by (e.g., 'PERM')") String code) {

		if (isNotBlank(code)) {
			return employmentTenureService.getEmploymentTenureByCode(code)
				.map(employmentTenure -> ResponseEntity.ok(new CollectionModel<>(List.of(employmentTenureModelMapper.toModel(employmentTenure)))))
				.orElse(ResponseEntity.ok(new CollectionModel<>(List.of())));
		}

		CollectionModel<EmploymentTenureReadModel> result = new CollectionModel<>(employmentTenureService.getAllEmploymentTenures().stream()
			.map(employmentTenureModelMapper::toModel)
			.toList());

		return ResponseEntity.ok(result);
	}

}
