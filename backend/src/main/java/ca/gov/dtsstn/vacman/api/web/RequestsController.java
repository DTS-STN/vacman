package ca.gov.dtsstn.vacman.api.web;

import static ca.gov.dtsstn.vacman.api.web.exception.ResourceNotFoundException.asResourceNotFoundException;
import static ca.gov.dtsstn.vacman.api.web.exception.ResourceNotFoundException.asUserResourceNotFoundException;
import static ca.gov.dtsstn.vacman.api.web.exception.UnauthorizedException.asEntraIdUnauthorizedException;
import static ca.gov.dtsstn.vacman.api.web.model.CollectionModel.toCollectionModel;

import org.mapstruct.factory.Mappers;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springdoc.core.annotations.ParameterObject;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PagedModel;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import ca.gov.dtsstn.vacman.api.config.SpringDocConfig;
import ca.gov.dtsstn.vacman.api.security.SecurityUtils;
import ca.gov.dtsstn.vacman.api.service.ProfileService;
import ca.gov.dtsstn.vacman.api.service.RequestService;
import ca.gov.dtsstn.vacman.api.service.UserService;
import ca.gov.dtsstn.vacman.api.web.model.CollectionModel;
import ca.gov.dtsstn.vacman.api.web.model.ProfileReadModel;
import ca.gov.dtsstn.vacman.api.web.model.RequestReadModel;
import ca.gov.dtsstn.vacman.api.web.model.RequestStatusUpdateModel;
import ca.gov.dtsstn.vacman.api.web.model.RequestUpdateModel;
import ca.gov.dtsstn.vacman.api.web.model.mapper.RequestModelMapper;
import ca.gov.dtsstn.vacman.api.web.validator.ValidHrAdvisorParam;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;

@RestController
@ApiResponses.AccessDeniedError
@ApiResponses.AuthenticationError
@ApiResponses.InternalServerError
@RequestMapping({ "/api/v1/requests" })
@SecurityRequirement(name = SpringDocConfig.AZURE_AD)
@ConditionalOnProperty(name = { "application.requests.enabled" }) // TODO ::: GjB ::: remove once live in prod
@Tag(name = "Requests", description = "Hiring manager requests for departmental clearance.")
public class RequestsController {

	private static final Logger log = LoggerFactory.getLogger(RequestsController.class);

	private final RequestModelMapper requestModelMapper = Mappers.getMapper(RequestModelMapper.class);

	private final RequestService requestService;

	private final UserService userService;

	public RequestsController(RequestService requestService, UserService userService, ProfileService profileService) {
		this.requestService = requestService;
		this.userService = userService;
	}

	@GetMapping
	@ApiResponses.Ok
	@ApiResponses.BadRequestError
	@PreAuthorize("hasAuthority('hr-advisor')")
	@Operation(summary = "Get hiring requests with pagination.")
	public ResponseEntity<PagedModel<RequestReadModel>> getAllRequests(
			@ParameterObject Pageable pageable,
			@RequestParam(name = "hr-advisor", required = false) @ValidHrAdvisorParam String hrAdvisorParam) {

		Long hrAdvisorId = null;

		if (hrAdvisorParam != null) {
			if ("me".equalsIgnoreCase(hrAdvisorParam)) {
				final var entraId = SecurityUtils.getCurrentUserEntraId()
					.orElseThrow(asEntraIdUnauthorizedException());

				final var currentUser = userService.getUserByMicrosoftEntraId(entraId)
					.orElseThrow(asUserResourceNotFoundException("microsoftEntraId", entraId));

				hrAdvisorId = currentUser.getId();
			} else {
				hrAdvisorId = Long.parseLong(hrAdvisorParam);
			}
		}

		final var requests = requestService.getAllRequests(pageable, hrAdvisorId);

		final var requestModels = requests.map(requestModelMapper::toModel);

		return ResponseEntity.ok(new PagedModel<>(requestModels));
	}

	@ApiResponses.Ok
	@GetMapping({ "/me" })
	@PreAuthorize("isAuthenticated()")
	@ApiResponses.ResourceNotFoundError
	@Operation(summary = "Get all hiring requests for the current user.")
	public ResponseEntity<CollectionModel<RequestReadModel>> getCurrentUserRequests() {
		final var entraId = SecurityUtils.getCurrentUserEntraId()
			.orElseThrow(asEntraIdUnauthorizedException());

		final var user = userService.getUserByMicrosoftEntraId(entraId)
			.orElseThrow(asUserResourceNotFoundException("microsoftEntraId", entraId));

		final var requests = requestService.getAllRequestsAssociatedWithUser(user.getId()).stream()
			.map(requestModelMapper::toModel)
			.collect(toCollectionModel());

		return ResponseEntity.ok(requests);
	}

	@ApiResponses.Created
	@PostMapping({ "/me" })
	@PreAuthorize("isAuthenticated()")
	@ApiResponses.ResourceNotFoundError
	@Operation(summary = "Create a new hiring request for the current user and return their profile.")
	public ResponseEntity<RequestReadModel> createCurrentUserRequest() {
		log.info("Received request to create new request");

		final var entraId = SecurityUtils.getCurrentUserEntraId()
			.orElseThrow(asEntraIdUnauthorizedException());

		final var currentUser = userService.getUserByMicrosoftEntraId(entraId)
			.orElseThrow(asUserResourceNotFoundException("microsoftEntraId", entraId));

		final var request = requestService.createRequest(currentUser);

		final var location = ServletUriComponentsBuilder.fromCurrentContextPath()
			.path("/api/v1/requests/{id}")
			.buildAndExpand(request.getId()).toUri();

		return ResponseEntity.created(location).body(requestModelMapper.toModel(request));
	}

	@ApiResponses.NoContent
	@DeleteMapping({ "/{id}" })
	@ApiResponses.BadRequestError
	@ApiResponses.ResourceNotFoundError
	@Operation(summary = "Delete a request by ID.")
	@PreAuthorize("hasAuthority('hr-advisor') || hasPermission(#id, 'REQUEST', 'DELETE')")
	public ResponseEntity<Void> deleteRequestById(@PathVariable Long id) {
		log.info("Received request to delete request; ID: [{}]", id);

		requestService.deleteRequest(id);

		return ResponseEntity.noContent().build();
	}

	@ApiResponses.Ok
	@GetMapping({ "/{id}" })
	@ApiResponses.BadRequestError
	@ApiResponses.ResourceNotFoundError
	@Operation(summary = "Get a request by ID.")
	@PreAuthorize("hasAuthority('hr-advisor') || hasPermission(#id, 'REQUEST', 'READ')")
	public ResponseEntity<RequestReadModel> getRequestById(@PathVariable Long id) {
		final var request = requestService.getRequestById(id)
			.map(requestModelMapper::toModel)
			.orElseThrow(asResourceNotFoundException("request", id));

		return ResponseEntity.ok(request);
	}


	@ApiResponses.Ok
	@PutMapping({ "/{id}" })
	@ApiResponses.BadRequestError
	@ApiResponses.ResourceNotFoundError
	@ApiResponses.UnprocessableEntityError
	@Operation(summary = "Update a request by ID.")
	@PreAuthorize("hasAuthority('hr-advisor') || hasPermission(#id, 'REQUEST', 'UPDATE')")
	public ResponseEntity<RequestReadModel> updateRequest(@PathVariable Long id, @Valid @RequestBody RequestUpdateModel updateModel) {
		log.info("Received request to update request; ID: [{}]", id);

		final var request = requestService.getRequestById(id)
			.orElseThrow(asResourceNotFoundException("request", id));

		log.trace("Found request: [{}]", request);

		final var preparedEntity = requestService.prepareRequestForUpdate(updateModel, request);

		final var updatedEntity = requestService.updateRequest(preparedEntity);

		return ResponseEntity.ok(requestModelMapper.toModel(updatedEntity));
	}

	@ApiResponses.Ok
	@ApiResponses.BadRequestError
	@PutMapping({ "/{id}/status" })
	@ApiResponses.ResourceNotFoundError
	@ApiResponses.UnprocessableEntityError
	@Operation(summary = "Update the status of a request.")
	@PreAuthorize("hasAuthority('hr-advisor') || hasPermission(#id, 'REQUEST', 'UPDATE')")
	public ResponseEntity<RequestReadModel> updateRequestStatus(@PathVariable Long id, @Valid @RequestBody RequestStatusUpdateModel statusUpdate) {
		log.info("Received request to update request status; ID: [{}], Event: [{}]", 
				id, statusUpdate.eventType());

		final var request = requestService.getRequestById(id)
			.orElseThrow(asResourceNotFoundException("request", id));

		log.trace("Found request: [{}]", request);

		final var updatedEntity = requestService.updateRequestStatus(request, statusUpdate.eventType());

		return ResponseEntity.ok(requestModelMapper.toModel(updatedEntity));
	}

	//
	//
	// --- /requests/.../matches endpoints
	//
	//

	@ApiResponses.Ok
	@ApiResponses.BadRequestError
	@GetMapping({ "/{id}/matches" })
	@ApiResponses.ResourceNotFoundError
	@Operation(summary = "Get all matches for a request.")
	@PreAuthorize("hasAuthority('hr-advisor') || hasPermission(#id, 'REQUEST', 'READ')")
	public ResponseEntity<CollectionModel<Object>> getAllRequestMatches(@PathVariable Long id) {
		throw new UnsupportedOperationException("not yet implemented");
	}

	@ApiResponses.Ok
	@ApiResponses.BadRequestError
	@ApiResponses.ResourceNotFoundError
	@GetMapping({ "/{id}/matches/{matchId}" })
	@Operation(summary = "Get a specific match for a request.")
	@PreAuthorize("hasAuthority('hr-advisor') || hasPermission(#id, 'REQUEST', 'READ')")
	public ResponseEntity<Object> getRequestMatchById(@PathVariable Long id, @PathVariable Long matchId) {
		throw new UnsupportedOperationException("not yet implemented");
	}

	@ApiResponses.Ok
	@ApiResponses.BadRequestError
	@ApiResponses.ResourceNotFoundError
	@ApiResponses.UnprocessableEntityError
	@PutMapping({ "/{id}/matches/{matchId}/status" })
	@Operation(summary = "Update the status of a request match.")
	@PreAuthorize("hasAuthority('hr-advisor') || hasPermission(#id, 'REQUEST', 'UPDATE')")
	public ResponseEntity<Object> updateRequestMatchStatus(@PathVariable Long id, @PathVariable Long matchId, @Valid @RequestBody Object statusUpdate) {
		throw new UnsupportedOperationException("not yet implemented");
	}

	//
	//
	// --- /requests/.../profiles endpoints
	//
	//

	@ApiResponses.Ok
	@ApiResponses.BadRequestError
	@GetMapping({ "/{id}/profiles" })
	@ApiResponses.ResourceNotFoundError
	@Operation(summary = "Get all candidate profiles for a request.")
	@PreAuthorize("hasAuthority('hr-advisor') || hasPermission(#id, 'REQUEST', 'READ')")
	public ResponseEntity<CollectionModel<ProfileReadModel>> getAllRequestProfiles(@PathVariable Long id) {
		throw new UnsupportedOperationException("not yet implemented");
	}

	@ApiResponses.Ok
	@ApiResponses.BadRequestError
	@ApiResponses.ResourceNotFoundError
	@GetMapping({ "/{id}/profiles/{profileId}" })
	@Operation(summary = "Get a specific candidate profile for a request.")
	@PreAuthorize("hasAuthority('hr-advisor') || hasPermission(#id, 'REQUEST', 'READ')")
	public ResponseEntity<ProfileReadModel> getRequestProfileById(@PathVariable Long id, @PathVariable Long profileId) {
		throw new UnsupportedOperationException("not yet implemented");
	}

}
