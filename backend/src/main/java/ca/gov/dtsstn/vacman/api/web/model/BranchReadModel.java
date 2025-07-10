package ca.gov.dtsstn.vacman.api.web.model;

import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.media.Schema.AccessMode;

@Schema(name = "BranchRead", description = "Standard representation of a branch.")
public record BranchReadModel(
        @Schema(accessMode = AccessMode.READ_ONLY, description = "The unique identifier for this branch.")
        Long id,

        @Schema(description = "The code of this branch.", example = "IITB")
        String code,

        @Schema(description = "The English name of this branch.", example = "Innovation, Information and Technology Branch")
        String nameEn,

        @Schema(description = "The French name of this branch.", example = "Direction générale de l'innovation, de l'information et de la technologie")
        String nameFr
) {}