package ca.gov.dtsstn.vacman.api.web;

import static org.apache.commons.lang3.StringUtils.isNotBlank;

import java.util.List;

import org.mapstruct.factory.Mappers;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
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
@Tag(name = "Employment Tenures")
@RequestMapping({ "/api/v1/employment-tenures" })
public class EmploymentTenureController {

	private final EmploymentTenureModelMapper employmentTenureModelMapper = Mappers.getMapper(EmploymentTenureModelMapper.class);

	private final EmploymentTenureService employmentTenureService;

	public EmploymentTenureController(EmploymentTenureService employmentTenureService) {
		this.employmentTenureService = employmentTenureService;
	}

	@GetMapping
	@SecurityRequirement(name = SpringDocConfig.AZURE_AD)
	@Operation(summary = "Get all employment tenures or filter by code.", description = "Returns a collection of all employment tenures, or employment tenures filtered by code.")
	public ResponseEntity<CollectionModel<EmploymentTenureReadModel>> getEmploymentTenures(
			@RequestParam(required = false)
			@Parameter(description = "Employment tenure code to filter by (e.g., 'INDETERMINATE')")
			String code) {
		if (isNotBlank(code)) {
			final var result = new CollectionModel<>(employmentTenureService.getEmploymentTenureByCode(code)
				.map(employmentTenureModelMapper::toModel)
				.map(List::of)
				.orElse(List.of()));
			return ResponseEntity.ok(result);
		}

		final var result = new CollectionModel<>(employmentTenureService.getAllEmploymentTenures().stream()
			.map(employmentTenureModelMapper::toModel)
			.toList());

		return ResponseEntity.ok(result);
	}

	@GetMapping("/{id}")
	@SecurityRequirement(name = SpringDocConfig.AZURE_AD)
	@Operation(summary = "Get an employment tenure by ID.", description = "Returns an employment tenure by its ID.")
	public ResponseEntity<EmploymentTenureReadModel> getEmploymentTenureById(
			@PathVariable
			@Parameter(description = "Employment tenure ID")
			Long id) {

		return employmentTenureService.getEmploymentTenureById(id)
			.map(employmentTenureModelMapper::toModel)
			.map(ResponseEntity::ok)
			.orElse(ResponseEntity.notFound().build());
	}

}