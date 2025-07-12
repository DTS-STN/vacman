package ca.gov.dtsstn.vacman.api.service;

import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;

import ca.gov.dtsstn.vacman.api.data.entity.EmploymentEquityEntity;
import ca.gov.dtsstn.vacman.api.data.repository.EmploymentEquityRepository;

@Service
public class EmploymentEquityService {

    private final EmploymentEquityRepository employmentEquityRepository;

    public EmploymentEquityService(EmploymentEquityRepository employmentEquityRepository) {
        this.employmentEquityRepository = employmentEquityRepository;
    }

    public List<EmploymentEquityEntity> getAllEmploymentEquities() {
        return employmentEquityRepository.findAll();
    }

    public Optional<EmploymentEquityEntity> getEmploymentEquityById(Long id) {
        return employmentEquityRepository.findById(id);
    }

    public Optional<EmploymentEquityEntity> getEmploymentEquityByCode(String code) {
        return employmentEquityRepository.findByCode(code);
    }

    public EmploymentEquityEntity saveEmploymentEquity(EmploymentEquityEntity employmentEquity) {
        return employmentEquityRepository.save(employmentEquity);
    }

    public void deleteEmploymentEquity(Long id) {
        employmentEquityRepository.deleteById(id);
    }
}
