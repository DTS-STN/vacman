package ca.gov.dtsstn.vacman.api.service;

import ca.gov.dtsstn.vacman.api.data.entity.ClassificationEntity;
import ca.gov.dtsstn.vacman.api.data.repository.ClassificationRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class ClassificationService {

    private final ClassificationRepository classificationRepository;

    public ClassificationService(ClassificationRepository classificationRepository) {
        this.classificationRepository = classificationRepository;
    }

    public List<ClassificationEntity> getAllClassifications() {
        return List.copyOf(classificationRepository.findAll());
    }

    public Optional<ClassificationEntity> getClassificationByCode(String code) {
        return classificationRepository.findByCode(code);
    }
}