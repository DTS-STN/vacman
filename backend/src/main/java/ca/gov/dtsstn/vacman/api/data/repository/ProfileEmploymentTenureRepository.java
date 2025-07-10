package ca.gov.dtsstn.vacman.api.data.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.repository.ListCrudRepository;
import org.springframework.data.repository.PagingAndSortingRepository;
import org.springframework.stereotype.Repository;

import ca.gov.dtsstn.vacman.api.data.entity.ProfileEmploymentTenureEntity;

@Repository
public interface ProfileEmploymentTenureRepository extends ListCrudRepository<ProfileEmploymentTenureEntity, Long>, PagingAndSortingRepository<ProfileEmploymentTenureEntity, Long> {

    List<ProfileEmploymentTenureEntity> findByProfileId(Long profileId);

    List<ProfileEmploymentTenureEntity> findByEmploymentTenureId(Long employmentTenureId);

    Optional<ProfileEmploymentTenureEntity> findByProfileIdAndEmploymentTenureId(Long profileId, Long employmentTenureId);

    void deleteByProfileId(Long profileId);

    void deleteByProfileIdAndEmploymentTenureId(Long profileId, Long employmentTenureId);
}
