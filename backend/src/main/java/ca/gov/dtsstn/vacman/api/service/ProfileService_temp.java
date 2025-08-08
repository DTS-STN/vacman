package ca.gov.dtsstn.vacman.api.service;

import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;

import ca.gov.dtsstn.vacman.api.data.entity.ProfileEntity;
import ca.gov.dtsstn.vacman.api.data.entity.ProfileStatusEntity;
import ca.gov.dtsstn.vacman.api.data.repository.ProfileRepository;
import ca.gov.dtsstn.vacman.api.data.repository.ProfileStatusRepository;
import ca.gov.dtsstn.vacman.api.event.ProfileStatusChangeEvent;
import ca.gov.dtsstn.vacman.api.web.exception.ResourceNotFoundException;

/**
 * Temporary reference file for ProfileService implementation of status change functionality.
 * This code should be integrated into the actual ProfileService class when the PUT /profiles/{id}/status endpoint is implemented.
 */
@Service
public class ProfileService_temp {

    private final ProfileRepository profileRepository;
    private final ProfileStatusRepository profileStatusRepository;
    private final ApplicationEventPublisher eventPublisher;

    public ProfileService_temp(ProfileRepository profileRepository, 
                          ProfileStatusRepository profileStatusRepository,
                          ApplicationEventPublisher eventPublisher) {
        this.profileRepository = profileRepository;
        this.profileStatusRepository = profileStatusRepository;
        this.eventPublisher = eventPublisher;
    }

    /**
     * Updates the status of a profile and emits a ProfileStatusChangeEvent.
     * This method should be called when the PUT /profiles/{id}/status endpoint is implemented.
     *
     * @param profileId The ID of the profile to update
     * @param statusId The new status ID
     * @return The updated profile entity
     * @throws ResourceNotFoundException if the profile or status is not found
     */
    public ProfileEntity updateProfileStatus(Long profileId, Long statusId) {
        ProfileEntity profileEntity = profileRepository.findById(profileId)
            .orElseThrow(() -> new ResourceNotFoundException("Profile not found"));
        
        Long previousStatusId = profileEntity.getProfileStatus() != null ?
            profileEntity.getProfileStatus().getId() : null;
        
        ProfileStatusEntity newStatus = profileStatusRepository.findById(statusId)
            .orElseThrow(() -> new ResourceNotFoundException("Profile status not found"));
        profileEntity.setProfileStatus(newStatus);
        
        profileEntity = profileRepository.save(profileEntity);
        
        eventPublisher.publishEvent(new ProfileStatusChangeEvent(profileEntity, previousStatusId, newStatus.getId()));
        
        return profileEntity;
    }
}