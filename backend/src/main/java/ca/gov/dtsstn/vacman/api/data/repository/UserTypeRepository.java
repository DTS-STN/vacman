package ca.gov.dtsstn.vacman.api.data.repository;

import java.util.Optional;

import org.springframework.data.repository.ListCrudRepository;
import org.springframework.data.repository.PagingAndSortingRepository;
import org.springframework.stereotype.Repository;

import ca.gov.dtsstn.vacman.api.data.entity.UserTypeEntity;

@Repository
public interface UserTypeRepository extends ListCrudRepository<UserTypeEntity, Long>, PagingAndSortingRepository<UserTypeEntity, Long> {
    Optional<UserTypeEntity> findByCode(String code);
}