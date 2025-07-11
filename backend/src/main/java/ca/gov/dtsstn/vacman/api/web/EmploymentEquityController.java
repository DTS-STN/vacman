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
import ca.gov.dtsstn.vacman.api.service.EmploymentEquityService;
import ca.gov.dtsstn.vacman.api.web.model.CollectionModel;
import ca.gov.dtsstn.vacman.api.web.model.EmploymentEquityReadModel;
import ca.gov.dtsstn.vacman.api.web.model.mapper.EmploymentEquityModelMapper;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;

@RestController
@Tag(name = "Employment Equity")
@RequestMapping({ "/api/v1/employment-equity" })
public class EmploymentEquityController {

	private final EmploymentEquityModelMapper employmentEquityModelMapper = Mappers.getMapper(EmploymentEquityModelMapper.class);

	private final EmploymentEquityService employmentEquityService;

	public EmploymentEquityController(EmploymentEquityService employmentEquityService) {
		this.employmentEquityService = employmentEquityService;
	}

	@GetMapping
	@SecurityRequirement(name = SpringDocConfig.AZURE_AD)
	@Operation(summary = "Get all employment equity types or filter by code.", description = "Returns a collection of all employment equity types, or employment equity types filtered by code.")
	public ResponseEntity<CollectionModel<EmploymentEquityReadModel>> getEmploymentEquities(
			@RequestParam(required = false)
			@Parameter(description = "Employment equity code to filter by (e.g., 'WOMEN')") String code) {

		if (isNotBlank(code)) {
			return employmentEquityService.getEmploymentEquityByCode(code)
				.map(employmentEquity -> ResponseEntity.ok(new CollectionModel<>(List.of(employmentEquityModelMapper.toModel(employmentEquity)))))
				.orElse(ResponseEntity.ok(new CollectionModel<>(List.of())));
		}

		CollectionModel<EmploymentEquityReadModel> result = new CollectionModel<>(employmentEquityService.getAllEmploymentEquities().stream()
			.map(employmentEquityModelMapper::toModel)
			.toList());

		return ResponseEntity.ok(result);
	}

}
