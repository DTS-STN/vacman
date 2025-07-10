package ca.gov.dtsstn.vacman.api.service;

import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import ca.gov.dtsstn.vacman.api.data.entity.AssessmentResultEntity;
import ca.gov.dtsstn.vacman.api.data.repository.AssessmentResultRepository;

@Service
public class AssessmentResultService {

    private final AssessmentResultRepository assessmentResultRepository;

    public AssessmentResultService(AssessmentResultRepository assessmentResultRepository) {
        this.assessmentResultRepository = assessmentResultRepository;
    }

    public List<AssessmentResultEntity> getAllAssessmentResults() {
        return assessmentResultRepository.findAll();
    }

    public Page<AssessmentResultEntity> getAssessmentResults(Pageable pageable) {
        return assessmentResultRepository.findAll(pageable);
    }

    public Optional<AssessmentResultEntity> getAssessmentResultById(Long id) {
        return assessmentResultRepository.findById(id);
    }

    public Optional<AssessmentResultEntity> getAssessmentResultByCode(String code) {
        return assessmentResultRepository.findByCode(code);
    }

    public AssessmentResultEntity saveAssessmentResult(AssessmentResultEntity assessmentResult) {
        return assessmentResultRepository.save(assessmentResult);
    }

    public void deleteAssessmentResult(Long id) {
        assessmentResultRepository.deleteById(id);
    }
}
