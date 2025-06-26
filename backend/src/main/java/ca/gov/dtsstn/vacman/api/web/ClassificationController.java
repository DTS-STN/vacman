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
import ca.gov.dtsstn.vacman.api.service.ClassificationService;
import ca.gov.dtsstn.vacman.api.web.model.ClassificationReadModel;
import ca.gov.dtsstn.vacman.api.web.model.CollectionModel;
import ca.gov.dtsstn.vacman.api.web.model.mapper.ClassificationModelMapper;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;

@RestController
@Tag(name = "Classifications")
@RequestMapping({ "/api/v1/classifications" })
public class ClassificationController {

	private final ClassificationModelMapper classificationModelMapper = Mappers.getMapper(ClassificationModelMapper.class);

	private final ClassificationService classificationService;

	public ClassificationController(ClassificationService classificationService) {
		this.classificationService = classificationService;
	}

	@GetMapping
	@SecurityRequirement(name = SpringDocConfig.AZURE_AD)
	@Operation(summary = "Get classifications with pagination or filter by code.", description = "Returns a paginated list of classifications or a specific classification if code is provided.")
	public ResponseEntity<?> getClassifications(
			@RequestParam(required = false)
			@Parameter(description = "Classification code to filter by (e.g., 'IT3')") String code,

			@RequestParam(defaultValue = "0")
			@Parameter(description = "Page number (0-based)")
			int page,

			@RequestParam(defaultValue = "20")
			@Range(min = 1, max = 100)
			@Parameter(description = "Page size (between 1 and 100)")
			int size) {

		if (isNotBlank(code)) {
			CollectionModel<ClassificationReadModel> result = new CollectionModel<>(classificationService.getClassificationByCode(code)
				.map(classificationModelMapper::toModel)
				.map(List::of)
				.orElse(List.of()));
			return ResponseEntity.ok(result);
		}

		Page<ClassificationReadModel> result = classificationService.getClassifications(PageRequest.of(page, size))
			.map(classificationModelMapper::toModel);
		return ResponseEntity.ok(result);
	}
}
