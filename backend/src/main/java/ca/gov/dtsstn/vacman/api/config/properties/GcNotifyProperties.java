package ca.gov.dtsstn.vacman.api.config.properties;

import java.time.Duration;
import java.util.Optional;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.lang.Nullable;
import org.springframework.validation.annotation.Validated;

import jakarta.validation.constraints.NotBlank;

/**
 * @author based on code by Greg Baker 
 */
@Validated
@ConfigurationProperties("application.gcnotify")

public record GcNotifyProperties(
	@NotBlank String notifyApiKey,
	@NotBlank String baseUrl,
	@NotBlank String emailProfileCreated,
	@NotBlank String emailProfileUpdated,
	@NotBlank String emailProfileApproved,
	@Nullable Duration connectTimeout,
	@Nullable Duration readTimeout
) {

	public Duration connectTimeout() {
		return Optional.ofNullable(connectTimeout).orElse(Duration.ofSeconds(30));
	}

	public Duration readTimeout() {
		return Optional.ofNullable(readTimeout).orElse(Duration.ofSeconds(30));
	}

}
