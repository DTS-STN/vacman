package ca.gov.dtsstn.vacman.api.service;

import java.util.Map;
import java.util.Optional;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.http.HttpHeaders;
import org.springframework.stereotype.Service;
import org.springframework.util.Assert;

import ca.gov.dtsstn.vacman.api.config.CacheConfig;
import ca.gov.dtsstn.vacman.api.config.properties.GcNotifyProperties;
import ca.gov.dtsstn.vacman.api.service.notify.NotificationReceipt;
import ca.gov.dtsstn.vacman.api.service.notify.UserProfileStatus;

/**
 * @author Based on code by Greg Baker
 */

@Service
public class NotificationService {

	public enum ProfileStatus { CREATED, UPDATED, APPROVED }

	private static final Logger log = LoggerFactory.getLogger(NotificationService.class);

	private final GcNotifyProperties gcNotifyProperties;

	private final RestTemplateBuilder restTemplateBuilder;

	public NotificationService(GcNotifyProperties gcNotifyProperties, RestTemplateBuilder restTemplateBuilder) {
		log.info("Creating 'notificationService' bean");

		Assert.notNull(gcNotifyProperties, "gcNotifyProperties is requred; it must not be null");
		Assert.notNull(restTemplateBuilder, "restTemplateBuilder is required; it must not be null");

		this.gcNotifyProperties = gcNotifyProperties;
		this.restTemplateBuilder = restTemplateBuilder;
	}

	/**
	 * Sends an email notification (via GC Notify) to a target recipient.
	 * 
	 * This method is marked as {@code @Cacheable} to reduce the number of emails sent for
	 * a given ESRF number. Think of it as a poor-man's rate-limiter/spam-reducer.
	 * 
	 * @see application.yaml		     	//???
	 * @see CacheConfig#esrfEmailsCache     //???
	 * 
	 */
	@Cacheable(cacheNames = { "esrf-emails" }, key = "#passportStatus.fileNumber")
	public NotificationReceipt sendEmailNotification(UserProfileStatus userProfileStatus, ProfileStatus profileStatus) {
		Assert.notNull(userProfileStatus, "passportStatus is requird; it must not be null");
		Assert.hasText(userProfileStatus.getEmail(), "email is required; it must not be blank or null");

		final var restTemplate = restTemplateBuilder
			.defaultHeader(HttpHeaders.AUTHORIZATION, "ApiKey-v1 %s".formatted(getApiKey()))
			.connectTimeout(gcNotifyProperties.connectTimeout())
			.readTimeout(gcNotifyProperties.readTimeout())
			.build();

		final var email = Optional.ofNullable(userProfileStatus.getEmail()).orElseThrow(); // Optional<T> keeps sonar happy
		final var templateId = getTemplateId(profileStatus);
		final var personalization = Map.of("link", userProfileStatus.getProfileId(), "userName", userProfileStatus.getUsername());
		log.trace("Request to send fileNumber notification email=[{}], parameters=[{}]", email, personalization);

		final var request = Map.of("email_address", email, "template_id", templateId, "personalisation", personalization);
		final var notificationReceipt = restTemplate.postForObject(gcNotifyProperties.baseUrl(), request, NotificationReceipt.class);
		log.debug("Notification sent to email [{}] using template [{}]", email, templateId);

		return notificationReceipt;
	}

	private String getTemplateId(ProfileStatus profileStatus) {
		return switch (profileStatus) {
			case CREATED -> gcNotifyProperties.emailProfileCreated();
			case UPDATED -> gcNotifyProperties.emailProfileUpdated();
			case APPROVED -> gcNotifyProperties.emailProfileApproved();
			default -> throw new IllegalArgumentException("Unknown profile status value " + profileStatus);
		};
	}

	private String getApiKey() {
		return gcNotifyProperties.notifyApiKey();
	};

}