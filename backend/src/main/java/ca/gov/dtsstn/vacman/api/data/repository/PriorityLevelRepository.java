package ca.gov.dtsstn.vacman.api.data.repository;

import java.util.Optional;

import org.springframework.data.repository.ListCrudRepository;
import org.springframework.data.repository.PagingAndSortingRepository;
import org.springframework.stereotype.Repository;

import ca.gov.dtsstn.vacman.api.data.entity.PriorityLevelEntity;

@Repository
public interface PriorityLevelRepository extends ListCrudRepository<PriorityLevelEntity, Long>, PagingAndSortingRepository<PriorityLevelEntity, Long> {
    Optional<PriorityLevelEntity> findByCode(String code);
}