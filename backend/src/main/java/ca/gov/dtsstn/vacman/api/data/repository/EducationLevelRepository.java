package ca.gov.dtsstn.vacman.api.data.repository;

import ca.gov.dtsstn.vacman.api.data.entity.EducationLevelEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.repository.ListCrudRepository;
import org.springframework.data.repository.PagingAndSortingRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface EducationLevelRepository extends ListCrudRepository<EducationLevelEntity, Long>, PagingAndSortingRepository<EducationLevelEntity, Long> {
    Optional<EducationLevelEntity> findByCode(String code);

    Page<EducationLevelEntity> findAll(Pageable pageable);
}
