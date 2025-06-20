package ca.gov.dtsstn.vacman.api.web;

import static org.apache.commons.lang3.StringUtils.isNotBlank;

import java.util.List;

import org.mapstruct.factory.Mappers;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import ca.gov.dtsstn.vacman.api.config.SpringDocConfig;
import ca.gov.dtsstn.vacman.api.service.CityService;
import ca.gov.dtsstn.vacman.api.web.model.CityReadModel;
import ca.gov.dtsstn.vacman.api.web.model.CollectionModel;
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
	@Operation(summary = "Get all cities or filter by code or province.", description = "Returns a collection of all cities, or cities filtered by code or province.")
	public CollectionModel<CityReadModel> getCities(
			@RequestParam(required = false)
			@Parameter(description = "City code to filter by (e.g., 'OT' for Ottawa)") String code,
			@RequestParam(required = false)
			@Parameter(description = "Province code to filter by (e.g., 'ON' for Ontario)") String province) {

		// If both parameters are provided, find cities that match both
		if (isNotBlank(code) && isNotBlank(province)) {
			return new CollectionModel<>(cityService.getCityByCodeAndProvince(code, province).stream()
				.map(cityModelMapper::toModel)
				.toList());
		}

		// If only code is provided
		if (isNotBlank(code)) {
			return new CollectionModel<>(cityService.getCityByCode(code)
				.map(cityModelMapper::toModel)
				.map(List::of)
				.orElse(List.of()));
		}

		// If only province is provided
		if (isNotBlank(province)) {
			return new CollectionModel<>(cityService.getCitiesByProvinceCode(province).stream()
				.map(cityModelMapper::toModel)
				.toList());
		}

		// If no parameters are provided
		return new CollectionModel<>(cityService.getAllCities().stream()
			.map(cityModelMapper::toModel)
			.toList());
	}
}
