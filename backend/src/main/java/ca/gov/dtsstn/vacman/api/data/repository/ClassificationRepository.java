package ca.gov.dtsstn.vacman.api.data.repository;

import ca.gov.dtsstn.vacman.api.data.entity.ClassificationEntity;
import org.springframework.data.repository.ListCrudRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ClassificationRepository extends ListCrudRepository<ClassificationEntity, Long> {
    Optional<ClassificationEntity> findByCode(String code);
}