package ca.gov.dtsstn.vacman.api.data.repository;

import org.springframework.stereotype.Repository;

import ca.gov.dtsstn.vacman.api.data.entity.UserEntity;

@Repository
public interface UserRepository extends AbstractBaseRepository<UserEntity> {}
