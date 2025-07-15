package ca.gov.dtsstn.vacman.api.service;

import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import ca.gov.dtsstn.vacman.api.data.entity.ProfileEntity;
import ca.gov.dtsstn.vacman.api.data.entity.ProfileStatusEntity;
import ca.gov.dtsstn.vacman.api.data.entity.UserEntity;
import ca.gov.dtsstn.vacman.api.data.repository.CityRepository;
import ca.gov.dtsstn.vacman.api.data.repository.ClassificationRepository;
import ca.gov.dtsstn.vacman.api.data.repository.LanguageRepository;
import ca.gov.dtsstn.vacman.api.data.repository.PriorityLevelRepository;
import ca.gov.dtsstn.vacman.api.data.repository.ProfileRepository;
import ca.gov.dtsstn.vacman.api.data.repository.ProfileStatusRepository;
import ca.gov.dtsstn.vacman.api.data.repository.UserRepository;
import ca.gov.dtsstn.vacman.api.data.repository.WfaStatusRepository;
import ca.gov.dtsstn.vacman.api.data.repository.WorkUnitRepository;
import ca.gov.dtsstn.vacman.api.web.model.ProfileCreateByActiveDirectoryIdModel;
import ca.gov.dtsstn.vacman.api.web.model.ProfileCreateModel;

@Service
public class ProfileService {

    private final ProfileRepository profileRepository;
    private final CityRepository cityRepository;
    private final ClassificationRepository classificationRepository;
    private final LanguageRepository languageRepository;
    private final PriorityLevelRepository priorityLevelRepository;
    private final ProfileStatusRepository profileStatusRepository;
    private final UserRepository userRepository;
    private final WfaStatusRepository wfaStatusRepository;
    private final WorkUnitRepository workUnitRepository;

    public ProfileService(
            ProfileRepository profileRepository,
            CityRepository cityRepository,
            ClassificationRepository classificationRepository,
            LanguageRepository languageRepository,
            PriorityLevelRepository priorityLevelRepository,
            ProfileStatusRepository profileStatusRepository,
            UserRepository userRepository,
            WfaStatusRepository wfaStatusRepository,
            WorkUnitRepository workUnitRepository) {
        this.profileRepository = profileRepository;
        this.cityRepository = cityRepository;
        this.classificationRepository = classificationRepository;
        this.languageRepository = languageRepository;
        this.priorityLevelRepository = priorityLevelRepository;
        this.profileStatusRepository = profileStatusRepository;
        this.userRepository = userRepository;
        this.wfaStatusRepository = wfaStatusRepository;
        this.workUnitRepository = workUnitRepository;
    }

    public ProfileEntity createProfile(ProfileCreateModel createModel) {
        ProfileEntity profile = new ProfileEntity();

        // Set required fields
        profile.setUser(userRepository.findById(createModel.userId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST,
                        "User not found with ID: " + createModel.userId())));

        profile.setHrAdvisor(userRepository.findById(createModel.hrAdvisorUserId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST,
                        "HR Advisor not found with ID: " + createModel.hrAdvisorUserId())));

        profile.setProfileStatus(profileStatusRepository.findByCode(createModel.profileStatusCode())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST,
                        "Profile status not found with code: " + createModel.profileStatusCode())));

        // Set optional relationship fields
        if (createModel.cityCode() != null) {
            profile.setCity(cityRepository.findByCode(createModel.cityCode())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST,
                            "City not found with code: " + createModel.cityCode())));
        }

        if (createModel.classificationCode() != null) {
            profile.setClassification(classificationRepository.findByCode(createModel.classificationCode())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST,
                            "Classification not found with code: " + createModel.classificationCode())));
        }

        if (createModel.languageCode() != null) {
            profile.setLanguage(languageRepository.findByCode(createModel.languageCode())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST,
                            "Language not found with code: " + createModel.languageCode())));
        }

        if (createModel.priorityLevelCode() != null) {
            profile.setPriorityLevel(priorityLevelRepository.findByCode(createModel.priorityLevelCode())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST,
                            "Priority level not found with code: " + createModel.priorityLevelCode())));
        }

        if (createModel.wfaStatusCode() != null) {
            profile.setWfaStatus(wfaStatusRepository.findByCode(createModel.wfaStatusCode())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST,
                            "WFA status not found with code: " + createModel.wfaStatusCode())));
        }

        if (createModel.workUnitCode() != null) {
            profile.setWorkUnit(workUnitRepository.findByCode(createModel.workUnitCode())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST,
                            "Work unit not found with code: " + createModel.workUnitCode())));
        }

        // Set simple fields
        profile.setPersonalPhoneNumber(createModel.personalPhoneNumber());
        profile.setPersonalEmailAddress(createModel.personalEmailAddress());
        profile.setPrivacyConsentInd(createModel.privacyConsentInd());
        profile.setAvailableForReferralInd(createModel.availableForReferralInd());
        profile.setInterestedInAlternationInd(createModel.interestedInAlternationInd());
        profile.setAdditionalComment(createModel.additionalComment());

        return profileRepository.save(profile);
    }

    /**
     * Creates a profile for a user identified by their Active Directory ID (networkName).
     * This method looks up the user by their networkName and creates a profile with minimal defaults.
     *
     * @param createModel the model containing the activeDirectoryId
     * @return the created profile entity
     * @throws ResponseStatusException if the user is not found or required defaults are missing
     */
    public ProfileEntity createProfileByActiveDirectoryId(ProfileCreateByActiveDirectoryIdModel createModel) {
        ProfileEntity profile = new ProfileEntity();

        // Look up the user by their networkName (activeDirectoryId)
        UserEntity user = userRepository.findByNetworkName(createModel.activeDirectoryId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST,
                        "User not found with network name (Active Directory ID): " + createModel.activeDirectoryId()));

        // Set the user
        profile.setUser(user);

        // For now, set the HR Advisor to the same user (this could be changed based on business rules)
        // In a real scenario, you might want to assign a default HR advisor or derive it from business logic
        profile.setHrAdvisor(user);

        // Set a default profile status - typically "PENDING" for new profiles
        ProfileStatusEntity defaultStatus = profileStatusRepository.findByCode("PENDING")
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR,
                        "Default profile status 'PENDING' not found in system"));
        profile.setProfileStatus(defaultStatus);

        // Set some reasonable defaults for new profiles
        profile.setPrivacyConsentInd(true); // Default to true as shown in frontend tests
        profile.setAvailableForReferralInd(true); // Default to true as shown in frontend tests
        profile.setInterestedInAlternationInd(false); // Default to false as shown in frontend tests

        return profileRepository.save(profile);
    }

    public List<ProfileEntity> getAllProfiles() {
        return profileRepository.findAll();
    }

    public Page<ProfileEntity> getProfiles(Pageable pageable) {
        return profileRepository.findAll(pageable);
    }

    public Optional<ProfileEntity> getProfileById(Long id) {
        return profileRepository.findById(id);
    }

    public ProfileEntity saveProfile(ProfileEntity profile) {
        return profileRepository.save(profile);
    }

    public void deleteProfile(Long id) {
        profileRepository.deleteById(id);
    }

    public boolean existsById(Long id) {
        return profileRepository.existsById(id);
    }
}
