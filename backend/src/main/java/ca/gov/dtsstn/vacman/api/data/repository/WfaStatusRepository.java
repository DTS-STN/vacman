package ca.gov.dtsstn.vacman.api.data.repository;

import org.springframework.data.repository.ListCrudRepository;
import org.springframework.stereotype.Repository;

import ca.gov.dtsstn.vacman.api.data.entity.WfaStatusEntity;

import java.util.Optional;

@Repository
public interface WfaStatusRepository extends ListCrudRepository<WfaStatusEntity, Long> {
    Optional<WfaStatusEntity> findByCode(String code);
}
