package ca.gov.dtsstn.vacman.api.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;

import ca.gov.dtsstn.vacman.api.data.entity.ProfileEntity;
import ca.gov.dtsstn.vacman.api.data.repository.ProfileRepository;
import ca.gov.dtsstn.vacman.api.event.ProfileCreateEvent;

/**
 * TODO: Remove this class once the profile service is implemented.
 * This is a sample implementation showing how to publish the ProfileCreateEvent.
 * It should be integrated with the actual profile service implementation once Maxwell has implemented the profile endpoints.
 */
@Service
public class ProfileService_temp {

    private static final Logger log = LoggerFactory.getLogger(ProfileService_temp.class);

    private final ApplicationEventPublisher eventPublisher;
    private final ProfileRepository profileRepository;

    public ProfileService_temp(ApplicationEventPublisher eventPublisher, ProfileRepository profileRepository) {
        this.eventPublisher = eventPublisher;
        this.profileRepository = profileRepository;
    }

    /**
     * Creates a new profile and publishes a ProfileCreateEvent.
     * 
     * @param profile The profile entity to create
     * @return The created profile entity
     */
    public ProfileEntity createProfile(ProfileEntity profile) {
        // Save the profile
        final var createdProfile = profileRepository.save(profile);

        // Publish created event
        eventPublisher.publishEvent(new ProfileCreateEvent(createdProfile));
        log.info("Profile created with ID: {}", createdProfile.getId());

        return createdProfile;
    }
}