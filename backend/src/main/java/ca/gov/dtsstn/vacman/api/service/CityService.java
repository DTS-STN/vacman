package ca.gov.dtsstn.vacman.api.service;

import ca.gov.dtsstn.vacman.api.data.entity.CityEntity;
import ca.gov.dtsstn.vacman.api.data.repository.CityRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class CityService {

    private final CityRepository cityRepository;

    public CityService(CityRepository cityRepository) {
        this.cityRepository = cityRepository;
    }

    public List<CityEntity> getAllCities() {
        return List.copyOf(cityRepository.findAll());
    }

    public Optional<CityEntity> getCityById(Long id) {
        return cityRepository.findById(id);
    }

    public Optional<CityEntity> getCityByCode(String code) {
        return cityRepository.findByCode(code);
    }

    public List<CityEntity> getCitiesByProvinceCode(String provinceCode) {
        return List.copyOf(cityRepository.findByProvinceCode(provinceCode));
    }

    public List<CityEntity> getCitiesByProvinceId(Long provinceId) {
        return List.copyOf(cityRepository.findByProvince_Id(provinceId));
    }

    public List<CityEntity> getCityByCodeAndProvince(String code, String provinceCode) {
        return List.copyOf(cityRepository.findByCodeAndProvinceCode(code, provinceCode));
    }
}
