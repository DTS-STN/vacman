package ca.gov.dtsstn.vacman.api.web;

import static org.apache.commons.lang3.StringUtils.isNotBlank;

import java.util.List;

import org.mapstruct.factory.Mappers;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import ca.gov.dtsstn.vacman.api.config.SpringDocConfig;
import ca.gov.dtsstn.vacman.api.service.WfaStatusService;
import ca.gov.dtsstn.vacman.api.web.model.CollectionModel;
import ca.gov.dtsstn.vacman.api.web.model.WfaStatusReadModel;
import ca.gov.dtsstn.vacman.api.web.model.mapper.WfaStatusModelMapper;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;

@RestController
@Tag(name = "WFA Statuses")
@RequestMapping({ "/api/v1/wfa-statuses" })
public class WfaStatusController {

	private final WfaStatusModelMapper wfaStatusModelMapper = Mappers.getMapper(WfaStatusModelMapper.class);

	private final WfaStatusService wfaStatusService;

	public WfaStatusController(WfaStatusService wfaStatusService) {
		this.wfaStatusService = wfaStatusService;
	}

	@GetMapping
	@SecurityRequirement(name = SpringDocConfig.AZURE_AD)
	@Operation(summary = "Get all WFA statuses or filter by code.", description = "Returns a collection of all WFA statuses or a specific WFA status if code is provided.")
	public CollectionModel<WfaStatusReadModel> getAllWfaStatuses(
			@RequestParam(required = false)
			@Parameter(description = "WFA status code to filter by") String code) {
		if (isNotBlank(code)) {
			return new CollectionModel<>(wfaStatusService.getWfaStatusByCode(code)
				.map(wfaStatusModelMapper::toModel)
				.map(List::of)
				.orElse(List.of()));
		}

		return new CollectionModel<>(wfaStatusService.getAllWfaStatuses().stream()
			.map(wfaStatusModelMapper::toModel)
			.toList());
	}
}
