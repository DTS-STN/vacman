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
import ca.gov.dtsstn.vacman.api.service.LanguageReferralTypeService;
import ca.gov.dtsstn.vacman.api.web.model.CollectionModel;
import ca.gov.dtsstn.vacman.api.web.model.LanguageReferralTypeReadModel;
import ca.gov.dtsstn.vacman.api.web.model.mapper.LanguageReferralTypeModelMapper;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;

@RestController
@Tag(name = "Language Referral Types")
@RequestMapping({ "/api/v1/language-referral-types" })
public class LanguageReferralTypeController {

	private final LanguageReferralTypeModelMapper languageReferralTypeModelMapper = Mappers.getMapper(LanguageReferralTypeModelMapper.class);

	private final LanguageReferralTypeService languageReferralTypeService;

	public LanguageReferralTypeController(LanguageReferralTypeService languageReferralTypeService) {
		this.languageReferralTypeService = languageReferralTypeService;
	}

	@GetMapping
	@SecurityRequirement(name = SpringDocConfig.AZURE_AD)
	@Operation(summary = "Get language referral types with pagination or filter by code.", description = "Returns a paginated list of language referral types or a specific language referral type if code is provided.")
	public ResponseEntity<?> getLanguageReferralTypes(
			@RequestParam(required = false)
			@Parameter(description = "Language referral type code to filter by")
			String code,

			@RequestParam(defaultValue = "0")
			@Parameter(description = "Page number (0-based)")
			int page,

			@RequestParam(defaultValue = "20")
			@Range(min = 1, max = 100)
			@Parameter(description = "Page size (between 1 and 100)")
			int size) {
		if (isNotBlank(code)) {
			CollectionModel<LanguageReferralTypeReadModel> result = new CollectionModel<>(languageReferralTypeService.getLanguageReferralTypeByCode(code)
				.map(languageReferralTypeModelMapper::toModel)
				.map(List::of)
				.orElse(List.of()));
			return ResponseEntity.ok(result);
		}

		Page<LanguageReferralTypeReadModel> result = languageReferralTypeService.getLanguageReferralTypes(PageRequest.of(page, size))
			.map(languageReferralTypeModelMapper::toModel);
		return ResponseEntity.ok(result);
	}
}
