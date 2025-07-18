package ca.gov.dtsstn.vacman.api.service;

import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import ca.gov.dtsstn.vacman.api.data.entity.ClassificationEntity;
import ca.gov.dtsstn.vacman.api.data.repository.ClassificationRepository;

@Service
public class ClassificationService {

    private final ClassificationRepository classificationRepository;

    public ClassificationService(ClassificationRepository classificationRepository) {
        this.classificationRepository = classificationRepository;
    }

    public Optional<ClassificationEntity> getClassificationByCode(String code) {
        return classificationRepository.findByCode(code);
    }

    public Page<ClassificationEntity> getClassifications(Pageable pageable) {
        return classificationRepository.findAll(pageable);
    }
}
