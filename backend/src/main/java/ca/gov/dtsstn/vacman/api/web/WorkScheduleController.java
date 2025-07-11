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
import ca.gov.dtsstn.vacman.api.service.WorkScheduleService;
import ca.gov.dtsstn.vacman.api.web.model.CollectionModel;
import ca.gov.dtsstn.vacman.api.web.model.WorkScheduleReadModel;
import ca.gov.dtsstn.vacman.api.web.model.mapper.WorkScheduleModelMapper;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;

@RestController
@Tag(name = "Work Schedule")
@RequestMapping({ "/api/v1/work-schedule" })
public class WorkScheduleController {

	private final WorkScheduleModelMapper workScheduleModelMapper = Mappers.getMapper(WorkScheduleModelMapper.class);

	private final WorkScheduleService workScheduleService;

	public WorkScheduleController(WorkScheduleService workScheduleService) {
		this.workScheduleService = workScheduleService;
	}

	@GetMapping
	@SecurityRequirement(name = SpringDocConfig.AZURE_AD)
	@Operation(summary = "Get all work schedule types or filter by code.", description = "Returns a collection of all work schedule types, or work schedule types filtered by code.")
	public ResponseEntity<CollectionModel<WorkScheduleReadModel>> getWorkSchedules(
			@RequestParam(required = false)
			@Parameter(description = "Work schedule code to filter by (e.g., 'FT375')") String code) {

		if (isNotBlank(code)) {
			return workScheduleService.getWorkScheduleByCode(code)
				.map(workSchedule -> ResponseEntity.ok(new CollectionModel<>(List.of(workScheduleModelMapper.toModel(workSchedule)))))
				.orElse(ResponseEntity.ok(new CollectionModel<>(List.of())));
		}

		CollectionModel<WorkScheduleReadModel> result = new CollectionModel<>(workScheduleService.getAllWorkSchedules().stream()
			.map(workScheduleModelMapper::toModel)
			.toList());

		return ResponseEntity.ok(result);
	}

}
