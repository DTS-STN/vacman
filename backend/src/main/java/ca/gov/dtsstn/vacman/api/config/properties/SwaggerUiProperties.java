package ca.gov.dtsstn.vacman.api.config.properties;

import java.util.List;
import java.util.Optional;

import org.hibernate.validator.constraints.URL;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.boot.context.properties.NestedConfigurationProperty;
import org.springframework.validation.annotation.Validated;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

@Validated
@ConfigurationProperties("application.swagger-ui")
public record SwaggerUiProperties(
	@NotBlank String applicationName,
	@NestedConfigurationProperty AuthenticationProperties authentication,
	@NotBlank String contactName,
	@NotNull @URL String contactUrl,
	@NotBlank String description,
	@NestedConfigurationProperty List<Server> servers,
	@NotNull @URL String tosUrl
) {

	public List<Server> servers() {
		return Optional.ofNullable(this.servers).orElse(List.of());
	}

	public record AuthenticationProperties(
		@NestedConfigurationProperty OAuthProperties oauth
	) {

		public record OAuthProperties(
			@NotNull @URL String authorizationUrl,
			@NotBlank String clientId,
			@NotNull @URL String tokenUrl
		) {}
	}

	public record Server(
		String description,
		@NotNull @URL String url
	) {}

}
