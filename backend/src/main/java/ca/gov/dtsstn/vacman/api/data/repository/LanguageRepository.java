package ca.gov.dtsstn.vacman.api.data.repository;

import java.util.Optional;

import org.springframework.stereotype.Repository;

import ca.gov.dtsstn.vacman.api.data.entity.LanguageEntity;

@Repository
public interface LanguageRepository extends AbstractBaseRepository<LanguageEntity> {
    Optional<LanguageEntity> findByCode(String code);
}
