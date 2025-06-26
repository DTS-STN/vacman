package ca.gov.dtsstn.vacman.api.data.repository;

import ca.gov.dtsstn.vacman.api.data.entity.LanguageReferralTypeEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.repository.ListCrudRepository;
import org.springframework.data.repository.PagingAndSortingRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface LanguageReferralTypeRepository extends ListCrudRepository<LanguageReferralTypeEntity, Long>, PagingAndSortingRepository<LanguageReferralTypeEntity, Long> {
    Optional<LanguageReferralTypeEntity> findByCode(String code);
}
