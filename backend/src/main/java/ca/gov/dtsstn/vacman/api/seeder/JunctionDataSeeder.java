package ca.gov.dtsstn.vacman.api.seeder;

import java.util.Arrays;
import java.util.List;
import java.util.Random;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import ca.gov.dtsstn.vacman.api.config.DatabaseSeederConfig;
import ca.gov.dtsstn.vacman.api.data.entity.CityEntity;
import ca.gov.dtsstn.vacman.api.data.entity.CityProfileEntity;
import ca.gov.dtsstn.vacman.api.data.entity.ClassificationEntity;
import ca.gov.dtsstn.vacman.api.data.entity.ClassificationProfileEntity;
import ca.gov.dtsstn.vacman.api.data.entity.EmploymentTenureEntity;
import ca.gov.dtsstn.vacman.api.data.entity.LanguageReferralTypeEntity;
import ca.gov.dtsstn.vacman.api.data.entity.ProfileEmploymentTenureEntity;
import ca.gov.dtsstn.vacman.api.data.entity.ProfileEntity;
import ca.gov.dtsstn.vacman.api.data.entity.ProfileRequestEntity;
import ca.gov.dtsstn.vacman.api.data.entity.RequestCityEntity;
import ca.gov.dtsstn.vacman.api.data.entity.RequestEmploymentTenureEntity;
import ca.gov.dtsstn.vacman.api.data.entity.RequestEntity;
import ca.gov.dtsstn.vacman.api.data.entity.RequestLanguageReferralTypeEntity;
import ca.gov.dtsstn.vacman.api.data.repository.CityProfileRepository;
import ca.gov.dtsstn.vacman.api.data.repository.CityRepository;
import ca.gov.dtsstn.vacman.api.data.repository.ClassificationProfileRepository;
import ca.gov.dtsstn.vacman.api.data.repository.ClassificationRepository;
import ca.gov.dtsstn.vacman.api.data.repository.EmploymentTenureRepository;
import ca.gov.dtsstn.vacman.api.data.repository.LanguageReferralTypeRepository;
import ca.gov.dtsstn.vacman.api.data.repository.ProfileEmploymentTenureRepository;
import ca.gov.dtsstn.vacman.api.data.repository.ProfileRepository;
import ca.gov.dtsstn.vacman.api.data.repository.ProfileRequestRepository;
import ca.gov.dtsstn.vacman.api.data.repository.RequestCityRepository;
import ca.gov.dtsstn.vacman.api.data.repository.RequestEmploymentTenureRepository;
import ca.gov.dtsstn.vacman.api.data.repository.RequestLanguageReferralTypeRepository;
import ca.gov.dtsstn.vacman.api.data.repository.RequestRepository;

/**
 * Seeds junction/relationship tables with sample data.
 * These tables represent many-to-many relationships between entities.
 */
@Component
@Profile({"dev", "local", "h2"})
public class JunctionDataSeeder {

    private static final Logger logger = LoggerFactory.getLogger(JunctionDataSeeder.class);

    private final DatabaseSeederConfig config;
    private final Random random = new Random(54321); // Fixed seed for reproducible data

    // Junction table repositories
    private final ProfileRequestRepository profileRequestRepository;
    private final RequestCityRepository requestCityRepository;
    private final RequestEmploymentTenureRepository requestEmploymentTenureRepository;
    private final RequestLanguageReferralTypeRepository requestLanguageReferralTypeRepository;
    private final CityProfileRepository cityProfileRepository;
    private final ClassificationProfileRepository classificationProfileRepository;
    private final ProfileEmploymentTenureRepository profileEmploymentTenureRepository;

    // Main entity repositories for foreign key references
    private final ProfileRepository profileRepository;
    private final RequestRepository requestRepository;
    private final CityRepository cityRepository;
    private final EmploymentTenureRepository employmentTenureRepository;
    private final LanguageReferralTypeRepository languageReferralTypeRepository;
    private final ClassificationRepository classificationRepository;

    public JunctionDataSeeder(
        DatabaseSeederConfig config,
        ProfileRequestRepository profileRequestRepository,
        RequestCityRepository requestCityRepository,
        RequestEmploymentTenureRepository requestEmploymentTenureRepository,
        RequestLanguageReferralTypeRepository requestLanguageReferralTypeRepository,
        CityProfileRepository cityProfileRepository,
        ClassificationProfileRepository classificationProfileRepository,
        ProfileEmploymentTenureRepository profileEmploymentTenureRepository,
        ProfileRepository profileRepository,
        RequestRepository requestRepository,
        CityRepository cityRepository,
        EmploymentTenureRepository employmentTenureRepository,
        LanguageReferralTypeRepository languageReferralTypeRepository,
        ClassificationRepository classificationRepository
    ) {
        this.config = config;
        this.profileRequestRepository = profileRequestRepository;
        this.requestCityRepository = requestCityRepository;
        this.requestEmploymentTenureRepository = requestEmploymentTenureRepository;
        this.requestLanguageReferralTypeRepository = requestLanguageReferralTypeRepository;
        this.cityProfileRepository = cityProfileRepository;
        this.classificationProfileRepository = classificationProfileRepository;
        this.profileEmploymentTenureRepository = profileEmploymentTenureRepository;
        this.profileRepository = profileRepository;
        this.requestRepository = requestRepository;
        this.cityRepository = cityRepository;
        this.employmentTenureRepository = employmentTenureRepository;
        this.languageReferralTypeRepository = languageReferralTypeRepository;
        this.classificationRepository = classificationRepository;
    }

    @Transactional
    public void seedJunctionData() {
        if (config.isLogSeedingProgress()) {
            logger.info("Seeding junction data tables...");
        }

        seedProfileRequests();
        seedRequestCities();
        seedRequestEmploymentTenures();
        seedRequestLanguageReferralTypes();
        seedCityProfiles();
        seedClassificationProfiles();
        seedProfileEmploymentTenures();

        if (config.isLogSeedingProgress()) {
            logger.info("Junction data tables seeded successfully");
        }
    }

    @Transactional
    public void clearJunctionData() {
        if (config.isLogSeedingProgress()) {
            logger.info("Clearing junction data tables...");
        }

        // Clear all junction tables
        profileEmploymentTenureRepository.deleteAll();
        classificationProfileRepository.deleteAll();
        cityProfileRepository.deleteAll();
        requestLanguageReferralTypeRepository.deleteAll();
        requestEmploymentTenureRepository.deleteAll();
        requestCityRepository.deleteAll();
        profileRequestRepository.deleteAll();
    }

    private void seedProfileRequests() {
        if (profileRequestRepository.count() > 0) return;

        List<ProfileEntity> profiles = profileRepository.findAll();
        List<RequestEntity> requests = requestRepository.findAll();

        if (profiles.isEmpty() || requests.isEmpty()) {
            logger.warn("Cannot seed profile requests: missing data (Profiles: {}, Requests: {})",
                       profiles.size(), requests.size());
            return;
        }

        // Create some profile-request relationships
        List<ProfileRequestEntity> profileRequests = Arrays.asList(
            createProfileRequest(profiles.get(0), getRandomElement(requests)),
            createProfileRequest(profiles.get(1), getRandomElement(requests)),
            createProfileRequest(profiles.get(2), getRandomElement(requests))
        );

        profileRequestRepository.saveAll(profileRequests);
        logSeeded("Profile Requests", profileRequests.size());
    }

    private void seedRequestCities() {
        if (requestCityRepository.count() > 0) return;

        List<RequestEntity> requests = requestRepository.findAll();
        List<CityEntity> cities = cityRepository.findAll();

        if (requests.isEmpty() || cities.isEmpty()) {
            logger.warn("Cannot seed request cities: missing data");
            return;
        }

        // Associate requests with cities
        List<RequestCityEntity> requestCities = requests.stream()
            .flatMap(request -> Arrays.asList(
                createRequestCity(request, getRandomElement(cities)),
                createRequestCity(request, getRandomElement(cities))
            ).stream())
            .toList();

        requestCityRepository.saveAll(requestCities);
        logSeeded("Request Cities", requestCities.size());
    }

    private void seedRequestEmploymentTenures() {
        if (requestEmploymentTenureRepository.count() > 0) return;

        List<RequestEntity> requests = requestRepository.findAll();
        List<EmploymentTenureEntity> tenures = employmentTenureRepository.findAll();

        if (requests.isEmpty() || tenures.isEmpty()) {
            logger.warn("Cannot seed request employment tenures: missing data");
            return;
        }

        List<RequestEmploymentTenureEntity> requestTenures = requests.stream()
            .map(request -> createRequestEmploymentTenure(request, getRandomElement(tenures)))
            .toList();

        requestEmploymentTenureRepository.saveAll(requestTenures);
        logSeeded("Request Employment Tenures", requestTenures.size());
    }

    private void seedRequestLanguageReferralTypes() {
        if (requestLanguageReferralTypeRepository.count() > 0) return;

        List<RequestEntity> requests = requestRepository.findAll();
        List<LanguageReferralTypeEntity> types = languageReferralTypeRepository.findAll();

        if (requests.isEmpty() || types.isEmpty()) {
            logger.warn("Cannot seed request language referral types: missing data");
            return;
        }

        List<RequestLanguageReferralTypeEntity> requestTypes = requests.stream()
            .map(request -> createRequestLanguageReferralType(request, getRandomElement(types)))
            .toList();

        requestLanguageReferralTypeRepository.saveAll(requestTypes);
        logSeeded("Request Language Referral Types", requestTypes.size());
    }

    private void seedCityProfiles() {
        if (cityProfileRepository.count() > 0) return;

        List<CityEntity> cities = cityRepository.findAll();
        List<ProfileEntity> profiles = profileRepository.findAll();

        if (cities.isEmpty() || profiles.isEmpty()) {
            logger.warn("Cannot seed city profiles: missing data");
            return;
        }

        List<CityProfileEntity> cityProfiles = profiles.stream()
            .map(profile -> createCityProfile(getRandomElement(cities), profile))
            .toList();

        cityProfileRepository.saveAll(cityProfiles);
        logSeeded("City Profiles", cityProfiles.size());
    }

    private void seedClassificationProfiles() {
        if (classificationProfileRepository.count() > 0) return;

        List<ClassificationEntity> classifications = classificationRepository.findAll();
        List<ProfileEntity> profiles = profileRepository.findAll();

        if (classifications.isEmpty() || profiles.isEmpty()) {
            logger.warn("Cannot seed classification profiles: missing data");
            return;
        }

        List<ClassificationProfileEntity> classificationProfiles = profiles.stream()
            .map(profile -> createClassificationProfile(getRandomElement(classifications), profile))
            .toList();

        classificationProfileRepository.saveAll(classificationProfiles);
        logSeeded("Classification Profiles", classificationProfiles.size());
    }

    private void seedProfileEmploymentTenures() {
        if (profileEmploymentTenureRepository.count() > 0) return;

        List<ProfileEntity> profiles = profileRepository.findAll();
        List<EmploymentTenureEntity> tenures = employmentTenureRepository.findAll();

        if (profiles.isEmpty() || tenures.isEmpty()) {
            logger.warn("Cannot seed profile employment tenures: missing data");
            return;
        }

        List<ProfileEmploymentTenureEntity> profileTenures = profiles.stream()
            .map(profile -> createProfileEmploymentTenure(profile, getRandomElement(tenures)))
            .toList();

        profileEmploymentTenureRepository.saveAll(profileTenures);
        logSeeded("Profile Employment Tenures", profileTenures.size());
    }

    // Helper methods to create junction entities
    private ProfileRequestEntity createProfileRequest(ProfileEntity profile, RequestEntity request) {
        ProfileRequestEntity entity = new ProfileRequestEntity();
        entity.setProfile(profile);
        entity.setRequest(request);
        entity.setCreatedBy("SYSTEM");
        return entity;
    }

    private RequestCityEntity createRequestCity(RequestEntity request, CityEntity city) {
        RequestCityEntity entity = new RequestCityEntity();
        entity.setRequest(request);
        entity.setCity(city);
        entity.setCreatedBy("SYSTEM");
        return entity;
    }

    private RequestEmploymentTenureEntity createRequestEmploymentTenure(RequestEntity request, EmploymentTenureEntity tenure) {
        RequestEmploymentTenureEntity entity = new RequestEmploymentTenureEntity();
        entity.setRequest(request);
        entity.setEmploymentTenure(tenure);
        entity.setCreatedBy("SYSTEM");
        return entity;
    }

    private RequestLanguageReferralTypeEntity createRequestLanguageReferralType(RequestEntity request, LanguageReferralTypeEntity type) {
        RequestLanguageReferralTypeEntity entity = new RequestLanguageReferralTypeEntity();
        entity.setRequest(request);
        entity.setLanguageReferralType(type);
        entity.setCreatedBy("SYSTEM");
        return entity;
    }

    private CityProfileEntity createCityProfile(CityEntity city, ProfileEntity profile) {
        CityProfileEntity entity = new CityProfileEntity();
        entity.setCity(city);
        entity.setProfile(profile);
        entity.setCreatedBy("SYSTEM");
        return entity;
    }

    private ClassificationProfileEntity createClassificationProfile(ClassificationEntity classification, ProfileEntity profile) {
        ClassificationProfileEntity entity = new ClassificationProfileEntity();
        entity.setClassification(classification);
        entity.setProfile(profile);
        entity.setCreatedBy("SYSTEM");
        return entity;
    }

    private ProfileEmploymentTenureEntity createProfileEmploymentTenure(ProfileEntity profile, EmploymentTenureEntity tenure) {
        ProfileEmploymentTenureEntity entity = new ProfileEmploymentTenureEntity();
        entity.setProfile(profile);
        entity.setEmploymentTenure(tenure);
        entity.setCreatedBy("SYSTEM");
        return entity;
    }

    // Helper methods
    private <T> T getRandomElement(List<T> list) {
        if (list.isEmpty()) return null;
        return list.get(random.nextInt(list.size()));
    }

    private void logSeeded(String entityType, int count) {
        if (config.isLogSeedingProgress()) {
            logger.info("Seeded {} {} records", count, entityType);
        }
    }
}
