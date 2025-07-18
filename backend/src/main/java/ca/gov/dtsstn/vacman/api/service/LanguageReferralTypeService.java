package ca.gov.dtsstn.vacman.api.service;

import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import ca.gov.dtsstn.vacman.api.data.entity.LanguageReferralTypeEntity;
import ca.gov.dtsstn.vacman.api.data.repository.LanguageReferralTypeRepository;

@Service
public class LanguageReferralTypeService {

    private final LanguageReferralTypeRepository languageReferralTypeRepository;

    public LanguageReferralTypeService(LanguageReferralTypeRepository languageReferralTypeRepository) {
        this.languageReferralTypeRepository = languageReferralTypeRepository;
    }

    public Optional<LanguageReferralTypeEntity> getLanguageReferralTypeByCode(String code) {
        return languageReferralTypeRepository.findByCode(code);
    }

    public Page<LanguageReferralTypeEntity> getLanguageReferralTypes(Pageable pageable) {
        return languageReferralTypeRepository.findAll(pageable);
    }
}
