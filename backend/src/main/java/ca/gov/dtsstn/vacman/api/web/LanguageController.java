package ca.gov.dtsstn.vacman.api.web;

import static org.apache.commons.lang3.StringUtils.isNotBlank;

import java.util.List;

import org.mapstruct.factory.Mappers;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import ca.gov.dtsstn.vacman.api.config.SpringDocConfig;
import ca.gov.dtsstn.vacman.api.service.LanguageService;
import ca.gov.dtsstn.vacman.api.web.model.CollectionModel;
import ca.gov.dtsstn.vacman.api.web.model.LanguageReadModel;
import ca.gov.dtsstn.vacman.api.web.model.mapper.LanguageModelMapper;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;

@RestController
@Tag(name = "Languages")
@RequestMapping({ "/api/v1/languages" })
public class LanguageController {

	private final LanguageModelMapper languageModelMapper = Mappers.getMapper(LanguageModelMapper.class);

	private final LanguageService languageService;

	public LanguageController(LanguageService languageService) {
		this.languageService = languageService;
	}

	@GetMapping
	@SecurityRequirement(name = SpringDocConfig.AZURE_AD)
	@Operation(summary = "Get all languages or filter by code.", description = "Returns a collection of all languages or a specific language if code is provided.")
	public CollectionModel<LanguageReadModel> getLanguages(
			@RequestParam(required = false)
			@Parameter(description = "Language code to filter by (e.g., 'EN')")
			String code) {
		if (isNotBlank(code)) {
			return new CollectionModel<>( languageService.getLanguageByCode(code)
				.map(languageModelMapper::toModel)
				.map(List::of)
				.orElse(List.of()));
		}

		return new CollectionModel<>(languageService.getAllLanguages().stream()
			.map(languageModelMapper::toModel)
			.toList());
	}
}
