package ca.gov.dtsstn.vacman.api.data.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.repository.ListCrudRepository;
import org.springframework.data.repository.PagingAndSortingRepository;
import org.springframework.stereotype.Repository;

import ca.gov.dtsstn.vacman.api.data.entity.CityProfileEntity;

@Repository
public interface CityProfileRepository extends ListCrudRepository<CityProfileEntity, Long>, PagingAndSortingRepository<CityProfileEntity, Long> {

    List<CityProfileEntity> findByProfileId(Long profileId);

    List<CityProfileEntity> findByCityId(Long cityId);

    Optional<CityProfileEntity> findByProfileIdAndCityId(Long profileId, Long cityId);

    void deleteByProfileId(Long profileId);

    void deleteByProfileIdAndCityId(Long profileId, Long cityId);
}
