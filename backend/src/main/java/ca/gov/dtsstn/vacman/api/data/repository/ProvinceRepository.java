package ca.gov.dtsstn.vacman.api.data.repository;

import java.util.Optional;

import org.springframework.data.repository.ListCrudRepository;
import org.springframework.stereotype.Repository;

import ca.gov.dtsstn.vacman.api.data.entity.ProvinceEntity;

@Repository
public interface ProvinceRepository extends ListCrudRepository<ProvinceEntity, Long> {

	Optional<ProvinceEntity> findByCode(String code);

}