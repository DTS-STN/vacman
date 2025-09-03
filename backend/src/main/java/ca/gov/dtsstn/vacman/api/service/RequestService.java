package ca.gov.dtsstn.vacman.api.service;

import static ca.gov.dtsstn.vacman.api.web.exception.ResourceNotFoundException.asResourceNotFoundException;

import ca.gov.dtsstn.vacman.api.web.exception.ResourceConflictException;
import ca.gov.dtsstn.vacman.api.web.exception.ResourceNotFoundException;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import static ca.gov.dtsstn.vacman.api.web.exception.ResourceNotFoundException.asResourceNotFoundException;

import ca.gov.dtsstn.vacman.api.web.exception.ResourceNotFoundException;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;

import ca.gov.dtsstn.vacman.api.config.properties.LookupCodes;
import ca.gov.dtsstn.vacman.api.config.properties.LookupCodes.RequestStatuses;
import ca.gov.dtsstn.vacman.api.data.entity.RequestEntity;
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
import ca.gov.dtsstn.vacman.api.web.model.RequestUpdateModel;
import org.springframework.stereotype.Service;

import ca.gov.dtsstn.vacman.api.config.properties.LookupCodes;
import ca.gov.dtsstn.vacman.api.config.properties.LookupCodes.RequestStatuses;
import ca.gov.dtsstn.vacman.api.data.entity.RequestEntity;
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
import ca.gov.dtsstn.vacman.api.web.model.RequestUpdateModel;

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
	}

	public RequestEntity createRequest(UserEntity submitter) {
		log.debug("Fetching DRAFT request status");

		final var draftStatus = requestStatusRepository.findByCode(requestStatuses.draft())
			.orElseThrow(asResourceNotFoundException("requestStatus", "code", requestStatuses.draft()));

		return requestRepository
				.save(RequestEntity.builder().submitter(submitter).requestStatus(draftStatus).build());
	}

	public Optional<RequestEntity> getRequestById(long requestId) {
		return requestRepository.findById(requestId);
	}

	public List<RequestEntity> getAllRequestsAssociatedWithUser(Long userId) {
		return requestRepository.findAll().stream()
			.filter(request -> request.getOwnerId().map(id -> id.equals(userId)).orElse(false)
				|| request.getDelegateIds().contains(userId))
			.collect(Collectors.toList());
	}

	/**
	 * Update a request based on the provided update model. This method validates that any IDs exist within the DB
	 * before saving the entity.
	 *
	 * @param updateModel The updated information for the request.
	 * @param request The request entity to be updated.
	 * @return The updated request entity.
	 * @throws ResourceNotFoundException When any given ID does not exist within the DB.
	 */
	public RequestEntity updateRequest(RequestUpdateModel updateModel, RequestEntity request) {
		request.setSelectionProcessNumber(updateModel.selectionProcessNumber());
		request.setWorkforceMgmtApprovalRecvd(updateModel.workforceManagementApproved());
		request.setPriorityEntitlement(updateModel.priorityEntitlement());
		request.setPriorityEntitlementRationale(updateModel.priorityEntitlementRationale());
		request.setHasPerformedSameDuties(updateModel.performedSameDuties());
		request.setStartDate(updateModel.projectedStartDate());
		request.setEndDate(updateModel.projectedEndDate());
		request.setEmploymentEquityNeedIdentifiedIndicator(updateModel.equityNeeded());
		request.setNameEn(updateModel.englishTitle());
		request.setNameFr(updateModel.frenchTitle());
		request.setLanguageProfileEn(updateModel.englishLanguageProfile());
		request.setLanguageProfileFr(updateModel.frenchLanguageProfile());
		request.setSomcAndConditionEmploymentEn(updateModel.englishStatementOfMerit());
		request.setSomcAndConditionEmploymentFr(updateModel.frenchStatementOfMerit());

		request.setPositionNumber(String.join(",", updateModel.positionNumbers()));

		Optional.ofNullable(updateModel.selectionProcessTypeId())
			.map(selectionProcessTypeRepository::getReferenceById)
			.ifPresent(request::setSelectionProcessType);

		Optional.ofNullable(updateModel.nonAdvertisedAppointmentId())
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
			.map(employmentEquityRepository::getReferenceById)
			.collect(Collectors.toList()));

		final var updatedEntity = requestRepository.save(request);

		return updatedEntity;
	}

	/**
	 * Delete a request by ID. The request can only be deleted if its status is "DRAFT".
	 *
	 * @param request The request entity to be deleted.
	 * @throws ResourceConflictException When the request status is not "DRAFT".
	 */
	public void deleteRequest(RequestEntity request) {
		if (!"DRAFT".equals(request.getRequestStatus().getCode())) {
			throw new ResourceConflictException("Request with ID=[" + request.getId() + "] cannot be deleted because its status is not DRAFT");
		}

		requestRepository.delete(request);
	}

}
