package ca.gov.dtsstn.vacman.api.data.repository;

import org.springframework.stereotype.Repository;

import ca.gov.dtsstn.vacman.api.data.entity.RequestStatusEntity;

@Repository
public interface RequestStatusRepository extends AbstractCodeRepository<RequestStatusEntity> {}