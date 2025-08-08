package ca.gov.dtsstn.vacman.api.web;

import ca.gov.dtsstn.vacman.api.config.SpringDocConfig;
import ca.gov.dtsstn.vacman.api.data.entity.ProfileEntity;
import ca.gov.dtsstn.vacman.api.security.SecurityUtils;
import ca.gov.dtsstn.vacman.api.service.ProfileService;
import ca.gov.dtsstn.vacman.api.service.UserService;
import ca.gov.dtsstn.vacman.api.web.exception.ResourceConflictException;
import ca.gov.dtsstn.vacman.api.web.exception.ResourceNotFoundException;
import ca.gov.dtsstn.vacman.api.web.exception.UnauthorizedException;
import ca.gov.dtsstn.vacman.api.web.model.ProfileReadModel;
import ca.gov.dtsstn.vacman.api.web.model.mapper.ProfileModelMapper;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.apache.commons.lang3.StringUtils;
import org.hibernate.validator.constraints.Range;
import org.mapstruct.factory.Mappers;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.web.PagedModel;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Collection;
import java.util.function.Function;

@RestController
@Tag(name = "Profiles")
@RequestMapping({ "/api/v1/profiles" })
public class ProfilesController {

    private static final Logger log = LoggerFactory.getLogger(ProfilesController.class);

    private static final String OID_NOT_FOUND_MESSAGE = "Could not extract 'oid' claim from JWT token";

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
                    .orElseThrow(() -> new UnauthorizedException(OID_NOT_FOUND_MESSAGE));

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
                .orElseThrow(() -> new UnauthorizedException(OID_NOT_FOUND_MESSAGE));

        final var profiles = profileService.getProfilesByEntraId(entraId, isActive)
                .stream()
                .map(profileModelMapper::toModelNoUserData)
                .toList();

        return ResponseEntity.ok(profiles);
    }

    @PostMapping(path = "/me")
    @SecurityRequirement(name = SpringDocConfig.AZURE_AD)
    @Operation(summary = "Create a new profile associated with the authenticated user.")
    public ResponseEntity<ProfileReadModel> createCurrentUserProfile() {
        log.info("Received request to create new profile");
        final var microsoftEntraId = SecurityUtils.getCurrentUserEntraId()
                .orElseThrow(() -> new UnauthorizedException(OID_NOT_FOUND_MESSAGE));

        log.debug("Checking if user with microsoftEntraId=[{}] already exists", microsoftEntraId);
        final var existingUser = userService.getUserByMicrosoftEntraId(microsoftEntraId)
                .orElseThrow(() -> new ResourceConflictException("A user with microsoftEntraId=[" + microsoftEntraId + "] does not exist"));

        log.debug("Checking if user with microsoftEntraId=[{}] has an active profile", microsoftEntraId);
        if (!profileService.getProfilesByEntraId(microsoftEntraId, true).isEmpty()) {
            throw new ResourceConflictException("Use with microsoftEntraId=[" + microsoftEntraId + "] has an existing active profile");
        }

        log.debug("Creating profile in database...");
        final var createdProfile = profileModelMapper.toModel(profileService.createProfile(existingUser));

        log.trace("Successfully created profile user: [{}]", createdProfile);

        return ResponseEntity.ok(createdProfile);
    }

    @PutMapping(path = "/{id}")
    @SecurityRequirement(name = SpringDocConfig.AZURE_AD)
    @Operation(summary = "Update the profile identified by ID.")
    public ResponseEntity<ProfileReadModel> updateProfileById(
            @PathVariable(name = "id")
            Long profileId,

            @Valid
            @RequestBody
            ProfileReadModel updatedProfile
    ) {
        log.info("Received request to get profile; ID: [{}]", profileId);

        log.debug("Checking if caller has hr-advisor claim");
        if (!SecurityUtils.hasHrAdvisorId()) {
            throw new UnauthorizedException("JWT token does not have hr-advisor claim.");
        }

        log.debug("Checking if caller is a user, that user owns the profile matching the profile ID, and the profile is active.");
        final var microsoftEntraId = SecurityUtils.getCurrentUserEntraId()
                .orElseThrow(() -> new UnauthorizedException(OID_NOT_FOUND_MESSAGE));

        var userId = userService.getUserByMicrosoftEntraId(microsoftEntraId)
                .orElseThrow(() ->  new ResourceNotFoundException("A user with microsoftEntraId=[" + microsoftEntraId + "] does not exist"))
                .getId();

        var foundProfile = profileService.getProfileByIdAndUserId(profileId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("A profile with id=[" + profileId
                        + "] for user with microsoftEntraId=[" + microsoftEntraId + "] does not exist"));

        log.trace("Found profile: [{}]", foundProfile);

        var updatedEntity = profileService.updateProfile(updatedProfile, foundProfile);

        return ResponseEntity.ok(profileModelMapper.toModelNoUserData(updatedEntity));
    }
}
