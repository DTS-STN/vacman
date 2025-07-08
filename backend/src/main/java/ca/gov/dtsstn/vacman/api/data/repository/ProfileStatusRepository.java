package ca.gov.dtsstn.vacman.api.data.repository;

import java.util.Optional;

import org.springframework.data.repository.ListCrudRepository;
import org.springframework.data.repository.PagingAndSortingRepository;
import org.springframework.stereotype.Repository;

import ca.gov.dtsstn.vacman.api.data.entity.ProfileStatusEntity;

@Repository
public interface ProfileStatusRepository extends ListCrudRepository<ProfileStatusEntity, Long>, PagingAndSortingRepository<ProfileStatusEntity, Long> {
    Optional<ProfileStatusEntity> findByCode(String code);
}