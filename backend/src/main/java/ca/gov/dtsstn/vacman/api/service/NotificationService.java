package ca.gov.dtsstn.vacman.api.service;

import ca.gov.dtsstn.vacman.api.service.dto.NotificationReceipt;

public interface NotificationService {

	NotificationReceipt sendNotification(String emailAddress);

}
