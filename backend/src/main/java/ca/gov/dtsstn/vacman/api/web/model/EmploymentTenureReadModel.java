package ca.gov.dtsstn.vacman.api.web.model;

import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.media.Schema.AccessMode;

@Schema(name = "EmploymentTenureRead", description = "Standard representation of an employment tenure.")
public record EmploymentTenureReadModel(
        @Schema(accessMode = AccessMode.READ_ONLY, description = "The unique identifier for this employment tenure.")
        Long id,

        @Schema(description = "The code of this employment tenure.", example = "INDETERMINATE")
        String code,

        @Schema(description = "The English name of this employment tenure.", example = "Indeterminate")
        String nameEn,

        @Schema(description = "The French name of this employment tenure.", example = "Indéterminé")
        String nameFr
) {}