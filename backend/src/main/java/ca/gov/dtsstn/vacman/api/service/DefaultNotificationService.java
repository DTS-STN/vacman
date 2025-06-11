package ca.gov.dtsstn.vacman.api.service;

import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.http.HttpHeaders;
import org.springframework.stereotype.Service;

import ca.gov.dtsstn.vacman.api.config.properties.GcNotifyProperties;
import ca.gov.dtsstn.vacman.api.service.dto.NotificationReceipt;

@Service
@ConditionalOnProperty(name = "application.gcnotify.enabled", havingValue = "true", matchIfMissing = false)
public class DefaultNotificationService implements NotificationService {

	private final GcNotifyProperties gcNotifyProperties;

	private final RestTemplateBuilder restTemplateBuilder;

	public DefaultNotificationService(GcNotifyProperties gcNotifyProperties, RestTemplateBuilder restTemplateBuilder) {
		this.gcNotifyProperties = gcNotifyProperties;
		this.restTemplateBuilder = restTemplateBuilder;
	}

	@Override
	public NotificationReceipt sendNotification(String emailAddress) {
		final var restTemplate = restTemplateBuilder
			.defaultHeader(HttpHeaders.AUTHORIZATION, "ApiKey-v1 %s".formatted(gcNotifyProperties.apiKey()))
			.connectTimeout(gcNotifyProperties.connectTimeout())
			.readTimeout(gcNotifyProperties.readTimeout())
			.build();

		// TODO ::: GjB ::: implement me!
		throw new UnsupportedOperationException("not yet implemented");

		// final var request = Map.of("email_address", emailAddress, "template_id", gcNotifyProperties.templateId());
		// final var notificationReceipt = restTemplate.postForObject(gcNotifyProperties.baseUrl(), request, NotificationReceipt.class);

	}

}
