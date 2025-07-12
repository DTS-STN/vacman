package ca.gov.dtsstn.vacman.api.service;

import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import ca.gov.dtsstn.vacman.api.data.entity.ProfileEntity;
import ca.gov.dtsstn.vacman.api.data.repository.CityRepository;
import ca.gov.dtsstn.vacman.api.data.repository.ClassificationRepository;
import ca.gov.dtsstn.vacman.api.data.repository.LanguageRepository;
import ca.gov.dtsstn.vacman.api.data.repository.PriorityLevelRepository;
import ca.gov.dtsstn.vacman.api.data.repository.ProfileRepository;
import ca.gov.dtsstn.vacman.api.data.repository.ProfileStatusRepository;
import ca.gov.dtsstn.vacman.api.data.repository.UserRepository;
import ca.gov.dtsstn.vacman.api.data.repository.WfaStatusRepository;
import ca.gov.dtsstn.vacman.api.data.repository.WorkUnitRepository;
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
