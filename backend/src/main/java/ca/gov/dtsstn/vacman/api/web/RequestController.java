package ca.gov.dtsstn.vacman.api.web;

import org.mapstruct.factory.Mappers;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import ca.gov.dtsstn.vacman.api.config.SpringDocConfig;
import ca.gov.dtsstn.vacman.api.data.entity.RequestEntity;
import ca.gov.dtsstn.vacman.api.service.RequestService;
import ca.gov.dtsstn.vacman.api.web.model.CollectionModel;
import ca.gov.dtsstn.vacman.api.web.model.RequestReadModel;
import ca.gov.dtsstn.vacman.api.web.model.mapper.RequestModelMapper;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;

@RestController
@Tag(name = "Requests")
@RequestMapping({ "/api/v1/requests" })
public class RequestController {

	private final RequestModelMapper requestModelMapper = Mappers.getMapper(RequestModelMapper.class);

	private final RequestService requestService;

	public RequestController(RequestService requestService) {
		this.requestService = requestService;
	}

	@GetMapping
	@SecurityRequirement(name = SpringDocConfig.AZURE_AD)
	@Operation(summary = "Get all requests", description = "Returns a collection of all requests with pagination support.")
	public ResponseEntity<CollectionModel<RequestReadModel>> getRequests(Pageable pageable) {
		Page<RequestEntity> requestPage = requestService.getRequests(pageable);

		CollectionModel<RequestReadModel> result = new CollectionModel<>(requestPage.getContent().stream()
			.map(requestModelMapper::toModel)
			.toList());

		return ResponseEntity.ok(result);
	}

	@GetMapping("/{id}")
	@SecurityRequirement(name = SpringDocConfig.AZURE_AD)
	@Operation(summary = "Get request by ID", description = "Returns a specific request by its ID.")
	public ResponseEntity<RequestReadModel> getRequestById(
			@PathVariable @Parameter(description = "Request ID") Long id) {

		return requestService.getRequestById(id)
			.map(request -> ResponseEntity.ok(requestModelMapper.toModel(request)))
			.orElse(ResponseEntity.notFound().build());
	}

	@PostMapping
	@SecurityRequirement(name = SpringDocConfig.AZURE_AD)
	@Operation(summary = "Create a new request", description = "Creates a new request.")
	public ResponseEntity<RequestReadModel> createRequest(@RequestBody RequestEntity request) {
		RequestEntity savedRequest = requestService.saveRequest(request);
		return ResponseEntity.ok(requestModelMapper.toModel(savedRequest));
	}

	@PutMapping("/{id}")
	@SecurityRequirement(name = SpringDocConfig.AZURE_AD)
	@Operation(summary = "Update request", description = "Updates an existing request.")
	public ResponseEntity<RequestReadModel> updateRequest(
			@PathVariable @Parameter(description = "Request ID") Long id,
			@RequestBody RequestEntity request) {

		return requestService.getRequestById(id)
			.map(existingRequest -> {
				request.setId(id);
				RequestEntity savedRequest = requestService.saveRequest(request);
				return ResponseEntity.ok(requestModelMapper.toModel(savedRequest));
			})
			.orElse(ResponseEntity.notFound().build());
	}

	@DeleteMapping("/{id}")
	@SecurityRequirement(name = SpringDocConfig.AZURE_AD)
	@Operation(summary = "Delete request", description = "Deletes a request by its ID.")
	public ResponseEntity<Void> deleteRequest(
			@PathVariable @Parameter(description = "Request ID") Long id) {

		if (requestService.getRequestById(id).isPresent()) {
			requestService.deleteRequest(id);
			return ResponseEntity.noContent().build();
		}
		return ResponseEntity.notFound().build();
	}

}
