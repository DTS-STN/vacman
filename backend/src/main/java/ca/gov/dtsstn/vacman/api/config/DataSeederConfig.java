package ca.gov.dtsstn.vacman.api.config;

import static ca.gov.dtsstn.vacman.api.data.entity.AbstractCodeEntity.byCode;

import java.util.List;
import java.util.Random;
import java.util.function.Supplier;
import java.util.stream.Stream;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.domain.Example;
import org.springframework.scheduling.annotation.Async;

import ca.gov.dtsstn.vacman.api.data.entity.CityEntity;
import ca.gov.dtsstn.vacman.api.data.entity.ClassificationEntity;
import ca.gov.dtsstn.vacman.api.data.entity.EmploymentOpportunityEntity;
import ca.gov.dtsstn.vacman.api.data.entity.EmploymentTenureEntity;
import ca.gov.dtsstn.vacman.api.data.entity.LanguageEntity;
import ca.gov.dtsstn.vacman.api.data.entity.LanguageReferralTypeEntity;
import ca.gov.dtsstn.vacman.api.data.entity.LanguageRequirementEntity;
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
import ca.gov.dtsstn.vacman.api.data.repository.CityRepository;
import ca.gov.dtsstn.vacman.api.data.repository.ClassificationRepository;
import ca.gov.dtsstn.vacman.api.data.repository.EmploymentOpportunityRepository;
import ca.gov.dtsstn.vacman.api.data.repository.EmploymentTenureRepository;
import ca.gov.dtsstn.vacman.api.data.repository.LanguageReferralTypeRepository;
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
import ca.gov.dtsstn.vacman.api.data.repository.WfaStatusRepository;
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
	final List<EmploymentOpportunityEntity> employmentOpportunities;
	final List<EmploymentTenureEntity> employmentTenures;
	final List<LanguageEntity> languages;
	final List<LanguageReferralTypeEntity> languageReferralTypes;
	final List<LanguageRequirementEntity> languageRequirements;
	final List<ProfileStatusEntity> profileStatuses;
	final List<RequestStatusEntity> requestStatuses;
	final List<SecurityClearanceEntity> securityClearances;
	final List<SelectionProcessTypeEntity> selectionProcessTypes;
	final List<UserTypeEntity> userTypes;
	final List<WfaStatusEntity> wfaStatuses;
	final List<WorkScheduleEntity> workSchedules;
	final List<WorkUnitEntity> workUnits;

	DataSeederConfig(
			CityRepository cityRepository,
			ClassificationRepository classificationRepository,
			EmploymentOpportunityRepository employmentOpportunityRepository,
			EmploymentTenureRepository employmentTenureRepository,
			LanguageReferralTypeRepository languageReferralTypeRepository,
			LanguageRepository languageRepository,
			LanguageRequirementRepository languageRequirementRepository,
			ProfileRepository profileRepository,
			ProfileStatusRepository profileStatusRepository,
			RequestRepository requestRepository,
			RequestStatusRepository requestStatusRepository,
			SecurityClearanceRepository securityClearanceRepository,
			SelectionProcessTypeRepository selectionProcessTypeRepository,
			UserRepository userRepository,
			UserTypeRepository userTypeRepository,
			WfaStatusRepository wfaStatusRepository,
			WorkScheduleRepository workScheduleRepository,
			WorkUnitRepository workUnitRepository) {
		this.profileRepository = profileRepository;
		this.requestRepository = requestRepository;
		this.userRepository = userRepository;

		this.cities = cityRepository.findAll();
		this.classifications = classificationRepository.findAll();
		this.employmentOpportunities = employmentOpportunityRepository.findAll();
		this.employmentTenures = employmentTenureRepository.findAll();
		this.languages = languageRepository.findAll();
		this.languageReferralTypes = languageReferralTypeRepository.findAll();
		this.languageRequirements = languageRequirementRepository.findAll();
		this.profileStatuses = profileStatusRepository.findAll();
		this.requestStatuses = requestStatusRepository.findAll();
		this.securityClearances = securityClearanceRepository.findAll();
		this.selectionProcessTypes = selectionProcessTypeRepository.findAll();
		this.userTypes = userTypeRepository.findAll();
		this.wfaStatuses = wfaStatusRepository.findAll();
		this.workSchedules = workScheduleRepository.findAll();
		this.workUnits = workUnitRepository.findAll();
	}

	@Bean ApplicationRunner dataSeeder() {
		return new ApplicationRunner() {

			@Async
			@Override
			public void run(ApplicationArguments args) {
				logger.info("Checking if data seeding is needed...");

				final var sentinelUser = UserEntity.builder()
					.businessEmailAddress("seeded-data@example.com")
					.build();

				if (userRepository.exists(Example.of(sentinelUser))) {
					logger.info("Data already seeded (sentinel user found), skipping.");
					return;
				}

				logger.info("Seeding application data...");

				seedUsers();
				seedRequests();

				logger.info("Data seeding complete");
			}

		};
	}

	void seedUsers() {
		final var faker = new Faker(new Random(0xDEADBEEF));

		final var sentinelUser = UserEntity.builder()
			.businessEmailAddress("seeded-data@example.com")
			.firstName("Seeded")
			.lastName("Data")
			.language(randomElement(faker, languages))
			.microsoftEntraId("SENTINEL-123456789")
			.userType(userTypes.stream().filter(byCode("employee")).findFirst().orElseThrow())
			.build();

		userRepository.save(sentinelUser);

		final var affectedWfa = wfaStatuses.stream().filter(byCode("AFFECTED")).findFirst().orElseThrow();
		final var surplusWfa = wfaStatuses.stream().filter(byCode("SURPLUS_GRJO")).findFirst().orElseThrow();
		final var approvedStatus = profileStatuses.stream().filter(byCode("APPROVED")).findFirst().orElseThrow();
		final var as05 = classifications.stream().filter(byCode("AS-05")).findFirst().orElseThrow();
		final var pm05 = classifications.stream().filter(byCode("PM-05")).findFirst().orElseThrow();
		final var ottawa = cities.stream().filter(c -> "Ottawa".equals(c.getNameEn())).findFirst().orElseThrow();
		final var gatineau = cities.stream().filter(c -> "Gatineau".equals(c.getNameEn())).findFirst().orElseThrow();
		final var montreal = cities.stream().filter(c -> "Montréal".equals(c.getNameEn())).findFirst().orElseThrow();
		final var bilingual = languageReferralTypes.stream().filter(byCode("BILINGUAL")).findFirst().orElseThrow();
		final var englishOnly = languageReferralTypes.stream().filter(byCode("ENGLISH")).findFirst().orElseThrow();

		// Find directorate work units for testing
		final var workplaceDirectorate = workUnits.stream().filter(byCode("100712")).findFirst().orElseThrow();        // Workplace Directorate
		final var digitalServiceDirectorate = workUnits.stream().filter(byCode("100570")).findFirst().orElseThrow();   // Digital Service Directorate
		final var accessibleCanadaDirectorate = workUnits.stream().filter(byCode("106061")).findFirst().orElseThrow(); // Accessible Canada Directorate

		final var users = Stream.generate(() -> UserEntity.builder()
				.businessEmailAddress(faker.internet().safeEmailAddress())
				.firstName(faker.name().firstName())
				.language(randomElement(faker, languages))
				.lastName(faker.name().lastName())
				.microsoftEntraId(faker.idNumber().valid())
				.userType(userTypes.stream()
					.filter(byCode("employee"))
					.findFirst().orElseThrow())
				.build())
			.map(userRepository::save)
			.limit(4)
			.toList();

		//
		// Create profiles for each user
		// Each profile matches different criteria for testing purposes
		//

		profileRepository.save(ProfileEntity.builder()
			.user(users.get(0))
			.profileStatus(approvedStatus)
			.wfaStatus(affectedWfa)
			.substantiveWorkUnit(workplaceDirectorate)
			.preferredClassifications(List.of(as05))
			.preferredCities(List.of(ottawa, gatineau))
			.preferredLanguages(List.of(bilingual))
			.preferredEmploymentOpportunities(employmentOpportunities)
			.isAvailableForReferral(true)
			.build());

		profileRepository.save(ProfileEntity.builder()
			.user(users.get(1))
			.profileStatus(approvedStatus)
			.wfaStatus(surplusWfa)
			.substantiveWorkUnit(digitalServiceDirectorate)
			.preferredClassifications(List.of(as05, pm05))
			.preferredCities(List.of(ottawa, gatineau, montreal))
			.preferredLanguages(List.of(bilingual))
			.preferredEmploymentOpportunities(employmentOpportunities)
			.isAvailableForReferral(true)
			.build());

		profileRepository.save(ProfileEntity.builder()
			.user(users.get(2))
			.profileStatus(approvedStatus)
			.wfaStatus(surplusWfa)
			.substantiveWorkUnit(accessibleCanadaDirectorate)
			.preferredClassifications(List.of(as05))
			.preferredCities(List.of(ottawa, gatineau))
			.preferredLanguages(List.of(englishOnly))
			.preferredEmploymentOpportunities(employmentOpportunities)
			.isAvailableForReferral(true)
			.build());

		profileRepository.save(ProfileEntity.builder()
			.user(users.get(3))
			.profileStatus(approvedStatus)
			.wfaStatus(affectedWfa)
			.substantiveWorkUnit(workplaceDirectorate)
			.preferredClassifications(List.of(as05))
			.preferredCities(List.of(ottawa, gatineau))
			.preferredLanguages(List.of(bilingual))
			.preferredEmploymentOpportunities(employmentOpportunities)
			.isAvailableForReferral(false)
			.build());
	}

	void seedRequests() {
		final var submittedStatus = requestStatuses.stream().filter(byCode("SUBMIT")).findFirst().orElseThrow();
		final var biLanguageReq = languageRequirements.stream().filter(byCode("BI")).findFirst().orElseThrow();
		final var eeAeLanguageReq = languageRequirements.stream().filter(byCode("EE-AE")).findFirst().orElseThrow();
		final var as05 = classifications.stream().filter(byCode("AS-05")).findFirst().orElseThrow();
		final var pm05 = classifications.stream().filter(byCode("PM-05")).findFirst().orElseThrow();
		final var ottawa = cities.stream().filter(c -> "Ottawa".equals(c.getNameEn())).findFirst().orElseThrow();
		final var gatineau = cities.stream().filter(c -> "Gatineau".equals(c.getNameEn())).findFirst().orElseThrow();
		final var montreal = cities.stream().filter(c -> "Montréal".equals(c.getNameEn())).findFirst().orElseThrow();

		// Get default values for required fields
		final var defaultEmploymentTenure = employmentTenures.get(0);         // Use first available
		final var defaultSelectionProcessType = selectionProcessTypes.get(0); // Use first available
		final var defaultWorkSchedule = workSchedules.get(0);                 // Use first available
		final var defaultSecurityClearance = securityClearances.get(0);       // Use first available
		final var defaultLanguage = languages.get(0);                         // Use first available

		// Find directorate work units for testing
		final var workplaceDirectorate = workUnits.stream().filter(byCode("100712")).findFirst().orElseThrow();        // Workplace Directorate
		final var digitalServiceDirectorate = workUnits.stream().filter(byCode("100570")).findFirst().orElseThrow();   // Digital Service Directorate
		final var accessibleCanadaDirectorate = workUnits.stream().filter(byCode("106061")).findFirst().orElseThrow(); // Accessible Canada Directorate

		// Find the existing sentinel user (created in seedUsers)
		final var sentinelUser = userRepository.findOne(Example.of(UserEntity.builder()
			.microsoftEntraId("SENTINEL-123456789")
			.build())).orElseThrow();

		// Request 1: AS-05 classification, Ottawa city, BI language requirement, Workplace Directorate
		// Should match Profile 0 and Profile 1
		requestRepository.save(RequestEntity.builder()
			.nameEn("AS-05 Bilingual Position in Ottawa")
			.nameFr("Poste AS-05 bilingue à Ottawa")
			.requestNumber("REQ-001")
			.positionNumber("00000001")
			.classification(as05)
			.cities(List.of(ottawa))
			.languageRequirement(biLanguageReq)
			.languageProfileEn("BBB")
			.languageProfileFr("BBB")
			.somcAndConditionEmploymentEn("English statement of merit criteria and conditions of employment for AS-05 position requiring bilingual proficiency.")
			.somcAndConditionEmploymentFr("Énoncé des critères de mérite et conditions d'emploi en français pour le poste AS-05 exigeant la compétence bilingue.")
			.requestStatus(submittedStatus)
			.submitter(sentinelUser)
			.hiringManager(sentinelUser)       // Submitter is the hiring manager
			.subDelegatedManager(sentinelUser) // Submitter is the staffing sub-delegated manager
			.language(defaultLanguage)
			.workUnit(workplaceDirectorate)
			.startDate(java.time.LocalDate.now().plusDays(30))
			.endDate(java.time.LocalDate.now().plusDays(90))
			.employmentTenure(defaultEmploymentTenure)
			.selectionProcessType(defaultSelectionProcessType)
			.workSchedule(defaultWorkSchedule)
			.securityClearance(defaultSecurityClearance)
			.workforceMgmtApprovalRecvd(true)
			.priorityEntitlement(false)
			.employmentEquityNeedIdentifiedIndicator(false)
			.build());

		// Request 2: AS-05 classification, Gatineau city, EE-AE language requirement, Digital Service Directorate
		// Should match Profile 2
		requestRepository.save(RequestEntity.builder()
			.nameEn("AS-05 English Essential Position in Gatineau")
			.nameFr("Poste AS-05 essentiel anglais à Gatineau")
			.requestNumber("REQ-002")
			.positionNumber("00000002")
			.classification(as05)
			.cities(List.of(gatineau))
			.languageRequirement(eeAeLanguageReq)
			.languageProfileEn("BBB")
			.languageProfileFr("BBB")
			.somcAndConditionEmploymentEn("English statement of merit criteria and conditions of employment for AS-05 position requiring English essential proficiency.")
			.somcAndConditionEmploymentFr("Énoncé des critères de mérite et conditions d'emploi en français pour le poste AS-05 exigeant la compétence essentiel anglais.")
			.requestStatus(submittedStatus)
			.submitter(sentinelUser)
			.hiringManager(null)             // Different hiring manager
			.subDelegatedManager(null) // Different sub-delegated manager
			.language(defaultLanguage)
			.workUnit(digitalServiceDirectorate)
			.startDate(java.time.LocalDate.now().plusDays(30))
			.endDate(java.time.LocalDate.now().plusDays(90))
			.employmentTenure(defaultEmploymentTenure)
			.selectionProcessType(defaultSelectionProcessType)
			.workSchedule(defaultWorkSchedule)
			.securityClearance(defaultSecurityClearance)
			.workforceMgmtApprovalRecvd(true)
			.priorityEntitlement(false)
			.employmentEquityNeedIdentifiedIndicator(false)
			.build());

		// Request 3: PM-05 classification, Montreal city, BI language requirement, Accessible Canada Directorate
		// Should match Profile 1
		requestRepository.save(RequestEntity.builder()
			.nameEn("PM-05 Bilingual Position in Montreal")
			.nameFr("Poste PM-05 bilingue à Montréal")
			.requestNumber("REQ-003")
			.positionNumber("00000003")
			.classification(pm05)
			.cities(List.of(montreal))
			.languageRequirement(biLanguageReq)
			.languageProfileEn("BBB")
			.languageProfileFr("BBB")
			.somcAndConditionEmploymentEn("English statement of merit criteria and conditions of employment for PM-05 position requiring bilingual proficiency.")
			.somcAndConditionEmploymentFr("Énoncé des critères de mérite et conditions d'emploi en français pour le poste PM-05 exigeant la compétence bilingue.")
			.requestStatus(submittedStatus)
			.submitter(sentinelUser)
			.hiringManager(sentinelUser)                    // Submitter is the hiring manager
			.subDelegatedManager(null) // Different sub-delegated manager
			.language(defaultLanguage)
			.workUnit(accessibleCanadaDirectorate)
			.startDate(java.time.LocalDate.now().plusDays(30))
			.endDate(java.time.LocalDate.now().plusDays(90))
			.employmentTenure(defaultEmploymentTenure)
			.selectionProcessType(defaultSelectionProcessType)
			.workSchedule(defaultWorkSchedule)
			.securityClearance(defaultSecurityClearance)
			.workforceMgmtApprovalRecvd(true)
			.priorityEntitlement(false)
			.employmentEquityNeedIdentifiedIndicator(false)
			.build());
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