package ca.gov.dtsstn.vacman.api.web;

import static org.apache.commons.lang3.StringUtils.isNotBlank;

import java.util.List;

import org.mapstruct.factory.Mappers;
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
	@Operation(summary = "Get all work units or filter by code.", description = "Returns a collection of all work units or a specific work unit if code is provided.")
	public CollectionModel<WorkUnitReadModel> getWorkUnits(
			@RequestParam(required = false)
			@Parameter(description = "Work unit code to filter by") String code) {
		if (isNotBlank(code)) {
			return new CollectionModel<>(workUnitService.getWorkUnitByCode(code)
				.map(workUnitModelMapper::toModel)
				.map(List::of)
				.orElse(List.of()));
		}

		return new CollectionModel<>(workUnitService.getAllWorkUnits().stream()
			.map(workUnitModelMapper::toModel)
			.toList());
	}
}
