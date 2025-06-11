package ca.gov.dtsstn.vacman.api.data.repository;

import org.springframework.data.repository.ListCrudRepository;

import ca.gov.dtsstn.vacman.api.data.entity.ProfileStatusEntity;

public interface ProfileStatusRepository extends ListCrudRepository<ProfileStatusEntity, Long> {}
