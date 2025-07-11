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
import ca.gov.dtsstn.vacman.api.data.entity.ClassificationEntity;
import ca.gov.dtsstn.vacman.api.data.entity.EmploymentTenureEntity;
import ca.gov.dtsstn.vacman.api.data.entity.LanguageEntity;
import ca.gov.dtsstn.vacman.api.data.entity.LanguageRequirementEntity;
import ca.gov.dtsstn.vacman.api.data.entity.ProfileEntity;
import ca.gov.dtsstn.vacman.api.data.entity.ProfileStatusEntity;
import ca.gov.dtsstn.vacman.api.data.entity.RequestEntity;
import ca.gov.dtsstn.vacman.api.data.entity.RequestStatusEntity;
import ca.gov.dtsstn.vacman.api.data.entity.SecurityClearanceEntity;
import ca.gov.dtsstn.vacman.api.data.entity.SelectionProcessTypeEntity;
import ca.gov.dtsstn.vacman.api.data.entity.UserEntity;
import ca.gov.dtsstn.vacman.api.data.entity.UserTypeEntity;
import ca.gov.dtsstn.vacman.api.data.entity.WorkScheduleEntity;
import ca.gov.dtsstn.vacman.api.data.entity.WorkUnitEntity;
import ca.gov.dtsstn.vacman.api.data.repository.AppointmentNonAdvertisedRepository;
import ca.gov.dtsstn.vacman.api.data.repository.ClassificationRepository;
import ca.gov.dtsstn.vacman.api.data.repository.EmploymentTenureRepository;
import ca.gov.dtsstn.vacman.api.data.repository.LanguageRepository;
import ca.gov.dtsstn.vacman.api.data.repository.LanguageRequirementRepository;
import ca.gov.dtsstn.vacman.api.data.repository.ProfileRepository;
import ca.gov.dtsstn.vacman.api.data.repository.ProfileStatusRepository;
import ca.gov.dtsstn.vacman.api.data.repository.RequestRepository;
import ca.gov.dtsstn.vacman.api.data.repository.RequestStatusRepository;
import ca.gov.dtsstn.vacman.api.data.repository.SecurityClearanceRepository;
import ca.gov.dtsstn.vacman.api.data.repository.SelectionProcessTypeRepository;
import ca.gov.dtsstn.vacman.api.data.repository.UserRepository;
import ca.gov.dtsstn.vacman.api.data.repository.UserTypeRepository;
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
        if (config.isLogSeedingProgress()) {
            logger.info("Starting main data seeding...");
        }

        // Validate configuration
        config.validate();

        // Cache lookup data for better performance
        cacheLookupData();

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

    private void cacheLookupData() {
        userTypes = userTypeRepository.findAll();
        languages = languageRepository.findAll();
        classifications = classificationRepository.findAll();
        securityClearances = securityClearanceRepository.findAll();
        requestStatuses = requestStatusRepository.findAll();
        workUnits = workUnitRepository.findAll();
        profileStatuses = profileStatusRepository.findAll();

        // Cache additional lookup data required for requests
        appointmentNonAdvertiseds = appointmentNonAdvertisedRepository.findAll();
        languageRequirements = languageRequirementRepository.findAll();
        employmentTenures = employmentTenureRepository.findAll();
        selectionProcessTypes = selectionProcessTypeRepository.findAll();
        workSchedules = workScheduleRepository.findAll();
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

        // Calculate how many users we need - ensure we have enough for all profiles
        int requiredUsers = Math.max(config.getUserCount(), config.getProfileCount());

        // Calculate user type distribution
        int adminCount = (int) (requiredUsers * config.getAdminUserPercentage());
        int hiringManagerCount = (int) (requiredUsers * config.getHiringManagerPercentage());
        int employeeCount = requiredUsers - adminCount - hiringManagerCount;

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

        for (int i = 0; i < count; i++) {
            String firstName = firstNames[random.nextInt(firstNames.length)];
            String lastName = lastNames[random.nextInt(lastNames.length)];
            String email = generateUniqueEmail(firstName, lastName, users.size() + i + 1);

            UserEntity user = createUser(email, firstName, lastName, userType, getRandomElement(languages));
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

        List<ProfileEntity> profiles = new ArrayList<>();
        int profileCount = config.getProfileCount();

        // Calculate profile status distribution
        int activeCount = (int) (profileCount * config.getActiveProfilePercentage());
        int inactiveCount = (int) (profileCount * config.getInactiveProfilePercentage());
        int pendingCount = profileCount - activeCount - inactiveCount;

        // Create profiles with proper status distribution
        createProfilesForStatus("ACTIVE", activeCount, profiles, users);
        createProfilesForStatus("INACTIVE", inactiveCount, profiles, users);
        createProfilesForStatus("PENDING", pendingCount, profiles, users);

        // Shuffle to randomize order
        Collections.shuffle(profiles, random);

        profileRepository.saveAll(profiles);
        logSeeded("Profiles", profiles.size());

        if (config.isLogSeedingProgress()) {
            logger.info("Profile distribution: {} active, {} inactive, {} pending",
                       activeCount, inactiveCount, pendingCount);
        }
    }

    private void createProfilesForStatus(String statusCode, int count, List<ProfileEntity> profiles, List<UserEntity> users) {
        ProfileStatusEntity status = getProfileStatusByCode(statusCode);
        if (status == null) {
            // Fall back to random status if specific status not found
            status = getRandomElement(profileStatuses);
        }

        for (int i = 0; i < count; i++) {
            UserEntity user = users.get(i % users.size()); // Cycle through available users
            UserEntity hrAdvisor = findHrAdvisor(users);

            ProfileEntity profile = createProfile(
                user,
                getRandomElement(classifications),
                hrAdvisor,
                getRandomElement(workUnits),
                status
            );
            profiles.add(profile);
        }
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
        user.setCreatedBy("SYSTEM");
        return user;
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
        profile.setAdditionalComment(generateProfileComment(user, profileStatus));
        profile.setCreatedBy("SYSTEM");
        return profile;
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

        request.setCreatedBy("SYSTEM");
        return request;
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
        if (list.isEmpty()) return null;
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
