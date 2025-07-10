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
import ca.gov.dtsstn.vacman.api.service.PriorityLevelService;
import ca.gov.dtsstn.vacman.api.web.model.CollectionModel;
import ca.gov.dtsstn.vacman.api.web.model.PriorityLevelReadModel;
import ca.gov.dtsstn.vacman.api.web.model.mapper.PriorityLevelModelMapper;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;

@RestController
@Tag(name = "Priority Level")
@RequestMapping({ "/api/v1/priority-level" })
public class PriorityLevelController {

	private final PriorityLevelModelMapper priorityLevelModelMapper = Mappers.getMapper(PriorityLevelModelMapper.class);

	private final PriorityLevelService priorityLevelService;

	public PriorityLevelController(PriorityLevelService priorityLevelService) {
		this.priorityLevelService = priorityLevelService;
	}

	@GetMapping
	@SecurityRequirement(name = SpringDocConfig.AZURE_AD)
	@Operation(summary = "Get all priority levels or filter by code.", description = "Returns a collection of all priority levels, or priority levels filtered by code.")
	public ResponseEntity<CollectionModel<PriorityLevelReadModel>> getPriorityLevels(
			@RequestParam(required = false)
			@Parameter(description = "Priority level code to filter by (e.g., 'HIGH')") String code) {

		if (isNotBlank(code)) {
			return priorityLevelService.getPriorityLevelByCode(code)
				.map(priorityLevel -> ResponseEntity.ok(new CollectionModel<>(List.of(priorityLevelModelMapper.toModel(priorityLevel)))))
				.orElse(ResponseEntity.ok(new CollectionModel<>(List.of())));
		}

		CollectionModel<PriorityLevelReadModel> result = new CollectionModel<>(priorityLevelService.getAllPriorityLevels().stream()
			.map(priorityLevelModelMapper::toModel)
			.toList());

		return ResponseEntity.ok(result);
	}

}
