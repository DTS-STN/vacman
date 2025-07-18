package ca.gov.dtsstn.vacman.api.web;

import static org.apache.commons.lang3.StringUtils.isNotBlank;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
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

	private final CityModelMapper cityModelMapper;

	private final CityService cityService;

	public CityController(CityService cityService, CityModelMapper cityModelMapper) {
		this.cityService = cityService;
		this.cityModelMapper = cityModelMapper;
	}

	@GetMapping
	@SecurityRequirement(name = SpringDocConfig.AZURE_AD)
	@Operation(summary = "Get all cities or filter by code or province.", description = "Returns a collection of all cities, or cities filtered by code or province.")
	public ResponseEntity<CollectionModel<CityReadModel>> getCities(
			@RequestParam(required = false)
			@Parameter(description = "City code to filter by (e.g., 'OT' for Ottawa)") String code,
			@RequestParam(required = false)
			@Parameter(description = "Province code to filter by (e.g., 'ON' for Ontario)") String province,
			@RequestParam(required = false)
			@Parameter(description = "Province ID to filter by") Long provinceId) {

		// If provinceId is provided
		if (provinceId != null) {
			CollectionModel<CityReadModel> result = new CollectionModel<>(cityService.getCitiesByProvinceId(provinceId).stream()
				.map(cityModelMapper::toModel)
				.toList());
			return ResponseEntity.ok(result);
		}

		// If both code and province parameters are provided, find cities that match both
		if (isNotBlank(code) && isNotBlank(province)) {
			CollectionModel<CityReadModel> result = new CollectionModel<>(cityService.getCityByCodeAndProvince(code, province).stream()
				.map(cityModelMapper::toModel)
				.toList());
			return ResponseEntity.ok(result);
		}

		// If only code is provided
		if (isNotBlank(code)) {
			CollectionModel<CityReadModel> result = new CollectionModel<>(cityService.getCityByCode(code)
				.map(cityModelMapper::toModel)
				.map(List::of)
				.orElse(List.of()));
			return ResponseEntity.ok(result);
		}

		// If only province is provided
		if (isNotBlank(province)) {
			CollectionModel<CityReadModel> result = new CollectionModel<>(cityService.getCitiesByProvinceCode(province).stream()
				.map(cityModelMapper::toModel)
				.toList());
			return ResponseEntity.ok(result);
		}

		// If no parameters are provided
		CollectionModel<CityReadModel> result = new CollectionModel<>(cityService.getAllCities().stream()
			.map(cityModelMapper::toModel)
			.toList());
		return ResponseEntity.ok(result);
	}

	@GetMapping("/{id}")
	@SecurityRequirement(name = SpringDocConfig.AZURE_AD)
	@Operation(summary = "Get a city by ID.", description = "Returns a city by its ID.")
	public ResponseEntity<CityReadModel> getCityById(
			@PathVariable
			@Parameter(description = "City ID") Long id) {

		return cityService.getCityById(id)
			.map(cityModelMapper::toModel)
			.map(ResponseEntity::ok)
			.orElse(ResponseEntity.notFound().build());
	}
}
