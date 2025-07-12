package ca.gov.dtsstn.vacman.api.service;

import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import ca.gov.dtsstn.vacman.api.data.entity.PriorityLevelEntity;
import ca.gov.dtsstn.vacman.api.data.repository.PriorityLevelRepository;

@Service
public class PriorityLevelService {

    private final PriorityLevelRepository priorityLevelRepository;

    public PriorityLevelService(PriorityLevelRepository priorityLevelRepository) {
        this.priorityLevelRepository = priorityLevelRepository;
    }

    public List<PriorityLevelEntity> getAllPriorityLevels() {
        return priorityLevelRepository.findAll();
    }

    public Page<PriorityLevelEntity> getPriorityLevels(Pageable pageable) {
        return priorityLevelRepository.findAll(pageable);
    }

    public Optional<PriorityLevelEntity> getPriorityLevelById(Long id) {
        return priorityLevelRepository.findById(id);
    }

    public Optional<PriorityLevelEntity> getPriorityLevelByCode(String code) {
        return priorityLevelRepository.findByCode(code);
    }

    public PriorityLevelEntity savePriorityLevel(PriorityLevelEntity priorityLevel) {
        return priorityLevelRepository.save(priorityLevel);
    }

    public void deletePriorityLevel(Long id) {
        priorityLevelRepository.deleteById(id);
    }
}
