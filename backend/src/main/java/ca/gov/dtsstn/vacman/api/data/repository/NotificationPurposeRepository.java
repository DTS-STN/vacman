package ca.gov.dtsstn.vacman.api.data.repository;

import org.springframework.data.repository.ListCrudRepository;

import ca.gov.dtsstn.vacman.api.data.entity.NotificationPurposeEntity;

public interface NotificationPurposeRepository extends ListCrudRepository<NotificationPurposeEntity, Long> {}
