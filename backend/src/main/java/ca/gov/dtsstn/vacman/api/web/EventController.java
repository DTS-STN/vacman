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
import ca.gov.dtsstn.vacman.api.data.entity.EventEntity;
import ca.gov.dtsstn.vacman.api.service.EventService;
import ca.gov.dtsstn.vacman.api.web.model.CollectionModel;
import ca.gov.dtsstn.vacman.api.web.model.EventReadModel;
import ca.gov.dtsstn.vacman.api.web.model.mapper.EventModelMapper;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;

@RestController
@Tag(name = "Events")
@RequestMapping({ "/api/v1/events" })
public class EventController {

	private final EventModelMapper eventModelMapper = Mappers.getMapper(EventModelMapper.class);

	private final EventService eventService;

	public EventController(EventService eventService) {
		this.eventService = eventService;
	}

	@GetMapping
	@SecurityRequirement(name = SpringDocConfig.AZURE_AD)
	@Operation(summary = "Get all events", description = "Returns a collection of all events with pagination support.")
	public ResponseEntity<CollectionModel<EventReadModel>> getEvents(Pageable pageable) {
		Page<EventEntity> eventPage = eventService.getEvents(pageable);

		CollectionModel<EventReadModel> result = new CollectionModel<>(eventPage.getContent().stream()
			.map(eventModelMapper::toModel)
			.toList());

		return ResponseEntity.ok(result);
	}

	@GetMapping("/{id}")
	@SecurityRequirement(name = SpringDocConfig.AZURE_AD)
	@Operation(summary = "Get event by ID", description = "Returns a specific event by its ID.")
	public ResponseEntity<EventReadModel> getEventById(
			@PathVariable @Parameter(description = "Event ID") Long id) {

		return eventService.getEventById(id)
			.map(event -> ResponseEntity.ok(eventModelMapper.toModel(event)))
			.orElse(ResponseEntity.notFound().build());
	}

	@PostMapping
	@SecurityRequirement(name = SpringDocConfig.AZURE_AD)
	@Operation(summary = "Create a new event", description = "Creates a new event.")
	public ResponseEntity<EventReadModel> createEvent(@RequestBody EventEntity event) {
		EventEntity savedEvent = eventService.saveEvent(event);
		return ResponseEntity.ok(eventModelMapper.toModel(savedEvent));
	}

	@PutMapping("/{id}")
	@SecurityRequirement(name = SpringDocConfig.AZURE_AD)
	@Operation(summary = "Update event", description = "Updates an existing event.")
	public ResponseEntity<EventReadModel> updateEvent(
			@PathVariable @Parameter(description = "Event ID") Long id,
			@RequestBody EventEntity event) {

		return eventService.getEventById(id)
			.map(existingEvent -> {
				event.setId(id);
				EventEntity savedEvent = eventService.saveEvent(event);
				return ResponseEntity.ok(eventModelMapper.toModel(savedEvent));
			})
			.orElse(ResponseEntity.notFound().build());
	}

	@DeleteMapping("/{id}")
	@SecurityRequirement(name = SpringDocConfig.AZURE_AD)
	@Operation(summary = "Delete event", description = "Deletes an event by its ID.")
	public ResponseEntity<Void> deleteEvent(
			@PathVariable @Parameter(description = "Event ID") Long id) {

		if (eventService.getEventById(id).isPresent()) {
			eventService.deleteEvent(id);
			return ResponseEntity.noContent().build();
		}
		return ResponseEntity.notFound().build();
	}

}
