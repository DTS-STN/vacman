package ca.gov.dtsstn.vacman.api.service;

import ca.gov.dtsstn.vacman.api.data.entity.ProfileEntity;
import ca.gov.dtsstn.vacman.api.data.repository.ProfileRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.Set;

@Service
public class ProfileService {

    private final ProfileRepository profileRepository;

    // Keys are tied to the potential values of getProfilesByStatusAndHrId parameter isActive.
    private final Map<Boolean, Set<String>> profileStatusSets = Map.of(
            Boolean.TRUE, Set.of("APPROVED", "PENDING", "INCOMPLETE"),
            Boolean.FALSE, Set.of("ARCHIVED")
    );

    public ProfileService(ProfileRepository profileRepository) {
        this.profileRepository = profileRepository;
    }

    /**
     * Returns all profiles that are either "active" or "inactive" depending on the argument value. Optionally,
     * allows for the HR Advisor's ID to be used as an additional filter.
     *
     * @param pageRequest Pagination information.
     * @param isActive Filter return based on active status.
     * @param hrAdvisorId Optional ID for additional filtering. Can be set to {@code null}.
     * @return A paginated collection of profile entities.
     */
    public Page<ProfileEntity> getProfilesByStatusAndHrId(PageRequest pageRequest, Boolean isActive, Long hrAdvisorId) {
        // Dispatch DB call based on presence of isActive & advisor ID
        if (isActive != null) {
            final var statusCodes = profileStatusSets.get(isActive);

            return (hrAdvisorId == null)
                    ? profileRepository.findByProfileStatusCodeIn(statusCodes, pageRequest)
                    : profileRepository.findByProfileStatusCodeInAndHrAdvisorIdIs(statusCodes, hrAdvisorId, pageRequest);
        } else {
            return (hrAdvisorId == null)
                    ? profileRepository.findAll(pageRequest)
                    : profileRepository.findAllByHrAdvisorId(hrAdvisorId, pageRequest);
        }
    }

    /**
     * Returns all profiles that are either "active" or "inactive" depending on the argument value & that
     * have a matching Microsoft Entra ID.
     * @param entraId The Microsoft Entra ID for filtering.
     * @param isActive Filter return based on active status.
     * @return A collection of profile entities.
     */
    public List<ProfileEntity> getProfilesByEntraId(String entraId, Boolean isActive) {
        return (isActive != null)
                ? profileRepository.findByUserMicrosoftEntraIdIsAndProfileStatusCodeIn(entraId, profileStatusSets.get(isActive))
                : profileRepository.findAllByUserMicrosoftEntraId(entraId);
    }
}
