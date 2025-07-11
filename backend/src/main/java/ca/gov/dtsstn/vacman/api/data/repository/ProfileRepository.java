package ca.gov.dtsstn.vacman.api.data.repository;

import org.springframework.data.repository.ListCrudRepository;
import org.springframework.data.repository.PagingAndSortingRepository;
import org.springframework.stereotype.Repository;

import ca.gov.dtsstn.vacman.api.data.entity.ProfileEntity;

@Repository
public interface ProfileRepository extends ListCrudRepository<ProfileEntity, Long>, PagingAndSortingRepository<ProfileEntity, Long> {
}