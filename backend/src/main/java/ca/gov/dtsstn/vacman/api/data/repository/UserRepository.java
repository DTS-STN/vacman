package ca.gov.dtsstn.vacman.api.data.repository;

import org.springframework.stereotype.Repository;

import ca.gov.dtsstn.vacman.api.data.entity.UserEntity;

import java.util.Optional;

@Repository
public interface UserRepository extends AbstractBaseRepository<UserEntity> {

    /**
     * Retrieve a user entity by their email address.
     *
     * @param businessEmail The target email address.
     * @return The user, if any.
     */
    Optional<UserEntity> findByBusinessEmailAddress(String businessEmail);
}
