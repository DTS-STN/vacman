package ca.gov.dtsstn.vacman.api.config;

import static ca.gov.dtsstn.vacman.api.data.entity.AbstractCodeEntity.byCode;

import java.time.LocalDate;
import java.util.List;
import java.util.Random;
import java.util.function.Supplier;
import java.util.stream.IntStream;
import java.util.stream.Stream;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.ApplicationRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import ca.gov.dtsstn.vacman.api.data.entity.CityEntity;
import ca.gov.dtsstn.vacman.api.data.entity.ClassificationEntity;
import ca.gov.dtsstn.vacman.api.data.entity.EmploymentEquityEntity;
import ca.gov.dtsstn.vacman.api.data.entity.EmploymentOpportunityEntity;
import ca.gov.dtsstn.vacman.api.data.entity.EmploymentTenureEntity;
import ca.gov.dtsstn.vacman.api.data.entity.LanguageEntity;
import ca.gov.dtsstn.vacman.api.data.entity.LanguageReferralTypeEntity;
import ca.gov.dtsstn.vacman.api.data.entity.LanguageRequirementEntity;
import ca.gov.dtsstn.vacman.api.data.entity.NonAdvertisedAppointmentEntity;
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
import ca.gov.dtsstn.vacman.api.data.repository.CityRepository;
import ca.gov.dtsstn.vacman.api.data.repository.ClassificationRepository;
import ca.gov.dtsstn.vacman.api.data.repository.EmploymentEquityRepository;
import ca.gov.dtsstn.vacman.api.data.repository.EmploymentOpportunityRepository;
import ca.gov.dtsstn.vacman.api.data.repository.EmploymentTenureRepository;
import ca.gov.dtsstn.vacman.api.data.repository.LanguageReferralTypeRepository;
import ca.gov.dtsstn.vacman.api.data.repository.LanguageRepository;
import ca.gov.dtsstn.vacman.api.data.repository.LanguageRequirementRepository;
import ca.gov.dtsstn.vacman.api.data.repository.NonAdvertisedAppointmentRepository;
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
import net.datafaker.Faker;

@Configuration
@ConditionalOnProperty(name = "application.data-seeder.enabled", havingValue = "true")
public class DataSeederConfig {

	static final Logger logger = LoggerFactory.getLogger(DataSeederConfig.class);

	final ProfileRepository profileRepository;
	final RequestRepository requestRepository;
	final UserRepository userRepository;

	final List<CityEntity> cities;
	final List<ClassificationEntity> classifications;
	final List<EmploymentEquityEntity> employmentEquities;
	final List<EmploymentOpportunityEntity> employmentOpportunities;
	final List<EmploymentTenureEntity> employmentTenures;
	final List<LanguageEntity> languages;
	final List<LanguageReferralTypeEntity> languageReferralTypes;
	final List<LanguageRequirementEntity> languageRequirements;
	final List<NonAdvertisedAppointmentEntity> nonAdvertisedAppointments;
	final List<ProfileStatusEntity> profileStatuses;
	final List<RequestStatusEntity> requestStatuses;
	final List<SecurityClearanceEntity> securityClearances;
	final List<SelectionProcessTypeEntity> selectionProcessTypes;
	final List<UserTypeEntity> userTypes;
	final List<WorkScheduleEntity> workSchedules;
	final List<WorkUnitEntity> workUnits;

	DataSeederConfig(
			CityRepository cityRepository,
			ClassificationRepository classificationRepository,
			EmploymentEquityRepository employmentEquityRepository,
			EmploymentOpportunityRepository employmentOpportunityRepository,
			EmploymentTenureRepository employmentTenureRepository,
			LanguageReferralTypeRepository languageReferralTypeRepository,
			LanguageRepository languageRepository,
			LanguageRequirementRepository languageRequirementRepository,
			NonAdvertisedAppointmentRepository nonAdvertisedAppointmentRepository,
			ProfileRepository profileRepository,
			ProfileStatusRepository profileStatusRepository,
			RequestRepository requestRepository,
			RequestStatusRepository requestStatusRepository,
			SecurityClearanceRepository securityClearanceRepository,
			SelectionProcessTypeRepository selectionProcessTypeRepository,
			UserRepository userRepository,
			UserTypeRepository userTypeRepository,
			WorkScheduleRepository workScheduleRepository,
			WorkUnitRepository workUnitRepository) {
		this.profileRepository = profileRepository;
		this.requestRepository = requestRepository;
		this.userRepository = userRepository;

		this.cities = cityRepository.findAll();
		this.classifications = classificationRepository.findAll();
		this.employmentEquities = employmentEquityRepository.findAll();
		this.employmentOpportunities = employmentOpportunityRepository.findAll();
		this.employmentTenures = employmentTenureRepository.findAll();
		this.languages = languageRepository.findAll();
		this.languageReferralTypes = languageReferralTypeRepository.findAll();
		this.languageRequirements = languageRequirementRepository.findAll();
		this.nonAdvertisedAppointments = nonAdvertisedAppointmentRepository.findAll();
		this.profileStatuses = profileStatusRepository.findAll();
		this.requestStatuses = requestStatusRepository.findAll();
		this.securityClearances = securityClearanceRepository.findAll();
		this.selectionProcessTypes = selectionProcessTypeRepository.findAll();
		this.userTypes = userTypeRepository.findAll();
		this.workSchedules = workScheduleRepository.findAll();
		this.workUnits = workUnitRepository.findAll();
	}

	@SuppressWarnings({ "unused" })
	@Bean ApplicationRunner dataSeeder() {
		return args -> {
			logger.info("Seeding application data...");

			final var users = seedUsers();
			final var profiles = seedProfiles(users);
			final var requests = seedRequests(users);

			logger.info("Data seeding complete");
		};
	}

	/**
	 * Seeds 100 employee users with random fake data including names, emails, and language.
	 */
	List<UserEntity> seedUsers() {
		final var faker = new Faker(new Random(6146794652083548235L));

		final var users = IntStream.range(0, 100)
			.mapToObj(xxx -> {
				final var firstName = faker.name().firstName();
				final var lastName = faker.name().lastName();
				final var businessEmailAddress = faker.internet().safeEmailAddress();
				final var language = randomElement(faker, languages);
				final var microsoftEntraId = faker.idNumber().valid();
				final var employeeUserType = userTypes.stream().filter(byCode("employee")).findFirst().orElseThrow();

				return UserEntity.builder()
					.businessEmailAddress(businessEmailAddress)
					.firstName(firstName)
					.language(language)
					.lastName(lastName)
					.microsoftEntraId(microsoftEntraId)
					.userType(employeeUserType)
					.build();
			}).toList();

		return userRepository.saveAll(users);
	}

	/**
	 * Seeds one profile per user, split into matching and non-matching profiles.
	 */
	List<ProfileEntity> seedProfiles(List<UserEntity> users) {
		final var matchingProfiles = seedMatchingProfiles(users.subList(0, 50));
		final var nonMatchingProfiles = seedNonMatchingProfiles(users.subList(50, 100));

		final var profiles = Stream.concat(matchingProfiles.stream(),nonMatchingProfiles.stream()).toList();

		return profileRepository.saveAll(profiles);
	}

	/**
	 * Seeds 50 profiles that are likely to match requests: approved status, available for referral, broad preferences.
	 */
	private List<ProfileEntity> seedMatchingProfiles(List<UserEntity> users) {
		final var approvedStatus = profileStatuses.stream()
			.filter(byCode("APPROVED"))
			.findFirst().orElseThrow();

		final var profiles = users.stream()
			.map(user -> ProfileEntity.builder()
				.user(user)
				.isAvailableForReferral(true)
				.preferredCities(cities)                                   // all cities
				.preferredClassifications(classifications)                 // all classifications
				.preferredEmploymentOpportunities(employmentOpportunities) // all employement opportunities
				.preferredLanguages(languageReferralTypes)                 // all languages
				.profileStatus(approvedStatus)
				.build())
			.toList();

		return profiles;
	}

	/**
	 * Seeds 50 profiles that might not match requests: random status, availability, and preferences.
	 */
	private List<ProfileEntity> seedNonMatchingProfiles(List<UserEntity> users) {
		final var faker = new Faker(new Random(7423979211207825555L));

		final var approvedStatus = profileStatuses.stream()
			.filter(byCode("APPROVED"))
			.findFirst().orElseThrow();

		final var pendingStatus = profileStatuses.stream()
			.filter(byCode("PENDING"))
			.findFirst().orElseThrow();

		return users.stream().map(user -> {
			final var preferredCities = randomSubList(faker, cities);
			final var preferredClassifications = randomSubList(faker, classifications);
			final var preferredEmploymentOpportunities = randomSubList(faker, employmentOpportunities);
			final var preferredLanguages = randomSubList(faker, languageReferralTypes);

			// 50/50 chance for profile to be marked as available for referral
			final var isAvailable = faker.random().nextBoolean();

			// 25% PENDING, 75% APPROVED
			final var isPending = faker.number().numberBetween(0, 100) < 25;
			final var profileStatus = isPending ? pendingStatus : approvedStatus;

			return ProfileEntity.builder()
				.user(user)
				.isAvailableForReferral(isAvailable)
				.preferredCities(preferredCities)
				.preferredClassifications(preferredClassifications)
				.preferredEmploymentOpportunities(preferredEmploymentOpportunities)
				.preferredLanguages(preferredLanguages)
				.profileStatus(profileStatus)
				.build();
		})
		.toList();
	}

	/**
	 * Seeds requests by iterating through users, with a 25% chance per user to create 1-10 requests for that user.
	 * Each request has random details including classification, status, cities, dates, and other attributes.
	 */
	List<RequestEntity> seedRequests(List<UserEntity> users) {
		final var faker = new Faker(new Random(4437113781045784766L));

		final var requests = users.stream()
			.filter(user -> faker.number().numberBetween(0, 100) < 25)
			.flatMap(user -> {
				final var nRequests = faker.number().numberBetween(1, 11);

				return IntStream.range(0, nRequests).mapToObj(j -> {
					// note: at max 25 cities because requests with too many cities make everything slow
					final var nRequestCities = faker.number().numberBetween(1, 25 + 1);

					final var nameEn = faker.job().title();
					final var nameFr = faker.job().title();

					final var startDate = LocalDate.now().plusDays(faker.number().numberBetween(0, 365));
					final var endDate = startDate.plusDays(faker.number().numberBetween(30, 30 + 365));

					final var additionalComment = randomValue(faker, faker.lorem()::sentence);
					final var appointmentNonAdvertised = randomValue(faker, () -> randomElement(faker, nonAdvertisedAppointments));
					final var classification = randomElement(faker, classifications);
					final var employmentEquityNeedIdentifiedIndicator = faker.random().nextBoolean();
					final var employmentTenure = randomElement(faker, employmentTenures);
					final var hasPerformedSameDuties = faker.random().nextBoolean();
					final var hiringManager = randomValue(faker, () -> randomElement(faker, users));
					final var hrAdvisor = randomValue(faker, () -> randomElement(faker, users));
					final var language = randomElement(faker, languages);
					final var languageProfileEn = faker.random().nextBoolean() ? "CBC" : "BBB";
					final var languageProfileFr = faker.random().nextBoolean() ? "CBC" : "BBB";
					final var languageRequirement = randomElement(faker, languageRequirements);
					final var positionNumber = "POS-" + faker.number().digits(6);
					final var priorityEntitlement = faker.random().nextBoolean();
					final var requestCities = cities.subList(1, nRequestCities + 1);
					final var requestEmploymentEquities = randomSubList(faker, employmentEquities);
					final var requestNumber = "REQ-" + faker.number().digits(6);
					final var requestStatus = randomElement(faker, requestStatuses);
					final var securityClearance = randomElement(faker, securityClearances);
					final var selectionProcessType = randomElement(faker, selectionProcessTypes);
					final var subDelegatedManager = randomValue(faker, () -> randomElement(faker, users));
					final var teleworkAllowed = faker.random().nextBoolean();
					final var workforceMgmtApprovalRecvd = faker.random().nextBoolean();
					final var workSchedule = randomElement(faker, workSchedules);
					final var workUnit = randomElement(faker, workUnits);

					return RequestEntity.builder()
						.additionalComment(additionalComment)
						.appointmentNonAdvertised(appointmentNonAdvertised)
						.cities(requestCities)
						.classification(classification)
						.employmentEquities(requestEmploymentEquities)
						.employmentEquityNeedIdentifiedIndicator(employmentEquityNeedIdentifiedIndicator)
						.employmentTenure(employmentTenure)
						.endDate(endDate)
						.hasPerformedSameDuties(hasPerformedSameDuties)
						.hiringManager(hiringManager)
						.hrAdvisor(hrAdvisor)
						.language(language)
						.languageProfileEn(languageProfileEn)
						.languageProfileFr(languageProfileFr)
						.languageRequirement(languageRequirement)
						.nameEn(nameEn)
						.nameFr(nameFr)
						.positionNumber(positionNumber)
						.priorityEntitlement(priorityEntitlement)
						.requestNumber(requestNumber)
						.requestStatus(requestStatus)
						.securityClearance(securityClearance)
						.selectionProcessType(selectionProcessType)
						.startDate(startDate)
						.subDelegatedManager(subDelegatedManager)
						.submitter(user)
						.teleworkAllowed(teleworkAllowed)
						.workforceMgmtApprovalRecvd(workforceMgmtApprovalRecvd)
						.workSchedule(workSchedule)
						.workUnit(workUnit)
						.build();
				});
			})
			.toList();

		return requestRepository.saveAll(requests);
	}

	<T> T randomElement(Faker faker, List<T> list) {
		return list.get(faker.number().numberBetween(0, list.size()));
	}

	<T> List<T> randomSubList(Faker faker, List<T> list) {
		return list.subList(0, faker.number().numberBetween(1, list.size() + 1));
	}

	<T> T randomValue(Faker faker, Supplier<T> supplier) {
		return faker.random().nextBoolean() ? supplier.get() : null;
	}

}