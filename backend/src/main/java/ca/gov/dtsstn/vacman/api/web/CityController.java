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
import ca.gov.dtsstn.vacman.api.service.CityService;
import ca.gov.dtsstn.vacman.api.web.model.CityReadModel;
import ca.gov.dtsstn.vacman.api.web.model.mapper.CityModelMapper;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;

@RestController
@Tag(name = "Cities")
@RequestMapping({ "/api/v1/cities" })
public class CityController {

    private final CityModelMapper cityModelMapper = Mappers.getMapper(CityModelMapper.class);

    private final CityService cityService;

    public CityController(CityService cityService) {
        this.cityService = cityService;
    }

    @GetMapping
    @SecurityRequirement(name = SpringDocConfig.AZURE_AD)
    @Operation(summary = "Get all cities or filter by code.", description = "Returns a list of all cities or a specific city if code is provided.")
    public List<CityReadModel> getCities(
            @RequestParam(required = false)
            @Parameter(description = "City code to filter by (e.g., 'OT' for Ottawa)")
            String code) {
        
        if (code != null && !code.isEmpty()) {
            return cityService.getCityByCode(code)
                .map(cityModelMapper::toModel)
                .map(List::of)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "City with code '" + code + "' not found"));
        }
        
        return cityService.getAllCities().stream()
            .map(cityModelMapper::toModel)
            .toList();
    }
}