package ca.gov.dtsstn.vacman.api.data.repository;

import org.springframework.stereotype.Repository;

import ca.gov.dtsstn.vacman.api.data.entity.ProfileStatusEntity;

@Repository
public interface ProfileStatusRepository extends AbstractBaseRepository<ProfileStatusEntity> {

    /**
     * Retrieve a profile status based on the provided code value.
     *
     * @param code The profile status code to return.
     * @return The profile status.
     */
    ProfileStatusEntity findByCode(String code);
}