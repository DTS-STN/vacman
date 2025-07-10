package ca.gov.dtsstn.vacman.api.service;

import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import ca.gov.dtsstn.vacman.api.data.entity.RequestStatusEntity;
import ca.gov.dtsstn.vacman.api.data.repository.RequestStatusRepository;

@Service
public class RequestStatusService {

    private final RequestStatusRepository requestStatusRepository;

    public RequestStatusService(RequestStatusRepository requestStatusRepository) {
        this.requestStatusRepository = requestStatusRepository;
    }

    public List<RequestStatusEntity> getAllRequestStatuses() {
        return requestStatusRepository.findAll();
    }

    public Page<RequestStatusEntity> getRequestStatuses(Pageable pageable) {
        return requestStatusRepository.findAll(pageable);
    }

    public Optional<RequestStatusEntity> getRequestStatusById(Long id) {
        return requestStatusRepository.findById(id);
    }

    public Optional<RequestStatusEntity> getRequestStatusByCode(String code) {
        return requestStatusRepository.findByCode(code);
    }

    public RequestStatusEntity saveRequestStatus(RequestStatusEntity requestStatus) {
        return requestStatusRepository.save(requestStatus);
    }

    public void deleteRequestStatus(Long id) {
        requestStatusRepository.deleteById(id);
    }
}
