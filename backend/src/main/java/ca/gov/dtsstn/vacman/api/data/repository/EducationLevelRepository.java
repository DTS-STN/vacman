package ca.gov.dtsstn.vacman.api.data.repository;

import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.repository.ListCrudRepository;
import org.springframework.data.repository.PagingAndSortingRepository;
import org.springframework.stereotype.Repository;

import ca.gov.dtsstn.vacman.api.data.entity.EducationLevelEntity;

@Repository
public interface EducationLevelRepository extends ListCrudRepository<EducationLevelEntity, Long>, PagingAndSortingRepository<EducationLevelEntity, Long> {

	Optional<EducationLevelEntity> findByCode(String code);

	@Override
	Page<EducationLevelEntity> findAll(Pageable pageable);

}
