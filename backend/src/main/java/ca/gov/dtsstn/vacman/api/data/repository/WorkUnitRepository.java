package ca.gov.dtsstn.vacman.api.data.repository;

import ca.gov.dtsstn.vacman.api.data.entity.WorkUnitEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.repository.ListCrudRepository;
import org.springframework.data.repository.PagingAndSortingRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface WorkUnitRepository extends ListCrudRepository<WorkUnitEntity, Long>, PagingAndSortingRepository<WorkUnitEntity, Long> {
    Optional<WorkUnitEntity> findByCode(String code);

    Page<WorkUnitEntity> findAll(Pageable pageable);
}
