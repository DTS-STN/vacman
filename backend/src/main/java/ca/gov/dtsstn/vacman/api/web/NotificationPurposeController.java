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
import ca.gov.dtsstn.vacman.api.service.NotificationPurposeService;
import ca.gov.dtsstn.vacman.api.web.model.CollectionModel;
import ca.gov.dtsstn.vacman.api.web.model.NotificationPurposeReadModel;
import ca.gov.dtsstn.vacman.api.web.model.mapper.NotificationPurposeModelMapper;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;

@RestController
@Tag(name = "Notification Purpose")
@RequestMapping({ "/api/v1/notification-purpose" })
public class NotificationPurposeController {

	private final NotificationPurposeModelMapper notificationPurposeModelMapper = Mappers.getMapper(NotificationPurposeModelMapper.class);

	private final NotificationPurposeService notificationPurposeService;

	public NotificationPurposeController(NotificationPurposeService notificationPurposeService) {
		this.notificationPurposeService = notificationPurposeService;
	}

	@GetMapping
	@SecurityRequirement(name = SpringDocConfig.AZURE_AD)
	@Operation(summary = "Get all notification purposes or filter by code.", description = "Returns a collection of all notification purposes, or notification purposes filtered by code.")
	public ResponseEntity<CollectionModel<NotificationPurposeReadModel>> getNotificationPurposes(
			@RequestParam(required = false)
			@Parameter(description = "Notification purpose code to filter by (e.g., 'ALERT')") String code) {

		if (isNotBlank(code)) {
			return notificationPurposeService.getNotificationPurposeByCode(code)
				.map(notificationPurpose -> ResponseEntity.ok(new CollectionModel<>(List.of(notificationPurposeModelMapper.toModel(notificationPurpose)))))
				.orElse(ResponseEntity.ok(new CollectionModel<>(List.of())));
		}

		CollectionModel<NotificationPurposeReadModel> result = new CollectionModel<>(notificationPurposeService.getAllNotificationPurposes().stream()
			.map(notificationPurposeModelMapper::toModel)
			.toList());

		return ResponseEntity.ok(result);
	}

}
