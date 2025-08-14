package ca.gov.dtsstn.vacman.api.config.properties;

import java.time.Duration;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.lang.Nullable;
import org.springframework.validation.annotation.Validated;

import jakarta.validation.constraints.NotBlank;

@Validated
@ConfigurationProperties("application.gcnotify")
public record GcNotifyProperties(
	@NotBlank String apiKey,
	@NotBlank String baseUrl,
 @NotBlank String profileCreatedTemplateId,
	@NotBlank String profileUpdatedTemplateId,
	@NotBlank String profileApprovedTemplateId,
	@NotBlank String profilePendingTemplateId,
	@Nullable Duration connectTimeout,
	@Nullable Duration readTimeout
) {}
