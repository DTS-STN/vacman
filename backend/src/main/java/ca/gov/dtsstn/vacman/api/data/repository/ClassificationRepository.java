package ca.gov.dtsstn.vacman.api.data.repository;

import org.springframework.stereotype.Repository;

import ca.gov.dtsstn.vacman.api.data.entity.ClassificationEntity;

@Repository
public interface ClassificationRepository extends AbstractCodeRepository<ClassificationEntity> {}
