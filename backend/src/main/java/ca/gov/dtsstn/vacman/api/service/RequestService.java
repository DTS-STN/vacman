package ca.gov.dtsstn.vacman.api.service;

import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import ca.gov.dtsstn.vacman.api.data.entity.RequestEntity;
import ca.gov.dtsstn.vacman.api.data.repository.RequestRepository;

@Service
public class RequestService {

    private final RequestRepository requestRepository;

    public RequestService(RequestRepository requestRepository) {
        this.requestRepository = requestRepository;
    }

    public List<RequestEntity> getAllRequests() {
        return requestRepository.findAll();
    }

    public Page<RequestEntity> getRequests(Pageable pageable) {
        return requestRepository.findAll(pageable);
    }

    public Optional<RequestEntity> getRequestById(Long id) {
        return requestRepository.findById(id);
    }

    public RequestEntity saveRequest(RequestEntity request) {
        return requestRepository.save(request);
    }

    public void deleteRequest(Long id) {
        requestRepository.deleteById(id);
    }

    public boolean existsById(Long id) {
        return requestRepository.existsById(id);
    }
}
