package ca.gov.dtsstn.vacman.api.data.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.repository.ListCrudRepository;
import org.springframework.data.repository.PagingAndSortingRepository;
import org.springframework.stereotype.Repository;

import ca.gov.dtsstn.vacman.api.data.entity.ProfileRequestEntity;

@Repository
public interface ProfileRequestRepository extends ListCrudRepository<ProfileRequestEntity, Long>, PagingAndSortingRepository<ProfileRequestEntity, Long> {

    List<ProfileRequestEntity> findByProfileId(Long profileId);

    List<ProfileRequestEntity> findByRequestId(Long requestId);

    Optional<ProfileRequestEntity> findByProfileIdAndRequestId(Long profileId, Long requestId);

    List<ProfileRequestEntity> findByAssessedById(Long assessedById);

    List<ProfileRequestEntity> findByApprovedById(Long approvedById);

    void deleteByProfileId(Long profileId);

    void deleteByRequestId(Long requestId);
}
