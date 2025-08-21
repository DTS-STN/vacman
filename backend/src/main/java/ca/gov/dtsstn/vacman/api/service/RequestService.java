package ca.gov.dtsstn.vacman.api.service;

import static ca.gov.dtsstn.vacman.api.web.exception.ResourceNotFoundException.asResourceNotFoundException;

import java.util.List;
import java.util.Optional;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Example;
import org.springframework.stereotype.Service;

import ca.gov.dtsstn.vacman.api.data.entity.RequestEntity;
import ca.gov.dtsstn.vacman.api.data.entity.RequestEntityBuilder;
import ca.gov.dtsstn.vacman.api.data.entity.RequestStatusEntityBuilder;
import ca.gov.dtsstn.vacman.api.data.entity.UserEntity;
import ca.gov.dtsstn.vacman.api.data.entity.UserEntityBuilder;
import ca.gov.dtsstn.vacman.api.data.repository.RequestRepository;
import ca.gov.dtsstn.vacman.api.data.repository.RequestStatusRepository;

@Service
public class RequestService {

	private static final Logger log = LoggerFactory.getLogger(RequestService.class);

	private final RequestRepository requestRepository;

	private final RequestStatusRepository requestStatusRepository;

	public RequestService(RequestRepository requestRepository, RequestStatusRepository requestStatusRepository) {
		this.requestRepository = requestRepository;
		this.requestStatusRepository = requestStatusRepository;
	}

	public RequestEntity createRequest(UserEntity submitter) {
		log.debug("Fetching DRAFT request status");

		final var requestStatusExample = Example.of(new RequestStatusEntityBuilder().code("DRAFT").build());

		final var draftStatus = requestStatusRepository.findOne(requestStatusExample)
			.orElseThrow(asResourceNotFoundException("requestStatus", "code", "DRAFT"));

		return requestRepository
				.save(new RequestEntityBuilder().submitter(submitter).requestStatus(draftStatus).build());
	}

	public Optional<RequestEntity> getRequestById(long requestId) {
		return requestRepository.findById(requestId);
	}

	public List<RequestEntity> getRequestsByUserId(long userId) {
		final var example = Example
				.of(new RequestEntityBuilder().submitter(new UserEntityBuilder().id(userId).build()).build());

		return requestRepository.findAll(example);
	}

}
