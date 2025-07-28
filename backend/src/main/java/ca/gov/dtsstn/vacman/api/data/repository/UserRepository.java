package ca.gov.dtsstn.vacman.api.data.repository;

import java.util.Optional;

import org.springframework.stereotype.Repository;

import ca.gov.dtsstn.vacman.api.data.entity.UserEntity;

@Repository
public interface UserRepository extends AbstractBaseRepository<UserEntity> {
    Optional<UserEntity> findByActiveDirectoryId(String activeDirectoryId);
}
