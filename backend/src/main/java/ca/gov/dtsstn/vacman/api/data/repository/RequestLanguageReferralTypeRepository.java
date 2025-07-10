package ca.gov.dtsstn.vacman.api.data.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.repository.ListCrudRepository;
import org.springframework.data.repository.PagingAndSortingRepository;
import org.springframework.stereotype.Repository;

import ca.gov.dtsstn.vacman.api.data.entity.RequestLanguageReferralTypeEntity;

@Repository
public interface RequestLanguageReferralTypeRepository extends ListCrudRepository<RequestLanguageReferralTypeEntity, Long>, PagingAndSortingRepository<RequestLanguageReferralTypeEntity, Long> {

    List<RequestLanguageReferralTypeEntity> findByRequestId(Long requestId);

    List<RequestLanguageReferralTypeEntity> findByLanguageReferralTypeId(Long languageReferralTypeId);

    Optional<RequestLanguageReferralTypeEntity> findByRequestIdAndLanguageReferralTypeId(Long requestId, Long languageReferralTypeId);

    void deleteByRequestId(Long requestId);

    void deleteByRequestIdAndLanguageReferralTypeId(Long requestId, Long languageReferralTypeId);
}
