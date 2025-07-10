package ca.gov.dtsstn.vacman.api.data.repository;

import ca.gov.dtsstn.vacman.api.data.entity.CityEntity;
import org.springframework.data.repository.ListCrudRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CityRepository extends ListCrudRepository<CityEntity, Long> {
    Optional<CityEntity> findByCode(String code);

    List<CityEntity> findByProvinceCode(String provinceCode);

    List<CityEntity> findByProvince_Id(Long provinceId);

    List<CityEntity> findByCodeAndProvinceCode(String code, String provinceCode);
}
