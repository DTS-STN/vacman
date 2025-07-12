package ca.gov.dtsstn.vacman.api.web;

import static org.apache.commons.lang3.StringUtils.isNotBlank;

import java.util.List;

import org.mapstruct.factory.Mappers;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import ca.gov.dtsstn.vacman.api.config.SpringDocConfig;
import ca.gov.dtsstn.vacman.api.service.ProvinceService;
import ca.gov.dtsstn.vacman.api.web.model.CollectionModel;
import ca.gov.dtsstn.vacman.api.web.model.ProvinceReadModel;
import ca.gov.dtsstn.vacman.api.web.model.mapper.ProvinceModelMapper;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;

@RestController
@Tag(name = "Provinces")
@RequestMapping({ "/api/v1/provinces" })
public class ProvinceController {

    private final ProvinceModelMapper provinceModelMapper = Mappers.getMapper(ProvinceModelMapper.class);

    private final ProvinceService provinceService;

    public ProvinceController(ProvinceService provinceService) {
        this.provinceService = provinceService;
    }

    @GetMapping
    @SecurityRequirement(name = SpringDocConfig.AZURE_AD)
    @Operation(summary = "Get all provinces or filter by code.", description = "Returns a collection of all provinces, or provinces filtered by code.")
    public ResponseEntity<CollectionModel<ProvinceReadModel>> getProvinces(
            @RequestParam(required = false)
            @Parameter(description = "Province code to filter by (e.g., 'YT' for Yukon)") String code) {

        if (isNotBlank(code)) {
            CollectionModel<ProvinceReadModel> result = new CollectionModel<>(provinceService.getProvinceByCode(code)
                .map(provinceModelMapper::toModel)
                .map(List::of)
                .orElse(List.of()));
            return ResponseEntity.ok(result);
        }

        CollectionModel<ProvinceReadModel> result = new CollectionModel<>(provinceService.getAllProvinces().stream()
            .map(provinceModelMapper::toModel)
            .toList());
        return ResponseEntity.ok(result);
    }

    @GetMapping("/{id}")
    @SecurityRequirement(name = SpringDocConfig.AZURE_AD)
    @Operation(summary = "Get a province by ID.", description = "Returns a province by its ID.")
    public ResponseEntity<ProvinceReadModel> getProvinceById(
            @PathVariable
            @Parameter(description = "Province ID") Long id) {

        return provinceService.getProvinceById(id)
            .map(provinceModelMapper::toModel)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }
}
