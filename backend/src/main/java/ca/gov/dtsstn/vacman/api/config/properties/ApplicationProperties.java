package ca.gov.dtsstn.vacman.api.config.properties;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.boot.context.properties.NestedConfigurationProperty;
import org.springframework.validation.annotation.Validated;

@Validated
@ConfigurationProperties("application")
@EnableConfigurationProperties({
	CachingProperties.class,
	EntraIdProperties.class,
	FrontendProperties.class,
	GcNotifyProperties.class,
	MetricsProperties.class,
	MSGraphProperties.class,
	RequestMatchingProperties.class,
	SwaggerUiProperties.class,
})
public record ApplicationProperties(
	@NestedConfigurationProperty CachingProperties caching,
	@NestedConfigurationProperty EntraIdProperties entraId,
	@NestedConfigurationProperty FrontendProperties frontend,
	@NestedConfigurationProperty GcNotifyProperties gcnotify,
	@NestedConfigurationProperty MetricsProperties metrics,
	@NestedConfigurationProperty RequestMatchingProperties matches,
	@NestedConfigurationProperty MSGraphProperties msGraph,
	@NestedConfigurationProperty SwaggerUiProperties swaggerUi
) {}
