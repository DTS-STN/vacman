package ca.gov.dtsstn.vacman.api.web;

import org.hibernate.validator.constraints.Range;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import ca.gov.dtsstn.vacman.api.config.SpringDocConfig;
import ca.gov.dtsstn.vacman.api.data.entity.ProfileEntity;
import ca.gov.dtsstn.vacman.api.service.ProfileService;
import ca.gov.dtsstn.vacman.api.web.model.ProfileCreateByActiveDirectoryIdModel;
import ca.gov.dtsstn.vacman.api.web.model.ProfileCreateModel;
import ca.gov.dtsstn.vacman.api.web.model.ProfileReadModel;
import ca.gov.dtsstn.vacman.api.web.model.mapper.ProfileModelMapper;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;

@RestController
@Tag(name = "Profiles")
@RequestMapping({ "/api/v1/profiles" })
public class ProfileController {

	private final ProfileModelMapper profileModelMapper;

	private final ProfileService profileService;

	public ProfileController(ProfileService profileService, ProfileModelMapper profileModelMapper) {
		this.profileService = profileService;
		this.profileModelMapper = profileModelMapper;
	}

	@GetMapping
	@SecurityRequirement(name = SpringDocConfig.AZURE_AD)
	@Operation(summary = "Get all profiles", description = "Returns a paginated list of profiles.")
	public ResponseEntity<Page<ProfileReadModel>> getProfiles(
			@RequestParam(defaultValue = "0")
			@Parameter(description = "Page number (0-based)")
			int page,

			@RequestParam(defaultValue = "20")
			@Range(min = 1, max = 100)
			@Parameter(description = "Page size (between 1 and 100)")
			int size) {
		Page<ProfileReadModel> result = profileService.getProfiles(PageRequest.of(page, size)).map(profileModelMapper::toModel);
		return ResponseEntity.ok(result);
	}

	@GetMapping("/{id}")
	@SecurityRequirement(name = SpringDocConfig.AZURE_AD)
	@Operation(summary = "Get profile by ID", description = "Returns a specific profile by its ID.")
	public ResponseEntity<ProfileReadModel> getProfileById(
			@PathVariable @Parameter(description = "Profile ID") Long id) {

		return profileService.getProfileById(id)
			.map(profile -> ResponseEntity.ok(profileModelMapper.toModel(profile)))
			.orElse(ResponseEntity.notFound().build());
	}

	@PostMapping
	@SecurityRequirement(name = SpringDocConfig.AZURE_AD)
	@Operation(summary = "Create a new profile",
			description = "Creates a new profile. If activeDirectoryId parameter is provided, creates a profile with default values for that user. Otherwise, expects a full ProfileCreateModel in the request body.")
	public ResponseEntity<ProfileReadModel> createProfile(
			@RequestParam(required = false)
			@Parameter(description = "Active Directory ID (network name) to create a profile with default values")
			String activeDirectoryId,
			@RequestBody(required = false) ProfileCreateModel createModel) {

		ProfileEntity savedProfile;

		// If activeDirectoryId parameter is provided, use the simplified creation
		if (activeDirectoryId != null && !activeDirectoryId.trim().isEmpty()) {
			ProfileCreateByActiveDirectoryIdModel simpleModel = new ProfileCreateByActiveDirectoryIdModel(activeDirectoryId);
			savedProfile = profileService.createProfileByActiveDirectoryId(simpleModel);
		}
		// Otherwise, use the full create model from request body
		else if (createModel != null) {
			savedProfile = profileService.createProfile(createModel);
		}
		// Neither parameter nor body provided
		else {
			return ResponseEntity.badRequest().build();
		}

		return ResponseEntity.ok(profileModelMapper.toModel(savedProfile));
	}

	@PutMapping("/{id}")
	@SecurityRequirement(name = SpringDocConfig.AZURE_AD)
	@Operation(summary = "Update profile", description = "Updates an existing profile.")
	public ResponseEntity<ProfileReadModel> updateProfile(
			@PathVariable @Parameter(description = "Profile ID") Long id,
			@RequestBody ProfileEntity profile) {

		return profileService.getProfileById(id)
			.map(existingProfile -> {
				profile.setId(id);
				ProfileEntity savedProfile = profileService.saveProfile(profile);
				return ResponseEntity.ok(profileModelMapper.toModel(savedProfile));
			})
			.orElse(ResponseEntity.notFound().build());
	}

	@DeleteMapping("/{id}")
	@SecurityRequirement(name = SpringDocConfig.AZURE_AD)
	@Operation(summary = "Delete profile", description = "Deletes a profile by its ID.")
	public ResponseEntity<Void> deleteProfile(
			@PathVariable @Parameter(description = "Profile ID") Long id) {

		if (profileService.getProfileById(id).isPresent()) {
			profileService.deleteProfile(id);
			return ResponseEntity.noContent().build();
		}
		return ResponseEntity.notFound().build();
	}

}
