package ca.gov.dtsstn.vacman.api.data.repository;

import org.springframework.data.repository.ListCrudRepository;
import org.springframework.data.repository.PagingAndSortingRepository;
import org.springframework.stereotype.Repository;

import ca.gov.dtsstn.vacman.api.data.entity.EventEntity;

@Repository
public interface EventRepository extends ListCrudRepository<EventEntity, Long>, PagingAndSortingRepository<EventEntity, Long> {
}
