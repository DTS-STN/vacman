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
import ca.gov.dtsstn.vacman.api.service.EmploymentOpportunityService;
import ca.gov.dtsstn.vacman.api.web.model.CollectionModel;
import ca.gov.dtsstn.vacman.api.web.model.EmploymentOpportunityReadModel;
import ca.gov.dtsstn.vacman.api.web.model.mapper.EmploymentOpportunityModelMapper;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;

@RestController
@Tag(name = "Employment Opportunity")
@RequestMapping({ "/api/v1/employment-opportunity" })
public class EmploymentOpportunityController {

	private final EmploymentOpportunityModelMapper employmentOpportunityModelMapper = Mappers.getMapper(EmploymentOpportunityModelMapper.class);

	private final EmploymentOpportunityService employmentOpportunityService;

	public EmploymentOpportunityController(EmploymentOpportunityService employmentOpportunityService) {
		this.employmentOpportunityService = employmentOpportunityService;
	}

	@GetMapping
	@SecurityRequirement(name = SpringDocConfig.AZURE_AD)
	@Operation(summary = "Get all employment opportunity types or filter by code.", description = "Returns a collection of all employment opportunity types, or employment opportunity types filtered by code.")
	public ResponseEntity<CollectionModel<EmploymentOpportunityReadModel>> getEmploymentOpportunities(
			@RequestParam(required = false)
			@Parameter(description = "Employment opportunity code to filter by (e.g., 'CASUAL')") String code) {

		if (isNotBlank(code)) {
			return employmentOpportunityService.getEmploymentOpportunityByCode(code)
				.map(employmentOpportunity -> ResponseEntity.ok(new CollectionModel<>(List.of(employmentOpportunityModelMapper.toModel(employmentOpportunity)))))
				.orElse(ResponseEntity.ok(new CollectionModel<>(List.of())));
		}

		CollectionModel<EmploymentOpportunityReadModel> result = new CollectionModel<>(employmentOpportunityService.getAllEmploymentOpportunities().stream()
			.map(employmentOpportunityModelMapper::toModel)
			.toList());

		return ResponseEntity.ok(result);
	}

}
