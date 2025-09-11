package ca.gov.dtsstn.vacman.api.service;

import static ca.gov.dtsstn.vacman.api.data.repository.ProfileRepository.hasHrAdvisorId;
import static ca.gov.dtsstn.vacman.api.web.exception.ResourceNotFoundException.asResourceNotFoundException;

import ca.gov.dtsstn.vacman.api.web.exception.ResourceConflictException;
import ca.gov.dtsstn.vacman.api.web.exception.ResourceNotFoundException;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;

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
import ca.gov.dtsstn.vacman.api.web.model.mapper.RequestModelMapper;
import org.mapstruct.factory.Mappers;

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
		this.requestModelMapper = Mappers.getMapper(RequestModelMapper.class);
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
	 * Get all requests, optionally filtered by HR advisor ID.
	 *
	 * @param pageable Pagination information
	 * @param hrAdvisorId Optional HR advisor ID to filter by (null for no filtering)
	 * @return Page of request entities
	 */
	public Page<RequestEntity> getAllRequests(Pageable pageable, Long hrAdvisorId) {
		if (hrAdvisorId == null) {
			return requestRepository.findAll(pageable);
		} else {
			return requestRepository.findAll(
				(root, query, criteriaBuilder) ->
						criteriaBuilder.equal(root.get("hrAdvisor").get("id"), hrAdvisorId),
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
	public RequestEntity updateRequest(RequestEntity request) {
		final var updatedEntity = requestRepository.save(request);

		return updatedEntity;
	}

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
		RequestEntity request = getRequestById(requestId)
			.orElseThrow(asResourceNotFoundException("request", requestId));

		if (!"DRAFT".equals(request.getRequestStatus().getCode())) {
			throw new ResourceConflictException("Request with ID=[" + requestId + "] cannot be deleted because its status is not DRAFT");
		}

		requestRepository.delete(request);
	}

}
