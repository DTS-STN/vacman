package ca.gov.dtsstn.vacman.api.service;

import ca.gov.dtsstn.vacman.api.data.entity.EducationLevelEntity;
import ca.gov.dtsstn.vacman.api.data.repository.EducationLevelRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class EducationLevelService {

    private final EducationLevelRepository educationLevelRepository;

    public EducationLevelService(EducationLevelRepository educationLevelRepository) {
        this.educationLevelRepository = educationLevelRepository;
    }

    public List<EducationLevelEntity> getAllEducationLevels() {
        return List.copyOf(educationLevelRepository.findAll());
    }

    public Optional<EducationLevelEntity> getEducationLevelByCode(String code) {
        return educationLevelRepository.findByCode(code);
    }
}