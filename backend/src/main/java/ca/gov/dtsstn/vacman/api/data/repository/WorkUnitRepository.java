package ca.gov.dtsstn.vacman.api.data.repository;

import java.util.Optional;

import org.springframework.data.repository.ListCrudRepository;
import org.springframework.data.repository.PagingAndSortingRepository;
import org.springframework.stereotype.Repository;

import ca.gov.dtsstn.vacman.api.data.entity.WorkUnitEntity;

@Repository
public interface WorkUnitRepository extends ListCrudRepository<WorkUnitEntity, Long>, PagingAndSortingRepository<WorkUnitEntity, Long> {
    Optional<WorkUnitEntity> findByCode(String code);
}
