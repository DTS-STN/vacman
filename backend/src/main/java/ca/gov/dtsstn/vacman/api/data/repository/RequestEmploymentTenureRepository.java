package ca.gov.dtsstn.vacman.api.data.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.repository.ListCrudRepository;
import org.springframework.data.repository.PagingAndSortingRepository;
import org.springframework.stereotype.Repository;

import ca.gov.dtsstn.vacman.api.data.entity.RequestEmploymentTenureEntity;

@Repository
public interface RequestEmploymentTenureRepository extends ListCrudRepository<RequestEmploymentTenureEntity, Long>, PagingAndSortingRepository<RequestEmploymentTenureEntity, Long> {

    List<RequestEmploymentTenureEntity> findByRequestId(Long requestId);

    List<RequestEmploymentTenureEntity> findByEmploymentTenureId(Long employmentTenureId);

    Optional<RequestEmploymentTenureEntity> findByRequestIdAndEmploymentTenureId(Long requestId, Long employmentTenureId);

    void deleteByRequestId(Long requestId);

    void deleteByRequestIdAndEmploymentTenureId(Long requestId, Long employmentTenureId);
}
