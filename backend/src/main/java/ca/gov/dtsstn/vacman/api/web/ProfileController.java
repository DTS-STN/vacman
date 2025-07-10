package ca.gov.dtsstn.vacman.api.web;

import org.mapstruct.factory.Mappers;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import ca.gov.dtsstn.vacman.api.config.SpringDocConfig;
import ca.gov.dtsstn.vacman.api.data.entity.ProfileEntity;
import ca.gov.dtsstn.vacman.api.service.ProfileService;
import ca.gov.dtsstn.vacman.api.web.model.CollectionModel;
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

	private final ProfileModelMapper profileModelMapper = Mappers.getMapper(ProfileModelMapper.class);

	private final ProfileService profileService;

	public ProfileController(ProfileService profileService) {
		this.profileService = profileService;
	}

	@GetMapping
	@SecurityRequirement(name = SpringDocConfig.AZURE_AD)
	@Operation(summary = "Get all profiles", description = "Returns a collection of all profiles with pagination support.")
	public ResponseEntity<CollectionModel<ProfileReadModel>> getProfiles(Pageable pageable) {
		Page<ProfileEntity> profilePage = profileService.getProfiles(pageable);

		CollectionModel<ProfileReadModel> result = new CollectionModel<>(profilePage.getContent().stream()
			.map(profileModelMapper::toModel)
			.toList());

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
	@Operation(summary = "Create a new profile", description = "Creates a new profile.")
	public ResponseEntity<ProfileReadModel> createProfile(@RequestBody ProfileEntity profile) {
		ProfileEntity savedProfile = profileService.saveProfile(profile);
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
