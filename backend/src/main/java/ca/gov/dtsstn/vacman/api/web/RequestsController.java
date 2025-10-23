package ca.gov.dtsstn.vacman.api.web;

import static ca.gov.dtsstn.vacman.api.data.entity.AbstractBaseEntity.byId;
import static ca.gov.dtsstn.vacman.api.data.entity.AbstractCodeEntity.byCode;
import static ca.gov.dtsstn.vacman.api.web.exception.ResourceNotFoundException.asResourceNotFoundException;
import static ca.gov.dtsstn.vacman.api.web.exception.ResourceNotFoundException.asUserResourceNotFoundException;
import static ca.gov.dtsstn.vacman.api.web.exception.UnauthorizedException.asEntraIdUnauthorizedException;
import static ca.gov.dtsstn.vacman.api.web.model.CollectionModel.toCollectionModel;
import static org.springframework.data.domain.Pageable.unpaged;

import java.util.Collection;
import java.util.List;

import org.mapstruct.factory.Mappers;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springdoc.core.annotations.ParameterObject;
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
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import ca.gov.dtsstn.vacman.api.config.SpringDocConfig;
import ca.gov.dtsstn.vacman.api.data.entity.AbstractBaseEntity;
import ca.gov.dtsstn.vacman.api.security.SecurityUtils;
import ca.gov.dtsstn.vacman.api.service.CodeService;
import ca.gov.dtsstn.vacman.api.service.MatchService;
import ca.gov.dtsstn.vacman.api.service.RequestService;
import ca.gov.dtsstn.vacman.api.service.UserService;
import ca.gov.dtsstn.vacman.api.service.dto.MatchQueryBuilder;
import ca.gov.dtsstn.vacman.api.web.exception.ResourceNotFoundException;
import ca.gov.dtsstn.vacman.api.web.model.CollectionModel;
import ca.gov.dtsstn.vacman.api.web.model.MatchReadModel;
import ca.gov.dtsstn.vacman.api.web.model.MatchStatusUpdateModel;
import ca.gov.dtsstn.vacman.api.web.model.MatchSummaryReadModel;
import ca.gov.dtsstn.vacman.api.web.model.MatchUpdateModel;
import ca.gov.dtsstn.vacman.api.web.model.ProfileReadModel;
import ca.gov.dtsstn.vacman.api.web.model.RequestReadFilterModel;
import ca.gov.dtsstn.vacman.api.web.model.RequestReadFilterModelBuilder;
import ca.gov.dtsstn.vacman.api.web.model.RequestReadModel;
import ca.gov.dtsstn.vacman.api.web.model.RequestStatusUpdateModel;
import ca.gov.dtsstn.vacman.api.web.model.RequestUpdateModel;
import ca.gov.dtsstn.vacman.api.web.model.mapper.MatchModelMapper;
import ca.gov.dtsstn.vacman.api.web.model.mapper.ProfileModelMapper;
import ca.gov.dtsstn.vacman.api.web.model.mapper.RequestModelMapper;
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
@Tag(name = "Requests", description = "Hiring manager requests for departmental clearance.")
public class RequestsController {

	private static final Logger log = LoggerFactory.getLogger(RequestsController.class);

	private final MatchModelMapper matchModelMapper = Mappers.getMapper(MatchModelMapper.class);

	private final ProfileModelMapper profileModelMapper = Mappers.getMapper(ProfileModelMapper.class);

	private final RequestModelMapper requestModelMapper = Mappers.getMapper(RequestModelMapper.class);

	private final CodeService codeService;

	private final MatchService matchService;

	private final RequestService requestService;

	private final UserService userService;

	public RequestsController(
			CodeService codeService,
			MatchService matchService,
			RequestService requestService,
			UserService userService) {
		this.codeService = codeService;
		this.matchService = matchService;
		this.requestService = requestService;
		this.userService = userService;
	}

	@GetMapping
	@ApiResponses.Ok
	@ApiResponses.BadRequestError
	@PreAuthorize("hasAuthority('hr-advisor')")
	@Operation(summary = "Get hiring requests with pagination.")
	public ResponseEntity<PagedModel<RequestReadModel>> getAllRequests(@ParameterObject Pageable pageable, @ParameterObject RequestReadFilterModel filter) {
		log.info("Received request to get all hiring requests.");
		log.debug("Pageable: {}, Filter: {}", pageable, filter);

		final var requestQuery = requestModelMapper.toRequestQuery(RequestReadFilterModelBuilder.builder(filter)
			// ?hrAdvisorId=me is a valid filter, so we must replace any instance
			// of 'me' with the current user's id before fetching the data
			.hrAdvisorId(resolveMeKeyword(filter.hrAdvisorId()))
			.build());

		final var requests = requestService.findRequests(pageable, requestQuery)
			.map(entity -> requestModelMapper.toModel(entity, requestService.hasMatches(entity.getId())));

		return ResponseEntity.ok(new PagedModel<>(requests));
	}

	@ApiResponses.Ok
	@GetMapping({ "/me" })
	@PreAuthorize("isAuthenticated()")
	@ApiResponses.ResourceNotFoundError
	@Operation(summary = "Get all hiring requests for the current user.")
	public ResponseEntity<PagedModel<RequestReadModel>> getCurrentUserRequests(@ParameterObject Pageable pageable) {
		final var entraId = SecurityUtils.getCurrentUserEntraId()
			.orElseThrow(asEntraIdUnauthorizedException());

		final var user = userService.getUserByMicrosoftEntraId(entraId)
			.orElseThrow(asUserResourceNotFoundException("microsoftEntraId", entraId));

		final var requests = requestService.getAllRequestsAssociatedWithUser(pageable, user.getId())
			.map(entity -> requestModelMapper.toModel(entity, requestService.hasMatches(entity.getId())));

		return ResponseEntity.ok(new PagedModel<>(requests));
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

		return ResponseEntity.created(location)
			.body(requestModelMapper.toModel(request, requestService.hasMatches(request.getId())));
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
			.orElseThrow(asResourceNotFoundException("request", id));

		return ResponseEntity.ok(requestModelMapper.toModel(request, requestService.hasMatches(request.getId())));
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

		return ResponseEntity.ok(requestModelMapper.toModel(updatedEntity, requestService.hasMatches(updatedEntity.getId())));
	}

	@ApiResponses.Ok
	@ApiResponses.BadRequestError
	@ApiResponses.ResourceNotFoundError
	@ApiResponses.UnprocessableEntityError
	@PostMapping({ "/{id}/status-change" })
	@Operation(summary = "Update the status of a request.")
	@PreAuthorize("hasAuthority('hr-advisor') || hasPermission(#id, 'REQUEST', 'UPDATE')")
	public ResponseEntity<RequestReadModel> updateRequestStatus(@PathVariable Long id, @Valid @RequestBody RequestStatusUpdateModel statusUpdate) {
		log.info("Received request to update request status; ID: [{}], Event: [{}]",  id, statusUpdate.eventType());

		final var request = requestService.getRequestById(id)
			.orElseThrow(asResourceNotFoundException("request", id));

		log.trace("Found request: [{}]", request);

		final var updatedEntity = requestService.updateRequestStatus(request, statusUpdate.eventType());

		return ResponseEntity.ok(requestModelMapper.toModel(updatedEntity, requestService.hasMatches(updatedEntity.getId())));
	}

	@ApiResponses.Ok
	@ApiResponses.BadRequestError
	@PostMapping({ "/{id}/run-matches" })
	@ApiResponses.ResourceNotFoundError
	@ApiResponses.UnprocessableEntityError
	@Operation(summary = "Run the match creation algorithm for a request.")
	@PreAuthorize("hasAuthority('hr-advisor')")
	public ResponseEntity<RequestReadModel> runMatches(@PathVariable Long id) {
		log.info("Received request to run matches for request; ID: [{}]", id);

		final var request = requestService.getRequestById(id)
			.orElseThrow(asResourceNotFoundException("request", id));

		log.trace("Found request: [{}]", request);

		final var updatedEntity = requestService.runMatches(request);

		return ResponseEntity.ok(requestModelMapper.toModel(updatedEntity, requestService.hasMatches(updatedEntity.getId())));
	}

	@ApiResponses.Ok
	@ApiResponses.BadRequestError
	@PostMapping({ "/{id}/cancel" })
	@ApiResponses.ResourceNotFoundError
	@ApiResponses.UnprocessableEntityError
	@Operation(summary = "Cancel a request.")
	@PreAuthorize("hasAuthority('hr-advisor')")
	public ResponseEntity<RequestReadModel> cancelRequest(@PathVariable Long id) {
		log.info("Received request to cancel request; ID: [{}]", id);

		final var updatedEntity = requestService.cancelRequest(id);

		return ResponseEntity.ok(requestModelMapper.toModel(updatedEntity, requestService.hasMatches(updatedEntity.getId())));
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
	public ResponseEntity<CollectionModel<MatchSummaryReadModel>> getAllRequestMatches(@PathVariable Long id) {
		log.info("Received request to get all matches for request; ID: [{}]", id);

		final var request = requestService.getRequestById(id)
			.orElseThrow(asResourceNotFoundException("request", id));

		log.trace("Found request: [{}]", request);

		final var matches = requestService.getMatchesByRequestId(id).stream()
			.map(matchModelMapper::toSummaryModel)
			.collect(toCollectionModel());

		return ResponseEntity.ok(matches);
	}

	@ApiResponses.Ok
	@ApiResponses.BadRequestError
	@ApiResponses.ResourceNotFoundError
	@GetMapping({ "/{id}/matches/{matchId}" })
	@Operation(summary = "Get a specific match for a request.")
	@PreAuthorize("hasAuthority('hr-advisor') || hasPermission(#id, 'REQUEST', 'READ')")
	public ResponseEntity<MatchReadModel> getRequestMatchById(@PathVariable Long id, @PathVariable Long matchId) {
		final var match = matchService.getMatchById(matchId)
			.orElseThrow(asResourceNotFoundException("match", matchId));

		if (!match.getRequest().getId().equals(id)) {
			// ensure that the match belongs to the request and throw a 404 if it doesn't
			// this prevents unauthorized access and also prevents leaking the existence of the match
			throw new ResourceNotFoundException("A match with id=[" + matchId + "] does not exist");
		}

		return ResponseEntity.ok(matchModelMapper.toModel(match));
	}

	@ApiResponses.NoContent
	@ApiResponses.BadRequestError
	@ApiResponses.ResourceNotFoundError
	@ApiResponses.UnprocessableEntityError
	@PostMapping({ "/{id}/matches/{matchId}/status-change" })
	@Operation(summary = "Update the status of a request match.")
	@PreAuthorize("hasAuthority('hr-advisor') || hasPermission(#id, 'REQUEST', 'UPDATE')")
	public ResponseEntity<Void> updateRequestMatchStatus(@PathVariable Long id, @PathVariable Long matchId, @Valid @RequestBody MatchStatusUpdateModel statusUpdate) {
		final var match = matchService.getMatchById(matchId)
			.orElseThrow(asResourceNotFoundException("match", matchId));

		if (!match.getRequest().getId().equals(id)) {
			// ensure that the match belongs to the request and throw a 404 if it doesn't
			// this prevents unauthorized access and also prevents leaking the existence of the match
			throw new ResourceNotFoundException("A match with id=[" + matchId + "] does not exist");
		}

		final var matchStatus = codeService.getMatchStatuses(unpaged()).stream()
			.filter(byCode(statusUpdate.statusCode()))
			.findFirst().orElseThrow();

		match.setMatchStatus(matchStatus);
		matchService.updateMatch(match);

		return ResponseEntity.noContent().build();
	}

	@ApiResponses.Ok
	@ApiResponses.BadRequestError
	@ApiResponses.ResourceNotFoundError
	@PutMapping({ "/{id}/matches/{matchId}" })
	@Operation(summary = "Update a match for a request.")
	@PreAuthorize("hasAuthority('hr-advisor') || hasPermission(#id, 'REQUEST', 'UPDATE')")
	public ResponseEntity<MatchSummaryReadModel> updateRequestMatch(@PathVariable Long id, @PathVariable Long matchId, @Valid @RequestBody MatchUpdateModel updateModel) {
		log.info("Received request to update match for request; Request ID: [{}], Match ID: [{}]", id, matchId);

		// Get the existing match entity
		final var matchEntity = requestService.getMatchById(matchId)
			.orElseThrow(asResourceNotFoundException("match", matchId));

		if (!matchEntity.getRequest().getId().equals(id)) {
			throw new ResourceNotFoundException("A match with id=[" + matchId + "] does not exist");
		}

		log.trace("Found match: {}", matchEntity);

		// Update match feedback if provided
		if (updateModel.matchFeedbackId() != null) {
			matchEntity.setMatchFeedback(codeService.getMatchFeedbacks(Pageable.unpaged()).stream()
				.filter(byId(updateModel.matchFeedbackId()))
				.findFirst()
				.orElseThrow(() -> new ResourceNotFoundException("Match feedback not found with ID: " + updateModel.matchFeedbackId())));
		}

		// Update comments if provided
		matchEntity.setHiringManagerComment(updateModel.hiringManagerComment());
		matchEntity.setHrAdvisorComment(updateModel.hrAdvisorComment());

		// Save the updated entity
		final var savedMatchEntity = requestService.saveMatch(matchEntity);

		log.trace("Updated match: {}", savedMatchEntity);

		final var matchSummary = matchModelMapper.toSummaryModel(savedMatchEntity);

		return ResponseEntity.ok(matchSummary);
	}

	//
	//
	// --- /requests/.../profiles endpoints
	//
	//

	@ApiResponses.Ok
	@ApiResponses.BadRequestError
	@ApiResponses.ResourceNotFoundError
	@GetMapping({ "/{id}/profiles/{profileId}" })
	@Operation(summary = "Get a specific candidate profile for a request.")
	@PreAuthorize("hasAuthority('hr-advisor') || hasPermission(#id, 'REQUEST', 'READ')")
	public ResponseEntity<ProfileReadModel> getRequestProfileById(@PathVariable Long id, @PathVariable Long profileId) {
		log.info("Received request to get profile for request; Request ID: [{}], Profile ID: [{}]", id, profileId);

		final var matchQuery = MatchQueryBuilder.builder()
			.profileId(profileId)
			.requestId(id)
			.build();

		final var match = requestService.findMatches(matchQuery).stream()
			.findFirst()
			.orElseThrow(() -> new ResourceNotFoundException("No match found between request with id=[" + id +
				"] and profile with id=[" + profileId + "]"));

		log.trace("Found match: {}", match);

		final var profileEntity = match.getProfile();

		return ResponseEntity.ok(profileModelMapper.toModel(profileEntity));
	}

	/**
	 * Replaces the "me" keyword in a list of IDs with the current authenticated user's ID.
	 */
	private List<String> resolveMeKeyword(Collection<String> hrAdvisorIds) {
		// if the "me" keyword isn't used, we don't need to do anything.
		if (!hrAdvisorIds.contains("me")) { return List.copyOf(hrAdvisorIds); }

		final var currentUserId = SecurityUtils.getCurrentUserEntraId()
			.flatMap(userService::getUserByMicrosoftEntraId)
			.map(AbstractBaseEntity::getId)
			.orElseThrow(asEntraIdUnauthorizedException());

		// replace all occurrences of "me" with the actual userid
		return hrAdvisorIds.stream()
			.map(id -> "me".equals(id) ? currentUserId.toString() : id)
			.toList();
	}

}
