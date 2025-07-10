package ca.gov.dtsstn.vacman.api.data.repository;

import ca.gov.dtsstn.vacman.api.data.entity.EmploymentTenureEntity;
import org.springframework.data.repository.ListCrudRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface EmploymentTenureRepository extends ListCrudRepository<EmploymentTenureEntity, Long> {
    Optional<EmploymentTenureEntity> findByCode(String code);
}