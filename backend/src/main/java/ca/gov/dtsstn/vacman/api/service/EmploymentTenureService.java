package ca.gov.dtsstn.vacman.api.service;

import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import ca.gov.dtsstn.vacman.api.data.entity.EmploymentTenureEntity;
import ca.gov.dtsstn.vacman.api.data.repository.EmploymentTenureRepository;

@Service
public class EmploymentTenureService {

    private final EmploymentTenureRepository employmentTenureRepository;

    public EmploymentTenureService(EmploymentTenureRepository employmentTenureRepository) {
        this.employmentTenureRepository = employmentTenureRepository;
    }

    public List<EmploymentTenureEntity> getAllEmploymentTenures() {
        return employmentTenureRepository.findAll();
    }

    public Page<EmploymentTenureEntity> getEmploymentTenures(Pageable pageable) {
        return employmentTenureRepository.findAll(pageable);
    }

    public Optional<EmploymentTenureEntity> getEmploymentTenureById(Long id) {
        return employmentTenureRepository.findById(id);
    }

    public Optional<EmploymentTenureEntity> getEmploymentTenureByCode(String code) {
        return employmentTenureRepository.findByCode(code);
    }

    public EmploymentTenureEntity saveEmploymentTenure(EmploymentTenureEntity employmentTenure) {
        return employmentTenureRepository.save(employmentTenure);
    }

    public void deleteEmploymentTenure(Long id) {
        employmentTenureRepository.deleteById(id);
    }
}
