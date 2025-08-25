package ca.gov.dtsstn.vacman.api.data.repository;

import org.springframework.stereotype.Repository;

import ca.gov.dtsstn.vacman.api.data.entity.RequestEntity;

@Repository
public interface RequestRepository extends AbstractBaseRepository<RequestEntity> {}