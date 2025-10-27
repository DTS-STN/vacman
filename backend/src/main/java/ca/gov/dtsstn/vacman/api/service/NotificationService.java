package ca.gov.dtsstn.vacman.api.service;

import java.util.List;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.http.HttpHeaders;
import org.springframework.stereotype.Service;
import org.springframework.util.Assert;
import org.springframework.util.StringUtils;
import org.springframework.web.client.RestTemplate;

import ca.gov.dtsstn.vacman.api.config.properties.ApplicationProperties;
import ca.gov.dtsstn.vacman.api.config.properties.LookupCodes;
import ca.gov.dtsstn.vacman.api.service.EmailTemplateService.EmailContent;
import ca.gov.dtsstn.vacman.api.service.notify.NotificationReceipt;
import io.micrometer.core.annotation.Counted;

@Service
public class NotificationService {

	public enum ProfileStatus { APPROVED, PENDING }

	public enum RequestEvent { CREATED, FEEDBACK_PENDING, FEEDBACK_COMPLETED }

	private static final Logger log = LoggerFactory.getLogger(NotificationService.class);

	private final ApplicationProperties applicationProperties;

	private final RestTemplate restTemplate;

	private final LookupCodes.Languages languages;

	private final EmailTemplateService emailTemplateService;

	public NotificationService(ApplicationProperties applicationProperties, RestTemplateBuilder restTemplateBuilder, 
	                          LookupCodes lookupCodes, EmailTemplateService emailTemplateService) {
		this.applicationProperties = applicationProperties;
		this.restTemplate = restTemplateBuilder
			.defaultHeader(HttpHeaders.AUTHORIZATION, "ApiKey-v1 %s".formatted(applicationProperties.gcnotify().apiKey()))
			.rootUri(applicationProperties.gcnotify().baseUrl())
			.connectTimeout(applicationProperties.gcnotify().connectTimeout())
			.readTimeout(applicationProperties.gcnotify().readTimeout())
			.build();
		this.languages = lookupCodes.languages();
		this.emailTemplateService = emailTemplateService;
	}

	/**
	* Sends an email notification (specific to a profile) to a single email address.
	*/
	@Counted("service.notification.sendProfileNotification.count")
	public NotificationReceipt sendProfileNotification(String email, String profileId, String username, String language, ProfileStatus profileStatus) {
		Assert.hasText(email, "email is required; it must not be blank or null");
		Assert.hasText(profileId, "profileId is required; it must not be blank or null");
		Assert.hasText(username, "username is required; it must not be blank or null");

		// Determine template path based on status and language
		String templateName = "email/" + 
							 (this.languages.english().equals(language) ? "en/" : "fr/") +
							 (profileStatus == ProfileStatus.APPROVED ? "vmsProfileActivationEng.ftl" : "approvalRequiredEng.ftl");

		if (!this.languages.english().equals(language)) {
			templateName = "email/fr/" + (profileStatus == ProfileStatus.APPROVED ? "vmsProfileActivationFre.ftl" : "approvalRequiredFre.ftl");
		}

		// Create model for template processing
		Map<String, Object> model = Map.of(
			"employee_name", username,
			"profileId", profileId
		);

		try {
			// Process the template with FreeMarker
			EmailContent emailContent = emailTemplateService.processEmailTemplate(templateName, model);

			// Use the generic template ID
			final var templateId = applicationProperties.gcnotify().genericTemplateId();

			// Personalization parameters for the generic template
			final var personalization = Map.of(
				"email_subject", emailContent.subject(),
				"email_message", emailContent.body()
			);

			log.trace("Request to send profile notification email=[{}], parameters=[{}]", email, personalization);

			final var request = Map.of(
				"email_address", email,
				"template_id", templateId,
				"personalisation", personalization
			);

			final var notificationReceipt = restTemplate.postForObject("/email", request, NotificationReceipt.class);
			log.debug("Notification sent to email [{}] using template [{}]", email, templateId);

			return notificationReceipt;
		} catch (Exception e) {
			log.error("Error processing email template: {}", e.getMessage(), e);
			throw new RuntimeException("Failed to process email template", e);
		}
	}

	/**
	 * Sends an email notification to multiple email addresses.
	 * Returns a list of notification receipts, one for each email address.
	 */
	@Counted("service.notification.sendRequestNotificationSingle.count")
	public NotificationReceipt sendRequestNotification(String email, Long requestId, String requestTitle, RequestEvent requestEvent) {
		Assert.hasText(email, "email is required; it must not be blank or null");
		Assert.notNull(requestId, "requestId is required; it must not be null");
		Assert.hasText(requestTitle, "requestTitle is required; it must not be blank or null");

		// Determine template name based on event (assuming English for now)
		// In a real implementation, you would add a language parameter to this method
		String language = this.languages.english(); // Default to English
		String templateName = "email/en/";

		switch (requestEvent) {
			case CREATED:
				templateName += "requestCreated.ftl";
				break;
			case FEEDBACK_PENDING:
				templateName += "requestFeedbackPending.ftl";
				break;
			case FEEDBACK_COMPLETED:
				templateName += "feedbackApprovedEng.ftl";
				break;
			default:
				throw new IllegalArgumentException("Unknown request event value " + requestEvent);
		}

		// Create model for template processing
		Map<String, Object> model = Map.of(
			"request-number", requestId.toString(),
			"requestTitle", requestTitle,
			"clearance-number", "CL-" + requestId // Example clearance number
		);

		try {
			// Process the template with FreeMarker
			EmailContent emailContent = emailTemplateService.processEmailTemplate(templateName, model);

			// Use the generic template ID
			final var templateId = applicationProperties.gcnotify().genericTemplateId();

			// Personalization parameters for the generic template
			final var personalization = Map.of(
				"email_subject", emailContent.subject(),
				"email_message", emailContent.body()
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
		} catch (Exception e) {
			log.error("Error processing email template: {}", e.getMessage(), e);
			throw new RuntimeException("Failed to process email template", e);
		}
	}

	/**
	 * Sends a request notification to multiple email addresses.
	 * Returns a list of notification receipts, one for each email address.
	 */
	@Counted("service.notification.sendRequestNotificationMultiple.count")
	public List<NotificationReceipt> sendRequestNotification(List<String> emails, Long requestId, String requestTitle, RequestEvent requestEvent) {
		Assert.notEmpty(emails, "emails is required; it must not be empty or null");
		Assert.notNull(requestId, "requestId is required; it must not be null");
		Assert.hasText(requestTitle, "requestTitle is required; it must not be blank or null");

		return emails.parallelStream()
			.filter(StringUtils::hasText)
			.map(email -> sendRequestNotification(email, requestId, requestTitle, requestEvent))
			.toList();
	}

}
