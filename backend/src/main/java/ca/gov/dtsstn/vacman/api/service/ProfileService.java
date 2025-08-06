package ca.gov.dtsstn.vacman.api.service;

import ca.gov.dtsstn.vacman.api.data.entity.ProfileEntity;
import ca.gov.dtsstn.vacman.api.data.repository.ProfileRepository;
import ca.gov.dtsstn.vacman.api.web.model.ProfilesStatusParam;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.util.Set;

@Service
public class ProfileService {

    private final ProfileRepository profileRepository;

    // Hardcoded profile code-codes that get reference based on the status code used for filtering in the repo codegen.
    // That's 5 degrees of coding.
    private final Set<String> activeProfileCodes = Set.of("APPROVED", "PENDING", "INCOMPLETE");
    private final Set<String> inactiveProfileCodes = Set.of("ARCHIVED");

    public ProfileService(ProfileRepository profileRepository) {
        this.profileRepository = profileRepository;
    }

    /**
     * Returns all profiles that are either "active" or "inactive" depending on the argument value. Optionally,
     * allows for the HR Advisor's ID to be used as an additional filter.
     *
     * @param pageRequest Pagination information.
     * @param status The target status for filtering.
     * @param hrAdvisorId Optional ID for additional filtering. Can be set to {@code null}.
     * @return A paginated collection of profile entities.
     */
    public Page<ProfileEntity> getProfilesByStatusAndHrId(PageRequest pageRequest, ProfilesStatusParam status, Long hrAdvisorId) {
        final var statusCodes = switch (status) {
            case ACTIVE -> activeProfileCodes;
            case INACTIVE -> inactiveProfileCodes;
        };

        return (hrAdvisorId == null)
                ? profileRepository.findByProfileStatusCodeIn(statusCodes, pageRequest)
                : profileRepository.findByProfileStatusCodeInAndHrAdvisorIdIs(statusCodes, hrAdvisorId, pageRequest);
    }
}
