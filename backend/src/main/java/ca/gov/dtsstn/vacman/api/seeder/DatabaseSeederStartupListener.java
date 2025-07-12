package ca.gov.dtsstn.vacman.api.seeder;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.annotation.Profile;
import org.springframework.context.event.EventListener;
import org.springframework.core.env.Environment;
import org.springframework.stereotype.Component;

import ca.gov.dtsstn.vacman.api.config.DatabaseSeederConfig;

/**
 * Application startup listener that triggers database seeding when appropriate.
 * Only runs when the seeding is enabled and the correct profiles are active.
 */
@Component
@Profile({"dev", "local", "h2"})
public class DatabaseSeederStartupListener {

    private static final Logger logger = LoggerFactory.getLogger(DatabaseSeederStartupListener.class);

    private final DatabaseSeeder databaseSeeder;
    private final DatabaseSeederConfig config;
    private final Environment environment;

    public DatabaseSeederStartupListener(
        DatabaseSeeder databaseSeeder,
        DatabaseSeederConfig config,
        Environment environment
    ) {
        this.databaseSeeder = databaseSeeder;
        this.config = config;
        this.environment = environment;
    }

    @EventListener(ApplicationReadyEvent.class)
    public void onApplicationReady() {
        if (!config.isEnabled()) {
            logger.debug("Database seeding is disabled");
            return;
        }

        if (!shouldRunSeeding()) {
            logger.debug("Database seeding skipped - not in appropriate environment");
            return;
        }

        try {
            logger.info("Running database seeding on application startup...");
            databaseSeeder.run();
            logger.info("Database seeding completed successfully on startup");
        } catch (Exception e) {
            logger.error("Database seeding failed on startup", e);
            // Don't fail the application startup, just log the error
        }
    }

    private boolean shouldRunSeeding() {
        // Only run in development/test environments
        boolean isDevEnvironment = environment.acceptsProfiles("dev", "h2", "development", "local");
        boolean isTestEnvironment = environment.acceptsProfiles("test", "testing");

        return isDevEnvironment || isTestEnvironment;
    }
}
