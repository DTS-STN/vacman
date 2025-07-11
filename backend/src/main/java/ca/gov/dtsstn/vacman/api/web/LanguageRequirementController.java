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
import ca.gov.dtsstn.vacman.api.service.LanguageRequirementService;
import ca.gov.dtsstn.vacman.api.web.model.CollectionModel;
import ca.gov.dtsstn.vacman.api.web.model.LanguageRequirementReadModel;
import ca.gov.dtsstn.vacman.api.web.model.mapper.LanguageRequirementModelMapper;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;

@RestController
@Tag(name = "Language Requirement")
@RequestMapping({ "/api/v1/language-requirement" })
public class LanguageRequirementController {

	private final LanguageRequirementModelMapper languageRequirementModelMapper = Mappers.getMapper(LanguageRequirementModelMapper.class);

	private final LanguageRequirementService languageRequirementService;

	public LanguageRequirementController(LanguageRequirementService languageRequirementService) {
		this.languageRequirementService = languageRequirementService;
	}

	@GetMapping
	@SecurityRequirement(name = SpringDocConfig.AZURE_AD)
	@Operation(summary = "Get all language requirement types or filter by code.", description = "Returns a collection of all language requirement types, or language requirement types filtered by code.")
	public ResponseEntity<CollectionModel<LanguageRequirementReadModel>> getLanguageRequirements(
			@RequestParam(required = false)
			@Parameter(description = "Language requirement code to filter by (e.g., 'BILINGUAL')") String code) {

		if (isNotBlank(code)) {
			return languageRequirementService.getLanguageRequirementByCode(code)
				.map(languageRequirement -> ResponseEntity.ok(new CollectionModel<>(List.of(languageRequirementModelMapper.toModel(languageRequirement)))))
				.orElse(ResponseEntity.ok(new CollectionModel<>(List.of())));
		}

		CollectionModel<LanguageRequirementReadModel> result = new CollectionModel<>(languageRequirementService.getAllLanguageRequirements().stream()
			.map(languageRequirementModelMapper::toModel)
			.toList());

		return ResponseEntity.ok(result);
	}

}
