package ca.gov.dtsstn.vacman.api.data.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.repository.ListCrudRepository;
import org.springframework.stereotype.Repository;

import ca.gov.dtsstn.vacman.api.data.entity.CityEntity;

@Repository
public interface CityRepository extends ListCrudRepository<CityEntity, Long> {

	Optional<CityEntity> findByCode(String code);

	List<CityEntity> findByProvinceCode(String provinceCode);

	List<CityEntity> findByProvince_Id(Long provinceId);

	List<CityEntity> findByCodeAndProvinceCode(String code, String provinceCode);

}
