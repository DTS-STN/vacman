package ca.gov.dtsstn.vacman.api.web;

import static org.apache.commons.lang3.StringUtils.isNotBlank;

import java.util.List;

import org.mapstruct.factory.Mappers;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import ca.gov.dtsstn.vacman.api.config.SpringDocConfig;
import ca.gov.dtsstn.vacman.api.service.AssessmentResultService;
import ca.gov.dtsstn.vacman.api.web.model.AssessmentResultReadModel;
import ca.gov.dtsstn.vacman.api.web.model.CollectionModel;
import ca.gov.dtsstn.vacman.api.web.model.mapper.AssessmentResultModelMapper;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;

@RestController
@Tag(name = "Assessment Results")
@RequestMapping({ "/api/v1/assessment-results" })
public class AssessmentResultController {

	private final AssessmentResultModelMapper assessmentResultModelMapper = Mappers.getMapper(AssessmentResultModelMapper.class);

	private final AssessmentResultService assessmentResultService;

	public AssessmentResultController(AssessmentResultService assessmentResultService) {
		this.assessmentResultService = assessmentResultService;
	}

	@GetMapping
	@SecurityRequirement(name = SpringDocConfig.AZURE_AD)
	@Operation(summary = "Get all assessment results or filter by code.", description = "Returns a collection of all assessment results, or assessment results filtered by code.")
	public ResponseEntity<CollectionModel<AssessmentResultReadModel>> getAssessmentResults(
			@RequestParam(required = false)
			@Parameter(description = "Assessment result code to filter by (e.g., 'PASS')") String code) {

		if (isNotBlank(code)) {
			return assessmentResultService.getAssessmentResultByCode(code)
				.map(assessmentResult -> ResponseEntity.ok(new CollectionModel<>(List.of(assessmentResultModelMapper.toModel(assessmentResult)))))
				.orElse(ResponseEntity.ok(new CollectionModel<>(List.of())));
		}

		CollectionModel<AssessmentResultReadModel> result = new CollectionModel<>(assessmentResultService.getAllAssessmentResults().stream()
			.map(assessmentResultModelMapper::toModel)
			.toList());

		return ResponseEntity.ok(result);
	}

}
