package ca.gov.dtsstn.vacman.api.seeder;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import ca.gov.dtsstn.vacman.api.config.DatabaseSeederConfig;
import ca.gov.dtsstn.vacman.api.data.repository.ProfileRepository;
import ca.gov.dtsstn.vacman.api.data.repository.RequestRepository;
import ca.gov.dtsstn.vacman.api.data.repository.UserRepository;

/**
 * Main database seeder that coordinates seeding of all tables.
 * Only runs in dev and local profiles.
 */
@Component
@Profile({"dev", "local", "h2"})
@Order(1000) // Run after all other initialization
public class DatabaseSeeder implements CommandLineRunner {

    private static final Logger logger = LoggerFactory.getLogger(DatabaseSeeder.class);

    private final DatabaseSeederConfig config;
    private final LookupDataSeeder lookupDataSeeder;
    private final MainDataSeeder mainDataSeeder;
    private final JunctionDataSeeder junctionDataSeeder;

    // Main entity repositories for checking if data exists
    private final UserRepository userRepository;
    private final ProfileRepository profileRepository;
    private final RequestRepository requestRepository;

    public DatabaseSeeder(
        DatabaseSeederConfig config,
        LookupDataSeeder lookupDataSeeder,
        MainDataSeeder mainDataSeeder,
        JunctionDataSeeder junctionDataSeeder,
        UserRepository userRepository,
        ProfileRepository profileRepository,
        RequestRepository requestRepository
    ) {
        this.config = config;
        this.lookupDataSeeder = lookupDataSeeder;
        this.mainDataSeeder = mainDataSeeder;
        this.junctionDataSeeder = junctionDataSeeder;
        this.userRepository = userRepository;
        this.profileRepository = profileRepository;
        this.requestRepository = requestRepository;
    }

    @Override
    @Transactional
    public void run(String... args) throws Exception {
        if (!config.isEnabled()) {
            logger.info("Database seeding is disabled");
            return;
        }

        // Check if data already exists and skip if configured to do so
        if (config.isSkipIfDataExists() && dataAlreadyExists()) {
            logger.info("Database already contains data, skipping seeding");
            return;
        }

        logger.info("Starting database seeding with configuration: {}", getConfigSummary());
        long startTime = System.currentTimeMillis();

        try {
            if (config.isClearDataFirst()) {
                clearExistingData();
            }

            // Seed lookup tables first (these are required by main entities)
            if (config.isSeedLookupTables()) {
                lookupDataSeeder.seedLookupTables();
            }

            // Seed main entities
            mainDataSeeder.seedMainData();

            // Seed junction tables last
            if (config.isSeedJunctionTables()) {
                junctionDataSeeder.seedJunctionData();
            }

            long endTime = System.currentTimeMillis();
            logger.info("Database seeding completed successfully in {}ms", endTime - startTime);

        } catch (Exception e) {
            logger.error("Database seeding failed", e);
            throw e;
        }
    }

    private boolean dataAlreadyExists() {
        long userCount = userRepository.count();
        long profileCount = profileRepository.count();
        long requestCount = requestRepository.count();

        boolean hasData = userCount > 0 || profileCount > 0 || requestCount > 0;

        if (hasData && config.isLogSeedingProgress()) {
            logger.info("Existing data found: {} users, {} profiles, {} requests",
                       userCount, profileCount, requestCount);
        }

        return hasData;
    }

    private void clearExistingData() {
        if (config.isLogSeedingProgress()) {
            logger.info("Clearing existing data...");
        }

        // Clear in reverse dependency order
        junctionDataSeeder.clearJunctionData();
        mainDataSeeder.clearMainData();

        // Only clear lookup tables if we're going to reseed them with the Java seeder
        // If seedLookupTables is false, we want to keep the data.sql loaded lookup data
        if (config.isSeedLookupTables()) {
            lookupDataSeeder.clearLookupTables();
        }

        if (config.isLogSeedingProgress()) {
            logger.info("Existing data cleared");
        }
    }

    private String getConfigSummary() {
        return String.format("users=%d, profiles=%d, requests=%d, profileRequests=%d, clearFirst=%s, seedLookups=%s, seedJunctions=%s",
            config.getUserCount(), config.getProfileCount(), config.getRequestCount(),
            config.getProfileRequestCount(), config.isClearDataFirst(),
            config.isSeedLookupTables(), config.isSeedJunctionTables());
    }
}
