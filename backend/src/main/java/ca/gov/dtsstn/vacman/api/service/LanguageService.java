package ca.gov.dtsstn.vacman.api.service;

import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import ca.gov.dtsstn.vacman.api.data.entity.LanguageEntity;
import ca.gov.dtsstn.vacman.api.data.repository.LanguageRepository;

@Service
public class LanguageService {

    private final LanguageRepository languageRepository;

    public LanguageService(LanguageRepository languageRepository) {
        this.languageRepository = languageRepository;
    }

    public Optional<LanguageEntity> getLanguageByCode(String code) {
        return languageRepository.findByCode(code);
    }

    public Page<LanguageEntity> getLanguages(Pageable pageable) {
        return languageRepository.findAll(pageable);
    }
}
