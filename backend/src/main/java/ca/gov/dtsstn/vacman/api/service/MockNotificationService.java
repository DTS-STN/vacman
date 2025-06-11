package ca.gov.dtsstn.vacman.api.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;

import ca.gov.dtsstn.vacman.api.service.dto.NotificationReceipt;

@Service
@ConditionalOnProperty(name = "application.gcnotify.enabled", havingValue = "false", matchIfMissing = true)
public class MockNotificationService implements NotificationService {

	private static final Logger log = LoggerFactory.getLogger(MockNotificationService.class);

	@Override
	public NotificationReceipt sendNotification(String emailAddress) {
		log.info("Sending mock notification...");
		return new NotificationReceipt();
	}

}
