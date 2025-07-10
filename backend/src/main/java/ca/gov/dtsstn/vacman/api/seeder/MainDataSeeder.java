package ca.gov.dtsstn.vacman.api.seeder;

import java.time.LocalDate;
import java.util.Arrays;
import java.util.List;
import java.util.Random;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import ca.gov.dtsstn.vacman.api.config.DatabaseSeederConfig;
import ca.gov.dtsstn.vacman.api.data.entity.ClassificationEntity;
import ca.gov.dtsstn.vacman.api.data.entity.EducationLevelEntity;
import ca.gov.dtsstn.vacman.api.data.entity.EventEntity;
import ca.gov.dtsstn.vacman.api.data.entity.LanguageEntity;
import ca.gov.dtsstn.vacman.api.data.entity.ProfileEntity;
import ca.gov.dtsstn.vacman.api.data.entity.ProfileStatusEntity;
import ca.gov.dtsstn.vacman.api.data.entity.RequestEntity;
import ca.gov.dtsstn.vacman.api.data.entity.RequestStatusEntity;
import ca.gov.dtsstn.vacman.api.data.entity.SecurityClearanceEntity;
import ca.gov.dtsstn.vacman.api.data.entity.UserEntity;
import ca.gov.dtsstn.vacman.api.data.entity.UserTypeEntity;
import ca.gov.dtsstn.vacman.api.data.entity.WorkUnitEntity;
import ca.gov.dtsstn.vacman.api.data.repository.CityProfileRepository;
import ca.gov.dtsstn.vacman.api.data.repository.ClassificationProfileRepository;
import ca.gov.dtsstn.vacman.api.data.repository.ClassificationRepository;
import ca.gov.dtsstn.vacman.api.data.repository.EducationLevelRepository;
import ca.gov.dtsstn.vacman.api.data.repository.EventRepository;
import ca.gov.dtsstn.vacman.api.data.repository.LanguageRepository;
import ca.gov.dtsstn.vacman.api.data.repository.ProfileEmploymentTenureRepository;
import ca.gov.dtsstn.vacman.api.data.repository.ProfileLanguageReferralTypeRepository;
import ca.gov.dtsstn.vacman.api.data.repository.ProfileRepository;
import ca.gov.dtsstn.vacman.api.data.repository.ProfileRequestRepository;
import ca.gov.dtsstn.vacman.api.data.repository.ProfileStatusRepository;
import ca.gov.dtsstn.vacman.api.data.repository.RequestRepository;
import ca.gov.dtsstn.vacman.api.data.repository.RequestStatusRepository;
import ca.gov.dtsstn.vacman.api.data.repository.SecurityClearanceRepository;
import ca.gov.dtsstn.vacman.api.data.repository.UserRepository;
import ca.gov.dtsstn.vacman.api.data.repository.UserTypeRepository;
import ca.gov.dtsstn.vacman.api.data.repository.WorkUnitRepository;

/**
 * Seeds main business data tables with sample data.
 * These tables contain the core business entities of the application.
 */
@Component
@Profile({"dev", "local", "h2"})
public class MainDataSeeder {

    private static final Logger logger = LoggerFactory.getLogger(MainDataSeeder.class);

    private final DatabaseSeederConfig config;
    private final Random random = new Random(12345); // Fixed seed for reproducible data

    // Main table repositories
    private final UserRepository userRepository;
    private final RequestRepository requestRepository;
    private final EventRepository eventRepository;
    private final ProfileRepository profileRepository;

    // Child entity repositories for proper deletion order
    private final CityProfileRepository cityProfileRepository;
    private final ClassificationProfileRepository classificationProfileRepository;
    private final ProfileEmploymentTenureRepository profileEmploymentTenureRepository;
    private final ProfileLanguageReferralTypeRepository profileLanguageReferralTypeRepository;
    private final ProfileRequestRepository profileRequestRepository;

    // Lookup repositories for foreign key references
    private final UserTypeRepository userTypeRepository;
    private final LanguageRepository languageRepository;
    private final ClassificationRepository classificationRepository;
    private final EducationLevelRepository educationLevelRepository;
    private final SecurityClearanceRepository securityClearanceRepository;
    private final RequestStatusRepository requestStatusRepository;
    private final WorkUnitRepository workUnitRepository;
    private final ProfileStatusRepository profileStatusRepository;

    public MainDataSeeder(
        DatabaseSeederConfig config,
        UserRepository userRepository,
        RequestRepository requestRepository,
        EventRepository eventRepository,
        ProfileRepository profileRepository,
        CityProfileRepository cityProfileRepository,
        ClassificationProfileRepository classificationProfileRepository,
        ProfileEmploymentTenureRepository profileEmploymentTenureRepository,
        ProfileLanguageReferralTypeRepository profileLanguageReferralTypeRepository,
        ProfileRequestRepository profileRequestRepository,
        UserTypeRepository userTypeRepository,
        LanguageRepository languageRepository,
        ClassificationRepository classificationRepository,
        EducationLevelRepository educationLevelRepository,
        SecurityClearanceRepository securityClearanceRepository,
        RequestStatusRepository requestStatusRepository,
        WorkUnitRepository workUnitRepository,
        ProfileStatusRepository profileStatusRepository
    ) {
        this.config = config;
        this.userRepository = userRepository;
        this.requestRepository = requestRepository;
        this.eventRepository = eventRepository;
        this.profileRepository = profileRepository;
        this.cityProfileRepository = cityProfileRepository;
        this.classificationProfileRepository = classificationProfileRepository;
        this.profileEmploymentTenureRepository = profileEmploymentTenureRepository;
        this.profileLanguageReferralTypeRepository = profileLanguageReferralTypeRepository;
        this.profileRequestRepository = profileRequestRepository;
        this.userTypeRepository = userTypeRepository;
        this.languageRepository = languageRepository;
        this.classificationRepository = classificationRepository;
        this.educationLevelRepository = educationLevelRepository;
        this.securityClearanceRepository = securityClearanceRepository;
        this.requestStatusRepository = requestStatusRepository;
        this.workUnitRepository = workUnitRepository;
        this.profileStatusRepository = profileStatusRepository;
    }

    @Transactional
    public void seedMainData() {
        if (config.isLogSeedingProgress()) {
            logger.info("Seeding main data tables...");
        }

        seedUsers();
        seedProfiles();
        seedRequests();
        seedEvents();

        if (config.isLogSeedingProgress()) {
            logger.info("Main data tables seeded successfully");
        }
    }    @Transactional
    public void clearMainData() {
        if (config.isLogSeedingProgress()) {
            logger.info("Clearing main data tables...");
        }

        // Clear in dependency order - child entities first to avoid cascade issues
        eventRepository.deleteAll();
        requestRepository.deleteAll();

        // Clear profile child entities first before deleting profiles
        profileRequestRepository.deleteAll();
        profileLanguageReferralTypeRepository.deleteAll();
        profileEmploymentTenureRepository.deleteAll();
        classificationProfileRepository.deleteAll();
        cityProfileRepository.deleteAll();

        // Now safe to delete profiles - cascade will handle user.profile references
        profileRepository.deleteAll();

        userRepository.deleteAll();
    }

    private void seedUsers() {
        if (userRepository.count() > 0) return;

        List<UserTypeEntity> userTypes = userTypeRepository.findAll();
        List<LanguageEntity> languages = languageRepository.findAll();

        if (userTypes.isEmpty() || languages.isEmpty()) {
            logger.warn("Cannot seed users: missing lookup data (UserTypes: {}, Languages: {})", userTypes.size(), languages.size());
            return;
        }

        List<UserEntity> users = Arrays.asList(
            createUser(1001L, "john.doe@example.com", "John", "Doe", getUserType(userTypes, "ADMIN"), getRandomElement(languages)),
            createUser(1002L, "jane.smith@example.com", "Jane", "Smith", getUserType(userTypes, "MANAGER"), getRandomElement(languages)),
            createUser(1003L, "bob.wilson@example.com", "Bob", "Wilson", getUserType(userTypes, "EMPLOYEE"), getRandomElement(languages)),
            createUser(1004L, "alice.brown@example.com", "Alice", "Brown", getUserType(userTypes, "EMPLOYEE"), getRandomElement(languages)),
            createUser(1005L, "charlie.davis@example.com", "Charlie", "Davis", getUserType(userTypes, "CONTRACTOR"), getRandomElement(languages))
        );

        userRepository.saveAll(users);
        logSeeded("Users", users.size());
    }

    private void seedProfiles() {
        if (profileRepository.count() > 0) return;

        List<UserEntity> users = userRepository.findAll();
        List<ClassificationEntity> classifications = classificationRepository.findAll();
        List<EducationLevelEntity> educationLevels = educationLevelRepository.findAll();
        List<WorkUnitEntity> workUnits = workUnitRepository.findAll();
        List<ProfileStatusEntity> profileStatuses = profileStatusRepository.findAll();

        if (users.isEmpty()) {
            logger.warn("Cannot seed profiles: no users available");
            return;
        }

        if (profileStatuses.isEmpty()) {
            logger.warn("Cannot seed profiles: no profile statuses available");
            return;
        }

        List<ProfileEntity> profiles = users.stream()
            .map(user -> createProfile(
                user,
                getRandomElement(classifications),
                getRandomElement(educationLevels),
                getRandomElement(workUnits),
                getRandomElement(profileStatuses)
            ))
            .toList();

        profileRepository.saveAll(profiles);
        logSeeded("Profiles", profiles.size());
    }

    private void seedRequests() {
        if (requestRepository.count() > 0) return;

        List<UserEntity> users = userRepository.findAll();
        List<SecurityClearanceEntity> clearances = securityClearanceRepository.findAll();
        List<WorkUnitEntity> workUnits = workUnitRepository.findAll();
        List<ClassificationEntity> classifications = classificationRepository.findAll();
        List<RequestStatusEntity> statuses = requestStatusRepository.findAll();

        if (users.isEmpty() || clearances.isEmpty() || workUnits.isEmpty() || classifications.isEmpty() || statuses.isEmpty()) {
            logger.warn("Cannot seed requests: missing lookup data");
            return;
        }

        // Create sample requests
        List<RequestEntity> requests = Arrays.asList(
            createRequest(
                "Software Developer Position",
                "Poste de développeur logiciel",
                getRandomElement(clearances),
                getRandomElement(users), // reviewedBy
                getRandomElement(users), // approvedBy
                getRandomElement(workUnits),
                getRandomElement(classifications),
                getRequestStatus(statuses, "SUBMITTED")
            ),
            createRequest(
                "Data Analyst Role",
                "Rôle d'analyste de données",
                getRandomElement(clearances),
                getRandomElement(users), // reviewedBy
                getRandomElement(users), // approvedBy
                getRandomElement(workUnits),
                getRandomElement(classifications),
                getRequestStatus(statuses, "APPROVED")
            )
        );

        requestRepository.saveAll(requests);
        logSeeded("Requests", requests.size());
    }

    private void seedEvents() {
        if (eventRepository.count() > 0) return;

        List<EventEntity> events = Arrays.asList(
            createEvent("System Startup", "Application started successfully"),
            createEvent("User Login", "User authentication event"),
            createEvent("Data Seeding", "Database seeding completed"),
            createEvent("Profile Update", "User profile information updated")
        );

        eventRepository.saveAll(events);
        logSeeded("Events", events.size());
    }

    // Helper methods to create entities
    private UserEntity createUser(Long userId, String email, String firstName, String lastName, UserTypeEntity userType, LanguageEntity language) {
        UserEntity user = new UserEntity();
        user.setBusinessEmailAddress(email);
        user.setFirstName(firstName);
        user.setLastName(lastName);
        user.setUserType(userType);
        user.setLanguage(language);
        user.setNetworkName("NET" + userId);
        user.setUuName("UU" + userId);
        user.setCreatedBy("SYSTEM");
        return user;
    }

    private ProfileEntity createProfile(UserEntity user, ClassificationEntity classification,
                                      EducationLevelEntity education, WorkUnitEntity workUnit,
                                      ProfileStatusEntity profileStatus) {
        ProfileEntity profile = new ProfileEntity();
        profile.setUser(user);
        profile.setClassification(classification);
        profile.setEducationLevel(education);
        profile.setWorkUnit(workUnit);
        profile.setProfileStatus(profileStatus);
        profile.setComment("Sample profile for " + user.getFirstName() + " " + user.getLastName());
        profile.setCreatedBy("SYSTEM");
        return profile;
    }

    private RequestEntity createRequest(String nameEn, String nameFr, SecurityClearanceEntity clearance,
                                       UserEntity reviewedBy, UserEntity approvedBy, WorkUnitEntity workUnit,
                                       ClassificationEntity classification, RequestStatusEntity status) {
        RequestEntity request = new RequestEntity();
        request.setRequestNameEn(nameEn);
        request.setRequestNameFr(nameFr);
        request.setSecurityClearance(clearance);
        request.setReviewedBy(reviewedBy);
        request.setApprovedBy(approvedBy);
        request.setWorkUnit(workUnit);
        request.setClassification(classification);
        request.setRequestStatus(status);

        // Set required start date - current date plus random days (0-30)
        LocalDate startDate = LocalDate.now().plusDays(random.nextInt(31));
        request.setStartDate(startDate);

        // Set optional end date - start date plus 6-12 months
        LocalDate endDate = startDate.plusMonths(6 + random.nextInt(7));
        request.setEndDate(endDate);

        request.setCreatedBy("SYSTEM");
        return request;
    }

    private EventEntity createEvent(String name, String description) {
        EventEntity event = new EventEntity();
        event.setEventName(name);
        event.setEventDescription(description);
        event.setCreatedBy("SYSTEM");
        return event;
    }

    // Helper methods for finding lookup data
    private <T> T getRandomElement(List<T> list) {
        if (list.isEmpty()) return null;
        return list.get(random.nextInt(list.size()));
    }

    private UserTypeEntity getUserType(List<UserTypeEntity> userTypes, String code) {
        return userTypes.stream()
            .filter(ut -> code.equals(ut.getCode()))
            .findFirst()
            .orElse(getRandomElement(userTypes));
    }

    private RequestStatusEntity getRequestStatus(List<RequestStatusEntity> statuses, String code) {
        return statuses.stream()
            .filter(rs -> code.equals(rs.getCode()))
            .findFirst()
            .orElse(getRandomElement(statuses));
    }

    private void logSeeded(String entityType, int count) {
        if (config.isLogSeedingProgress()) {
            logger.info("Seeded {} {} records", count, entityType);
        }
    }
}
