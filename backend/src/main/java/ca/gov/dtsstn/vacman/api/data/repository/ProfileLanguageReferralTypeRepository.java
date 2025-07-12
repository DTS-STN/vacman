package ca.gov.dtsstn.vacman.api.data.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.repository.ListCrudRepository;
import org.springframework.data.repository.PagingAndSortingRepository;
import org.springframework.stereotype.Repository;

import ca.gov.dtsstn.vacman.api.data.entity.ProfileLanguageReferralTypeEntity;

@Repository
public interface ProfileLanguageReferralTypeRepository extends ListCrudRepository<ProfileLanguageReferralTypeEntity, Long>, PagingAndSortingRepository<ProfileLanguageReferralTypeEntity, Long> {

    List<ProfileLanguageReferralTypeEntity> findByProfileId(Long profileId);

    List<ProfileLanguageReferralTypeEntity> findByLanguageReferralTypeId(Long languageReferralTypeId);

    Optional<ProfileLanguageReferralTypeEntity> findByProfileIdAndLanguageReferralTypeId(Long profileId, Long languageReferralTypeId);

    void deleteByProfileId(Long profileId);

    void deleteByProfileIdAndLanguageReferralTypeId(Long profileId, Long languageReferralTypeId);
}
