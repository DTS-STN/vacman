package ca.gov.dtsstn.vacman.api.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.info.GitProperties;
import org.springframework.boot.micrometer.metrics.autoconfigure.MeterRegistryCustomizer;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import ca.gov.dtsstn.vacman.api.config.properties.ApplicationProperties;
import io.micrometer.core.instrument.MeterRegistry;

@Configuration
public class MetricsConfig {

	@Autowired ApplicationProperties applicationProperties;

	@Autowired GitProperties gitProperties;

	/**
	 * Configures common tags for all metrics recorded by Micrometer.
	 * This includes service name, service version, and deployment environment name.
	 * These tags help in identifying and filtering metrics in monitoring systems.
	 */
	@Bean MeterRegistryCustomizer<MeterRegistry> commonTags() {
		return registry -> {
			registry.config().commonTags(
				"service.name", applicationProperties.metrics().serviceName(),
				"service.version", gitProperties.get("build.version"),
				"deployment.environment.name", applicationProperties.metrics().environmentName()
			);
		};
	}

}