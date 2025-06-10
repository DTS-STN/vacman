package ca.gov.dtsstn.vacman.api.service;

import ca.gov.dtsstn.vacman.api.data.entity.LanguageReferralTypeEntity;
import ca.gov.dtsstn.vacman.api.data.repository.LanguageReferralTypeRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class LanguageReferralTypeService {

    private final LanguageReferralTypeRepository languageReferralTypeRepository;

    public LanguageReferralTypeService(LanguageReferralTypeRepository languageReferralTypeRepository) {
        this.languageReferralTypeRepository = languageReferralTypeRepository;
    }

    public List<LanguageReferralTypeEntity> getAllLanguageReferralTypes() {
        return List.copyOf(languageReferralTypeRepository.findAll());
    }

    public Optional<LanguageReferralTypeEntity> getLanguageReferralTypeByCode(String code) {
        return languageReferralTypeRepository.findByCode(code);
    }
}