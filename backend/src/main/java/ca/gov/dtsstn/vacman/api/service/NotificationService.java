package ca.gov.dtsstn.vacman.api.service;

import java.lang.reflect.RecordComponent;
import java.util.*;

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
import ca.gov.dtsstn.vacman.api.service.email.data.EmailTemplateModel;
import ca.gov.dtsstn.vacman.api.service.notify.NotificationReceipt;
import io.micrometer.core.annotation.Counted;

/**
 * Service for handling email notifications using GC Notify.
 * This service provides methods to send profile-related and request-related email notifications,
 * utilizing FreeMarker templates for content generation and supporting multiple languages.
 */
@Service
public class NotificationService {

	/**
	 * The possible statuses of a user profile.
	 */
	public enum ProfileStatus {
		APPROVED, PENDING, ARCHIVED
	}

	/**
	 * The events in the request lifecycle that trigger notifications.
	 */
	public enum RequestEvent {
		SUBMITTED, FEEDBACK_PENDING, FEEDBACK_COMPLETED, VMS_NOT_REQUIRED, PSC_NOT_REQUIRED, PSC_REQUIRED, COMPLETED, CANCELLED
	}

	private static final Logger log = LoggerFactory.getLogger(NotificationService.class);

	private final ApplicationProperties applicationProperties;

	private final RestTemplate restTemplate;

	private final EmailTemplateService emailTemplateService;

	/**
	 * Constructs a NotificationService with the required dependencies.
	 *
	 * @param applicationProperties the application configuration properties
	 * @param restTemplateBuilder builder for creating the REST template
	 * @param lookupCodes lookup codes configuration (reserved for future use)
	 * @param emailTemplateService the email template service
	 */
	public NotificationService(
			ApplicationProperties applicationProperties,
			RestTemplateBuilder restTemplateBuilder,
			LookupCodes lookupCodes,
			EmailTemplateService emailTemplateService) {
		this.applicationProperties = applicationProperties;
		this.emailTemplateService = emailTemplateService;
		this.restTemplate = restTemplateBuilder
			.defaultHeader(HttpHeaders.AUTHORIZATION, "ApiKey-v1 %s".formatted(applicationProperties.gcnotify().apiKey()))
			.rootUri(applicationProperties.gcnotify().baseUrl())
			.connectTimeout(applicationProperties.gcnotify().connectTimeout())
			.readTimeout(applicationProperties.gcnotify().readTimeout())
			.build();
	}

	/**
	 * Sends an email notification specific to a profile to a single email address.
	 * The notification content is generated using FreeMarker templates based on the profile status.
	 *
	 * @param email the recipient's email address; must not be blank or null
	 * @param profileId the ID of the profile; must not be blank or null
	 * @param username the username of the profile owner; must not be blank or null
	 * @param language the language code for the notification (e.g., "en", "fr")
	 * @param profileStatus the status of the profile (APPROVED or PENDING)
	 * @return the notification receipt from GC Notify containing details about the sent email
	 */
	@Counted("service.notification.sendProfileNotification.count")
	public NotificationReceipt sendProfileNotification(String email, String profileId, String username, String language, ProfileStatus profileStatus) {
		Assert.hasText(email, "email is required; it must not be blank or null");
		Assert.hasText(profileId, "profileId is required; it must not be blank or null");
		Assert.hasText(username, "username is required; it must not be blank or null");
		Assert.notNull(language, "language is required; it must not be blank or null");

		final var templateName = switch (profileStatus) {
			case APPROVED -> "vmsProfileActivation.ftl";
			case PENDING -> "approvalRequired.ftl";
			case ARCHIVED -> "vmsProfileClosed.ftl";
		};

		final var model = Map.<String, String>of(
			"employeeName", username,
			"profileId", profileId
		);

		final var emailContent = emailTemplateService.processEmailTemplate(templateName, Locale.of(language), model);
		final var templateId = applicationProperties.gcnotify().genericTemplateId();

		// Personalization parameters
		final var personalization = Map.of(
			"email_subject", emailContent.subject(),
			"email_body", emailContent.body()
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
	}

	/**
	 * Sends a profile specific email notification to multiple email addresses.
	 * Notifications are sent in parallel for efficiency, and each email address receives the same notification content.
	 *
	 * @param emails the list of recipient email addresses; must not be empty or null, and individual emails must not be blank
	 * @param profileId the ID of the profile; must not be blank or null
	 * @param username the username of the profile owner; must not be blank or null
	 * @param language the language code for the notification (e.g., "en", "fr")
	 * @param profileStatus the status of the profile (APPROVED or PENDING)
	 * @return a list of notification receipts, one for each successfully sent email
	 */
	@Counted("service.notification.sendProfileNotificationMultiple.count")
	public List<NotificationReceipt> sendProfileNotification(List<String> emails, String profileId, String username, String language, ProfileStatus profileStatus) {
		Assert.notEmpty(emails, "emails is required; it must not be blank or null");
		Assert.hasText(profileId, "profileId is required; it must not be blank or null");
		Assert.hasText(username, "username is required; it must not be blank or null");
		Assert.notNull(language, "language is required; it must not be blank or null");

		return emails.parallelStream()
			.filter(StringUtils::hasText)
			.map(email -> sendProfileNotification(email, profileId, username, language, profileStatus))
			.toList();
	}

	/**
	 * Sends an email notification for a request event to a single email address.
	 * The notification content is generated using FreeMarker templates based on the request event.
	 *
	 * @param email the recipient's email address; must not be blank or null
	 * @param requestId the ID of the request; must not be null
	 * @param requestTitle the title of the request; must not be blank or null
	 * @param requestEvent the event that triggered the notification
	 * @param language the language code for the notification (e.g., "en", "fr")
	 * @return the notification receipt from GC Notify containing details about the sent email
	 */
	@Counted("service.notification.sendRequestNotificationSingle.count")
	public NotificationReceipt sendRequestNotification(String email, Long requestId, String requestTitle, RequestEvent requestEvent, String language) {
		Assert.hasText(email, "email is required; it must not be blank or null");
		Assert.notNull(requestId, "requestId is required; it must not be null");
		Assert.hasText(requestTitle, "requestTitle is required; it must not be blank or null");
		Assert.notNull(language, "language is required; it must not be blank or null");

		final var templateName = switch (requestEvent) {
			case SUBMITTED, VMS_NOT_REQUIRED, PSC_REQUIRED -> "requestAssigned.ftl";
			case FEEDBACK_PENDING -> "prioritiesIdentified.ftl";
			case FEEDBACK_COMPLETED, PSC_NOT_REQUIRED -> "feedbackApproved.ftl";
			case COMPLETED -> "feedbackApprovedPSC.ftl";
			case CANCELLED -> "requestCancelled.ftl";
		};

		// Create the appropriate model based on the request event
		final var model = switch (requestEvent) {
			case SUBMITTED, VMS_NOT_REQUIRED, PSC_REQUIRED -> 
				recordToMap(new EmailTemplateModel.RequestAssigned(requestId.toString()));
			case FEEDBACK_PENDING -> 
				recordToMap(new EmailTemplateModel.PrioritiesIdentified(requestId.toString()));
			case FEEDBACK_COMPLETED, PSC_NOT_REQUIRED -> 
				recordToMap(new EmailTemplateModel.FeedbackApproved(requestId.toString(), "CL-" + requestId));
			case COMPLETED -> 
				recordToMap(new EmailTemplateModel.FeedbackApprovedPSC(requestId.toString(), "CL-" + requestId, "PSC-" + requestId));
			case CANCELLED -> 
				recordToMap(new EmailTemplateModel.RequestCancelled(requestId.toString()));
		};

		final var emailContent = emailTemplateService.processEmailTemplate(templateName, Locale.of(language), model);
		final var templateId = applicationProperties.gcnotify().genericTemplateId();

		final var personalization = Map.of(
			"email_subject", emailContent.subject(),
			"email_body", emailContent.body()
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

	/**
	 * Sends a request notification to multiple email addresses.
	 * Notifications are sent in parallel for efficiency, and each email address receives the same notification content.
	 *
	 * @param emails the list of recipient email addresses; must not be empty or null, and individual emails must not be blank
	 * @param requestId the ID of the request; must not be null
	 * @param requestTitle the title of the request; must not be blank or null
	 * @param requestEvent the event that triggered the notification
	 * @param language the language code for the notification (e.g., "en", "fr")
	 * @return a list of notification receipts, one for each successfully sent email
	 */
	@Counted("service.notification.sendRequestNotificationMultiple.count")
	public List<NotificationReceipt> sendRequestNotification(List<String> emails, Long requestId, String requestTitle, RequestEvent requestEvent, String language) {
		Assert.notEmpty(emails, "emails is required; it must not be empty or null");
		Assert.notNull(requestId, "requestId is required; it must not be null");
		Assert.hasText(requestTitle, "requestTitle is required; it must not be blank or null");
		Assert.notNull(language, "language is required; it must not be blank or null");

		return emails.parallelStream()
			.filter(StringUtils::hasText)
			.map(email -> sendRequestNotification(email, requestId, requestTitle, requestEvent, language))
			.toList();
	}


	/**
	 * Sends job opportunity notifications to multiple recipients in a single bulk API call.
	 *
	 * @param recipientEmails List of recipient email addresses
	 * @param requestId the ID of the request
	 * @param requestTitle the title of the request
	 * @param jobModel the job opportunity model containing the data for the notification
	 * @param language the language code for the notification (e.g., "en", "fr")
	 * @return the notification receipt from GC Notify containing details about the sent emails
	 */
	@Counted("service.notification.sendBulkJobOpportunityNotification.count")
	public NotificationReceipt sendBulkJobOpportunityNotification(
			List<String> recipientEmails,
			Long requestId,
			String requestTitle,
			EmailTemplateModel.JobOpportunity jobModel,
			String language) {

		Assert.notEmpty(recipientEmails, "recipientEmails is required; it must not be empty or null");
		Assert.notNull(requestId, "requestId is required; it must not be null");
		Assert.hasText(requestTitle, "requestTitle is required; it must not be blank or null");
		Assert.notNull(jobModel, "jobModel is required; it must not be null");
		Assert.notNull(language, "language is required; it must not be blank or null");

		final var templateName = "jobOpportunity.ftl";
		final var model = recordToMap(jobModel);

		// Process the email template to get subject and body using the provided language
		final var emailContent = emailTemplateService.processEmailTemplate(templateName, Locale.of(language), model);
		final var templateId = applicationProperties.gcnotify().genericTemplateId();

		// Create the rows array for bulk sending
		// First row is the header with column names
		List<List<String>> rows = new ArrayList<>();
		rows.add(List.of("email address", "email_body", "email_subject"));

		for (String email : recipientEmails) {
			rows.add(List.of(email, emailContent.body(), emailContent.subject()));
		}

		final var bulkRequest = Map.of(
			"name", "Job Opportunity Notification - " + requestId,
			"template_id", templateId,
			"rows", rows
		);

		log.trace("Request to send bulk job opportunity notifications to {} recipients for request ID: [{}]",
			recipientEmails.size(), requestId);

		final var notificationReceipt = restTemplate.postForObject("/v2/notifications/bulk", bulkRequest, NotificationReceipt.class);
		log.debug("Bulk job opportunity notifications sent to {} recipients using template [{}]",
			recipientEmails.size(), templateId);

		return notificationReceipt;
	}

	/**
	 * Sends a notification that a match was approved to a single email address.
	 * The notification content is generated using the jobOpportunityHR template.
	 *
	 * @param email the recipient's email address; must not be blank or null
	 * @param jobOpportunityHR the job opportunity HR model containing the data for the notification
	 * @param language the language code for the notification (e.g., "en", "fr")
	 * @return the notification receipt from GC Notify containing details about the sent email
	 */
	@Counted("service.notification.sendJobOpportunityHRNotification.count")
	public NotificationReceipt sendJobOpportunityHRNotification(String email, EmailTemplateModel.JobOpportunityHR jobOpportunityHR, String language) {
		Assert.hasText(email, "email is required; it must not be blank or null");
		Assert.notNull(jobOpportunityHR, "jobOpportunityHR is required; it must not be null");
		Assert.notNull(language, "language is required; it must not be blank or null");

		final var templateName = "jobOpportunityHR.ftl";
		final var model = recordToMap(jobOpportunityHR);

		final var emailContent = emailTemplateService.processEmailTemplate(templateName, Locale.of(language), model);
		final var templateId = applicationProperties.gcnotify().genericTemplateId();

		final var personalization = Map.of(
			"email_subject", emailContent.subject(),
			"email_body", emailContent.body()
		);

		log.trace("Request to send job opportunity HR notification email=[{}], parameters=[{}]", email, personalization);

		final var request = Map.of(
			"email_address", email,
			"template_id", templateId,
			"personalisation", personalization
		);

		final var notificationReceipt = restTemplate.postForObject("/email", request, NotificationReceipt.class);
		log.debug("Job opportunity HR notification sent to email [{}] using template [{}]", email, templateId);

		return notificationReceipt;
	}

	/**
	 * Sends a job opportunity HR notification to multiple email addresses.
	 * Notifications are sent in parallel for efficiency, and each email address receives the same notification content.
	 *
	 * @param emails the list of recipient email addresses; must not be empty or null, and individual emails must not be blank
	 * @param jobOpportunityHR the job opportunity HR model containing the data for the notification
	 * @param language the language code for the notification (e.g., "en", "fr")
	 * @return a list of notification receipts, one for each successfully sent email
	 */
	@Counted("service.notification.sendJobOpportunityHRNotificationMultiple.count")
	public List<NotificationReceipt> sendJobOpportunityHRNotification(List<String> emails, EmailTemplateModel.JobOpportunityHR jobOpportunityHR, String language) {
		Assert.notEmpty(emails, "emails is required; it must not be empty or null");
		Assert.notNull(jobOpportunityHR, "jobOpportunityHR is required; it must not be null");
		Assert.notNull(language, "language is required; it must not be blank or null");

		return emails.parallelStream()
			.filter(StringUtils::hasText)
			.map(email -> sendJobOpportunityHRNotification(email, jobOpportunityHR, language))
			.toList();
	}

	/**
	 * Converts a record to a Map that can be used with the email template service.
	 *
	 * @param record The record to convert
	 * @return A Map containing the record's fields
	 */
	private Map<String, Object> recordToMap(Record record) {
		Map<String, Object> map = new HashMap<>();
		for (RecordComponent component : record.getClass().getRecordComponents()) {
			try {
				final var name = component.getName();
				final var value = component.getAccessor().invoke(record);
				if (value != null) {
					map.put(name, value);
				}
			} catch (Exception e) {
				log.warn("Failed to get record component value", e);
			}
		}
		return map;
	}
}
