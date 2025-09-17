package ca.gov.dtsstn.vacman.api.service;

import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.http.HttpHeaders;
import org.springframework.stereotype.Service;
import org.springframework.util.Assert;
import org.springframework.web.client.RestTemplate;

import ca.gov.dtsstn.vacman.api.config.properties.ApplicationProperties;
import ca.gov.dtsstn.vacman.api.service.notify.NotificationReceipt;

@Service
public class NotificationService {

	public enum ProfileStatus { CREATED, UPDATED, APPROVED, PENDING }

	public enum RequestEvent { CREATED, FEEDBACK_PENDING }

	private static final Logger log = LoggerFactory.getLogger(NotificationService.class);

	private final ApplicationProperties applicationProperties;

	private final RestTemplate restTemplate;

	public NotificationService(ApplicationProperties applicationProperties, RestTemplateBuilder restTemplateBuilder) {
		this.applicationProperties = applicationProperties;
		this.restTemplate = restTemplateBuilder
			.defaultHeader(HttpHeaders.AUTHORIZATION, "ApiKey-v1 %s".formatted(applicationProperties.gcnotify().apiKey()))
			.rootUri(applicationProperties.gcnotify().baseUrl())
			.connectTimeout(applicationProperties.gcnotify().connectTimeout())
			.readTimeout(applicationProperties.gcnotify().readTimeout())
			.build();
	}

	public NotificationReceipt sendEmailNotification(String email, String profileId, String username, String language, ProfileStatus profileStatus) {
		Assert.hasText(email, "email is required; it must not be blank or null");
		Assert.hasText(profileId, "profileId is required; it must not be blank or null");
		Assert.hasText(username, "username is required; it must not be blank or null");

		final var templateId = switch (profileStatus) {
			case CREATED -> language == "en" 
				? applicationProperties.gcnotify().profileCreatedTemplateIdEng()
				: applicationProperties.gcnotify().profileCreatedTemplateIdFra(); 

			case UPDATED -> language == "en" 
				? applicationProperties.gcnotify().profileUpdatedTemplateIdEng()
				: applicationProperties.gcnotify().profileUpdatedTemplateIdFra();

			case APPROVED -> language == "en" 
				? applicationProperties.gcnotify().profileApprovedTemplateIdEng()
				: applicationProperties.gcnotify().profileApprovedTemplateIdFra();

			case PENDING -> language == "en" 
				? applicationProperties.gcnotify().profilePendingTemplateId()
				: applicationProperties.gcnotify().profilePendingTemplateId();

			default -> throw new IllegalArgumentException("Unknown profile status value " + profileStatus);
		};

		// Personalization parameters for the email template
		final var personalization = Map.of(
			"link", profileId, 
			"employee_name", username
		);

		log.trace("Request to send fileNumber notification email=[{}], parameters=[{}]", email, personalization);

		final var request = Map.of(
			"email_address", email, 
			"template_id", templateId, 
			"personalisation", personalization
		);

		final var notificationReceipt = restTemplate.postForObject("/email", request, NotificationReceipt.class);
		log.debug("Notification sent to email [{}] using template [{}]", email, templateId);

		return notificationReceipt;
	}

	//TODO add language to get the correct template
	public NotificationReceipt sendRequestNotification(String email, Long requestId, String requestTitle, RequestEvent requestEvent) {
		Assert.hasText(email, "email is required; it must not be blank or null");
		Assert.notNull(requestId, "requestId is required; it must not be null");
		Assert.hasText(requestTitle, "requestTitle is required; it must not be blank or null");

		final var templateId = switch (requestEvent) {
			case CREATED -> applicationProperties.gcnotify().requestCreatedTemplateId();
			case FEEDBACK_PENDING -> applicationProperties.gcnotify().requestFeedbackPendingTemplateId();
			default -> throw new IllegalArgumentException("Unknown request event value " + requestEvent);
		};
		
		// TODO personalization parameters for the email template needs to match the templates
		final var personalization = Map.of(
			"requestId", requestId.toString(), 
			"requestTitle", requestTitle
		);

		log.trace("Request to send request notification email=[{}], parameters=[{}]", email, personalization);

		final var request = Map.of(
			"email_address", email, 
			"template_id", templateId, 
			"personalisation", personalization
		);

		final var notificationReceipt = restTemplate.postForObject("/email", request, NotificationReceipt.class);
		log.debug("Notification sent to email [{}] using template [{}]", email, templateId);

		return notificationReceipt;
	}

}
