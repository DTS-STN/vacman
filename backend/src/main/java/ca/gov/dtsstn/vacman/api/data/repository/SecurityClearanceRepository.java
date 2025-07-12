package ca.gov.dtsstn.vacman.api.data.repository;

import java.util.Optional;

import org.springframework.data.repository.ListCrudRepository;
import org.springframework.data.repository.PagingAndSortingRepository;
import org.springframework.stereotype.Repository;

import ca.gov.dtsstn.vacman.api.data.entity.SecurityClearanceEntity;

@Repository
public interface SecurityClearanceRepository extends ListCrudRepository<SecurityClearanceEntity, Long>, PagingAndSortingRepository<SecurityClearanceEntity, Long> {
    Optional<SecurityClearanceEntity> findByCode(String code);
}
