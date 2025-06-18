package ca.gov.dtsstn.vacman.api.web;

import java.util.List;

import org.apache.commons.lang3.StringUtils;
import org.mapstruct.factory.Mappers;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

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
    @Operation(summary = "Get all language referral types or filter by code.", description = "Returns a collection of all language referral types or a specific language referral type if code is provided.")
    public CollectionModel<LanguageReferralTypeReadModel> getLanguageReferralTypes(
            @RequestParam(required = false)
            @Parameter(description = "Language referral type code to filter by")
            String code) {

        if (StringUtils.isNotBlank(code)) {
            List<LanguageReferralTypeReadModel> result = languageReferralTypeService.getLanguageReferralTypeByCode(code)
                .map(languageReferralTypeModelMapper::toModel)
                .map(List::of)
                .orElse(List.of());

            return new CollectionModel<>(result);
        }

        List<LanguageReferralTypeReadModel> result = languageReferralTypeService.getAllLanguageReferralTypes().stream()
            .map(languageReferralTypeModelMapper::toModel)
            .toList();
        return new CollectionModel<>(result);
    }
}
