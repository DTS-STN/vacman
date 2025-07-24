package ca.gov.dtsstn.vacman.api.web.model;

import org.immutables.value.Value.Immutable;

import io.swagger.v3.oas.annotations.media.Schema;

@Immutable
@Schema(name = "CityRead", description = "Standard representation of a city.")
public interface CityReadModel extends CodeReadModel {

	@Schema(description = "The province/territory this city belongs to.")
	ProvinceReadModel getProvinceTerritory();

}