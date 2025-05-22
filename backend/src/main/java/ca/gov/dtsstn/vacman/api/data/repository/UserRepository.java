package ca.gov.dtsstn.vacman.api.data.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.repository.ListCrudRepository;
import org.springframework.data.repository.PagingAndSortingRepository;
import org.springframework.stereotype.Repository;

import ca.gov.dtsstn.vacman.api.data.entity.UserEntity;

@Repository
public interface UserRepository extends ListCrudRepository<UserEntity, String>, PagingAndSortingRepository<UserEntity, String> {
    Page<UserEntity> findAll(Pageable pageable);
}
