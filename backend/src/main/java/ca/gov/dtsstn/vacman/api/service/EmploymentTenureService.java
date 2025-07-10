package ca.gov.dtsstn.vacman.api.service;

import ca.gov.dtsstn.vacman.api.data.entity.EmploymentTenureEntity;
import ca.gov.dtsstn.vacman.api.data.repository.EmploymentTenureRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class EmploymentTenureService {

    private final EmploymentTenureRepository employmentTenureRepository;

    public EmploymentTenureService(EmploymentTenureRepository employmentTenureRepository) {
        this.employmentTenureRepository = employmentTenureRepository;
    }

    public List<EmploymentTenureEntity> getAllEmploymentTenures() {
        return List.copyOf(employmentTenureRepository.findAll());
    }

    public Optional<EmploymentTenureEntity> getEmploymentTenureByCode(String code) {
        return employmentTenureRepository.findByCode(code);
    }

    public Optional<EmploymentTenureEntity> getEmploymentTenureById(Long id) {
        return employmentTenureRepository.findById(id);
    }
}