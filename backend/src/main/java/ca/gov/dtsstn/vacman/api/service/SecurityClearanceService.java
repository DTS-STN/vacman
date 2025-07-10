package ca.gov.dtsstn.vacman.api.service;

import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import ca.gov.dtsstn.vacman.api.data.entity.SecurityClearanceEntity;
import ca.gov.dtsstn.vacman.api.data.repository.SecurityClearanceRepository;

@Service
public class SecurityClearanceService {

    private final SecurityClearanceRepository securityClearanceRepository;

    public SecurityClearanceService(SecurityClearanceRepository securityClearanceRepository) {
        this.securityClearanceRepository = securityClearanceRepository;
    }

    public List<SecurityClearanceEntity> getAllSecurityClearances() {
        return securityClearanceRepository.findAll();
    }

    public Page<SecurityClearanceEntity> getSecurityClearances(Pageable pageable) {
        return securityClearanceRepository.findAll(pageable);
    }

    public Optional<SecurityClearanceEntity> getSecurityClearanceById(Long id) {
        return securityClearanceRepository.findById(id);
    }

    public Optional<SecurityClearanceEntity> getSecurityClearanceByCode(String code) {
        return securityClearanceRepository.findByCode(code);
    }

    public SecurityClearanceEntity saveSecurityClearance(SecurityClearanceEntity securityClearance) {
        return securityClearanceRepository.save(securityClearance);
    }

    public void deleteSecurityClearance(Long id) {
        securityClearanceRepository.deleteById(id);
    }
}
