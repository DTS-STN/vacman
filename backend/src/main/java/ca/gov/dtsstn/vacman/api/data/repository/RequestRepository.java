package ca.gov.dtsstn.vacman.api.data.repository;

import org.springframework.data.repository.ListCrudRepository;
import org.springframework.data.repository.PagingAndSortingRepository;
import org.springframework.stereotype.Repository;

import ca.gov.dtsstn.vacman.api.data.entity.RequestEntity;

@Repository
public interface RequestRepository extends ListCrudRepository<RequestEntity, Long>, PagingAndSortingRepository<RequestEntity, Long> {
}
