package ca.gov.dtsstn.vacman.api.data.repository;

import java.util.Optional;

import org.springframework.stereotype.Repository;

import ca.gov.dtsstn.vacman.api.data.entity.UserTypeEntity;

@Repository
public interface UserTypeRepository extends AbstractBaseRepository<UserTypeEntity> {
    Optional<UserTypeEntity> findByCode(String code);
}
