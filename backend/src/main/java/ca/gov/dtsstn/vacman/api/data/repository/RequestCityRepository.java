package ca.gov.dtsstn.vacman.api.data.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.repository.ListCrudRepository;
import org.springframework.data.repository.PagingAndSortingRepository;
import org.springframework.stereotype.Repository;

import ca.gov.dtsstn.vacman.api.data.entity.RequestCityEntity;

@Repository
public interface RequestCityRepository extends ListCrudRepository<RequestCityEntity, Long>, PagingAndSortingRepository<RequestCityEntity, Long> {

    List<RequestCityEntity> findByRequestId(Long requestId);

    List<RequestCityEntity> findByCityId(Long cityId);

    Optional<RequestCityEntity> findByRequestIdAndCityId(Long requestId, Long cityId);

    void deleteByRequestId(Long requestId);

    void deleteByRequestIdAndCityId(Long requestId, Long cityId);
}
