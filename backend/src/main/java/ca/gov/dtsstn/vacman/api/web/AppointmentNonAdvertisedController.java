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
import ca.gov.dtsstn.vacman.api.service.AppointmentNonAdvertisedService;
import ca.gov.dtsstn.vacman.api.web.model.AppointmentNonAdvertisedReadModel;
import ca.gov.dtsstn.vacman.api.web.model.CollectionModel;
import ca.gov.dtsstn.vacman.api.web.model.mapper.AppointmentNonAdvertisedModelMapper;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;

@RestController
@Tag(name = "Appointment Non-Advertised")
@RequestMapping({ "/api/v1/appointment-non-advertised" })
public class AppointmentNonAdvertisedController {

	private final AppointmentNonAdvertisedModelMapper appointmentNonAdvertisedModelMapper = Mappers.getMapper(AppointmentNonAdvertisedModelMapper.class);

	private final AppointmentNonAdvertisedService appointmentNonAdvertisedService;

	public AppointmentNonAdvertisedController(AppointmentNonAdvertisedService appointmentNonAdvertisedService) {
		this.appointmentNonAdvertisedService = appointmentNonAdvertisedService;
	}

	@GetMapping
	@SecurityRequirement(name = SpringDocConfig.AZURE_AD)
	@Operation(summary = "Get all appointment non-advertised types or filter by code.", description = "Returns a collection of all appointment non-advertised types, or appointment non-advertised types filtered by code.")
	public ResponseEntity<CollectionModel<AppointmentNonAdvertisedReadModel>> getAppointmentNonAdvertised(
			@RequestParam(required = false)
			@Parameter(description = "Appointment non-advertised code to filter by (e.g., 'ACTING')") String code) {

		if (isNotBlank(code)) {
			return appointmentNonAdvertisedService.getAppointmentNonAdvertisedByCode(code)
				.map(appointmentNonAdvertised -> ResponseEntity.ok(new CollectionModel<>(List.of(appointmentNonAdvertisedModelMapper.toModel(appointmentNonAdvertised)))))
				.orElse(ResponseEntity.ok(new CollectionModel<>(List.of())));
		}

		CollectionModel<AppointmentNonAdvertisedReadModel> result = new CollectionModel<>(appointmentNonAdvertisedService.getAllAppointmentNonAdvertised().stream()
			.map(appointmentNonAdvertisedModelMapper::toModel)
			.toList());

		return ResponseEntity.ok(result);
	}

}
