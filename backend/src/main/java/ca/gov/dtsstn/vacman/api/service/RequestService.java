package ca.gov.dtsstn.vacman.api.service;

import static ca.gov.dtsstn.vacman.api.web.exception.ResourceNotFoundException.asResourceNotFoundException;

import java.util.List;
import java.util.Optional;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Example;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import ca.gov.dtsstn.vacman.api.config.properties.LookupCodes;
import ca.gov.dtsstn.vacman.api.config.properties.LookupCodes.RequestStatuses;
import ca.gov.dtsstn.vacman.api.data.entity.RequestEntity;
import ca.gov.dtsstn.vacman.api.data.entity.UserEntity;
import ca.gov.dtsstn.vacman.api.data.repository.RequestRepository;
import ca.gov.dtsstn.vacman.api.data.repository.RequestStatusRepository;

@Service
public class RequestService {

	private static final Logger log = LoggerFactory.getLogger(RequestService.class);

	private final RequestRepository requestRepository;

	private final RequestStatuses requestStatuses;

	private final RequestStatusRepository requestStatusRepository;

	public RequestService(
			LookupCodes lookupCodes,
			RequestRepository requestRepository,
			RequestStatusRepository requestStatusRepository) {
		this.requestStatuses = lookupCodes.requestStatuses();
		this.requestRepository = requestRepository;
		this.requestStatusRepository = requestStatusRepository;
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
	public List<RequestEntity> getRequestsByUserId(long userId) {
		final var example = Example
				.of(RequestEntity.builder().submitter(UserEntity.builder().id(userId).build()).build());

		return requestRepository.findAll(example);
	}

}
