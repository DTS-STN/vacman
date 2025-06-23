package ca.gov.dtsstn.vacman.api.service;

import ca.gov.dtsstn.vacman.api.data.entity.EducationLevelEntity;
import ca.gov.dtsstn.vacman.api.data.repository.EducationLevelRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class EducationLevelService {

    private final EducationLevelRepository educationLevelRepository;

    public EducationLevelService(EducationLevelRepository educationLevelRepository) {
        this.educationLevelRepository = educationLevelRepository;
    }

    public Optional<EducationLevelEntity> getEducationLevelByCode(String code) {
        return educationLevelRepository.findByCode(code);
    }

    public Page<EducationLevelEntity> getEducationLevels(Pageable pageable) {
        return educationLevelRepository.findAll(pageable);
    }
}
