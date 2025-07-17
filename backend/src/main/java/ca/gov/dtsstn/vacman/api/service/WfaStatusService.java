package ca.gov.dtsstn.vacman.api.service;

import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import ca.gov.dtsstn.vacman.api.data.entity.WfaStatusEntity;
import ca.gov.dtsstn.vacman.api.data.repository.WfaStatusRepository;

@Service
public class WfaStatusService {

    private final WfaStatusRepository wfaStatusRepository;

    public WfaStatusService(WfaStatusRepository wfaStatusRepository) {
        this.wfaStatusRepository = wfaStatusRepository;
    }

    public Optional<WfaStatusEntity> getWfaStatusByCode(String code) {
        return wfaStatusRepository.findByCode(code);
    }

    public Page<WfaStatusEntity> getWfaStatuses(Pageable pageable) {
        return wfaStatusRepository.findAll(pageable);
    }

}
