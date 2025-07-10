package ca.gov.dtsstn.vacman.api.web.model;

import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.media.Schema.AccessMode;

@Schema(name = "CityRead", description = "Standard representation of a city.")
public record CityReadModel(
        @Schema(accessMode = AccessMode.READ_ONLY, description = "The unique identifier for this city.")
        Long id,

        @Schema(description = "The code of this city.", example = "ON52")
        String code,

        @Schema(description = "The English name of this city.", example = "Ottawa")
        String nameEn,

        @Schema(description = "The French name of this city.", example = "Ottawa")
        String nameFr,

        @Schema(description = "The province this city belongs to.")
        ProvinceReadModel province
) {}
