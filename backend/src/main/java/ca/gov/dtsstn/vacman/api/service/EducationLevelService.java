package ca.gov.dtsstn.vacman.api.service;

import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import ca.gov.dtsstn.vacman.api.data.entity.EducationLevelEntity;
import ca.gov.dtsstn.vacman.api.data.repository.EducationLevelRepository;

@Service
public class EducationLevelService {

	private final EducationLevelRepository educationLevelRepository;

	public EducationLevelService(EducationLevelRepository educationLevelRepository) {
		this.educationLevelRepository = educationLevelRepository;
	}

	public Optional<EducationLevelEntity> getEducationLevelByCode(String code) {
		return educationLevelRepository.findByCode(code);
	}

	public Page<EducationLevelEntity> getEducationLevels(Pageable pageable) {
		return educationLevelRepository.findAll(pageable);
	}

}
