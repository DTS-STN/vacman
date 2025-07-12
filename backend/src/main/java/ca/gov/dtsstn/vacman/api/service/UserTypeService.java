package ca.gov.dtsstn.vacman.api.service;

import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import ca.gov.dtsstn.vacman.api.data.entity.UserTypeEntity;
import ca.gov.dtsstn.vacman.api.data.repository.UserTypeRepository;

@Service
public class UserTypeService {

    private final UserTypeRepository userTypeRepository;

    public UserTypeService(UserTypeRepository userTypeRepository) {
        this.userTypeRepository = userTypeRepository;
    }

    public List<UserTypeEntity> getAllUserTypes() {
        return userTypeRepository.findAll();
    }

    public Page<UserTypeEntity> getUserTypes(Pageable pageable) {
        return userTypeRepository.findAll(pageable);
    }

    public Optional<UserTypeEntity> getUserTypeById(Long id) {
        return userTypeRepository.findById(id);
    }

    public Optional<UserTypeEntity> getUserTypeByCode(String code) {
        return userTypeRepository.findByCode(code);
    }

    public UserTypeEntity saveUserType(UserTypeEntity userType) {
        return userTypeRepository.save(userType);
    }

    public void deleteUserType(Long id) {
        userTypeRepository.deleteById(id);
    }
}
