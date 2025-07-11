package ca.gov.dtsstn.vacman.api.service;

import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;

import ca.gov.dtsstn.vacman.api.data.entity.AppointmentNonAdvertisedEntity;
import ca.gov.dtsstn.vacman.api.data.repository.AppointmentNonAdvertisedRepository;

@Service
public class AppointmentNonAdvertisedService {

    private final AppointmentNonAdvertisedRepository appointmentNonAdvertisedRepository;

    public AppointmentNonAdvertisedService(AppointmentNonAdvertisedRepository appointmentNonAdvertisedRepository) {
        this.appointmentNonAdvertisedRepository = appointmentNonAdvertisedRepository;
    }

    public List<AppointmentNonAdvertisedEntity> getAllAppointmentNonAdvertised() {
        return appointmentNonAdvertisedRepository.findAll();
    }

    public Optional<AppointmentNonAdvertisedEntity> getAppointmentNonAdvertisedById(Long id) {
        return appointmentNonAdvertisedRepository.findById(id);
    }

    public Optional<AppointmentNonAdvertisedEntity> getAppointmentNonAdvertisedByCode(String code) {
        return appointmentNonAdvertisedRepository.findByCode(code);
    }

    public AppointmentNonAdvertisedEntity saveAppointmentNonAdvertised(AppointmentNonAdvertisedEntity appointmentNonAdvertised) {
        return appointmentNonAdvertisedRepository.save(appointmentNonAdvertised);
    }

    public void deleteAppointmentNonAdvertised(Long id) {
        appointmentNonAdvertisedRepository.deleteById(id);
    }
}
