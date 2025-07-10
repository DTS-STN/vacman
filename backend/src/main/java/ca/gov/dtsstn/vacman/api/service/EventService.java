package ca.gov.dtsstn.vacman.api.service;

import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import ca.gov.dtsstn.vacman.api.data.entity.EventEntity;
import ca.gov.dtsstn.vacman.api.data.repository.EventRepository;

@Service
public class EventService {

    private final EventRepository eventRepository;

    public EventService(EventRepository eventRepository) {
        this.eventRepository = eventRepository;
    }

    public List<EventEntity> getAllEvents() {
        return eventRepository.findAll();
    }

    public Page<EventEntity> getEvents(Pageable pageable) {
        return eventRepository.findAll(pageable);
    }

    public Optional<EventEntity> getEventById(Long id) {
        return eventRepository.findById(id);
    }

    public EventEntity saveEvent(EventEntity event) {
        return eventRepository.save(event);
    }

    public void deleteEvent(Long id) {
        eventRepository.deleteById(id);
    }

    public boolean existsById(Long id) {
        return eventRepository.existsById(id);
    }
}
