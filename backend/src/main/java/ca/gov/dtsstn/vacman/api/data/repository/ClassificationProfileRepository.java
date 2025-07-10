package ca.gov.dtsstn.vacman.api.data.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.repository.ListCrudRepository;
import org.springframework.data.repository.PagingAndSortingRepository;
import org.springframework.stereotype.Repository;

import ca.gov.dtsstn.vacman.api.data.entity.ClassificationProfileEntity;

@Repository
public interface ClassificationProfileRepository extends ListCrudRepository<ClassificationProfileEntity, Long>, PagingAndSortingRepository<ClassificationProfileEntity, Long> {

    List<ClassificationProfileEntity> findByProfileId(Long profileId);

    List<ClassificationProfileEntity> findByClassificationId(Long classificationId);

    Optional<ClassificationProfileEntity> findByProfileIdAndClassificationId(Long profileId, Long classificationId);

    void deleteByProfileId(Long profileId);

    void deleteByProfileIdAndClassificationId(Long profileId, Long classificationId);
}
