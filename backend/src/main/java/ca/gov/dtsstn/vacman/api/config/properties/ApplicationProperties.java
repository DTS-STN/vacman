package ca.gov.dtsstn.vacman.api.config.properties;


import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.boot.context.properties.NestedConfigurationProperty;
import org.springframework.validation.annotation.Validated;

@Validated
@ConfigurationProperties("application")
@EnableConfigurationProperties({
	EntraIdProperties.class,
	MSGraphProperties.class,
	GcNotifyProperties.class,
	SwaggerUiProperties.class,
})
public record ApplicationProperties(
	@NestedConfigurationProperty EntraIdProperties entraId,
	@NestedConfigurationProperty MSGraphProperties msGraph,
	@NestedConfigurationProperty GcNotifyProperties gcnotify,
	@NestedConfigurationProperty SwaggerUiProperties swaggerUi
) {}
