package ca.gov.dtsstn.vacman.api.data.repository;

import java.util.Optional;

import org.springframework.data.repository.ListCrudRepository;
import org.springframework.data.repository.PagingAndSortingRepository;
import org.springframework.stereotype.Repository;

import ca.gov.dtsstn.vacman.api.data.entity.NotificationPurposeEntity;

@Repository
public interface NotificationPurposeRepository extends ListCrudRepository<NotificationPurposeEntity, Long>, PagingAndSortingRepository<NotificationPurposeEntity, Long> {

	Optional<NotificationPurposeEntity> findByCode(String code);

}