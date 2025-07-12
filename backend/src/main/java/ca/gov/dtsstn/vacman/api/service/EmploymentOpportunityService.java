package ca.gov.dtsstn.vacman.api.service;

import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;

import ca.gov.dtsstn.vacman.api.data.entity.EmploymentOpportunityEntity;
import ca.gov.dtsstn.vacman.api.data.repository.EmploymentOpportunityRepository;

@Service
public class EmploymentOpportunityService {

    private final EmploymentOpportunityRepository employmentOpportunityRepository;

    public EmploymentOpportunityService(EmploymentOpportunityRepository employmentOpportunityRepository) {
        this.employmentOpportunityRepository = employmentOpportunityRepository;
    }

    public List<EmploymentOpportunityEntity> getAllEmploymentOpportunities() {
        return employmentOpportunityRepository.findAll();
    }

    public Optional<EmploymentOpportunityEntity> getEmploymentOpportunityById(Long id) {
        return employmentOpportunityRepository.findById(id);
    }

    public Optional<EmploymentOpportunityEntity> getEmploymentOpportunityByCode(String code) {
        return employmentOpportunityRepository.findByCode(code);
    }

    public EmploymentOpportunityEntity saveEmploymentOpportunity(EmploymentOpportunityEntity employmentOpportunity) {
        return employmentOpportunityRepository.save(employmentOpportunity);
    }

    public void deleteEmploymentOpportunity(Long id) {
        employmentOpportunityRepository.deleteById(id);
    }
}
