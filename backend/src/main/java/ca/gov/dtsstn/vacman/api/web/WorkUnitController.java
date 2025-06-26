package ca.gov.dtsstn.vacman.api.web;

import static org.apache.commons.lang3.StringUtils.isNotBlank;

import java.util.List;

import org.hibernate.validator.constraints.Range;
import org.mapstruct.factory.Mappers;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import ca.gov.dtsstn.vacman.api.config.SpringDocConfig;
import ca.gov.dtsstn.vacman.api.service.WorkUnitService;
import ca.gov.dtsstn.vacman.api.web.model.CollectionModel;
import ca.gov.dtsstn.vacman.api.web.model.WorkUnitReadModel;
import ca.gov.dtsstn.vacman.api.web.model.mapper.WorkUnitModelMapper;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;

@RestController
@Tag(name = "Work Units")
@RequestMapping({ "/api/v1/work-units" })
public class WorkUnitController {

	private final WorkUnitModelMapper workUnitModelMapper = Mappers.getMapper(WorkUnitModelMapper.class);

	private final WorkUnitService workUnitService;

	public WorkUnitController(WorkUnitService workUnitService) {
		this.workUnitService = workUnitService;
	}

	@GetMapping
	@SecurityRequirement(name = SpringDocConfig.AZURE_AD)
	@Operation(summary = "Get work units with pagination or filter by code.", description = "Returns a paginated list of work units or a specific work unit if code is provided.")
	public ResponseEntity<?> getWorkUnits(
			@RequestParam(required = false)
			@Parameter(description = "Work unit code to filter by") String code,

			@RequestParam(defaultValue = "0")
			@Parameter(description = "Page number (0-based)")
			int page,

			@RequestParam(defaultValue = "20")
			@Range(min = 1, max = 100)
			@Parameter(description = "Page size (between 1 and 100)")
			int size) {
		if (isNotBlank(code)) {
			CollectionModel<WorkUnitReadModel> result = new CollectionModel<>(workUnitService.getWorkUnitByCode(code)
				.map(workUnitModelMapper::toModel)
				.map(List::of)
				.orElse(List.of()));
			return ResponseEntity.ok(result);
		}

		Page<WorkUnitReadModel> result = workUnitService.getWorkUnits(PageRequest.of(page, size))
			.map(workUnitModelMapper::toModel);
		return ResponseEntity.ok(result);
	}
}
