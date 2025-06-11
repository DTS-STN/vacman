package ca.gov.dtsstn.vacman.api.config.properties;

import java.time.Duration;

import org.springframework.boot.context.properties.ConfigurationProperties;

import jakarta.annotation.Nullable;
import jakarta.validation.constraints.NotBlank;

@ConfigurationProperties("application.gcnotify")
public record GcNotifyProperties(
	boolean enabled,
	@NotBlank String apiKey,
	@NotBlank String baseUrl,
	@NotBlank String templateId,
	@Nullable Duration connectTimeout,
	@Nullable Duration readTimeout
) {}
