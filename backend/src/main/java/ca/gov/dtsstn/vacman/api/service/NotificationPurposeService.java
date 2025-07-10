package ca.gov.dtsstn.vacman.api.service;

import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import ca.gov.dtsstn.vacman.api.data.entity.NotificationPurposeEntity;
import ca.gov.dtsstn.vacman.api.data.repository.NotificationPurposeRepository;

@Service
public class NotificationPurposeService {

    private final NotificationPurposeRepository notificationPurposeRepository;

    public NotificationPurposeService(NotificationPurposeRepository notificationPurposeRepository) {
        this.notificationPurposeRepository = notificationPurposeRepository;
    }

    public List<NotificationPurposeEntity> getAllNotificationPurposes() {
        return notificationPurposeRepository.findAll();
    }

    public Page<NotificationPurposeEntity> getNotificationPurposes(Pageable pageable) {
        return notificationPurposeRepository.findAll(pageable);
    }

    public Optional<NotificationPurposeEntity> getNotificationPurposeById(Long id) {
        return notificationPurposeRepository.findById(id);
    }

    public Optional<NotificationPurposeEntity> getNotificationPurposeByCode(String code) {
        return notificationPurposeRepository.findByCode(code);
    }

    public NotificationPurposeEntity saveNotificationPurpose(NotificationPurposeEntity notificationPurpose) {
        return notificationPurposeRepository.save(notificationPurpose);
    }

    public void deleteNotificationPurpose(Long id) {
        notificationPurposeRepository.deleteById(id);
    }
}
