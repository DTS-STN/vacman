package ca.gov.dtsstn.vacman.api.web;

import static org.apache.commons.lang3.StringUtils.isNotBlank;

import java.util.List;

import org.hibernate.validator.constraints.Range;
import org.mapstruct.factory.Mappers;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import ca.gov.dtsstn.vacman.api.config.SpringDocConfig;
import ca.gov.dtsstn.vacman.api.service.EducationLevelService;
import ca.gov.dtsstn.vacman.api.web.model.CollectionModel;
import ca.gov.dtsstn.vacman.api.web.model.EducationLevelReadModel;
import ca.gov.dtsstn.vacman.api.web.model.mapper.EducationLevelModelMapper;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;

@RestController
@Tag(name = "Education Levels")
@RequestMapping({ "/api/v1/education-levels" })
public class EducationLevelController {

	private final EducationLevelModelMapper educationLevelModelMapper = Mappers.getMapper(EducationLevelModelMapper.class);

	private final EducationLevelService educationLevelService;

	public EducationLevelController(EducationLevelService educationLevelService) {
		this.educationLevelService = educationLevelService;
	}

	@GetMapping
	@SecurityRequirement(name = SpringDocConfig.AZURE_AD)
	@Operation(summary = "Get education levels with pagination or filter by code.", description = "Returns a paginated list of education levels or a specific education level if code is provided.")
	public ResponseEntity<?> getEducationLevels(
			@RequestParam(required = false)
			@Parameter(description = "Education level code to filter by (e.g., 'BD' for Bachelor's Degree)") String code,

			@RequestParam(defaultValue = "0")
			@Parameter(description = "Page number (0-based)")
			int page,

			@RequestParam(defaultValue = "20")
			@Range(min = 1, max = 100)
			@Parameter(description = "Page size (between 1 and 100)")
			int size) {
		if (isNotBlank(code)) {
			CollectionModel<EducationLevelReadModel> result = new CollectionModel<>(educationLevelService.getEducationLevelByCode(code)
				.map(educationLevelModelMapper::toModel)
				.map(List::of)
				.orElse(List.of()));
			return ResponseEntity.ok(result);
		}

		Page<EducationLevelReadModel> result = educationLevelService.getEducationLevels(PageRequest.of(page, size))
			.map(educationLevelModelMapper::toModel);
		return ResponseEntity.ok(result);
	}
}
