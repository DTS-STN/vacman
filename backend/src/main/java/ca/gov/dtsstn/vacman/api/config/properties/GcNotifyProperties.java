package ca.gov.dtsstn.vacman.api.config.properties;

import java.time.Duration;

import org.jspecify.annotations.Nullable;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.validation.annotation.Validated;

import jakarta.validation.constraints.NotBlank;

@Validated
@ConfigurationProperties("application.gcnotify")
public record GcNotifyProperties(
	@NotBlank String apiKey,
	@NotBlank String baseUrl,
	@NotBlank String hrGdInboxEmail,
	@NotBlank String pimsSleTeamEmail,
	@NotBlank String genericTemplateId,
	@Nullable Duration connectTimeout,
	@Nullable Duration readTimeout
) {}
