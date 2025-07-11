package ca.gov.dtsstn.vacman.api.seeder;

import java.util.List;
import java.util.Random;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

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
 * Seeds junction/relationship tables based on the DDL structure.
 * Only includes tables that exist in the DDL:
 * - CITY_PROFILE
 * - CLASSIFICATION_PROFILE
 * - PROFILE_EMPLOYMENT_OPPORTUNITY
 * - PROFILE_LANGUAGE_REFERRAL_TYPE
 * - REQUEST_CITY
 * - REQUEST_EMPLOYMENT_EQUITY
 */
@Component
public class JunctionDataSeeder {

	private static final Logger log = LoggerFactory.getLogger(JunctionDataSeeder.class);

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

	private final Random random = new Random();

	public JunctionDataSeeder(
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
	}

	public void seedJunctionData() {
		log.info("Seeding junction data...");

		seedCityProfiles();
		seedClassificationProfiles();
		seedProfileEmploymentOpportunities();
		seedProfileLanguageReferralTypes();
		seedRequestCities();
		seedRequestEmploymentEquities();

		log.info("Junction data seeding completed.");
	}

	private void seedCityProfiles() {
		if (cityProfileRepository.count() > 0) {
			log.info("City profiles already exist, skipping seeding.");
			return;
		}

		List<ProfileEntity> profiles = profileRepository.findAll();
		List<CityEntity> cities = cityRepository.findAll();

		if (profiles.isEmpty() || cities.isEmpty()) {
			log.warn("Cannot seed city profiles - missing profiles or cities data.");
			return;
		}

		// Associate each profile with 1-3 random cities
		for (ProfileEntity profile : profiles) {
			int numCities = random.nextInt(3) + 1; // 1-3 cities
			for (int i = 0; i < numCities && i < cities.size(); i++) {
				CityEntity city = cities.get(random.nextInt(cities.size()));

				// Check if this combination already exists
				if (cityProfileRepository.findByProfileIdAndCityId(profile.getId(), city.getId()).isEmpty()) {
					CityProfileEntity cityProfile = createCityProfile(profile, city);
					cityProfileRepository.save(cityProfile);
				}
			}
		}

		log.info("Seeded {} city profiles.", cityProfileRepository.count());
	}

	private void seedClassificationProfiles() {
		if (classificationProfileRepository.count() > 0) {
			log.info("Classification profiles already exist, skipping seeding.");
			return;
		}

		List<ProfileEntity> profiles = profileRepository.findAll();
		List<ClassificationEntity> classifications = classificationRepository.findAll();

		if (profiles.isEmpty() || classifications.isEmpty()) {
			log.warn("Cannot seed classification profiles - missing profiles or classifications data.");
			return;
		}

		// Associate each profile with 1-2 random classifications
		for (ProfileEntity profile : profiles) {
			int numClassifications = random.nextInt(2) + 1; // 1-2 classifications
			for (int i = 0; i < numClassifications && i < classifications.size(); i++) {
				ClassificationEntity classification = classifications.get(random.nextInt(classifications.size()));

				// Check if this combination already exists
				if (classificationProfileRepository.findByProfileIdAndClassificationId(profile.getId(), classification.getId()).isEmpty()) {
					ClassificationProfileEntity classificationProfile = createClassificationProfile(profile, classification);
					classificationProfileRepository.save(classificationProfile);
				}
			}
		}

		log.info("Seeded {} classification profiles.", classificationProfileRepository.count());
	}

	private void seedProfileEmploymentOpportunities() {
		if (profileEmploymentOpportunityRepository.count() > 0) {
			log.info("Profile employment opportunities already exist, skipping seeding.");
			return;
		}

		List<ProfileEntity> profiles = profileRepository.findAll();
		List<EmploymentOpportunityEntity> opportunities = employmentOpportunityRepository.findAll();

		if (profiles.isEmpty() || opportunities.isEmpty()) {
			log.warn("Cannot seed profile employment opportunities - missing profiles or opportunities data.");
			return;
		}

		// Associate each profile with 1-3 random employment opportunities
		for (ProfileEntity profile : profiles) {
			int numOpportunities = random.nextInt(3) + 1; // 1-3 opportunities
			for (int i = 0; i < numOpportunities && i < opportunities.size(); i++) {
				EmploymentOpportunityEntity opportunity = opportunities.get(random.nextInt(opportunities.size()));

				// Check if this combination already exists
				if (profileEmploymentOpportunityRepository.findByProfileIdAndEmploymentOpportunityId(profile.getId(), opportunity.getId()).isEmpty()) {
					ProfileEmploymentOpportunityEntity profileOpportunity = createProfileEmploymentOpportunity(profile, opportunity);
					profileEmploymentOpportunityRepository.save(profileOpportunity);
				}
			}
		}

		log.info("Seeded {} profile employment opportunities.", profileEmploymentOpportunityRepository.count());
	}

	private void seedProfileLanguageReferralTypes() {
		if (profileLanguageReferralTypeRepository.count() > 0) {
			log.info("Profile language referral types already exist, skipping seeding.");
			return;
		}

		List<ProfileEntity> profiles = profileRepository.findAll();
		List<LanguageReferralTypeEntity> referralTypes = languageReferralTypeRepository.findAll();

		if (profiles.isEmpty() || referralTypes.isEmpty()) {
			log.warn("Cannot seed profile language referral types - missing profiles or referral types data.");
			return;
		}

		// Associate each profile with 1-2 random language referral types
		for (ProfileEntity profile : profiles) {
			int numTypes = random.nextInt(2) + 1; // 1-2 types
			for (int i = 0; i < numTypes && i < referralTypes.size(); i++) {
				LanguageReferralTypeEntity referralType = referralTypes.get(random.nextInt(referralTypes.size()));

				// Check if this combination already exists
				if (profileLanguageReferralTypeRepository.findByProfileIdAndLanguageReferralTypeId(profile.getId(), referralType.getId()).isEmpty()) {
					ProfileLanguageReferralTypeEntity profileReferralType = createProfileLanguageReferralType(profile, referralType);
					profileLanguageReferralTypeRepository.save(profileReferralType);
				}
			}
		}

		log.info("Seeded {} profile language referral types.", profileLanguageReferralTypeRepository.count());
	}

	private void seedRequestCities() {
		if (requestCityRepository.count() > 0) {
			log.info("Request cities already exist, skipping seeding.");
			return;
		}

		List<RequestEntity> requests = requestRepository.findAll();
		List<CityEntity> cities = cityRepository.findAll();

		if (requests.isEmpty() || cities.isEmpty()) {
			log.warn("Cannot seed request cities - missing requests or cities data.");
			return;
		}

		// Associate each request with 1-3 random cities
		for (RequestEntity request : requests) {
			int numCities = random.nextInt(3) + 1; // 1-3 cities
			for (int i = 0; i < numCities && i < cities.size(); i++) {
				CityEntity city = cities.get(random.nextInt(cities.size()));

				// Check if this combination already exists
				if (requestCityRepository.findByRequestIdAndCityId(request.getId(), city.getId()).isEmpty()) {
					RequestCityEntity requestCity = createRequestCity(request, city);
					requestCityRepository.save(requestCity);
				}
			}
		}

		log.info("Seeded {} request cities.", requestCityRepository.count());
	}

	private void seedRequestEmploymentEquities() {
		if (requestEmploymentEquityRepository.count() > 0) {
			log.info("Request employment equities already exist, skipping seeding.");
			return;
		}

		List<RequestEntity> requests = requestRepository.findAll();
		List<EmploymentEquityEntity> equities = employmentEquityRepository.findAll();

		if (requests.isEmpty() || equities.isEmpty()) {
			log.warn("Cannot seed request employment equities - missing requests or equity data.");
			return;
		}

		// Associate each request with 1-2 random employment equities
		for (RequestEntity request : requests) {
			int numEquities = random.nextInt(2) + 1; // 1-2 equities
			for (int i = 0; i < numEquities && i < equities.size(); i++) {
				EmploymentEquityEntity equity = equities.get(random.nextInt(equities.size()));

				// Check if this combination already exists
				if (requestEmploymentEquityRepository.findByRequestIdAndEmploymentEquityId(request.getId(), equity.getId()).isEmpty()) {
					RequestEmploymentEquityEntity requestEquity = createRequestEmploymentEquity(request, equity);
					requestEmploymentEquityRepository.save(requestEquity);
				}
			}
		}

		log.info("Seeded {} request employment equities.", requestEmploymentEquityRepository.count());
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

	/**
	 * Clears all junction table data in the correct order
	 */
	public void clearJunctionData() {
		log.info("Clearing junction tables...");

		// Clear all junction repositories
		requestEmploymentEquityRepository.deleteAll();
		requestCityRepository.deleteAll();
		profileLanguageReferralTypeRepository.deleteAll();
		profileEmploymentOpportunityRepository.deleteAll();
		classificationProfileRepository.deleteAll();
		cityProfileRepository.deleteAll();

		log.info("Junction tables cleared");
	}
}
