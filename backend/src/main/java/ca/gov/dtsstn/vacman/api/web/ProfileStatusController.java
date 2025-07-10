package ca.gov.dtsstn.vacman.api.web;

import static org.apache.commons.lang3.StringUtils.isNotBlank;

import java.util.List;

import org.mapstruct.factory.Mappers;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import ca.gov.dtsstn.vacman.api.config.SpringDocConfig;
import ca.gov.dtsstn.vacman.api.service.ProfileStatusService;
import ca.gov.dtsstn.vacman.api.web.model.CollectionModel;
import ca.gov.dtsstn.vacman.api.web.model.ProfileStatusReadModel;
import ca.gov.dtsstn.vacman.api.web.model.mapper.ProfileStatusModelMapper;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;

@RestController
@Tag(name = "Profile Status")
@RequestMapping({ "/api/v1/profile-status" })
public class ProfileStatusController {

	private final ProfileStatusModelMapper profileStatusModelMapper = Mappers.getMapper(ProfileStatusModelMapper.class);

	private final ProfileStatusService profileStatusService;

	public ProfileStatusController(ProfileStatusService profileStatusService) {
		this.profileStatusService = profileStatusService;
	}

	@GetMapping
	@SecurityRequirement(name = SpringDocConfig.AZURE_AD)
	@Operation(summary = "Get all profile statuses or filter by code.", description = "Returns a collection of all profile statuses, or profile statuses filtered by code.")
	public ResponseEntity<CollectionModel<ProfileStatusReadModel>> getProfileStatuses(
			@RequestParam(required = false)
			@Parameter(description = "Profile status code to filter by (e.g., 'ACTIVE')") String code) {

		if (isNotBlank(code)) {
			return profileStatusService.getProfileStatusByCode(code)
				.map(profileStatus -> ResponseEntity.ok(new CollectionModel<>(List.of(profileStatusModelMapper.toModel(profileStatus)))))
				.orElse(ResponseEntity.ok(new CollectionModel<>(List.of())));
		}

		CollectionModel<ProfileStatusReadModel> result = new CollectionModel<>(profileStatusService.getAllProfileStatuses().stream()
			.map(profileStatusModelMapper::toModel)
			.toList());

		return ResponseEntity.ok(result);
	}

}
