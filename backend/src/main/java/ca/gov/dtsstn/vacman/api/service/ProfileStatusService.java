package ca.gov.dtsstn.vacman.api.service;

import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import ca.gov.dtsstn.vacman.api.data.entity.ProfileStatusEntity;
import ca.gov.dtsstn.vacman.api.data.repository.ProfileStatusRepository;

@Service
public class ProfileStatusService {

    private final ProfileStatusRepository profileStatusRepository;

    public ProfileStatusService(ProfileStatusRepository profileStatusRepository) {
        this.profileStatusRepository = profileStatusRepository;
    }

    public List<ProfileStatusEntity> getAllProfileStatuses() {
        return profileStatusRepository.findAll();
    }

    public Page<ProfileStatusEntity> getProfileStatuses(Pageable pageable) {
        return profileStatusRepository.findAll(pageable);
    }

    public Optional<ProfileStatusEntity> getProfileStatusById(Long id) {
        return profileStatusRepository.findById(id);
    }

    public Optional<ProfileStatusEntity> getProfileStatusByCode(String code) {
        return profileStatusRepository.findByCode(code);
    }

    public ProfileStatusEntity saveProfileStatus(ProfileStatusEntity profileStatus) {
        return profileStatusRepository.save(profileStatus);
    }

    public void deleteProfileStatus(Long id) {
        profileStatusRepository.deleteById(id);
    }
}
