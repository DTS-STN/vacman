package ca.gov.dtsstn.vacman.api.service;

import java.util.List;

import org.springframework.stereotype.Service;

import ca.gov.dtsstn.vacman.api.data.entity.WfaStatusEntity;
import ca.gov.dtsstn.vacman.api.data.repository.WfaStatusRepository;

@Service
public class WfaStatusService {

    private final WfaStatusRepository wfaStatusRepository;

    public WfaStatusService(WfaStatusRepository wfaStatusRepository) {
        this.wfaStatusRepository = wfaStatusRepository;
    }

    public List<WfaStatusEntity> getAllWfaStatuses() {
        return List.copyOf(wfaStatusRepository.findAll());
    }
}