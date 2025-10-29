package ca.gov.dtsstn.vacman.api.service;

import static ca.gov.dtsstn.vacman.api.data.repository.AbstractBaseRepository.hasId;
import static ca.gov.dtsstn.vacman.api.data.repository.MatchRepository.hasProfileId;
import static ca.gov.dtsstn.vacman.api.data.repository.MatchRepository.hasRequestId;
import static ca.gov.dtsstn.vacman.api.data.repository.RequestRepository.hasHiringManagerId;
import static ca.gov.dtsstn.vacman.api.data.repository.RequestRepository.hasHrAdvisorIdIn;
import static ca.gov.dtsstn.vacman.api.data.repository.RequestRepository.hasRequestStatusIdIn;
import static ca.gov.dtsstn.vacman.api.data.repository.RequestRepository.hasSubDelegatedManagerId;
import static ca.gov.dtsstn.vacman.api.data.repository.RequestRepository.hasSubmitterId;
import static ca.gov.dtsstn.vacman.api.data.repository.RequestRepository.hasWorkUnitIdIn;
import static ca.gov.dtsstn.vacman.api.web.exception.ResourceNotFoundException.asResourceNotFoundException;
import static org.springframework.data.jpa.domain.Specification.allOf;
import static org.springframework.data.jpa.domain.Specification.anyOf;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

import org.apache.commons.lang3.RandomStringUtils;
import org.mapstruct.factory.Mappers;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import ca.gov.dtsstn.vacman.api.config.properties.ApplicationProperties;
import ca.gov.dtsstn.vacman.api.config.properties.LookupCodes;
import ca.gov.dtsstn.vacman.api.config.properties.LookupCodes.RequestStatuses;
import ca.gov.dtsstn.vacman.api.data.entity.MatchEntity;
import ca.gov.dtsstn.vacman.api.data.entity.RequestEntity;
import ca.gov.dtsstn.vacman.api.data.entity.RequestStatusEntity;
import ca.gov.dtsstn.vacman.api.data.entity.UserEntity;
import ca.gov.dtsstn.vacman.api.data.repository.CityRepository;
import ca.gov.dtsstn.vacman.api.data.repository.ClassificationRepository;
import ca.gov.dtsstn.vacman.api.data.repository.EmploymentEquityRepository;
import ca.gov.dtsstn.vacman.api.data.repository.EmploymentTenureRepository;
import ca.gov.dtsstn.vacman.api.data.repository.LanguageRepository;
import ca.gov.dtsstn.vacman.api.data.repository.LanguageRequirementRepository;
import ca.gov.dtsstn.vacman.api.data.repository.MatchRepository;
import ca.gov.dtsstn.vacman.api.data.repository.NonAdvertisedAppointmentRepository;
import ca.gov.dtsstn.vacman.api.data.repository.ProvinceRepository;
import ca.gov.dtsstn.vacman.api.data.repository.RequestRepository;
import ca.gov.dtsstn.vacman.api.data.repository.RequestStatusRepository;
import ca.gov.dtsstn.vacman.api.data.repository.SecurityClearanceRepository;
import ca.gov.dtsstn.vacman.api.data.repository.SelectionProcessTypeRepository;
import ca.gov.dtsstn.vacman.api.data.repository.WorkScheduleRepository;
import ca.gov.dtsstn.vacman.api.data.repository.WorkUnitRepository;
import ca.gov.dtsstn.vacman.api.event.RequestCompletedEvent;
import ca.gov.dtsstn.vacman.api.event.RequestCreatedEvent;
import ca.gov.dtsstn.vacman.api.event.RequestFeedbackCompletedEvent;
import ca.gov.dtsstn.vacman.api.event.RequestFeedbackPendingEvent;
import ca.gov.dtsstn.vacman.api.event.RequestUpdatedEvent;
import ca.gov.dtsstn.vacman.api.security.SecurityUtils;
import ca.gov.dtsstn.vacman.api.service.NotificationService.RequestEvent;
import ca.gov.dtsstn.vacman.api.service.dto.MatchQuery;
import ca.gov.dtsstn.vacman.api.service.dto.RequestQuery;
import ca.gov.dtsstn.vacman.api.web.exception.ResourceConflictException;
import ca.gov.dtsstn.vacman.api.web.exception.ResourceNotFoundException;
import ca.gov.dtsstn.vacman.api.web.exception.UnauthorizedException;
import ca.gov.dtsstn.vacman.api.web.model.RequestUpdateModel;
import ca.gov.dtsstn.vacman.api.web.model.mapper.RequestModelMapper;
import io.micrometer.core.annotation.Counted;

@Service
public class RequestService {

	private static final Logger log = LoggerFactory.getLogger(RequestService.class);

	private final ApplicationEventPublisher eventPublisher;

	private final ApplicationProperties applicationProperties;

	private final CityRepository cityRepository;

	private final ClassificationRepository classificationRepository;

	private final EmploymentEquityRepository employmentEquityRepository;

	private final EmploymentTenureRepository employmentTenureRepository;

	private final LanguageRepository languageRepository;

	private final LanguageRequirementRepository languageRequirementRepository;

	private final MatchRepository matchRepository;

	private final NonAdvertisedAppointmentRepository nonAdvertisedAppointmentRepository;

	private final NotificationService notificationService;

	private final RequestModelMapper requestModelMapper = Mappers.getMapper(RequestModelMapper.class);

	private final RequestRepository requestRepository;

	private final RequestStatuses requestStatuses;

	private final RequestStatusRepository requestStatusRepository;

	private final SecurityClearanceRepository securityClearanceRepository;

	private final SelectionProcessTypeRepository selectionProcessTypeRepository;

	private final UserService userService;

	private final WorkScheduleRepository workScheduleRepository;

	private final WorkUnitRepository workUnitRepository;

	private final RequestMatchingService requestMatchingService;

	public RequestService(
			ApplicationEventPublisher eventPublisher,
			ApplicationProperties applicationProperties,
			CityRepository cityRepository,
			ClassificationRepository classificationRepository,
			EmploymentEquityRepository employmentEquityRepository,
			EmploymentTenureRepository employmentTenureRepository,
			LanguageRepository languageRepository,
			LanguageRequirementRepository languageRequirementRepository,
			LookupCodes lookupCodes,
			MatchRepository matchRepository,
			NonAdvertisedAppointmentRepository nonAdvertisedAppointmentRepository,
			NotificationService notificationService,
			ProvinceRepository provinceRepository,
			RequestMatchingService requestMatchingService,
			RequestRepository requestRepository,
			RequestStatusRepository requestStatusRepository,
			SecurityClearanceRepository securityClearanceRepository,
			SelectionProcessTypeRepository selectionProcessTypeRepository,
			UserService userService,
			WorkScheduleRepository workScheduleRepository,
			WorkUnitRepository workUnitRepository) {
		this.applicationProperties = applicationProperties;
		this.cityRepository = cityRepository;
		this.classificationRepository = classificationRepository;
		this.employmentEquityRepository = employmentEquityRepository;
		this.employmentTenureRepository = employmentTenureRepository;
		this.eventPublisher = eventPublisher;
		this.languageRepository = languageRepository;
		this.languageRequirementRepository = languageRequirementRepository;
		this.matchRepository = matchRepository;
		this.nonAdvertisedAppointmentRepository = nonAdvertisedAppointmentRepository;
		this.notificationService = notificationService;
		this.requestMatchingService = requestMatchingService;
		this.requestRepository = requestRepository;
		this.requestStatusRepository = requestStatusRepository;
		this.securityClearanceRepository = securityClearanceRepository;
		this.selectionProcessTypeRepository = selectionProcessTypeRepository;
		this.userService = userService;
		this.workScheduleRepository = workScheduleRepository;
		this.workUnitRepository = workUnitRepository;

		this.requestStatuses = lookupCodes.requestStatuses();
	}

	@Transactional(readOnly = false)
	@Counted("service.request.createRequest.count")
	public RequestEntity createRequest(UserEntity submitter) {
		log.debug("Fetching DRAFT request status");

		final var draftStatus = requestStatusRepository.findByCode(requestStatuses.draft())
			.orElseThrow(asResourceNotFoundException("requestStatus", "code", requestStatuses.draft()));

		final var request = requestRepository.save(RequestEntity.builder()
			.submitter(submitter)
			.requestStatus(draftStatus)
			.build());

		eventPublisher.publishEvent(new RequestCreatedEvent(request));

		return request;
	}

	@Transactional(readOnly = true)
	@Counted("service.request.getRequestById.count")
	public Optional<RequestEntity> getRequestById(long requestId) {
		return requestRepository.findById(requestId);
	}

	@Transactional(readOnly = true)
	@Counted("service.request.getAllRequestsAssociatedWithUser.count")
	public Page<RequestEntity> getAllRequestsAssociatedWithUser(Pageable pageable, Long userId, RequestQuery query) {
		final var requestsAssociatedWithUser = anyOf(
			hasSubmitterId(userId),
			hasHiringManagerId(userId),
			hasSubDelegatedManagerId(userId)
		);

		final var specification = allOf(
			requestsAssociatedWithUser,
			hasHrAdvisorIdIn(query.hrAdvisorIds()),
			hasRequestStatusIdIn(query.statusIds()),
			hasWorkUnitIdIn(query.workUnitIds())
		);

		return requestRepository.findAll(specification, pageable);
	}

	/**
	 * Checks if a request has any associated matches.
	 *
	 * @param requestId The request ID
	 * @return true if matches exist for the request, false otherwise
	 */
	@Transactional(readOnly = true)
	@Counted("service.request.hasMatches.count")
	public boolean hasMatches(Long requestId) {
		return matchRepository.exists(hasRequestId(requestId));
	}

	@Transactional(readOnly = true)
	@Counted("service.request.getMatchesByRequestId.count")
	public List<MatchEntity> getMatchesByRequestId(Long requestId) {
		return matchRepository.findAll(hasRequestId(requestId));
	}

	/**
	 * Get a match by ID
	 *
	 * @param matchId The match ID
	 * @return Optional containing the match if found
	 */
	@Transactional(readOnly = true)
	@Counted("service.request.getMatchById.count")
	public Optional<MatchEntity> getMatchById(Long matchId) {
		return matchRepository.findOne(hasId(matchId));
	}

	/**
	 * Save a match entity
	 *
	 * @param match The fully populated match entity
	 * @return The saved match entity
	 */
	@Transactional
	@Counted("service.request.saveMatch.count")
	public MatchEntity saveMatch(MatchEntity match) {
		return matchRepository.save(match);
	}

	/**
	 * Get all requests, optionally filtered by HR advisor IDs, status IDs, and work unit IDs.
	 *
	 * @param pageable      Pagination information
	 * @param query         Query parameters for filtering requests
	 */
	@Transactional(readOnly = true)
	@Counted("service.request.findRequests.count")
	public Page<RequestEntity> findRequests(Pageable pageable, RequestQuery query) {
		final var specification = allOf(
			hasHrAdvisorIdIn(query.hrAdvisorIds()),
			hasRequestStatusIdIn(query.statusIds()),
			hasWorkUnitIdIn(query.workUnitIds())
		);

		return requestRepository.findAll(specification, pageable);
	}

	/**
	 * Find matches based on the provided query parameters.
	 *
	 * @param query Query parameters for filtering matches
	 */
	@Transactional(readOnly = true)
	@Counted("service.request.findMatches.count")
	public List<MatchEntity> findMatches(MatchQuery query) {
		final var specification = allOf(
			hasProfileId(query.profileId()),
			hasRequestId(query.requestId())
		);

		return matchRepository.findAll(specification);
	}

	/**
	 * Update a request based on the provided entity. This method saves the entity
	 * to the database.
	 *
	 * @param request The request entity to be updated.
	 * @return The updated request entity.
	 */
	@Transactional(readOnly = false)
	@Counted("service.request.updateRequest.count")
	public RequestEntity updateRequest(RequestEntity request) {
		final var updatedRequest = requestRepository.save(request);
		eventPublisher.publishEvent(new RequestUpdatedEvent(updatedRequest));
		return updatedRequest;
	}

	@Transactional(readOnly = true)
	@Counted("service.request.prepareRequestForUpdate.count")
	public RequestEntity prepareRequestForUpdate(RequestUpdateModel updateModel, RequestEntity request) {
		requestModelMapper.updateEntityFromModel(updateModel, request);

		if (StringUtils.hasText(updateModel.positionNumbers())) {
			request.setPositionNumber(updateModel.positionNumbers());
		}

		Optional.ofNullable(updateModel.selectionProcessTypeId())
			.map(selectionProcessTypeRepository::getReferenceById)
			.ifPresent(request::setSelectionProcessType);

		Optional.ofNullable(updateModel.appointmentNonAdvertisedId())
			.map(nonAdvertisedAppointmentRepository::getReferenceById)
			.ifPresent(request::setAppointmentNonAdvertised);

		Optional.ofNullable(updateModel.workScheduleId())
			.map(workScheduleRepository::getReferenceById)
			.ifPresent(request::setWorkSchedule);

		Optional.ofNullable(updateModel.employmentTenureId())
			.map(employmentTenureRepository::getReferenceById)
			.ifPresent(request::setEmploymentTenure);

		Optional.ofNullable(updateModel.classificationId())
			.map(classificationRepository::getReferenceById)
			.ifPresent(request::setClassification);

		if (updateModel.languageOfCorrespondenceId() == null) {
			request.setLanguage(null);
		}
		else {
			request.setLanguage(languageRepository.getReferenceById(updateModel.languageOfCorrespondenceId()));
		}

		Optional.ofNullable(updateModel.languageRequirementId())
			.map(languageRequirementRepository::getReferenceById)
			.ifPresent(request::setLanguageRequirement);

		Optional.ofNullable(updateModel.securityClearanceId())
			.map(securityClearanceRepository::getReferenceById)
			.ifPresent(request::setSecurityClearance);

		if (updateModel.workUnitId() == null) {
			request.setWorkUnit(null);
		}
		else {
			request.setWorkUnit(workUnitRepository.getReferenceById(updateModel.workUnitId()));
		}

		request.setEmploymentEquities(Optional.ofNullable(updateModel.employmentEquityIds()).stream()
			.flatMap(Collection::stream)
			.map(RequestUpdateModel.EmploymentEquityId::value)
			.map(employmentEquityRepository::getReferenceById)
			.toList());

		request.setCities(Optional.ofNullable(updateModel.cityIds()).stream()
			.flatMap(Collection::stream)
			.map(RequestUpdateModel.CityId::value)
			.map(cityRepository::getReferenceById)
			.toList());

		request.setHiringManager(resolveUser(updateModel.hiringManagerId()));
		request.setHrAdvisor(resolveUser(updateModel.hrAdvisorId()));
		request.setSubDelegatedManager(resolveUser(updateModel.subDelegatedManagerId()));
		request.setSubmitter(resolveUser(updateModel.submitterId()));

		Optional.ofNullable(updateModel.statusId())
			.map(requestStatusRepository::getReferenceById)
			.ifPresent(request::setRequestStatus);

		return request;
		}

	private UserEntity resolveUser(Long userId) {
		if (userId == null) { return null; }
		return userService.getUserById(userId)
			.orElseThrow(asResourceNotFoundException("user", userId));
	}

	@Counted("service.request.deleteRequest.count")
	public void deleteRequest(Long requestId) {
		final var request = getRequestById(requestId)
			.orElseThrow(asResourceNotFoundException("request", requestId));

		if (!requestStatuses.draft().equals(request.getRequestStatus().getCode())) {
			throw new ResourceConflictException("Request with ID=[" + requestId + "] cannot be deleted because its status is not DRAFT");
		}

		requestRepository.delete(request);
	}

	/**
	 * Updates the request status based on the event type.
	 *
	 * @param request   The request entity to update
	 * @param eventType The event type that triggered the status change
	 * @return The updated request entity
	 */
	@Counted("service.request.updateRequestStatus.count")
	public RequestEntity updateRequestStatus(RequestEntity request, String eventType) {
		final var currentUser = SecurityUtils.getCurrentUserEntraId()
			.flatMap(userService::getUserByMicrosoftEntraId)
			.orElseThrow(() -> new UnauthorizedException("User not authenticated"));

		final var isHrAdvisor = SecurityUtils.hasAuthority("hr-advisor");
		final var isOwner = request.isOwnedBy(currentUser.getId());
		final var currentStatus = request.getRequestStatus().getCode();

		final var updatedRequest = switch (eventType) {
			case "requestSubmitted" -> handleRequestSubmitted(request, isOwner, currentStatus);
			case "requestPickedUp" -> handleRequestPickedUp(request, isHrAdvisor, currentStatus, currentUser);
			case "vmsNotRequired" -> handleVmsNotRequired(request, isHrAdvisor, currentStatus);
			case "submitFeedback" -> handleSubmitFeedback(request, isOwner, currentStatus);
			case "pscNotRequired" -> handlePscNotRequired(request, isHrAdvisor, currentStatus);
			case "pscRequired" -> handlePscRequired(request, isHrAdvisor, currentStatus);
			case "complete" -> handleComplete(request, isHrAdvisor, currentStatus);
			default -> throw new IllegalArgumentException("Unknown event type: " + eventType);
		};

		return updateRequest(updatedRequest);
	}

	/**
	 * Handles the requestSubmitted event.
	 *
	 * @param request       The request entity
	 * @param isOwner       Whether the current user is the owner of the request
	 * @param currentStatus The current status code of the request
	 * @return The updated request entity
	 */
	private RequestEntity handleRequestSubmitted(RequestEntity request, boolean isOwner, String currentStatus) {
		if (!isOwner) {
			throw new UnauthorizedException("Only the request owner can submit a request");
		}

		if (!requestStatuses.draft().equals(currentStatus)) {
			throw new ResourceNotFoundException("Request must be in DRAFT status to be submitted");
		}

		// Set status to SUBMIT
		request.setRequestStatus(getRequestStatusByCode(requestStatuses.submitted()));

		// Send notification
		// sendRequestCreatedNotification(request);

		return request;
	}

	/**
	 * Handles the requestPickedUp event.
	 *
	 * @param request       The request entity
	 * @param isHrAdvisor   Whether the current user is an HR advisor
	 * @param currentStatus The current status code of the request
	 * @param currentUser   The current user entity
	 * @return The updated request entity
	 */
	private RequestEntity handleRequestPickedUp(RequestEntity request, boolean isHrAdvisor, String currentStatus, UserEntity currentUser) {
		if (!isHrAdvisor) {
			throw new UnauthorizedException("Only HR advisors can pick up requests");
		}

		if (!requestStatuses.submitted().equals(currentStatus) && !requestStatuses.hrReview().equals(currentStatus)) {
			throw new ResourceConflictException("Request must be in SUBMIT or HR_REVIEW status to be picked up");
		}

		// Set HR advisor
		request.setHrAdvisor(currentUser);

		// Set status to HR_REVIEW
		request.setRequestStatus(getRequestStatusByCode(requestStatuses.hrReview()));

		return request;
	}

	/**
	 * Gets a RequestStatusEntity by its code.
	 */
	private RequestStatusEntity getRequestStatusByCode(String code) {
		return requestStatusRepository.findByCode(code)
			.orElseThrow(() -> new IllegalStateException("Request status not found: " + code));
	}

	/**
	 * Sends a notification when a request is created.
	 * TODO ::: GjB ::: this should be done via events. see RequestEventListener.java
	 */
	private void sendRequestCreatedNotification(RequestEntity request) {
		notificationService.sendRequestNotification(
			applicationProperties.gcnotify().hrGdInboxEmail(),
			request.getId(),
			request.getNameEn(),
			RequestEvent.CREATED,
			"en");
	}

	/**
	 * Cancels a request.
	 *
	 * @param requestId The ID of the request to cancel
	 * @return The updated request entity
	 */
	@Counted("service.request.cancelRequest.count")
	public RequestEntity cancelRequest(Long requestId) {
		final var request = getRequestById(requestId)
			.orElseThrow(asResourceNotFoundException("request", requestId));

		// Set status to CANCELLED
		request.setRequestStatus(getRequestStatusByCode(requestStatuses.cancelled()));

		return updateRequest(request);
	}

	/**
	 * Runs the match creation algorithm for a request and updates the status.
	 *
	 * @param request The request entity to run matches for
	 * @return The updated request entity
	 */
	@Counted("service.request.runMatches.count")
	public RequestEntity runMatches(RequestEntity request) {
		final var currentStatus = request.getRequestStatus().getCode();

		if (!requestStatuses.hrReview().equals(currentStatus)) {
			throw new ResourceConflictException("Request must be in HR_REVIEW status to be approved");
		}

		final var matches = createMatches(request);

		if (!matches.isEmpty()) {
			// Set status to FDBK_PENDING and send notification to the owner
			request.setRequestStatus(getRequestStatusByCode(requestStatuses.feedbackPending()));
			eventPublisher.publishEvent(new RequestFeedbackPendingEvent(request));
		}
		else {
			// Set status to NO_MATCH_HR_REVIEW
			request.setRequestStatus(getRequestStatusByCode(requestStatuses.noMatchHrReview()));
		}

		return updateRequest(request);
	}

	/**
	 * Creates matches for a request using the matching algorithm.
	 *
	 * @param request The request entity
	 * @return List of created match entities
	 */
	private List<MatchEntity> createMatches(RequestEntity request) {
		log.info("Creating matches for request ID: [{}]", request.getId());

		final int maxMatches = applicationProperties.matches().maxMatchesPerRequest();
		log.debug("Using configured maximum matches per request: {}", maxMatches);

		return requestMatchingService.performRequestMatching(request.getId(), maxMatches);
	}

	/**
	 * Handles the vmsNotRequired event.
	 *
	 * @param request       The request entity
	 * @param isHrAdvisor   Whether the current user is an HR advisor
	 * @param currentStatus The current status code of the request
	 * @return The updated request entity
	 */
	private RequestEntity handleVmsNotRequired(RequestEntity request, boolean isHrAdvisor, String currentStatus) {
		if (!isHrAdvisor) {
			throw new UnauthorizedException("Only HR advisors can mark a request as VMS not required");
		}

		if (!requestStatuses.hrReview().equals(currentStatus)) {
			throw new ResourceConflictException("Request must be in HR_REVIEW status to be marked as VMS not required");
		}

		// Generate VacMan clearance number (16 character ID with letters and numbers)
		// TODO: Real implementation (ADO task 6691)
		final var priorityClearanceNumber = RandomStringUtils.insecure().nextAlphanumeric(16).toUpperCase();
		request.setPriorityClearanceNumber(priorityClearanceNumber);

		// Set status to PENDING_PSC_NO_VMS
		request.setRequestStatus(getRequestStatusByCode(requestStatuses.pendingPscClearanceNoVms()));

		return request;
	}

	/**
	 * Handles the submitFeedback event.
	 *
	 * @param request       The request entity
	 * @param isOwner       Whether the current user is the owner of the request
	 * @param currentStatus The current status code of the request
	 * @return The updated request entity
	 */
	private RequestEntity handleSubmitFeedback(RequestEntity request, boolean isOwner, String currentStatus) {
		if (!isOwner) {
			throw new UnauthorizedException("Only the request owner can submit feedback");
		}

		if (!requestStatuses.feedbackPending().equals(currentStatus)) {
			throw new ResourceConflictException("Request must be in FDBK_PENDING status to submit feedback");
		}

		// Set status to FDBK_PEND_APPR
		request.setRequestStatus(getRequestStatusByCode(requestStatuses.feedbackPendingApproval()));

		// Loop through all the matches under the requestId and set match status to
		// PENDING
		// This is a placeholder for the actual implementation until the match
		// functionality is implemented
		// Example:
		/*
		 * List<MatchEntity> matches = matchRepository.findByRequestId(request.getId());
		 * for (MatchEntity match : matches) {
		 * match.setStatus(getMatchStatusByCode("PENDING"));
		 * matchRepository.save(match);
		 * }
		 */

		eventPublisher.publishEvent(new RequestFeedbackCompletedEvent(request));

		return request;
	}

	/**
	 * Handles the pscNotRequired event.
	 *
	 * @param request       The request entity
	 * @param isHrAdvisor   Whether the current user is an HR advisor
	 * @param currentStatus The current status code of the request
	 * @return The updated request entity
	 */
	private RequestEntity handlePscNotRequired(RequestEntity request, boolean isHrAdvisor, String currentStatus) {
		if (!isHrAdvisor) {
			throw new UnauthorizedException("Only HR advisors can mark a request as PSC not required");
		}

		if (!requestStatuses.feedbackPendingApproval().equals(currentStatus) && !requestStatuses.noMatchHrReview().equals(currentStatus)) {
			throw new ResourceConflictException("Request must be in FDBK_PEND_APPR or NO_MATCH_HR_REVIEW status to be marked as PSC not required");
		}

		// Set status to CLR_GRANTED
		request.setRequestStatus(getRequestStatusByCode(requestStatuses.clearanceGranted()));

		// Generate VacMan clearance number (16 character ID with letters and numbers)
		// TODO: Real implementation (ADO task 6691)
		final var priorityClearanceNumber = RandomStringUtils.insecure().nextAlphanumeric(16).toUpperCase();
		request.setPriorityClearanceNumber(priorityClearanceNumber);

		final var clearanceNumber = RandomStringUtils.insecure().nextAlphanumeric(16).toUpperCase();
		request.setPscClearanceNumber(clearanceNumber);

		return request;
	}

	/**
	 * Handles the pscRequired event.
	 *
	 * @param request       The request entity
	 * @param isHrAdvisor   Whether the current user is an HR advisor
	 * @param currentStatus The current status code of the request
	 * @return The updated request entity
	 */
	private RequestEntity handlePscRequired(RequestEntity request, boolean isHrAdvisor, String currentStatus) {
		if (!isHrAdvisor) {
			throw new UnauthorizedException("Only HR advisors can mark a request as PSC required");
		}

		if (!requestStatuses.feedbackPendingApproval().equals(currentStatus) && !requestStatuses.noMatchHrReview().equals(currentStatus)) {
			throw new ResourceConflictException("Request must be in FDBK_PEND_APPR or NO_MATCH_HR_REVIEW status to be marked as PSC required");
		}

		// Set status to PENDING_PSC
		request.setRequestStatus(getRequestStatusByCode(requestStatuses.pendingPscClearance()));

		// Generate VacMan clearance number (16 character ID with letters and numbers)
		// TODO: Real implementation (ADO task 6691)
		final var priorityClearanceNumber = RandomStringUtils.insecure().nextAlphanumeric(16).toUpperCase();
		request.setPriorityClearanceNumber(priorityClearanceNumber);

		final var clearanceNumber = RandomStringUtils.insecure().nextAlphanumeric(16).toUpperCase();
		request.setPscClearanceNumber(clearanceNumber);

		return request;
	}

	/**
	 * Handles the complete event.
	 *
	 * @param request       The request entity
	 * @param isHrAdvisor   Whether the current user is an HR advisor
	 * @param currentStatus The current status code of the request
	 * @return The updated request entity
	 */
	private RequestEntity handleComplete(RequestEntity request, boolean isHrAdvisor, String currentStatus) {
		if (!isHrAdvisor) {
			throw new UnauthorizedException("Only HR advisors can complete a request");
		}

		if (!requestStatuses.pendingPscClearance().equals(currentStatus) && !requestStatuses.pendingPscClearanceNoVms().equals(currentStatus)) {
			throw new ResourceConflictException("Request must be in PENDING_PSC or PENDING_PSC_NO_VMS status to be completed");
		}

		// Set status to PSC_GRANTED
		request.setRequestStatus(getRequestStatusByCode(requestStatuses.pscClearanceGranted()));
		eventPublisher.publishEvent(new RequestCompletedEvent(request));

		return request;
	}

}
