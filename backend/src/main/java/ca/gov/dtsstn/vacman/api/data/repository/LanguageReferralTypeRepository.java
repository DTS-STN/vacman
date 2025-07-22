package ca.gov.dtsstn.vacman.api.data.repository;

import java.util.Optional;

import org.springframework.data.repository.ListCrudRepository;
import org.springframework.data.repository.PagingAndSortingRepository;
import org.springframework.stereotype.Repository;

import ca.gov.dtsstn.vacman.api.data.entity.LanguageReferralTypeEntity;

@Repository
public interface LanguageReferralTypeRepository extends ListCrudRepository<LanguageReferralTypeEntity, Long>, PagingAndSortingRepository<LanguageReferralTypeEntity, Long> {

	Optional<LanguageReferralTypeEntity> findByCode(String code);

}
