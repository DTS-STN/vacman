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
import ca.gov.dtsstn.vacman.api.service.RequestStatusService;
import ca.gov.dtsstn.vacman.api.web.model.CollectionModel;
import ca.gov.dtsstn.vacman.api.web.model.RequestStatusReadModel;
import ca.gov.dtsstn.vacman.api.web.model.mapper.RequestStatusModelMapper;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;

@RestController
@Tag(name = "Request Status")
@RequestMapping({ "/api/v1/request-status" })
public class RequestStatusController {

	private final RequestStatusModelMapper requestStatusModelMapper = Mappers.getMapper(RequestStatusModelMapper.class);

	private final RequestStatusService requestStatusService;

	public RequestStatusController(RequestStatusService requestStatusService) {
		this.requestStatusService = requestStatusService;
	}

	@GetMapping
	@SecurityRequirement(name = SpringDocConfig.AZURE_AD)
	@Operation(summary = "Get all request statuses or filter by code.", description = "Returns a collection of all request statuses, or request statuses filtered by code.")
	public ResponseEntity<CollectionModel<RequestStatusReadModel>> getRequestStatuses(
			@RequestParam(required = false)
			@Parameter(description = "Request status code to filter by (e.g., 'OPEN')") String code) {

		if (isNotBlank(code)) {
			return requestStatusService.getRequestStatusByCode(code)
				.map(requestStatus -> ResponseEntity.ok(new CollectionModel<>(List.of(requestStatusModelMapper.toModel(requestStatus)))))
				.orElse(ResponseEntity.ok(new CollectionModel<>(List.of())));
		}

		CollectionModel<RequestStatusReadModel> result = new CollectionModel<>(requestStatusService.getAllRequestStatuses().stream()
			.map(requestStatusModelMapper::toModel)
			.toList());

		return ResponseEntity.ok(result);
	}

}
