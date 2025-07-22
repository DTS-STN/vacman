package ca.gov.dtsstn.vacman.api.data.repository;

import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.repository.ListCrudRepository;
import org.springframework.data.repository.PagingAndSortingRepository;
import org.springframework.stereotype.Repository;

import ca.gov.dtsstn.vacman.api.data.entity.WfaStatusEntity;

@Repository
public interface WfaStatusRepository extends ListCrudRepository<WfaStatusEntity, Long>, PagingAndSortingRepository<WfaStatusEntity, Long> {

	Optional<WfaStatusEntity> findByCode(String code);


	@Override
	Page<WfaStatusEntity> findAll(Pageable pageable);

}
