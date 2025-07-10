package ca.gov.dtsstn.vacman.api.data.repository;

import java.util.Optional;

import org.springframework.data.repository.ListCrudRepository;
import org.springframework.data.repository.PagingAndSortingRepository;
import org.springframework.stereotype.Repository;

import ca.gov.dtsstn.vacman.api.data.entity.AssessmentResultEntity;

@Repository
public interface AssessmentResultRepository extends ListCrudRepository<AssessmentResultEntity, Long>, PagingAndSortingRepository<AssessmentResultEntity, Long> {
    Optional<AssessmentResultEntity> findByCode(String code);
}
