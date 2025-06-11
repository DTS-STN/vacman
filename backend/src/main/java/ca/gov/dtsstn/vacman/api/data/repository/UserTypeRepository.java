package ca.gov.dtsstn.vacman.api.data.repository;

import org.springframework.data.repository.ListCrudRepository;
import org.springframework.stereotype.Repository;

import ca.gov.dtsstn.vacman.api.data.entity.UserTypeEntity;

@Repository
public interface UserTypeRepository extends ListCrudRepository<UserTypeEntity, Long> {}
