package ca.gov.dtsstn.vacman.api.seeder;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Random;
import java.util.Set;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import ca.gov.dtsstn.vacman.api.config.DatabaseSeederConfig;
import ca.gov.dtsstn.vacman.api.data.entity.CityEntity;
import ca.gov.dtsstn.vacman.api.data.entity.CityProfileEntity;
import ca.gov.dtsstn.vacman.api.data.entity.ClassificationEntity;
import ca.gov.dtsstn.vacman.api.data.entity.ClassificationProfileEntity;
import ca.gov.dtsstn.vacman.api.data.entity.EmploymentEquityEntity;
import ca.gov.dtsstn.vacman.api.data.entity.EmploymentOpportunityEntity;
import ca.gov.dtsstn.vacman.api.data.entity.LanguageReferralTypeEntity;
import ca.gov.dtsstn.vacman.api.data.entity.ProfileEmploymentOpportunityEntity;
import ca.gov.dtsstn.vacman.api.data.entity.ProfileEntity;
import ca.gov.dtsstn.vacman.api.data.entity.ProfileLanguageReferralTypeEntity;
import ca.gov.dtsstn.vacman.api.data.entity.RequestCityEntity;
import ca.gov.dtsstn.vacman.api.data.entity.RequestEmploymentEquityEntity;
import ca.gov.dtsstn.vacman.api.data.entity.RequestEntity;
import ca.gov.dtsstn.vacman.api.data.repository.CityProfileRepository;
import ca.gov.dtsstn.vacman.api.data.repository.CityRepository;
import ca.gov.dtsstn.vacman.api.data.repository.ClassificationProfileRepository;
import ca.gov.dtsstn.vacman.api.data.repository.ClassificationRepository;
import ca.gov.dtsstn.vacman.api.data.repository.EmploymentEquityRepository;
import ca.gov.dtsstn.vacman.api.data.repository.EmploymentOpportunityRepository;
import ca.gov.dtsstn.vacman.api.data.repository.LanguageReferralTypeRepository;
import ca.gov.dtsstn.vacman.api.data.repository.ProfileEmploymentOpportunityRepository;
import ca.gov.dtsstn.vacman.api.data.repository.ProfileLanguageReferralTypeRepository;
import ca.gov.dtsstn.vacman.api.data.repository.ProfileRepository;
import ca.gov.dtsstn.vacman.api.data.repository.RequestCityRepository;
import ca.gov.dtsstn.vacman.api.data.repository.RequestEmploymentEquityRepository;
import ca.gov.dtsstn.vacman.api.data.repository.RequestRepository;

/**
 * Enhanced junction data seeder with configurable relationship management.
 * Seeds junction/relationship tables based on the DDL structure with proper validation
 * and configurable relationship counts.
 */
@Component
public class JunctionDataSeeder {

    private static final Logger logger = LoggerFactory.getLogger(JunctionDataSeeder.class);

    private final DatabaseSeederConfig config;
    private final Random random;

    // Repository dependencies
    private final CityRepository cityRepository;
    private final CityProfileRepository cityProfileRepository;
    private final ClassificationRepository classificationRepository;
    private final ClassificationProfileRepository classificationProfileRepository;
    private final EmploymentEquityRepository employmentEquityRepository;
    private final EmploymentOpportunityRepository employmentOpportunityRepository;
    private final LanguageReferralTypeRepository languageReferralTypeRepository;
    private final ProfileRepository profileRepository;
    private final ProfileEmploymentOpportunityRepository profileEmploymentOpportunityRepository;
    private final ProfileLanguageReferralTypeRepository profileLanguageReferralTypeRepository;
    private final RequestRepository requestRepository;
    private final RequestCityRepository requestCityRepository;
    private final RequestEmploymentEquityRepository requestEmploymentEquityRepository;

    // Cached lookup data
    private List<CityEntity> cities;
    private List<ClassificationEntity> classifications;
    private List<EmploymentEquityEntity> employmentEquities;
    private List<EmploymentOpportunityEntity> employmentOpportunities;
    private List<LanguageReferralTypeEntity> languageReferralTypes;

    public JunctionDataSeeder(
            DatabaseSeederConfig config,
            CityRepository cityRepository,
            CityProfileRepository cityProfileRepository,
            ClassificationRepository classificationRepository,
            ClassificationProfileRepository classificationProfileRepository,
            EmploymentEquityRepository employmentEquityRepository,
            EmploymentOpportunityRepository employmentOpportunityRepository,
            LanguageReferralTypeRepository languageReferralTypeRepository,
            ProfileRepository profileRepository,
            ProfileEmploymentOpportunityRepository profileEmploymentOpportunityRepository,
            ProfileLanguageReferralTypeRepository profileLanguageReferralTypeRepository,
            RequestRepository requestRepository,
            RequestCityRepository requestCityRepository,
            RequestEmploymentEquityRepository requestEmploymentEquityRepository) {

        this.config = config;
        this.cityRepository = cityRepository;
        this.cityProfileRepository = cityProfileRepository;
        this.classificationRepository = classificationRepository;
        this.classificationProfileRepository = classificationProfileRepository;
        this.employmentEquityRepository = employmentEquityRepository;
        this.employmentOpportunityRepository = employmentOpportunityRepository;
        this.languageReferralTypeRepository = languageReferralTypeRepository;
        this.profileRepository = profileRepository;
        this.profileEmploymentOpportunityRepository = profileEmploymentOpportunityRepository;
        this.profileLanguageReferralTypeRepository = profileLanguageReferralTypeRepository;
        this.requestRepository = requestRepository;
        this.requestCityRepository = requestCityRepository;
        this.requestEmploymentEquityRepository = requestEmploymentEquityRepository;

        // Initialize random with configurable seed for reproducible relationships
        this.random = config.isUseFixedSeed() ?
            new Random(config.getRandomSeed() + 1000) : // Offset seed for junction data
            new Random();
    }

    @Transactional
    public void seedJunctionData() {
        if (config.isLogSeedingProgress()) {
            logger.info("Starting junction data seeding...");
        }

        // Cache lookup data for better performance
        cacheLookupData();

        // Validate that we have required data
        if (!validateLookupData()) {
            logger.error("Cannot seed junction data: missing required lookup data");
            return;
        }

        // Seed all junction tables
        seedCityProfiles();
        seedClassificationProfiles();
        seedProfileEmploymentOpportunities();
        seedProfileLanguageReferralTypes();
        seedRequestCities();
        seedRequestEmploymentEquities();

        if (config.isLogSeedingProgress()) {
            logger.info("Junction data seeding completed successfully");
        }
    }

    @Transactional
    public void clearJunctionData() {
        if (config.isLogSeedingProgress()) {
            logger.info("Clearing junction data tables...");
        }

        try {
            // Clear in reverse dependency order
            requestEmploymentEquityRepository.deleteAll();
            requestCityRepository.deleteAll();
            profileLanguageReferralTypeRepository.deleteAll();
            profileEmploymentOpportunityRepository.deleteAll();
            classificationProfileRepository.deleteAll();
            cityProfileRepository.deleteAll();

            if (config.isLogSeedingProgress()) {
                logger.info("Junction data tables cleared successfully");
            }
        } catch (Exception e) {
            logger.error("Error clearing junction data tables", e);
            throw e;
        }
    }

    private void cacheLookupData() {
        cities = cityRepository.findAll();
        classifications = classificationRepository.findAll();
        employmentEquities = employmentEquityRepository.findAll();
        employmentOpportunities = employmentOpportunityRepository.findAll();
        languageReferralTypes = languageReferralTypeRepository.findAll();
    }

    private boolean validateLookupData() {
        boolean valid = true;

        if (cities.isEmpty()) {
            logger.warn("No cities found - city relationships will not be created");
        }

        if (classifications.isEmpty()) {
            logger.warn("No classifications found - classification relationships will not be created");
        }

        if (employmentEquities.isEmpty()) {
            logger.warn("No employment equities found - employment equity relationships will not be created");
        }

        if (employmentOpportunities.isEmpty()) {
            logger.warn("No employment opportunities found - employment opportunity relationships will not be created");
        }

        if (languageReferralTypes.isEmpty()) {
            logger.warn("No language referral types found - language referral relationships will not be created");
        }

        return valid;
    }

    private void seedCityProfiles() {
        if (cityProfileRepository.count() > 0) {
            logger.info("City profiles already exist, skipping city profile seeding");
            return;
        }

        if (cities.isEmpty()) {
            logger.warn("No cities available for city profile relationships");
            return;
        }

        List<ProfileEntity> profiles = profileRepository.findAll();
        if (profiles.isEmpty()) {
            logger.warn("No profiles available for city profile relationships");
            return;
        }

        List<CityProfileEntity> cityProfiles = new ArrayList<>();
        int totalRelationships = 0;

        for (ProfileEntity profile : profiles) {
            int cityCount = generateRandomCount(
                config.getMinCitiesPerProfile(),
                config.getMaxCitiesPerProfile()
            );

            Set<Long> usedCityIds = new HashSet<>();
            int created = 0;

            for (int i = 0; i < cityCount && created < cityCount; i++) {
                CityEntity city = getRandomElement(cities);
                if (city != null && !usedCityIds.contains(city.getId())) {
                    CityProfileEntity cityProfile = createCityProfile(profile, city);
                    cityProfiles.add(cityProfile);
                    usedCityIds.add(city.getId());
                    created++;
                    totalRelationships++;
                }
            }
        }

        if (!cityProfiles.isEmpty()) {
            cityProfileRepository.saveAll(cityProfiles);
            logSeeded("City-Profile relationships", totalRelationships);
        }
    }

    private void seedClassificationProfiles() {
        if (classificationProfileRepository.count() > 0) {
            logger.info("Classification profiles already exist, skipping classification profile seeding");
            return;
        }

        if (classifications.isEmpty()) {
            logger.warn("No classifications available for classification profile relationships");
            return;
        }

        List<ProfileEntity> profiles = profileRepository.findAll();
        if (profiles.isEmpty()) {
            logger.warn("No profiles available for classification profile relationships");
            return;
        }

        List<ClassificationProfileEntity> classificationProfiles = new ArrayList<>();
        int totalRelationships = 0;

        for (ProfileEntity profile : profiles) {
            int classificationCount = generateRandomCount(
                config.getMinClassificationsPerProfile(),
                config.getMaxClassificationsPerProfile()
            );

            Set<Long> usedClassificationIds = new HashSet<>();
            int created = 0;

            for (int i = 0; i < classificationCount && created < classificationCount; i++) {
                ClassificationEntity classification = getRandomElement(classifications);
                if (classification != null && !usedClassificationIds.contains(classification.getId())) {
                    ClassificationProfileEntity classificationProfile = createClassificationProfile(profile, classification);
                    classificationProfiles.add(classificationProfile);
                    usedClassificationIds.add(classification.getId());
                    created++;
                    totalRelationships++;
                }
            }
        }

        if (!classificationProfiles.isEmpty()) {
            classificationProfileRepository.saveAll(classificationProfiles);
            logSeeded("Classification-Profile relationships", totalRelationships);
        }
    }

    private void seedProfileEmploymentOpportunities() {
        if (profileEmploymentOpportunityRepository.count() > 0) {
            logger.info("Profile employment opportunities already exist, skipping seeding");
            return;
        }

        if (employmentOpportunities.isEmpty()) {
            logger.warn("No employment opportunities available for profile relationships");
            return;
        }

        List<ProfileEntity> profiles = profileRepository.findAll();
        if (profiles.isEmpty()) {
            logger.warn("No profiles available for employment opportunity relationships");
            return;
        }

        List<ProfileEmploymentOpportunityEntity> profileOpportunities = new ArrayList<>();
        int totalRelationships = 0;

        for (ProfileEntity profile : profiles) {
            int opportunityCount = generateRandomCount(
                config.getMinEmploymentOpportunitiesPerProfile(),
                config.getMaxEmploymentOpportunitiesPerProfile()
            );

            Set<Long> usedOpportunityIds = new HashSet<>();
            int created = 0;

            for (int i = 0; i < opportunityCount && created < opportunityCount; i++) {
                EmploymentOpportunityEntity opportunity = getRandomElement(employmentOpportunities);
                if (opportunity != null && !usedOpportunityIds.contains(opportunity.getId())) {
                    ProfileEmploymentOpportunityEntity profileOpportunity = createProfileEmploymentOpportunity(profile, opportunity);
                    profileOpportunities.add(profileOpportunity);
                    usedOpportunityIds.add(opportunity.getId());
                    created++;
                    totalRelationships++;
                }
            }
        }

        if (!profileOpportunities.isEmpty()) {
            profileEmploymentOpportunityRepository.saveAll(profileOpportunities);
            logSeeded("Profile-Employment Opportunity relationships", totalRelationships);
        }
    }

    private void seedProfileLanguageReferralTypes() {
        if (profileLanguageReferralTypeRepository.count() > 0) {
            logger.info("Profile language referral types already exist, skipping seeding");
            return;
        }

        if (languageReferralTypes.isEmpty()) {
            logger.warn("No language referral types available for profile relationships");
            return;
        }

        List<ProfileEntity> profiles = profileRepository.findAll();
        if (profiles.isEmpty()) {
            logger.warn("No profiles available for language referral type relationships");
            return;
        }

        List<ProfileLanguageReferralTypeEntity> profileLanguageReferrals = new ArrayList<>();
        int totalRelationships = 0;

        for (ProfileEntity profile : profiles) {
            int referralCount = generateRandomCount(
                config.getMinLanguageReferralTypesPerProfile(),
                config.getMaxLanguageReferralTypesPerProfile()
            );

            Set<Long> usedReferralIds = new HashSet<>();
            int created = 0;

            for (int i = 0; i < referralCount && created < referralCount; i++) {
                LanguageReferralTypeEntity referralType = getRandomElement(languageReferralTypes);
                if (referralType != null && !usedReferralIds.contains(referralType.getId())) {
                    ProfileLanguageReferralTypeEntity profileReferral = createProfileLanguageReferralType(profile, referralType);
                    profileLanguageReferrals.add(profileReferral);
                    usedReferralIds.add(referralType.getId());
                    created++;
                    totalRelationships++;
                }
            }
        }

        if (!profileLanguageReferrals.isEmpty()) {
            profileLanguageReferralTypeRepository.saveAll(profileLanguageReferrals);
            logSeeded("Profile-Language Referral Type relationships", totalRelationships);
        }
    }

    private void seedRequestCities() {
        if (requestCityRepository.count() > 0) {
            logger.info("Request cities already exist, skipping request city seeding");
            return;
        }

        if (cities.isEmpty()) {
            logger.warn("No cities available for request relationships");
            return;
        }

        List<RequestEntity> requests = requestRepository.findAll();
        if (requests.isEmpty()) {
            logger.warn("No requests available for city relationships");
            return;
        }

        List<RequestCityEntity> requestCities = new ArrayList<>();
        int totalRelationships = 0;

        for (RequestEntity request : requests) {
            int cityCount = generateRandomCount(
                config.getMinCitiesPerRequest(),
                config.getMaxCitiesPerRequest()
            );

            Set<Long> usedCityIds = new HashSet<>();
            int created = 0;

            for (int i = 0; i < cityCount && created < cityCount; i++) {
                CityEntity city = getRandomElement(cities);
                if (city != null && !usedCityIds.contains(city.getId())) {
                    RequestCityEntity requestCity = createRequestCity(request, city);
                    requestCities.add(requestCity);
                    usedCityIds.add(city.getId());
                    created++;
                    totalRelationships++;
                }
            }
        }

        if (!requestCities.isEmpty()) {
            requestCityRepository.saveAll(requestCities);
            logSeeded("Request-City relationships", totalRelationships);
        }
    }

    private void seedRequestEmploymentEquities() {
        if (requestEmploymentEquityRepository.count() > 0) {
            logger.info("Request employment equities already exist, skipping seeding");
            return;
        }

        if (employmentEquities.isEmpty()) {
            logger.warn("No employment equities available for request relationships");
            return;
        }

        List<RequestEntity> requests = requestRepository.findAll();
        if (requests.isEmpty()) {
            logger.warn("No requests available for employment equity relationships");
            return;
        }

        List<RequestEmploymentEquityEntity> requestEquities = new ArrayList<>();
        int totalRelationships = 0;

        for (RequestEntity request : requests) {
            int equityCount = generateRandomCount(
                config.getMinEmploymentEquitiesPerRequest(),
                config.getMaxEmploymentEquitiesPerRequest()
            );

            Set<Long> usedEquityIds = new HashSet<>();
            int created = 0;

            for (int i = 0; i < equityCount && created < equityCount; i++) {
                EmploymentEquityEntity equity = getRandomElement(employmentEquities);
                if (equity != null && !usedEquityIds.contains(equity.getId())) {
                    RequestEmploymentEquityEntity requestEquity = createRequestEmploymentEquity(request, equity);
                    requestEquities.add(requestEquity);
                    usedEquityIds.add(equity.getId());
                    created++;
                    totalRelationships++;
                }
            }
        }

        if (!requestEquities.isEmpty()) {
            requestEmploymentEquityRepository.saveAll(requestEquities);
            logSeeded("Request-Employment Equity relationships", totalRelationships);
        }
    }

    // Helper methods to create entities
    private CityProfileEntity createCityProfile(ProfileEntity profile, CityEntity city) {
        CityProfileEntity entity = new CityProfileEntity();
        entity.setProfile(profile);
        entity.setCity(city);
        entity.setCreatedBy("SYSTEM");
        return entity;
    }

    private ClassificationProfileEntity createClassificationProfile(ProfileEntity profile, ClassificationEntity classification) {
        ClassificationProfileEntity entity = new ClassificationProfileEntity();
        entity.setProfile(profile);
        entity.setClassification(classification);
        entity.setCreatedBy("SYSTEM");
        return entity;
    }

    private ProfileEmploymentOpportunityEntity createProfileEmploymentOpportunity(ProfileEntity profile, EmploymentOpportunityEntity opportunity) {
        ProfileEmploymentOpportunityEntity entity = new ProfileEmploymentOpportunityEntity();
        entity.setProfile(profile);
        entity.setEmploymentOpportunity(opportunity);
        entity.setCreatedBy("SYSTEM");
        return entity;
    }

    private ProfileLanguageReferralTypeEntity createProfileLanguageReferralType(ProfileEntity profile, LanguageReferralTypeEntity referralType) {
        ProfileLanguageReferralTypeEntity entity = new ProfileLanguageReferralTypeEntity();
        entity.setProfile(profile);
        entity.setLanguageReferralType(referralType);
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

    private RequestEmploymentEquityEntity createRequestEmploymentEquity(RequestEntity request, EmploymentEquityEntity equity) {
        RequestEmploymentEquityEntity entity = new RequestEmploymentEquityEntity();
        entity.setRequest(request);
        entity.setEmploymentEquity(equity);
        entity.setCreatedBy("SYSTEM");
        return entity;
    }

    // Utility methods
    private int generateRandomCount(int min, int max) {
        if (min > max) {
            logger.warn("Invalid range: min ({}) > max ({}), using min as count", min, max);
            return min;
        }
        if (min == max) {
            return min;
        }
        return min + random.nextInt(max - min + 1);
    }

    private <T> T getRandomElement(List<T> list) {
        if (list.isEmpty()) return null;
        return list.get(random.nextInt(list.size()));
    }

    private void logSeeded(String entityType, int count) {
        if (config.isLogSeedingProgress()) {
            logger.info("Seeded {} {}", count, entityType);
        }
    }
}
