package ca.gov.dtsstn.vacman.api.service;

import ca.gov.dtsstn.vacman.api.data.entity.WorkUnitEntity;
import ca.gov.dtsstn.vacman.api.data.repository.WorkUnitRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class WorkUnitService {

    private final WorkUnitRepository workUnitRepository;

    public WorkUnitService(WorkUnitRepository workUnitRepository) {
        this.workUnitRepository = workUnitRepository;
    }

    public List<WorkUnitEntity> getAllWorkUnits() {
        return List.copyOf(workUnitRepository.findAll());
    }

    public Optional<WorkUnitEntity> getWorkUnitByCode(String code) {
        return workUnitRepository.findByCode(code);
    }

    public Page<WorkUnitEntity> getWorkUnits(Pageable pageable) {
        return workUnitRepository.findAll(pageable);
    }
}
