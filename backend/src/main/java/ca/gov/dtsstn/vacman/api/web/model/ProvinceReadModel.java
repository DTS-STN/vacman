package ca.gov.dtsstn.vacman.api.web.model;

import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.media.Schema.AccessMode;

@Schema(name = "ProvinceRead", description = "Standard representation of a province.")
public record ProvinceReadModel(
        @Schema(accessMode = AccessMode.READ_ONLY, description = "The unique identifier for this province.")
        Long id,

        @Schema(description = "The code of this province.", example = "ON")
        String code,

        @Schema(description = "The English name of this province.", example = "Ontario")
        String nameEn,

        @Schema(description = "The French name of this province.", example = "Ontario")
        String nameFr
) {}
