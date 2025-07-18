package ca.gov.dtsstn.vacman.api.data.repository;

import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.repository.ListCrudRepository;
import org.springframework.data.repository.PagingAndSortingRepository;
import org.springframework.stereotype.Repository;

import ca.gov.dtsstn.vacman.api.data.entity.UserEntity;

@Repository
public interface UserRepository extends ListCrudRepository<UserEntity, Long>, PagingAndSortingRepository<UserEntity, Long> {

  Page<UserEntity> findAll(Pageable pageable);

  Optional<UserEntity> findByActiveDirectoryId(String activeDirectoryId);

}
