package ca.gov.dtsstn.vacman.api.service;

import static ca.gov.dtsstn.vacman.api.web.exception.ResourceNotFoundException.asResourceNotFoundException;

import java.util.Collection;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;
import java.util.stream.Stream;

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
import ca.gov.dtsstn.vacman.api.data.entity.ProfileEntity;
import ca.gov.dtsstn.vacman.api.data.entity.RequestEntity;
import ca.gov.dtsstn.vacman.api.data.entity.RequestStatusEntity;
import ca.gov.dtsstn.vacman.api.data.entity.UserEntity;
import ca.gov.dtsstn.vacman.api.data.repository.CityRepository;
import ca.gov.dtsstn.vacman.api.data.repository.ClassificationRepository;
import ca.gov.dtsstn.vacman.api.data.repository.EmploymentEquityRepository;
import ca.gov.dtsstn.vacman.api.data.repository.EmploymentTenureRepository;
import ca.gov.dtsstn.vacman.api.data.repository.LanguageRepository;
import ca.gov.dtsstn.vacman.api.data.repository.LanguageRequirementRepository;
import ca.gov.dtsstn.vacman.api.data.repository.NonAdvertisedAppointmentRepository;
import ca.gov.dtsstn.vacman.api.data.repository.ProvinceRepository;
import ca.gov.dtsstn.vacman.api.data.repository.RequestRepository;
import ca.gov.dtsstn.vacman.api.data.repository.RequestStatusRepository;
import ca.gov.dtsstn.vacman.api.data.repository.SecurityClearanceRepository;
import ca.gov.dtsstn.vacman.api.data.repository.SelectionProcessTypeRepository;
import ca.gov.dtsstn.vacman.api.data.repository.WorkScheduleRepository;
import ca.gov.dtsstn.vacman.api.data.repository.WorkUnitRepository;
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
	private final EmploymentTenureRepository employmentTenureRepository;
	private final LanguageRepository languageRepository;
	private final LanguageRequirementRepository languageRequirementRepository;
	private final NonAdvertisedAppointmentRepository nonAdvertisedAppointmentRepository;
	private final CityRepository cityRepository;
	private final SecurityClearanceRepository securityClearanceRepository;
	private final SelectionProcessTypeRepository selectionProcessTypeRepository;
	private final WorkScheduleRepository workScheduleRepository;
	private final WorkUnitRepository workUnitRepository;
	private final RequestModelMapper requestModelMapper;
	private final UserService userService;
	private final NotificationService notificationService;
	private final ApplicationProperties applicationProperties;

	public RequestService(
			LookupCodes lookupCodes, RequestRepository requestRepository,
			RequestStatusRepository requestStatusRepository,
			ClassificationRepository classificationRepository,
			EmploymentEquityRepository employmentEquityRepository,
			EmploymentTenureRepository employmentTenureRepository,
			LanguageRepository languageRepository,
			LanguageRequirementRepository languageRequirementRepository,
			NonAdvertisedAppointmentRepository nonAdvertisedAppointmentRepository,
			ProvinceRepository provinceRepository,
			CityRepository cityRepository,
			SecurityClearanceRepository securityClearanceRepository,
			SelectionProcessTypeRepository selectionProcessTypeRepository,
			WorkScheduleRepository workScheduleRepository,
			WorkUnitRepository workUnitRepository,
			UserService userService,
			NotificationService notificationService,
			ApplicationEventPublisher eventPublisher,
			ApplicationProperties applicationProperties) {
		this.requestStatuses = lookupCodes.requestStatuses();
		this.requestRepository = requestRepository;
		this.requestStatusRepository = requestStatusRepository;
		this.classificationRepository = classificationRepository;
		this.employmentEquityRepository = employmentEquityRepository;
		this.employmentTenureRepository = employmentTenureRepository;
		this.languageRepository = languageRepository;
		this.languageRequirementRepository = languageRequirementRepository;
		this.nonAdvertisedAppointmentRepository = nonAdvertisedAppointmentRepository;
		this.cityRepository = cityRepository;
		this.securityClearanceRepository = securityClearanceRepository;
		this.selectionProcessTypeRepository = selectionProcessTypeRepository;
		this.workScheduleRepository = workScheduleRepository;
		this.workUnitRepository = workUnitRepository;
		this.userService = userService;
		this.notificationService = notificationService;
		this.applicationProperties = applicationProperties;
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
	 * @param pageable    Pagination information
	 * @param hrAdvisorId Optional HR advisor ID to filter by (null for no
	 *                    filtering)
	 * @return Page of request entities
	 */
	@Transactional(readOnly = true)
	public Page<RequestEntity> getAllRequests(Pageable pageable, Long hrAdvisorId) {
		if (hrAdvisorId == null) {
			return requestRepository.findAll(pageable);
		} else {
			return requestRepository.findAll(
					RequestRepository.hasHrAdvisorId(hrAdvisorId),
					pageable);
		}
	}

	/**
	 * Update a request based on the provided entity. This method saves the entity
	 * to the database.
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

		Optional.ofNullable(updateModel.employmentTenureId())
				.map(employmentTenureRepository::getReferenceById)
				.ifPresent(request::setEmploymentTenure);

		Optional.ofNullable(updateModel.classificationId())
				.map(classificationRepository::getReferenceById)
				.ifPresent(request::setClassification);

		if (updateModel.languageOfCorrespondenceId() == null) {
			request.setLanguage(null);
		} else {
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
		} else {
			request.setWorkUnit(workUnitRepository.getReferenceById(updateModel.workUnitId()));
		}

		request.setEmploymentEquities(Optional.ofNullable(updateModel.employmentEquityIds()).stream()
				.flatMap(Collection::stream)
				.map(RequestUpdateModel.EmploymentEquityId::value)
				.map(employmentEquityRepository::getReferenceById)
				.collect(Collectors.toList()));

		request.setCities(Optional.ofNullable(updateModel.cityIds()).stream()
				.flatMap(Collection::stream)
				.map(RequestUpdateModel.CityId::value)
				.map(cityRepository::getReferenceById)
				.collect(Collectors.toList()));

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
		if (userId == null) {
			return null;
		}

		return userService.getUserById(userId)
				.orElseThrow(asResourceNotFoundException("user", userId));
	}

	public void deleteRequest(Long requestId) {
		final var request = getRequestById(requestId)
				.orElseThrow(asResourceNotFoundException("request", requestId));

		if (!requestStatuses.draft().equals(request.getRequestStatus().getCode())) {
			throw new ResourceConflictException(
					"Request with ID=[" + requestId + "] cannot be deleted because its status is not DRAFT");
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
			case "pscNotRequired" ->
				handlePscNotRequired(request, isHrAdvisor, currentStatus);
			case "pscRequired" ->
				handlePscRequired(request, isHrAdvisor, currentStatus);
			case "complete" ->
				handleComplete(request, isHrAdvisor, currentStatus);
			default ->
				throw new IllegalArgumentException("Unknown event type: " + eventType);
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
		notificationService.sendRequestNotification(
				applicationProperties.gcnotify().hrGdInboxEmail(),
				request.getId(),
				request.getNameEn(),
				RequestEvent.CREATED);
	}

	/**
	 * Cancels a request.
	 *
	 * @param requestId The ID of the request to cancel
	 * @return The updated request entity
	 */
	public RequestEntity cancelRequest(Long requestId) {

		final var request = getRequestById(requestId)
			.orElseThrow(asResourceNotFoundException("request", requestId));

		// Set status to CANCELLED
		request.setRequestStatus(getRequestStatusByCode(requestStatuses.cancelled()));

		return updateRequest(request);
	}

	/**
	 * Sends a notification when a request is approved and feedback is pending.
	 */
	private void sendRequestFeedbackPendingNotification(RequestEntity request) {
		Optional.ofNullable(request.getSubmitter())
				.map(this::getEmployeeEmails)
				.filter(emails -> !emails.isEmpty())
				.ifPresentOrElse(
						emails -> notificationService.sendRequestNotification(
								emails,
								request.getId(),
								request.getNameEn(),
								RequestEvent.FEEDBACK_PENDING),
						() -> log.warn("No email addresses found for request ID: [{}]", request.getId()));
	}

	/**
	 * Runs the match creation algorithm for a request and updates the status.
	 *
	 * @param request The request entity to run matches for
	 * @return The updated request entity
	 */
	public RequestEntity runMatches(RequestEntity request) {
		final String currentStatus = request.getRequestStatus().getCode();

		RequestEntity updatedRequest = handleRunMatches(request, currentStatus);

		return updateRequest(updatedRequest);
	}

	/**
	 * Handles the runMatches event.
	 *
	 * @param request The request entity
	 * @param currentStatus The current status code of the request
	 * @return The updated request entity
	 */
	private RequestEntity handleRunMatches(RequestEntity request, String currentStatus) {

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
	 * This is a dummy implementation that will be replaced with the actual match
	 * creation algorithm.
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

		// Send notification with the Feedback Completed template to the HR Advisor
		UserEntity hrAdvisor = request.getHrAdvisor();
		if (hrAdvisor != null && hrAdvisor.getBusinessEmailAddress() != null) {
			notificationService.sendRequestNotification(
					hrAdvisor.getBusinessEmailAddress(),
					request.getId(),
					request.getNameEn(),
					RequestEvent.FEEDBACK_COMPLETED);
		} else {
			log.warn("No HR advisor or business email address found for request ID: [{}]", request.getId());
		}

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

		if (!requestStatuses.feedbackPendingApproval().equals(currentStatus)) {
			throw new ResourceConflictException("Request must be in FDBK_PEND_APPR status to be marked as PSC not required");
		}

		// Set status to CLR_GRANTED
		request.setRequestStatus(getRequestStatusByCode(requestStatuses.clearanceGranted()));

		// Generate VacMan clearance number (16 character ID with letters and numbers)
		// TODO: Real implementation (ADO task 6691)
		final var clearanceNumber = RandomStringUtils.insecure().nextAlphanumeric(16).toUpperCase();
		request.setPscClearanceNumber(clearanceNumber);

		// TODO: send notification (details need to be worked out)

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

		if (!requestStatuses.feedbackPendingApproval().equals(currentStatus)) {
			throw new ResourceConflictException("Request must be in FDBK_PEND_APPR status to be marked as PSC required");
		}

		// Set status to PENDING_PSC
		request.setRequestStatus(getRequestStatusByCode(requestStatuses.pendingPscClearance()));

		// Generate VacMan clearance number (16 character ID with letters and numbers)
		final var clearanceNumber = RandomStringUtils.insecure().nextAlphanumeric(16).toUpperCase();
		request.setPscClearanceNumber(clearanceNumber);

		// TODO: send notification (details need to be worked out)

		return request;
	}

	private List<String> getEmployeeEmails(UserEntity owner) {
		final var businessEmail = Optional.ofNullable(owner.getBusinessEmailAddress())
				.filter(StringUtils::hasText);

		final var personalEmail = owner.getProfiles().stream()
				.map(ProfileEntity::getPersonalEmailAddress)
				.filter(StringUtils::hasText).findFirst();

		return Stream.of(businessEmail, personalEmail)
				.filter(Optional::isPresent)
				.map(Optional::get).toList();
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

		if (!requestStatuses.pendingPscClearance().equals(currentStatus) &&
				!requestStatuses.pendingPscClearanceNoVms().equals(currentStatus)) {
			throw new ResourceConflictException(
					"Request must be in PENDING_PSC or PENDING_PSC_NO_VMS status to be completed");
		}

		// Set status to PSC_GRANTED
		request.setRequestStatus(getRequestStatusByCode(requestStatuses.pscClearanceGranted()));

		return request;
	}

}
