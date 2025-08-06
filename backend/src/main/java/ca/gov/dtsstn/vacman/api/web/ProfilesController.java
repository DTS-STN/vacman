package ca.gov.dtsstn.vacman.api.web;

import ca.gov.dtsstn.vacman.api.config.SpringDocConfig;
import ca.gov.dtsstn.vacman.api.security.SecurityUtils;
import ca.gov.dtsstn.vacman.api.service.ProfileService;
import ca.gov.dtsstn.vacman.api.web.exception.UnauthorizedException;
import ca.gov.dtsstn.vacman.api.web.model.ProfileReadModel;
import ca.gov.dtsstn.vacman.api.web.model.ProfilesStatusParam;
import ca.gov.dtsstn.vacman.api.web.model.mapper.ProfileModelMapper;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.hibernate.validator.constraints.Range;
import org.mapstruct.factory.Mappers;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.web.PagedModel;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@Tag(name = "Profiles")
@RequestMapping({ "/api/v1/profiles" })
public class ProfilesController {

    private final ProfileService profileService;

    private final ProfileModelMapper profileModelMapper = Mappers.getMapper(ProfileModelMapper.class);

    public ProfilesController(ProfileService profileService) {
        this.profileService = profileService;
    }

    @GetMapping
    @SecurityRequirement(name = SpringDocConfig.AZURE_AD)
    @Operation(summary = "Retrieve a list of profiles with optional filters on active profiles, inactive profiles, and HR advisor assocation.")
    public ResponseEntity<PagedModel<ProfileReadModel>> getProfiles(
            @RequestParam(defaultValue = "0")
            @Parameter(description = "Page number (0-based")
            int page,

            @RequestParam(defaultValue = "20")
            @Range(min = 1, max = 100)
            @Parameter(description = "Page size (between 1 and 100)")
            int size,

            @RequestParam
            @Parameter(description = "Return either active or inactive profiles.")
            ProfilesStatusParam status,

            @RequestParam(required = false)
            @Parameter(description = "Return only the profiles that are associated with the HR advisor")
            Long hrAdvisorId
    ) {
        if (!SecurityUtils.hasHrAdvisorId()) {
            throw new UnauthorizedException("JWT token does not have hr-advisor claim.");
        }

        final var profiles = profileService.getProfilesByStatusAndHrId(PageRequest.of(page, size), status, hrAdvisorId)
                .map(profileModelMapper::toModel);

       return ResponseEntity.ok(new PagedModel<>(profiles));
    }
}
