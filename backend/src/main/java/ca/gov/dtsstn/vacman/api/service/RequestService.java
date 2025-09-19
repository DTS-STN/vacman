package ca.gov.dtsstn.vacman.api.service;

import static ca.gov.dtsstn.vacman.api.web.exception.ResourceNotFoundException.asResourceNotFoundException;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.mapstruct.factory.Mappers;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import ca.gov.dtsstn.vacman.api.config.properties.LookupCodes;
import ca.gov.dtsstn.vacman.api.config.properties.LookupCodes.RequestStatuses;
import ca.gov.dtsstn.vacman.api.data.entity.RequestEntity;
import ca.gov.dtsstn.vacman.api.data.entity.RequestStatusEntity;
import ca.gov.dtsstn.vacman.api.data.entity.UserEntity;
import ca.gov.dtsstn.vacman.api.data.repository.ClassificationRepository;
import ca.gov.dtsstn.vacman.api.data.repository.EmploymentEquityRepository;
import ca.gov.dtsstn.vacman.api.data.repository.LanguageRepository;
import ca.gov.dtsstn.vacman.api.data.repository.LanguageRequirementRepository;
import ca.gov.dtsstn.vacman.api.data.repository.NonAdvertisedAppointmentRepository;
import ca.gov.dtsstn.vacman.api.data.repository.ProvinceRepository;
import ca.gov.dtsstn.vacman.api.data.repository.RequestRepository;
import ca.gov.dtsstn.vacman.api.data.repository.RequestStatusRepository;
import ca.gov.dtsstn.vacman.api.data.repository.SecurityClearanceRepository;
import ca.gov.dtsstn.vacman.api.data.repository.SelectionProcessTypeRepository;
import ca.gov.dtsstn.vacman.api.data.repository.WorkScheduleRepository;
import ca.gov.dtsstn.vacman.api.security.SecurityUtils;
import ca.gov.dtsstn.vacman.api.service.NotificationService.RequestEvent;
import ca.gov.dtsstn.vacman.api.web.exception.ResourceConflictException;
import ca.gov.dtsstn.vacman.api.web.exception.ResourceNotFoundException;
import ca.gov.dtsstn.vacman.api.web.exception.UnauthorizedException;
import ca.gov.dtsstn.vacman.api.web.model.RequestUpdateModel;
import ca.gov.dtsstn.vacman.api.web.model.mapper.RequestModelMapper;

@Service
public class RequestService {

	private static final Logger log = LoggerFactory.getLogger(RequestService.class);

	private final RequestRepository requestRepository;
	private final RequestStatuses requestStatuses;
	private final RequestStatusRepository requestStatusRepository;
	private final ClassificationRepository classificationRepository;
	private final EmploymentEquityRepository employmentEquityRepository;
	private final LanguageRequirementRepository languageRequirementRepository;
	private final NonAdvertisedAppointmentRepository nonAdvertisedAppointmentRepository;
	private final SecurityClearanceRepository securityClearanceRepository;
	private final SelectionProcessTypeRepository selectionProcessTypeRepository;
	private final WorkScheduleRepository workScheduleRepository;
	private final RequestModelMapper requestModelMapper;
	private final UserService userService;
	private final NotificationService notificationService;

	public RequestService(
			LookupCodes lookupCodes,RequestRepository requestRepository,
			RequestStatusRepository requestStatusRepository,
			ClassificationRepository classificationRepository,
			EmploymentEquityRepository employmentEquityRepository,
			LanguageRepository languageRepository,
			LanguageRequirementRepository languageRequirementRepository,
			NonAdvertisedAppointmentRepository nonAdvertisedAppointmentRepository,
			ProvinceRepository provinceRepository,
			SecurityClearanceRepository securityClearanceRepository,
			SelectionProcessTypeRepository selectionProcessTypeRepository,
			WorkScheduleRepository workScheduleRepository,
			UserService userService,
			NotificationService notificationService,
			ApplicationEventPublisher eventPublisher) {
		this.requestStatuses = lookupCodes.requestStatuses();
		this.requestRepository = requestRepository;
		this.requestStatusRepository = requestStatusRepository;
		this.classificationRepository = classificationRepository;
		this.employmentEquityRepository = employmentEquityRepository;
		this.languageRequirementRepository = languageRequirementRepository;
		this.nonAdvertisedAppointmentRepository = nonAdvertisedAppointmentRepository;
		this.securityClearanceRepository = securityClearanceRepository;
		this.selectionProcessTypeRepository = selectionProcessTypeRepository;
		this.workScheduleRepository = workScheduleRepository;
		this.userService = userService;
		this.notificationService = notificationService;
		this.requestModelMapper = Mappers.getMapper(RequestModelMapper.class);
	}

	@Transactional(readOnly = false)
	public RequestEntity createRequest(UserEntity submitter) {
		log.debug("Fetching DRAFT request status");

		final var draftStatus = requestStatusRepository.findByCode(requestStatuses.draft())
			.orElseThrow(asResourceNotFoundException("requestStatus", "code", requestStatuses.draft()));

		return requestRepository
				.save(RequestEntity.builder().submitter(submitter).requestStatus(draftStatus).build());
	}

	@Transactional(readOnly = true)
	public Optional<RequestEntity> getRequestById(long requestId) {
		return requestRepository.findById(requestId);
	}

	@Transactional(readOnly = true)
	public List<RequestEntity> getAllRequestsAssociatedWithUser(Long userId) {
		return requestRepository.findAll().stream()
			.filter(request -> request.getOwnerId().map(id -> id.equals(userId)).orElse(false)
				|| request.getDelegateIds().contains(userId))
			.collect(Collectors.toList());
	}

	/**
	 * Get all requests, optionally filtered by HR advisor ID.
	 *
	 * @param pageable Pagination information
	 * @param hrAdvisorId Optional HR advisor ID to filter by (null for no filtering)
	 * @return Page of request entities
	 */
	@Transactional(readOnly = true)
	public Page<RequestEntity> getAllRequests(Pageable pageable, Long hrAdvisorId) {
		if (hrAdvisorId == null) {
			return requestRepository.findAll(pageable);
		} else {
			return requestRepository.findAll(
				RequestRepository.hasHrAdvisorId(hrAdvisorId),
				pageable
			);
		}
	}

	/**
	 * Update a request based on the provided entity. This method saves the entity to the database.
	 *
	 * @param request The request entity to be updated.
	 * @return The updated request entity.
	 */
	@Transactional(readOnly = false)
	public RequestEntity updateRequest(RequestEntity request) {
		final var updatedEntity = requestRepository.save(request);

		return updatedEntity;
	}

	@Transactional(readOnly = true)
	public RequestEntity prepareRequestForUpdate(RequestUpdateModel updateModel, RequestEntity request) {
		requestModelMapper.updateEntityFromModel(updateModel, request);

		request.setPositionNumber(String.join(",", updateModel.positionNumbers()));

		Optional.ofNullable(updateModel.selectionProcessTypeId())
			.map(selectionProcessTypeRepository::getReferenceById)
			.ifPresent(request::setSelectionProcessType);

		Optional.ofNullable(updateModel.appointmentNonAdvertisedId())
			.map(nonAdvertisedAppointmentRepository::getReferenceById)
			.ifPresent(request::setAppointmentNonAdvertised);

		Optional.ofNullable(updateModel.workScheduleId())
			.map(workScheduleRepository::getReferenceById)
			.ifPresent(request::setWorkSchedule);

		Optional.ofNullable(updateModel.classificationId())
			.map(classificationRepository::getReferenceById)
			.ifPresent(request::setClassification);

		Optional.ofNullable(updateModel.languageRequirementId())
			.map(languageRequirementRepository::getReferenceById)
			.ifPresent(request::setLanguageRequirement);

		Optional.ofNullable(updateModel.securityClearanceId())
			.map(securityClearanceRepository::getReferenceById)
			.ifPresent(request::setSecurityClearance);

		request.setEmploymentEquities(updateModel.employmentEquityIds().stream()
			.map(id -> employmentEquityRepository.getReferenceById(id.value()))
			.collect(Collectors.toList()));

		return request;
	}


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
	 * @param request The request entity to update
	 * @param eventType The event type that triggered the status change
	 * @return The updated request entity
	 */
	public RequestEntity updateRequestStatus(RequestEntity request, String eventType) {
		// Get current user information
		final var currentUser = SecurityUtils.getCurrentUserEntraId()
			.flatMap(userService::getUserByMicrosoftEntraId)
			.orElseThrow(() -> new UnauthorizedException("User not authenticated"));

		final boolean isHrAdvisor = SecurityUtils.hasAuthority("hr-advisor");
		final boolean isOwner = request.isOwnedBy(currentUser.getId());

		// Get current status code
		final String currentStatus = request.getRequestStatus().getCode();


		final var updatedRequest = switch (eventType) {
			case "requestSubmitted" ->
				handleRequestSubmitted(request, isOwner, currentStatus);
			case "requestPickedUp" ->
				handleRequestPickedUp(request, isHrAdvisor, currentStatus, currentUser);
			case "vmsNotRequired" ->
				handleVmsNotRequired(request, isHrAdvisor, currentStatus);
			case "submitFeedback" ->
				handleSubmitFeedback(request, isOwner, currentStatus);
			default ->
				throw new IllegalArgumentException("Unknown event type: " + eventType);
		};

		return updateRequest(updatedRequest);
	}

	/**
	 * Handles the requestSubmitted event.
	 *
	 * @param request The request entity
	 * @param isOwner Whether the current user is the owner of the request
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
		sendRequestCreatedNotification(request);

		return request;
	}

	/**
	 * Handles the requestPickedUp event.
	 *
	 * @param request The request entity
	 * @param isHrAdvisor Whether the current user is an HR advisor
	 * @param currentStatus The current status code of the request
	 * @param currentUser The current user entity
	 * @return The updated request entity
	 */
	private RequestEntity handleRequestPickedUp(RequestEntity request, boolean isHrAdvisor,
											   String currentStatus, UserEntity currentUser) {
		if (!isHrAdvisor) {
			throw new UnauthorizedException("Only HR advisors can pick up requests");
		}

		if (!requestStatuses.submitted().equals(currentStatus) &&
			!requestStatuses.hrReview().equals(currentStatus)) {
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
	 */
	private void sendRequestCreatedNotification(RequestEntity request) {
		final var hrAdvisor = request.getHrAdvisor();

		// If there's an HR advisor associated with the request, send the notification to their business email address (assumed to be the GD inbox)
		// TODO: The requirements say to use HR groups GD inbox - should we create a field on the user entity for this?
		if (hrAdvisor != null && hrAdvisor.getBusinessEmailAddress() != null) {
			notificationService.sendRequestNotification(
				hrAdvisor.getBusinessEmailAddress(),
				request.getId(),
				request.getNameEn(),
				RequestEvent.CREATED
			);
		} else {
			log.warn("No HR advisor or business email address found for request ID: [{}]", request.getId());
		}
	}

	/**
	 * Sends a notification when a request is approved and feedback is pending.
	 */
	private void sendRequestFeedbackPendingNotification(RequestEntity request) {
		final var owner = request.getSubmitter();

		// If there's an owner associated with the request, send the notification to their business email address
		if (owner != null && owner.getBusinessEmailAddress() != null) {
			notificationService.sendRequestNotification(
				owner.getBusinessEmailAddress(),
				request.getId(),
				request.getNameEn(),
				RequestEvent.FEEDBACK_PENDING
			);
		} else {
			log.warn("No owner or business email address found for request ID: [{}]", request.getId());
		}
	}

	/**
	 * Approves a request by running the match creation algorithm and updating the status.
	 *
	 * @param request The request entity to approve
	 * @return The updated request entity
	 */
	public RequestEntity approveRequest(RequestEntity request) {
		final boolean isHrAdvisor = SecurityUtils.hasAuthority("hr-advisor");

		// Get current status code
		final String currentStatus = request.getRequestStatus().getCode();

		// Handle the approval
		RequestEntity updatedRequest = handleRunMatches(request, isHrAdvisor, currentStatus);

		return updateRequest(updatedRequest);
	}

	/**
	 * Handles the runMatches event.
	 *
	 * @param request The request entity
	 * @param isHrAdvisor Whether the current user is an HR advisor
	 * @param currentStatus The current status code of the request
	 * @return The updated request entity
	 */
	private RequestEntity handleRunMatches(RequestEntity request, boolean isHrAdvisor, String currentStatus) {
		if (!isHrAdvisor) {
			throw new UnauthorizedException("Only HR advisors can approve requests");
		}

		if (!requestStatuses.hrReview().equals(currentStatus)) {
			throw new ResourceConflictException("Request must be in HR_REVIEW status to be approved");
		}

		boolean hasMatches = createMatches(request);

		if (hasMatches) {
			// Set status to FDBK_PENDING and send notification to the owner
			request.setRequestStatus(getRequestStatusByCode(requestStatuses.feedbackPending()));
			sendRequestFeedbackPendingNotification(request);
		} else {
			// Set status to NO_MATCH_HR_REVIEW
			request.setRequestStatus(getRequestStatusByCode(requestStatuses.noMatchHrReview()));
		}

		return request;
	}

	/**
	 * Creates matches for a request.
	 * This is a dummy implementation that will be replaced with the actual match creation algorithm.
	 *
	 * @param request The request entity
	 * @return True if matches were created, false otherwise (for now always true)
	 */
	private boolean createMatches(RequestEntity request) {
		// dummy (placeholder) implementation that returns true
		log.info("Creating matches for request ID: [{}]", request.getId());

		return true;
	}

	/**
	 * Handles the vmsNotRequired event.
	 *
	 * @param request The request entity
	 * @param isHrAdvisor Whether the current user is an HR advisor
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

		// Set status to PENDING_PSC_NO_VMS
		request.setRequestStatus(getRequestStatusByCode(requestStatuses.pendingPscClearanceNoVms()));

		return request;
	}

	/**
	 * Handles the submitFeedback event.
	 *
	 * @param request The request entity
	 * @param isOwner Whether the current user is the owner of the request
	 * @param currentStatus The current status code of the request
	 * @return The updated request entity
	 */
	private RequestEntity handleSubmitFeedback(RequestEntity request, boolean isOwner, String currentStatus) {
		if (!isOwner) {
			throw new UnauthorizedException("Only the request owner can submit feedback");
		}

		if (!requestStatuses.feedbackPending().equals(currentStatus)) {
			throw new ResourceNotFoundException("Request must be in FDBK_PENDING status to submit feedback");
		}

		// Set status to FDBK_PEND_APPR
		request.setRequestStatus(getRequestStatusByCode(requestStatuses.feedbackPendingApproval()));

		// Loop through all the matches under the requestId and set match status to PENDING
		// This is a placeholder for the actual implementation until the match functionality is implemented
		// Example:
		/*
		List<MatchEntity> matches = matchRepository.findByRequestId(request.getId());
		for (MatchEntity match : matches) {
			match.setStatus(getMatchStatusByCode("PENDING"));
			matchRepository.save(match);
		}
		*/

		// Send notification with the Feedback Completed template to the HR Advisor
		UserEntity hrAdvisor = request.getHrAdvisor();
		if (hrAdvisor != null && hrAdvisor.getBusinessEmailAddress() != null) {
			notificationService.sendRequestNotification(
				hrAdvisor.getBusinessEmailAddress(),
				request.getId(),
				request.getNameEn(),
				RequestEvent.FEEDBACK_COMPLETED
			);
		} else {
			log.warn("No HR advisor or business email address found for request ID: [{}]", request.getId());
		}

		return request;
	}

}
