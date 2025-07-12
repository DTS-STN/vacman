package ca.gov.dtsstn.vacman.api.service;

import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;

import ca.gov.dtsstn.vacman.api.data.entity.LanguageRequirementEntity;
import ca.gov.dtsstn.vacman.api.data.repository.LanguageRequirementRepository;

@Service
public class LanguageRequirementService {

    private final LanguageRequirementRepository languageRequirementRepository;

    public LanguageRequirementService(LanguageRequirementRepository languageRequirementRepository) {
        this.languageRequirementRepository = languageRequirementRepository;
    }

    public List<LanguageRequirementEntity> getAllLanguageRequirements() {
        return languageRequirementRepository.findAll();
    }

    public Optional<LanguageRequirementEntity> getLanguageRequirementById(Long id) {
        return languageRequirementRepository.findById(id);
    }

    public Optional<LanguageRequirementEntity> getLanguageRequirementByCode(String code) {
        return languageRequirementRepository.findByCode(code);
    }

    public LanguageRequirementEntity saveLanguageRequirement(LanguageRequirementEntity languageRequirement) {
        return languageRequirementRepository.save(languageRequirement);
    }

    public void deleteLanguageRequirement(Long id) {
        languageRequirementRepository.deleteById(id);
    }
}
