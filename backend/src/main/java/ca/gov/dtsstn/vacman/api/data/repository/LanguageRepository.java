package ca.gov.dtsstn.vacman.api.data.repository;

import java.util.Optional;

import org.springframework.data.repository.ListCrudRepository;
import org.springframework.data.repository.PagingAndSortingRepository;
import org.springframework.stereotype.Repository;

import ca.gov.dtsstn.vacman.api.data.entity.LanguageEntity;

@Repository
public interface LanguageRepository extends ListCrudRepository<LanguageEntity, Long>, PagingAndSortingRepository<LanguageEntity, Long> {
    Optional<LanguageEntity> findByCode(String code);
}
