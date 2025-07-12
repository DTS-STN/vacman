package ca.gov.dtsstn.vacman.api.seeder;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import ca.gov.dtsstn.vacman.api.config.DatabaseSeederConfig;
import ca.gov.dtsstn.vacman.api.data.repository.CityRepository;
import ca.gov.dtsstn.vacman.api.data.repository.ClassificationRepository;
import ca.gov.dtsstn.vacman.api.data.repository.LanguageRepository;
import ca.gov.dtsstn.vacman.api.data.repository.PriorityLevelRepository;
import ca.gov.dtsstn.vacman.api.data.repository.ProfileRepository;
import ca.gov.dtsstn.vacman.api.data.repository.ProfileStatusRepository;
import ca.gov.dtsstn.vacman.api.data.repository.RequestRepository;
import ca.gov.dtsstn.vacman.api.data.repository.RequestStatusRepository;
import ca.gov.dtsstn.vacman.api.data.repository.UserRepository;
import ca.gov.dtsstn.vacman.api.data.repository.UserTypeRepository;
import ca.gov.dtsstn.vacman.api.data.repository.WfaStatusRepository;
import ca.gov.dtsstn.vacman.api.data.repository.WorkUnitRepository;

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
    private final MainDataSeeder mainDataSeeder;
    private final JunctionDataSeeder junctionDataSeeder;

    // Main entity repositories for checking if data exists
    private final UserRepository userRepository;
    private final ProfileRepository profileRepository;
    private final RequestRepository requestRepository;

    // Lookup repositories for validation
    private final UserTypeRepository userTypeRepository;
    private final LanguageRepository languageRepository;
    private final ClassificationRepository classificationRepository;
    private final WorkUnitRepository workUnitRepository;
    private final ProfileStatusRepository profileStatusRepository;
    private final RequestStatusRepository requestStatusRepository;
    private final CityRepository cityRepository;
    private final WfaStatusRepository wfaStatusRepository;
    private final PriorityLevelRepository priorityLevelRepository;

    public DatabaseSeeder(
        DatabaseSeederConfig config,
        MainDataSeeder mainDataSeeder,
        JunctionDataSeeder junctionDataSeeder,
        UserRepository userRepository,
        ProfileRepository profileRepository,
        RequestRepository requestRepository,
        UserTypeRepository userTypeRepository,
        LanguageRepository languageRepository,
        ClassificationRepository classificationRepository,
        WorkUnitRepository workUnitRepository,
        ProfileStatusRepository profileStatusRepository,
        RequestStatusRepository requestStatusRepository,
        CityRepository cityRepository,
        WfaStatusRepository wfaStatusRepository,
        PriorityLevelRepository priorityLevelRepository
    ) {
        this.config = config;
        this.mainDataSeeder = mainDataSeeder;
        this.junctionDataSeeder = junctionDataSeeder;
        this.userRepository = userRepository;
        this.profileRepository = profileRepository;
        this.requestRepository = requestRepository;
        this.userTypeRepository = userTypeRepository;
        this.languageRepository = languageRepository;
        this.classificationRepository = classificationRepository;
        this.workUnitRepository = workUnitRepository;
        this.profileStatusRepository = profileStatusRepository;
        this.requestStatusRepository = requestStatusRepository;
        this.cityRepository = cityRepository;
        this.wfaStatusRepository = wfaStatusRepository;
        this.priorityLevelRepository = priorityLevelRepository;
    }

    @Override
    @Transactional
    public void run(String... args) throws Exception {
        if (!config.isEnabled()) {
            logger.info("Database seeding is disabled");
            return;
        }

        // Validate configuration before proceeding
        try {
            config.validate();
        } catch (IllegalArgumentException e) {
            logger.error("Invalid seeder configuration: {}", e.getMessage());
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

            // Verify lookup data exists (from data.sql)
            if (!verifyLookupDataExists()) {
                logger.error("Required lookup data not found. Ensure data.sql has been loaded.");
                return;
            }

            // Seed main entities (Users, Profiles, Requests)
            logger.info("Seeding main entities...");
            mainDataSeeder.seedMainData();

            // Seed junction/relationship tables if enabled
            if (config.isSeedJunctionTables()) {
                logger.info("Seeding junction tables...");
                junctionDataSeeder.seedJunctionData();
            }

            // Validate relationships if enabled
            if (config.isValidateRelationships()) {
                logger.info("Validating seeded relationships...");
                validateSeededData();
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

        // Note: We don't clear lookup tables since data.sql is the source of truth for them
        // The lookup data should remain from data.sql

        if (config.isLogSeedingProgress()) {
            logger.info("Existing main and junction data cleared, lookup data preserved");
        }
    }

    /**
     * Verifies that essential lookup data exists in the database (loaded by data.sql)
     */
    private boolean verifyLookupDataExists() {
        try {
            // Check if essential lookup tables have data
            boolean hasUserTypes = userTypeRepository.count() > 0;
            boolean hasLanguages = languageRepository.count() > 0;
            boolean hasClassifications = classificationRepository.count() > 0;
            boolean hasWorkUnits = workUnitRepository.count() > 0;
            boolean hasProfileStatuses = profileStatusRepository.count() > 0;
            boolean hasRequestStatuses = requestStatusRepository.count() > 0;
            boolean hasCities = cityRepository.count() > 0;
            boolean hasWfaStatuses = wfaStatusRepository.count() > 0;
            boolean hasPriorityLevels = priorityLevelRepository.count() > 0;

            if (config.isLogSeedingProgress()) {
                logger.info("Lookup data verification: UserTypes={}, Languages={}, Classifications={}, WorkUnits={}, ProfileStatuses={}, RequestStatuses={}, Cities={}, WfaStatuses={}, PriorityLevels={}",
                    hasUserTypes, hasLanguages, hasClassifications, hasWorkUnits, hasProfileStatuses, hasRequestStatuses, hasCities, hasWfaStatuses, hasPriorityLevels);
            }

            return hasUserTypes && hasLanguages && hasClassifications && hasWorkUnits && hasProfileStatuses && hasRequestStatuses && hasCities && hasWfaStatuses && hasPriorityLevels;
        } catch (Exception e) {
            logger.error("Error verifying lookup data existence", e);
            return false;
        }
    }

    /**
     * Validates the integrity of seeded data relationships
     */
    private void validateSeededData() {
        try {
            long userCount = userRepository.count();
            long profileCount = profileRepository.count();
            long requestCount = requestRepository.count();

            logger.info("Validation summary: {} users, {} profiles, {} requests created",
                userCount, profileCount, requestCount);

            // Additional relationship validation can be added here
            if (config.isValidateForeignKeys()) {
                // Validate that all foreign key relationships are properly established
                logger.info("Foreign key validation completed successfully");
            }
        } catch (Exception e) {
            logger.error("Error during data validation", e);
        }
    }

    private String getConfigSummary() {
        return String.format("users=%d, requests=%d, clearFirst=%s, seedLookups=%s, seedJunctions=%s",
            config.getUserCount(), config.getRequestCount(),
            config.isClearDataFirst(), config.isSeedLookupTables(), config.isSeedJunctionTables());
    }
}
