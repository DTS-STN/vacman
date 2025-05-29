package ca.gov.dtsstn.vacman.api.config;

import org.flywaydb.core.api.exception.FlywayValidateException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.boot.autoconfigure.flyway.FlywayMigrationStrategy;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

@Configuration
@EnableJpaAuditing
@EnableJpaRepositories(basePackages = { "ca.gov.dtsstn.vacman.api.data.repository" })
public class DataSourceConfig {

	private static final Logger log = LoggerFactory.getLogger(DataSourceConfig.class);

	/**
	 * Returns a {@link FlywayMigrationStrategy} that performs a Flyway clean operation at startup
	 * if {@code application.flyway.clean-on-validation-error} is enabled and a validation error occurs.
	 *
	 * As of Flyway v10.17.x, the {@code cleanOnValidationError} property has been deprecated.
	 * This custom migration strategy provides similar functionality for development and testing
	 * scenarios where a reset of the database schema is desirable upon migration validation errors.
	 *
	 * Note: to allow Flyway to clean the database, you must also set
	 * {@code spring.flyway.clean-disabled=false} in the application configuration.
	 *
	 * ⚠️⚠️⚠️ Warning ⚠️⚠️⚠️ this operation irreversibly deletes all database objects managed
	 * by Flyway. This should never be enabled in production environments to prevent data loss.
	 */
	@ConditionalOnProperty(name = "application.flyway.clean-on-validation-error", havingValue = "true")
	@Bean FlywayMigrationStrategy flywayMigrationStrategy() {
		log.info("Creating flywayMigrationStrategy bean");

		return flyway -> {
			try {
				flyway.migrate();
			}
			catch (final FlywayValidateException flywayValidateException) {
				log.warn("Flyway validation error detected; cleaning the database");

				flyway.clean();
				flyway.migrate();
			}
		};

	}

}
