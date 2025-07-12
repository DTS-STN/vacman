package ca.gov.dtsstn.vacman.api.seeder;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Random;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import ca.gov.dtsstn.vacman.api.config.DatabaseSeederConfig;
import ca.gov.dtsstn.vacman.api.data.entity.AppointmentNonAdvertisedEntity;
import ca.gov.dtsstn.vacman.api.data.entity.CityEntity;
import ca.gov.dtsstn.vacman.api.data.entity.ClassificationEntity;
import ca.gov.dtsstn.vacman.api.data.entity.EmploymentTenureEntity;
import ca.gov.dtsstn.vacman.api.data.entity.LanguageEntity;
import ca.gov.dtsstn.vacman.api.data.entity.LanguageRequirementEntity;
import ca.gov.dtsstn.vacman.api.data.entity.PriorityLevelEntity;
import ca.gov.dtsstn.vacman.api.data.entity.ProfileEntity;
import ca.gov.dtsstn.vacman.api.data.entity.ProfileStatusEntity;
import ca.gov.dtsstn.vacman.api.data.entity.RequestEntity;
import ca.gov.dtsstn.vacman.api.data.entity.RequestStatusEntity;
import ca.gov.dtsstn.vacman.api.data.entity.SecurityClearanceEntity;
import ca.gov.dtsstn.vacman.api.data.entity.SelectionProcessTypeEntity;
import ca.gov.dtsstn.vacman.api.data.entity.UserEntity;
import ca.gov.dtsstn.vacman.api.data.entity.UserTypeEntity;
import ca.gov.dtsstn.vacman.api.data.entity.WfaStatusEntity;
import ca.gov.dtsstn.vacman.api.data.entity.WorkScheduleEntity;
import ca.gov.dtsstn.vacman.api.data.entity.WorkUnitEntity;
import ca.gov.dtsstn.vacman.api.data.repository.AppointmentNonAdvertisedRepository;
import ca.gov.dtsstn.vacman.api.data.repository.CityRepository;
import ca.gov.dtsstn.vacman.api.data.repository.ClassificationRepository;
import ca.gov.dtsstn.vacman.api.data.repository.EmploymentTenureRepository;
import ca.gov.dtsstn.vacman.api.data.repository.LanguageRepository;
import ca.gov.dtsstn.vacman.api.data.repository.LanguageRequirementRepository;
import ca.gov.dtsstn.vacman.api.data.repository.PriorityLevelRepository;
import ca.gov.dtsstn.vacman.api.data.repository.ProfileRepository;
import ca.gov.dtsstn.vacman.api.data.repository.ProfileStatusRepository;
import ca.gov.dtsstn.vacman.api.data.repository.RequestRepository;
import ca.gov.dtsstn.vacman.api.data.repository.RequestStatusRepository;
import ca.gov.dtsstn.vacman.api.data.repository.SecurityClearanceRepository;
import ca.gov.dtsstn.vacman.api.data.repository.SelectionProcessTypeRepository;
import ca.gov.dtsstn.vacman.api.data.repository.UserRepository;
import ca.gov.dtsstn.vacman.api.data.repository.UserTypeRepository;
import ca.gov.dtsstn.vacman.api.data.repository.WfaStatusRepository;
import ca.gov.dtsstn.vacman.api.data.repository.WorkScheduleRepository;
import ca.gov.dtsstn.vacman.api.data.repository.WorkUnitRepository;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;

/**
 * Enhanced main data seeder with improved relationship handling and configuration.
 * Seeds main business data tables with configurable relationships and realistic data distribution.
 */
@Component
@Profile({"dev", "local", "h2"})
public class MainDataSeeder {

    private static final Logger logger = LoggerFactory.getLogger(MainDataSeeder.class);

    @PersistenceContext
    private EntityManager entityManager;

    private final DatabaseSeederConfig config;
    private final Random random;

    // Main table repositories
    private final UserRepository userRepository;
    private final RequestRepository requestRepository;
    private final ProfileRepository profileRepository;

    // Lookup repositories for foreign key references
    private final UserTypeRepository userTypeRepository;
    private final LanguageRepository languageRepository;
    private final ClassificationRepository classificationRepository;
    private final SecurityClearanceRepository securityClearanceRepository;
    private final RequestStatusRepository requestStatusRepository;
    private final WorkUnitRepository workUnitRepository;
    private final ProfileStatusRepository profileStatusRepository;
    private final CityRepository cityRepository;
    private final WfaStatusRepository wfaStatusRepository;
    private final PriorityLevelRepository priorityLevelRepository;

    // Additional repositories for Request entity requirements
    private final AppointmentNonAdvertisedRepository appointmentNonAdvertisedRepository;
    private final LanguageRequirementRepository languageRequirementRepository;
    private final EmploymentTenureRepository employmentTenureRepository;
    private final SelectionProcessTypeRepository selectionProcessTypeRepository;
    private final WorkScheduleRepository workScheduleRepository;

    // Cached lookup data for better performance
    private List<UserTypeEntity> userTypes;
    private List<LanguageEntity> languages;
    private List<ClassificationEntity> classifications;
    private List<SecurityClearanceEntity> securityClearances;
    private List<RequestStatusEntity> requestStatuses;
    private List<WorkUnitEntity> workUnits;
    private List<ProfileStatusEntity> profileStatuses;
    private List<CityEntity> cities;
    private List<WfaStatusEntity> wfaStatuses;
    private List<PriorityLevelEntity> priorityLevels;
    private List<AppointmentNonAdvertisedEntity> appointmentNonAdvertiseds;
    private List<LanguageRequirementEntity> languageRequirements;
    private List<EmploymentTenureEntity> employmentTenures;
    private List<SelectionProcessTypeEntity> selectionProcessTypes;
    private List<WorkScheduleEntity> workSchedules;

    public MainDataSeeder(
        DatabaseSeederConfig config,
        UserRepository userRepository,
        RequestRepository requestRepository,
        ProfileRepository profileRepository,
        UserTypeRepository userTypeRepository,
        LanguageRepository languageRepository,
        ClassificationRepository classificationRepository,
        SecurityClearanceRepository securityClearanceRepository,
        RequestStatusRepository requestStatusRepository,
        WorkUnitRepository workUnitRepository,
        ProfileStatusRepository profileStatusRepository,
        CityRepository cityRepository,
        WfaStatusRepository wfaStatusRepository,
        PriorityLevelRepository priorityLevelRepository,
        AppointmentNonAdvertisedRepository appointmentNonAdvertisedRepository,
        LanguageRequirementRepository languageRequirementRepository,
        EmploymentTenureRepository employmentTenureRepository,
        SelectionProcessTypeRepository selectionProcessTypeRepository,
        WorkScheduleRepository workScheduleRepository
    ) {
        this.config = config;
        this.userRepository = userRepository;
        this.requestRepository = requestRepository;
        this.profileRepository = profileRepository;
        this.userTypeRepository = userTypeRepository;
        this.languageRepository = languageRepository;
        this.classificationRepository = classificationRepository;
        this.securityClearanceRepository = securityClearanceRepository;
        this.requestStatusRepository = requestStatusRepository;
        this.workUnitRepository = workUnitRepository;
        this.profileStatusRepository = profileStatusRepository;
        this.cityRepository = cityRepository;
        this.wfaStatusRepository = wfaStatusRepository;
        this.priorityLevelRepository = priorityLevelRepository;
        this.appointmentNonAdvertisedRepository = appointmentNonAdvertisedRepository;
        this.languageRequirementRepository = languageRequirementRepository;
        this.employmentTenureRepository = employmentTenureRepository;
        this.selectionProcessTypeRepository = selectionProcessTypeRepository;
        this.workScheduleRepository = workScheduleRepository;

        // Initialize random with configurable seed for reproducible data
        this.random = config.isUseFixedSeed() ?
            new Random(config.getRandomSeed()) :
            new Random();
    }

    @Transactional
    public void seedMainData() {
        logger.info("=== STARTING MAIN DATA SEEDING ===");

        if (config.isLogSeedingProgress()) {
            logger.info("Starting main data seeding...");
        }

        // Validate configuration
        config.validate();

        // Load lookup data from database
        loadLookupData();

        // Validate that we have required lookup data
        if (!validateLookupData()) {
            logger.error("Cannot seed main data: missing required lookup data");
            return;
        }

        seedUsers();
        seedProfiles();
        seedRequests();

        if (config.isValidateRelationships()) {
            validateSeededData();
        }

        if (config.isLogSeedingProgress()) {
            logger.info("Main data seeding completed successfully");
        }
    }

    @Transactional
    public void clearMainData() {
        if (config.isLogSeedingProgress()) {
            logger.info("Clearing main data tables...");
        }

        try {
            // Clear in dependency order (child tables first)
            entityManager.createNativeQuery("DELETE FROM REQUEST").executeUpdate();
            entityManager.createNativeQuery("DELETE FROM PROFILE").executeUpdate();
            entityManager.createNativeQuery("DELETE FROM [USER]").executeUpdate();

            // Flush all changes
            entityManager.flush();

            if (config.isLogSeedingProgress()) {
                logger.info("Main data tables cleared successfully");
            }
        } catch (Exception e) {
            logger.error("Error clearing main data tables", e);
            throw e;
        }
    }

    private void loadLookupData() {
        logger.info("=== LOADING LOOKUP DATA FROM DATABASE ===");

        userTypes = userTypeRepository.findAll();
        languages = languageRepository.findAll();
        classifications = classificationRepository.findAll();
        securityClearances = securityClearanceRepository.findAll();
        requestStatuses = requestStatusRepository.findAll();
        workUnits = workUnitRepository.findAll();
        profileStatuses = profileStatusRepository.findAll();
        cities = cityRepository.findAll();
        wfaStatuses = wfaStatusRepository.findAll();
        priorityLevels = priorityLevelRepository.findAll();

        // Cache additional lookup data required for requests
        appointmentNonAdvertiseds = appointmentNonAdvertisedRepository.findAll();
        languageRequirements = languageRequirementRepository.findAll();
        employmentTenures = employmentTenureRepository.findAll();
        selectionProcessTypes = selectionProcessTypeRepository.findAll();
        workSchedules = workScheduleRepository.findAll();

        if (!languages.isEmpty()) {
            logger.info("Available languages: {}",
                       languages.stream().map(l -> l.getCode() + ":" + l.getNameEn()).toList());
        } else {
            logger.error("CRITICAL: No languages found in database! User creation will fail!");
        }

        logger.info("=== LOOKUP DATA LOADING COMPLETE ===");
    }

    private boolean validateLookupData() {
        boolean valid = true;

        if (userTypes.isEmpty()) {
            logger.error("No user types found");
            valid = false;
        }

        if (languages.isEmpty()) {
            logger.error("No languages found");
            valid = false;
        }

        if (classifications.isEmpty()) {
            logger.warn("No classifications found - some features may not work");
        }

        if (securityClearances.isEmpty()) {
            logger.warn("No security clearances found - requests may not be created properly");
        }

        if (requestStatuses.isEmpty()) {
            logger.warn("No request statuses found - requests may not be created properly");
        }

        if (profileStatuses.isEmpty()) {
            logger.warn("No profile statuses found - profiles may not be created properly");
        }

        if (cities.isEmpty()) {
            logger.warn("No cities found - profiles may not have location data");
        }

        if (wfaStatuses.isEmpty()) {
            logger.warn("No WFA statuses found - profiles may not have WFA status data");
        }

        if (priorityLevels.isEmpty()) {
            logger.warn("No priority levels found - profiles may not have priority data");
        }

        // Validate additional lookup entities required for requests
        if (languageRequirements.isEmpty()) {
            logger.warn("No language requirements found - requests may not be created properly");
        }

        if (employmentTenures.isEmpty()) {
            logger.warn("No employment tenures found - requests may not be created properly");
        }

        if (selectionProcessTypes.isEmpty()) {
            logger.warn("No selection process types found - requests may not be created properly");
        }

        if (appointmentNonAdvertiseds.isEmpty()) {
            logger.warn("No appointment non-advertised records found - requests may not be created properly");
        }

        if (workSchedules.isEmpty()) {
            logger.warn("No work schedules found - requests may not be created properly");
        }

        return valid;
    }

    private void seedUsers() {
        if (userRepository.count() > 0) {
            logger.info("Users already exist, skipping user seeding");
            return;
        }

        // Use the configured user count directly - don't adjust based on profiles
        int totalUsers = config.getUserCount();

        // Calculate user type distribution
        int adminCount = (int) (totalUsers * config.getAdminUserPercentage());
        int hiringManagerCount = (int) (totalUsers * config.getHiringManagerPercentage());
        int employeeCount = totalUsers - adminCount - hiringManagerCount;

        // Name pools for realistic data generation
        String[] firstNames = {
            "Michael", "Emma", "William", "Olivia", "James", "Sophia", "Benjamin", "Isabella",
            "Lucas", "Mia", "Henry", "Charlotte", "Alexander", "Amelia", "Mason", "Harper",
            "Ethan", "Evelyn", "Daniel", "Abigail", "Matthew", "Emily", "Anthony", "Elizabeth",
            "Joshua", "Sofia", "Andrew", "Avery", "Christopher", "Ella", "Samuel", "Madison",
            "Joseph", "Scarlett", "Gabriel", "Victoria", "Carter", "Aria", "Jayden", "Grace",
            "John", "Grace", "David", "Chloe", "Luke", "Zoe", "Ryan", "Lily", "Nathan", "Hannah"
        };

        String[] lastNames = {
            "Anderson", "Thomas", "Jackson", "White", "Harris", "Martin", "Thompson", "Garcia",
            "Martinez", "Robinson", "Clark", "Rodriguez", "Lewis", "Lee", "Walker", "Hall",
            "Allen", "Young", "Hernandez", "King", "Wright", "Lopez", "Hill", "Scott",
            "Green", "Adams", "Baker", "Gonzalez", "Nelson", "Carter", "Mitchell", "Perez",
            "Roberts", "Turner", "Phillips", "Campbell", "Parker", "Evans", "Edwards", "Collins",
            "Stewart", "Sanchez", "Morris", "Rogers", "Reed", "Cook", "Morgan", "Bell", "Murphy", "Bailey"
        };

        List<UserEntity> users = new ArrayList<>();

        // Create users with proper distribution
        createUsersForType("admin", adminCount, users, firstNames, lastNames);
        createUsersForType("hiring-manager", hiringManagerCount, users, firstNames, lastNames);
        createUsersForType("employee", employeeCount, users, firstNames, lastNames);

        // Shuffle to randomize order
        Collections.shuffle(users, random);

        userRepository.saveAll(users);
        logSeeded("Users", users.size());

        if (config.isLogSeedingProgress()) {
            logger.info("User distribution: {} admins, {} hiring managers, {} employees",
                       adminCount, hiringManagerCount, employeeCount);
        }
    }

    private void createUsersForType(String userTypeCode, int count, List<UserEntity> users,
                                   String[] firstNames, String[] lastNames) {
        UserTypeEntity userType = getUserTypeByCode(userTypeCode);
        if (userType == null) {
            logger.warn("User type '{}' not found, skipping {} users", userTypeCode, count);
            return;
        }

        // Ensure we have languages available
        if (languages.isEmpty()) {
            logger.error("Cannot create users: no languages available");
            return;
        }

        for (int i = 0; i < count; i++) {
            String firstName = firstNames[random.nextInt(firstNames.length)];
            String lastName = lastNames[random.nextInt(lastNames.length)];
            String email = generateUniqueEmail(firstName, lastName, users.size() + i + 1);

            // Get a valid language - use first language as fallback if random selection fails
            LanguageEntity language = getRandomElement(languages);
            if (language == null) {
                language = languages.get(0); // Fallback to first language
                logger.warn("Random language selection failed, using fallback language: {}", language.getNameEn());
            }

            UserEntity user = createUser(email, firstName, lastName, userType, language);
            users.add(user);
        }
    }

    private String generateUniqueEmail(String firstName, String lastName, int index) {
        return String.format("%s.%s%d@example.com",
                           firstName.toLowerCase(),
                           lastName.toLowerCase(),
                           index);
    }

    private void seedProfiles() {
        if (profileRepository.count() > 0) {
            logger.info("Profiles already exist, skipping profile seeding");
            return;
        }

        List<UserEntity> users = userRepository.findAll();
        if (users.isEmpty()) {
            logger.warn("Cannot seed profiles: no users available");
            return;
        }

        if (profileStatuses.isEmpty()) {
            logger.warn("Cannot seed profiles: no profile statuses available");
            return;
        }

        // Calculate user distribution based on configuration
        int totalUsers = users.size();
        int usersWithZeroProfiles = (int) (totalUsers * config.getUsersWithZeroProfilesPercentage());
        int usersWithOneProfile = (int) (totalUsers * config.getUsersWithOneProfilePercentage());
        int usersWithMultipleProfiles = totalUsers - usersWithZeroProfiles - usersWithOneProfile;

        // Shuffle users to randomize assignment
        Collections.shuffle(users, random);

        List<ProfileEntity> allProfiles = new ArrayList<>();
        int userIndex = 0;

        // Users with zero profiles (skip first usersWithZeroProfiles users)
        userIndex += usersWithZeroProfiles;

        // Users with one profile
        for (int i = 0; i < usersWithOneProfile && userIndex < users.size(); i++, userIndex++) {
            UserEntity user = users.get(userIndex);
            ProfileEntity profile = createProfileForUser(user, selectProfileStatus(false)); // Not necessarily active
            allProfiles.add(profile);
        }

        // Users with multiple profiles
        for (int i = 0; i < usersWithMultipleProfiles && userIndex < users.size(); i++, userIndex++) {
            UserEntity user = users.get(userIndex);
            int profileCount = random.nextInt(config.getMaxProfilesPerUserWithMultiple() - config.getMinProfilesPerUserWithMultiple() + 1)
                             + config.getMinProfilesPerUserWithMultiple();

            boolean hasActiveProfile = false;
            for (int j = 0; j < profileCount; j++) {
                boolean makeActive = false;
                if (config.isEnsureOneActiveProfilePerUser() && !hasActiveProfile && (j == profileCount - 1 || random.nextDouble() < 0.3)) {
                    makeActive = true;
                    hasActiveProfile = true;
                }

                ProfileStatusEntity status = makeActive ? getProfileStatusByCode("ACTIVE") : selectProfileStatus(true); // Exclude active for non-primary profiles
                if (status == null) {
                    status = getRandomElement(profileStatuses);
                }

                ProfileEntity profile = createProfileForUser(user, status);
                allProfiles.add(profile);
            }
        }

        // Shuffle final list to randomize order
        Collections.shuffle(allProfiles, random);

        profileRepository.saveAll(allProfiles);
        logSeeded("Profiles", allProfiles.size());

        if (config.isLogSeedingProgress()) {
            logger.info("Profile distribution: {} users with zero profiles, {} users with one profile, {} users with multiple profiles",
                       usersWithZeroProfiles, usersWithOneProfile, usersWithMultipleProfiles);

            // Log distribution by status
            long activeCount = allProfiles.stream().filter(p -> "ACTIVE".equals(p.getProfileStatus().getCode())).count();
            long inactiveCount = allProfiles.stream().filter(p -> "INACTIVE".equals(p.getProfileStatus().getCode())).count();
            long pendingCount = allProfiles.size() - activeCount - inactiveCount;

            logger.info("Profile status distribution: {} active, {} inactive, {} other", activeCount, inactiveCount, pendingCount);
        }
    }

    /**
     * Selects a profile status based on configured distributions
     * @param excludeActive whether to exclude ACTIVE status from selection
     * @return selected ProfileStatusEntity
     */
    private ProfileStatusEntity selectProfileStatus(boolean excludeActive) {
        if (excludeActive) {
            // Redistribute percentages excluding active
            double inactiveWeight = config.getInactiveProfilePercentage();
            double pendingWeight = config.getPendingProfilePercentage();
            double totalWeight = inactiveWeight + pendingWeight;

            if (totalWeight <= 0) {
                return getRandomElement(profileStatuses.stream()
                    .filter(ps -> !"ACTIVE".equals(ps.getCode()))
                    .toList());
            }

            double randomValue = random.nextDouble() * totalWeight;
            if (randomValue < inactiveWeight) {
                return getProfileStatusByCode("INACTIVE");
            } else {
                return getProfileStatusByCode("PENDING");
            }
        } else {
            // Use normal distribution
            double randomValue = random.nextDouble();
            if (randomValue < config.getActiveProfilePercentage()) {
                return getProfileStatusByCode("ACTIVE");
            } else if (randomValue < config.getActiveProfilePercentage() + config.getInactiveProfilePercentage()) {
                return getProfileStatusByCode("INACTIVE");
            } else {
                return getProfileStatusByCode("PENDING");
            }
        }
    }

    /**
     * Creates a profile for the specified user with the given status
     */
    private ProfileEntity createProfileForUser(UserEntity user, ProfileStatusEntity status) {
        UserEntity hrAdvisor = findHrAdvisor(List.of(user)); // Pass list with single user for consistency

        return createProfile(
            user,
            getRandomElement(classifications),
            hrAdvisor,
            getRandomElement(workUnits),
            status
        );
    }

    private UserEntity findHrAdvisor(List<UserEntity> users) {
        // Try to find a hiring manager first
        return users.stream()
                .filter(u -> "hiring-manager".equals(u.getUserType().getCode()))
                .findAny()
                .orElse(getRandomElement(users));
    }

    private void seedRequests() {
        if (requestRepository.count() > 0) {
            logger.info("Requests already exist, skipping request seeding");
            return;
        }

        List<UserEntity> users = userRepository.findAll();
        if (users.isEmpty() || securityClearances.isEmpty() || workUnits.isEmpty() ||
            classifications.isEmpty() || requestStatuses.isEmpty() || languages.isEmpty() ||
            languageRequirements.isEmpty() || employmentTenures.isEmpty() ||
            selectionProcessTypes.isEmpty() || appointmentNonAdvertiseds.isEmpty() ||
            workSchedules.isEmpty()) {
            logger.warn("Cannot seed requests: missing required lookup data");
            return;
        }

        int requestCount = config.getRequestCount();

        // Calculate request status distribution
        int draftCount = (int) (requestCount * config.getDraftRequestPercentage());
        int submittedCount = (int) (requestCount * config.getSubmittedRequestPercentage());
        int underReviewCount = (int) (requestCount * config.getUnderReviewRequestPercentage());
        int approvedCount = (int) (requestCount * config.getApprovedRequestPercentage());
        int rejectedCount = requestCount - draftCount - submittedCount - underReviewCount - approvedCount;

        List<RequestEntity> requests = new ArrayList<>();

        // Create requests with proper status distribution
        createRequestsForStatus("DRAFT", draftCount, requests, users);
        createRequestsForStatus("SUBMITTED", submittedCount, requests, users);
        createRequestsForStatus("UNDER_REVIEW", underReviewCount, requests, users);
        createRequestsForStatus("APPROVED", approvedCount, requests, users);
        createRequestsForStatus("REJECTED", rejectedCount, requests, users);

        // Shuffle to randomize order
        Collections.shuffle(requests, random);

        requestRepository.saveAll(requests);
        logSeeded("Requests", requests.size());

        if (config.isLogSeedingProgress()) {
            logger.info("Request distribution: {} draft, {} submitted, {} under review, {} approved, {} rejected",
                       draftCount, submittedCount, underReviewCount, approvedCount, rejectedCount);
        }
    }

    private void createRequestsForStatus(String statusCode, int count, List<RequestEntity> requests, List<UserEntity> users) {
        RequestStatusEntity status = getRequestStatusByCode(statusCode);
        if (status == null) {
            status = getRandomElement(requestStatuses);
        }

        // Enhanced request templates with more variety
        String[][] requestTemplates = {
            {"Senior Software Developer Position", "Poste de développeur logiciel senior"},
            {"Data Analyst - Business Intelligence", "Analyste de données - Intelligence d'affaires"},
            {"Project Manager - Digital Transformation", "Gestionnaire de projet - Transformation numérique"},
            {"Business Analyst - Policy Development", "Analyste d'affaires - Développement de politiques"},
            {"Technical Writer - Documentation Specialist", "Rédacteur technique - Spécialiste en documentation"},
            {"DevOps Engineer - Infrastructure", "Ingénieur DevOps - Infrastructure"},
            {"Product Manager - User Experience", "Gestionnaire de produit - Expérience utilisateur"},
            {"Security Analyst - Cybersecurity", "Analyste de sécurité - Cybersécurité"},
            {"Database Administrator", "Administrateur de base de données"},
            {"Quality Assurance Specialist", "Spécialiste en assurance qualité"},
            {"Systems Analyst - Enterprise Architecture", "Analyste de systèmes - Architecture d'entreprise"},
            {"Communications Advisor", "Conseiller en communications"}
        };

        for (int i = 0; i < count; i++) {
            String[] template = requestTemplates[i % requestTemplates.length];

            RequestEntity request = createRequest(
                template[0],
                template[1],
                getRandomElement(securityClearances),
                getRandomElement(users), // submitter
                findHrAdvisor(users), // hrAdvisor
                getRandomElement(workUnits),
                getRandomElement(classifications),
                status
            );
            requests.add(request);
        }
    }

    // Helper methods to create entities
    private UserEntity createUser(String email, String firstName, String lastName,
                                 UserTypeEntity userType, LanguageEntity language) {
        UserEntity user = new UserEntity();
        user.setBusinessEmailAddress(email);
        user.setFirstName(firstName);
        user.setLastName(lastName);
        user.setUserType(userType);
        user.setLanguage(language);
        user.setNetworkName("NET" + String.format("%04d", random.nextInt(10000)));
        user.setUuName("UU" + String.format("%04d", random.nextInt(10000)));

        // Add optional fields with realistic data
        if (random.nextBoolean()) {
            user.setMiddleName(generateMiddleName());
        }

        if (random.nextDouble() < 0.3) { // 30% chance of having initials
            user.setInitial(firstName.substring(0, 1) + (user.getMiddleName() != null ? user.getMiddleName().substring(0, 1) : "") + lastName.substring(0, 1));
        }

        if (random.nextDouble() < 0.8) { // 80% chance of having a business phone
            user.setBusinessPhoneNumber(generateBusinessPhoneNumber());
        }

        if (random.nextDouble() < 0.6) { // 60% chance of having a PRI
            user.setPersonalRecordIdentifier(String.format("PRI%07d", random.nextInt(10000000)));
        }

        user.setCreatedBy("SYSTEM");
        return user;
    }

    private String generateMiddleName() {
        String[] middleNames = {
            "James", "Marie", "Anne", "Michael", "Elizabeth", "David", "Catherine", "Robert",
            "Michelle", "Christopher", "Jennifer", "Daniel", "Patricia", "Matthew", "Linda"
        };
        return middleNames[random.nextInt(middleNames.length)];
    }

    private String generateBusinessPhoneNumber() {
        // Generate Canadian government phone number format: +1-XXX-XXX-XXXX
        int areaCode = 613 + random.nextInt(3); // 613, 614, 615 (Ottawa area codes)
        int exchange = 200 + random.nextInt(800); // Valid exchange codes
        int number = random.nextInt(10000);
        return String.format("+1-%03d-%03d-%04d", areaCode, exchange, number);
    }

    private ProfileEntity createProfile(UserEntity user, ClassificationEntity classification,
                                      UserEntity hrAdvisor, WorkUnitEntity workUnit,
                                      ProfileStatusEntity profileStatus) {
        ProfileEntity profile = new ProfileEntity();
        profile.setUser(user);
        profile.setHrAdvisor(hrAdvisor);
        profile.setClassification(classification);
        profile.setWorkUnit(workUnit);
        profile.setProfileStatus(profileStatus);

        // Populate additional foreign key relationships
        if (!cities.isEmpty() && random.nextDouble() < 0.8) { // 80% chance of having a city
            profile.setCity(getRandomElement(cities));
        }

        if (!wfaStatuses.isEmpty() && random.nextDouble() < 0.4) { // 40% chance of having WFA status
            profile.setWfaStatus(getRandomElement(wfaStatuses));
        }

        if (!priorityLevels.isEmpty() && random.nextDouble() < 0.3) { // 30% chance of having priority level
            profile.setPriorityLevel(getRandomElement(priorityLevels));
        }

        if (!languages.isEmpty() && random.nextDouble() < 1.0) { // 100% chance of having a language preference
            profile.setLanguage(getRandomElement(languages));
        }

        // Populate boolean indicators with realistic distributions
        profile.setPrivacyConsentInd(random.nextDouble() < 0.95); // 95% consent to privacy
        profile.setAvailableForReferralInd(random.nextDouble() < 0.8); // 80% available for referral
        profile.setInterestedInAlternationInd(random.nextDouble() < 0.6); // 60% interested in alternation

        // Add personal contact information for some profiles
        if (random.nextDouble() < 0.6) { // 60% chance of personal phone
            profile.setPersonalPhoneNumber(generatePersonalPhoneNumber());
        }

        if (random.nextDouble() < 0.4) { // 40% chance of personal email
            profile.setPersonalEmailAddress(generatePersonalEmail(user.getFirstName(), user.getLastName()));
        }

        profile.setAdditionalComment(generateProfileComment(user, profileStatus));
        profile.setCreatedBy("SYSTEM");
        return profile;
    }

    private String generatePersonalPhoneNumber() {
        // Generate Canadian mobile number format: +1-XXX-XXX-XXXX
        int areaCode = 416 + random.nextInt(10); // Various Canadian area codes
        int exchange = 300 + random.nextInt(700); // Mobile exchange codes
        int number = random.nextInt(10000);
        return String.format("+1-%03d-%03d-%04d", areaCode, exchange, number);
    }

    private String generatePersonalEmail(String firstName, String lastName) {
        String[] domains = {"gmail.com", "yahoo.ca", "hotmail.com", "outlook.com", "icloud.com"};
        String domain = domains[random.nextInt(domains.length)];
        String prefix = firstName.toLowerCase() + "." + lastName.toLowerCase();

        // Sometimes add a number to make it unique
        if (random.nextBoolean()) {
            prefix += random.nextInt(100);
        }

        return prefix + "@" + domain;
    }

    private String generateProfileComment(UserEntity user, ProfileStatusEntity status) {
        String[] commentTemplates = {
            "Profile created for %s %s - %s status",
            "Employee profile for %s %s with %s classification",
            "HR profile record for %s %s - currently %s",
            "Workforce planning profile: %s %s (%s)"
        };

        String template = commentTemplates[random.nextInt(commentTemplates.length)];
        return String.format(template, user.getFirstName(), user.getLastName(),
                           status.getNameEn().toLowerCase());
    }

    private RequestEntity createRequest(String nameEn, String nameFr, SecurityClearanceEntity clearance,
                                       UserEntity submitter, UserEntity hrAdvisor, WorkUnitEntity workUnit,
                                       ClassificationEntity classification, RequestStatusEntity status) {
        RequestEntity request = new RequestEntity();
        request.setRequestNameEn(nameEn);
        request.setRequestNameFr(nameFr);
        request.setSecurityClearance(clearance);
        request.setSubmitter(submitter);
        request.setHrAdvisor(hrAdvisor);
        request.setWorkUnit(workUnit);
        request.setClassification(classification);
        request.setRequestStatus(status);

        // Set all required lookup entities
        request.setHiringManager(findHiringManager(hrAdvisor));
        request.setSubDelegatedManager(hrAdvisor); // Use hrAdvisor as fallback
        request.setLanguage(getRandomElement(languages));
        request.setLanguageRequirement(getRandomElement(languageRequirements));
        request.setEmploymentTenure(getRandomElement(employmentTenures));
        request.setSelectionProcessType(getRandomElement(selectionProcessTypes));
        request.setAppointmentNonAdvertised(getRandomElement(appointmentNonAdvertiseds));
        request.setWorkSchedule(getRandomElement(workSchedules));

        // Set realistic date ranges based on status
        LocalDate startDate = generateStartDate(status);
        request.setStartDate(startDate);

        LocalDate endDate = generateEndDate(startDate, status);
        request.setEndDate(endDate);

        // Populate optional fields with realistic data
        if (random.nextDouble() < 0.7) { // 70% chance of having priority clearance number
            request.setPriorityClearanceNumber("PC-" + String.format("%06d", random.nextInt(1000000)));
        }

        request.setAllowTeleworkIndicator(random.nextDouble() < 0.8); // 80% allow telework

        if (random.nextDouble() < 0.3) { // 30% chance of alternate contact email
            request.setAlternateContactEmailAddress(generateAlternateContactEmail());
        }

        if (random.nextDouble() < 0.9) { // 90% chance of having request number
            request.setRequestNumber("REQ" + String.format("%07d", random.nextInt(10000000)));
        }

        request.setEmploymentEquityNeedIdentifiedIndicator(random.nextDouble() < 0.25); // 25% have EE need

        if (random.nextDouble() < 0.6) { // 60% chance of selection process number
            request.setSelectionProcessNumber("SP-" + String.format("%08d", random.nextInt(100000000)));
        }

        if (random.nextDouble() < 0.8) { // 80% chance of position number
            request.setPositionNumber(generatePositionNumber());
        }

        // Language profiles (official language requirements)
        if (random.nextDouble() < 0.7) { // 70% chance of having language profiles
            String[] languageProfiles = {"BBB", "BBC", "CCC", "CBB", "BCC"};
            request.setLanguageProfileEn(languageProfiles[random.nextInt(languageProfiles.length)]);
            request.setLanguageProfileFr(languageProfiles[random.nextInt(languageProfiles.length)]);
        }

        // SOMC and conditions of employment
        if (random.nextDouble() < 0.4) { // 40% chance of having SOMC
            request.setSomcAndConditionEmploymentEn(generateSomcConditions("en"));
            request.setSomcAndConditionEmploymentFr(generateSomcConditions("fr"));
        }

        if (random.nextDouble() < 0.5) { // 50% chance of additional comments
            request.setAdditionalComment(generateRequestComment(nameEn, status));
        }

        request.setCreatedBy("SYSTEM");
        return request;
    }

    private String generateAlternateContactEmail() {
        String[] domains = {"gc.ca", "canada.ca", "tpsgc-pwgsc.gc.ca", "ic.gc.ca"};
        String domain = domains[random.nextInt(domains.length)];
        String prefix = "contact" + random.nextInt(1000);
        return prefix + "@" + domain;
    }

    private String generatePositionNumber() {
        // Generate realistic government position number format
        String[] departments = {"DTSSTN", "ESDC", "HRSDC", "CRA", "PSPC"};
        String dept = departments[random.nextInt(departments.length)];
        int positionNum = 100000 + random.nextInt(900000);
        return dept + "-" + positionNum;
    }

    private String generateSomcConditions(String language) {
        if ("fr".equals(language)) {
            String[] conditionsFr = {
                "Conditions d'emploi spéciales selon les exigences du poste",
                "Horaire de travail flexible avec possibilité de télétravail",
                "Exigences de sécurité selon le niveau de classification",
                "Formation obligatoire dans les 90 premiers jours"
            };
            return conditionsFr[random.nextInt(conditionsFr.length)];
        } else {
            String[] conditionsEn = {
                "Special conditions of employment as per position requirements",
                "Flexible work schedule with telework opportunities",
                "Security requirements based on classification level",
                "Mandatory training within the first 90 days"
            };
            return conditionsEn[random.nextInt(conditionsEn.length)];
        }
    }

    private String generateRequestComment(String requestName, RequestStatusEntity status) {
        String[] commentTemplates = {
            "Request for %s - Status: %s",
            "Staffing action: %s (Current status: %s)",
            "Workforce planning request: %s - %s",
            "Position filling request: %s (%s)"
        };

        String template = commentTemplates[random.nextInt(commentTemplates.length)];
        return String.format(template, requestName, status.getNameEn().toLowerCase());
    }

    private LocalDate generateStartDate(RequestStatusEntity status) {
        LocalDate baseDate = LocalDate.now();

        // Adjust start date based on status
        switch (status.getCode()) {
            case "DRAFT":
                return baseDate.plusDays(random.nextInt(60) + 30); // 30-90 days from now
            case "SUBMITTED":
            case "UNDER_REVIEW":
                return baseDate.plusDays(random.nextInt(45) + 15); // 15-60 days from now
            case "APPROVED":
                return baseDate.plusDays(random.nextInt(30) + 7); // 7-37 days from now
            case "REJECTED":
            case "CANCELLED":
                return baseDate.plusDays(random.nextInt(180) + 30); // Past or future
            default:
                return baseDate.plusDays(random.nextInt(90)); // Random future date
        }
    }

    private LocalDate generateEndDate(LocalDate startDate, RequestStatusEntity status) {
        // Generate end date 6-18 months after start date
        int monthsToAdd = 6 + random.nextInt(13);
        return startDate.plusMonths(monthsToAdd);
    }

    // Helper methods for finding lookup data
    private <T> T getRandomElement(List<T> list) {
        if (list == null || list.isEmpty()) {
            logger.warn("Attempting to get random element from null or empty list");
            return null;
        }
        return list.get(random.nextInt(list.size()));
    }

    private UserTypeEntity getUserTypeByCode(String code) {
        return userTypes.stream()
            .filter(ut -> code.equals(ut.getCode()))
            .findFirst()
            .orElse(null);
    }

    private RequestStatusEntity getRequestStatusByCode(String code) {
        return requestStatuses.stream()
            .filter(rs -> code.equals(rs.getCode()))
            .findFirst()
            .orElse(null);
    }

    private ProfileStatusEntity getProfileStatusByCode(String code) {
        return profileStatuses.stream()
            .filter(ps -> code.equals(ps.getCode()))
            .findFirst()
            .orElse(null);
    }

    private UserEntity findHiringManager(UserEntity fallback) {
        List<UserEntity> hiringManagers = userRepository.findAll().stream()
            .filter(u -> "hiring-manager".equals(u.getUserType().getCode()))
            .toList();

        if (hiringManagers.isEmpty()) {
            return fallback; // Use fallback if no hiring managers exist
        }

        return getRandomElement(hiringManagers);
    }

    private void validateSeededData() {
        if (config.isLogSeedingProgress()) {
            logger.info("Validating seeded data relationships...");
        }

        long userCount = userRepository.count();
        long profileCount = profileRepository.count();
        long requestCount = requestRepository.count();

        logger.info("Data validation summary: {} users, {} profiles, {} requests",
                   userCount, profileCount, requestCount);

        // Additional validation logic can be added here
        validateUserDistribution();
        validateProfileDistribution();
        validateRequestDistribution();
    }

    private void validateUserDistribution() {
        List<UserEntity> users = userRepository.findAll();
        long adminCount = users.stream().filter(u -> "admin".equals(u.getUserType().getCode())).count();
        long hmCount = users.stream().filter(u -> "hiring-manager".equals(u.getUserType().getCode())).count();
        long empCount = users.stream().filter(u -> "employee".equals(u.getUserType().getCode())).count();

        logger.info("User type validation: {} admins, {} hiring managers, {} employees",
                   adminCount, hmCount, empCount);
    }

    private void validateProfileDistribution() {
        List<ProfileEntity> profiles = profileRepository.findAll();
        long activeCount = profiles.stream()
            .filter(p -> "ACTIVE".equals(p.getProfileStatus().getCode()))
            .count();

        logger.info("Profile status validation: {} active profiles out of {}",
                   activeCount, profiles.size());
    }

    private void validateRequestDistribution() {
        List<RequestEntity> requests = requestRepository.findAll();
        long approvedCount = requests.stream()
            .filter(r -> "APPROVED".equals(r.getRequestStatus().getCode()))
            .count();

        logger.info("Request status validation: {} approved requests out of {}",
                   approvedCount, requests.size());
    }

    private void logSeeded(String entityType, int count) {
        if (config.isLogSeedingProgress()) {
            logger.info("Seeded {} {} records", count, entityType);
        }
    }
}
