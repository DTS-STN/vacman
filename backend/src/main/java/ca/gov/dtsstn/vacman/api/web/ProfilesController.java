package ca.gov.dtsstn.vacman.api.web;

import ca.gov.dtsstn.vacman.api.config.SpringDocConfig;
import ca.gov.dtsstn.vacman.api.data.entity.ProfileEntity;
import ca.gov.dtsstn.vacman.api.security.SecurityUtils;
import ca.gov.dtsstn.vacman.api.service.ProfileService;
import ca.gov.dtsstn.vacman.api.service.UserService;
import ca.gov.dtsstn.vacman.api.web.exception.ResourceNotFoundException;
import ca.gov.dtsstn.vacman.api.web.exception.UnauthorizedException;
import ca.gov.dtsstn.vacman.api.web.model.ProfileReadModel;
import ca.gov.dtsstn.vacman.api.web.model.mapper.ProfileModelMapper;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.apache.commons.lang3.StringUtils;
import org.hibernate.validator.constraints.Range;
import org.mapstruct.factory.Mappers;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.web.PagedModel;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.Collection;
import java.util.function.Function;

@RestController
@Tag(name = "Profiles")
@RequestMapping({ "/api/v1/profiles" })
public class ProfilesController {

    private final ProfileService profileService;

    private final UserService userService;

    private final ProfileModelMapper profileModelMapper = Mappers.getMapper(ProfileModelMapper.class);

    public ProfilesController(ProfileService profileService, UserService userService) {
        this.profileService = profileService;
        this.userService = userService;
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

            @RequestParam(name = "active", required = false)
            @Parameter(name = "active", description = "Return only active or inactive profiles")
            Boolean isActive,

            @RequestParam(name = "hr-advisor", required = false)
            @Parameter(name = "hr-advisor", description = "Return only the profiles that are associated with the HR advisor")
            String hrAdvisor,

           @RequestParam(name = "user-data", defaultValue = "false")
           @Parameter(name = "user-data", description = "Return user first name, last name, and email address with profile")
           boolean wantUserData
    ) {
        if (!SecurityUtils.hasHrAdvisorId()) {
            throw new UnauthorizedException("JWT token does not have hr-advisor claim.");
        }

        // Determine the advisor ID based on the advisor param (or lack thereof).
        Long hrAdvisorId;
        if (StringUtils.isBlank(hrAdvisor)) {
            hrAdvisorId = null;
        } else if (hrAdvisor.equalsIgnoreCase("me")) {
            // Retrieve the advisor ID via the incoming oid claim
            var entraId = SecurityUtils.getCurrentUserEntraId()
                    .orElseThrow(() -> new UnauthorizedException("Could not extract 'oid' claim from JWT token"));

            hrAdvisorId = userService.getUserByMicrosoftEntraId(entraId)
                    .orElseThrow(() -> new ResourceNotFoundException("No user found for given entra ID."))
                    .getId();
        } else {
            hrAdvisorId = Long.valueOf(hrAdvisor);
        }

        // Determine the mapping function to use.
        final Function<ProfileEntity, ProfileReadModel> mapper = (wantUserData)
                ? profileModelMapper::toModel
                : profileModelMapper::toModelNoUserData;

        final var profiles =
                profileService.getProfilesByStatusAndHrId(PageRequest.of(page, size), isActive, hrAdvisorId)
                        .map(mapper);

       return ResponseEntity.ok(new PagedModel<>(profiles));
    }

    @GetMapping(path = "/me")
    @SecurityRequirement(name = SpringDocConfig.AZURE_AD)
    @Operation(summary = "Retrieve the profiles associated with the authenticated user with optional filters on active profiles, inactive profiles, and HR advisor association.")
    public ResponseEntity<Collection<ProfileReadModel>> getProfileMe(
            @RequestParam(name = "active", required = false)
            @Parameter(name = "active", description = "Return only active or inactive profiles")
            Boolean isActive
    ) {
        var entraId = SecurityUtils.getCurrentUserEntraId()
                .orElseThrow(() -> new UnauthorizedException("Could not extract 'oid' claim from JWT token"));

        final var profiles = profileService.getProfilesByEntraId(entraId, isActive)
                .stream()
                .map(profileModelMapper::toModelNoUserData)
                .toList();

        return ResponseEntity.ok(profiles);
    }
}
