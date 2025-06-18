package ca.gov.dtsstn.vacman.api.web;

import java.util.List;

import org.mapstruct.factory.Mappers;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

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
    @Operation(summary = "Get all education levels or filter by code.", description = "Returns a collection of all education levels or a specific education level if code is provided.")
    public CollectionModel<EducationLevelReadModel> getEducationLevels(
            @RequestParam(required = false)
            @Parameter(description = "Education level code to filter by (e.g., 'BD' for Bachelor's Degree)")
            String code) {

        if (code != null && !code.isEmpty()) {
            List<EducationLevelReadModel> result = educationLevelService.getEducationLevelByCode(code)
                .map(educationLevelModelMapper::toModel)
                .map(List::of)
                .orElse(List.of());
            return new CollectionModel<>(result);
        }

        List<EducationLevelReadModel> result = educationLevelService.getAllEducationLevels().stream()
            .map(educationLevelModelMapper::toModel)
            .toList();
        return new CollectionModel<>(result);
    }
}
