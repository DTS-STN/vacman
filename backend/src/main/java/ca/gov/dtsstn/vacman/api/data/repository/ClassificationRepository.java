package ca.gov.dtsstn.vacman.api.data.repository;

import java.util.Optional;

import org.springframework.data.repository.ListCrudRepository;
import org.springframework.data.repository.PagingAndSortingRepository;
import org.springframework.stereotype.Repository;

import ca.gov.dtsstn.vacman.api.data.entity.ClassificationEntity;

@Repository
public interface ClassificationRepository extends ListCrudRepository<ClassificationEntity, Long>, PagingAndSortingRepository<ClassificationEntity, Long> {
    Optional<ClassificationEntity> findByCode(String code);
}
