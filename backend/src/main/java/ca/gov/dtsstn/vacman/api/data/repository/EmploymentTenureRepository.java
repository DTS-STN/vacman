package ca.gov.dtsstn.vacman.api.data.repository;

import java.util.Optional;

import org.springframework.data.repository.ListCrudRepository;
import org.springframework.data.repository.PagingAndSortingRepository;
import org.springframework.stereotype.Repository;

import ca.gov.dtsstn.vacman.api.data.entity.EmploymentTenureEntity;

@Repository
public interface EmploymentTenureRepository extends ListCrudRepository<EmploymentTenureEntity, Long>, PagingAndSortingRepository<EmploymentTenureEntity, Long> {
    Optional<EmploymentTenureEntity> findByCode(String code);
}
