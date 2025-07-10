package ca.gov.dtsstn.vacman.api.service;

import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import ca.gov.dtsstn.vacman.api.data.entity.ProfileEntity;
import ca.gov.dtsstn.vacman.api.data.repository.ProfileRepository;

@Service
public class ProfileService {

    private final ProfileRepository profileRepository;

    public ProfileService(ProfileRepository profileRepository) {
        this.profileRepository = profileRepository;
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
