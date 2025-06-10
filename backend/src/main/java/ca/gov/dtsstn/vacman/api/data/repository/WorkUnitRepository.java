package ca.gov.dtsstn.vacman.api.data.repository;

import ca.gov.dtsstn.vacman.api.data.entity.WorkUnitEntity;
import org.springframework.data.repository.ListCrudRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface WorkUnitRepository extends ListCrudRepository<WorkUnitEntity, Long> {
    Optional<WorkUnitEntity> findByCode(String code);
}