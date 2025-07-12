package ca.gov.dtsstn.vacman.api.service;

import ca.gov.dtsstn.vacman.api.data.entity.ProvinceEntity;
import ca.gov.dtsstn.vacman.api.data.repository.ProvinceRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class ProvinceService {

    private final ProvinceRepository provinceRepository;

    public ProvinceService(ProvinceRepository provinceRepository) {
        this.provinceRepository = provinceRepository;
    }

    public List<ProvinceEntity> getAllProvinces() {
        return List.copyOf(provinceRepository.findAll());
    }

    public Optional<ProvinceEntity> getProvinceByCode(String code) {
        return provinceRepository.findByCode(code);
    }

    public Optional<ProvinceEntity> getProvinceById(Long id) {
        return provinceRepository.findById(id);
    }
}
