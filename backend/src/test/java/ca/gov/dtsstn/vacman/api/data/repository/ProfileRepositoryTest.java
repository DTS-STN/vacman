package ca.gov.dtsstn.vacman.api.data.repository;

import static ca.gov.dtsstn.vacman.api.data.repository.ProfileRepository.hasFirstNameContaining;
import static ca.gov.dtsstn.vacman.api.data.repository.ProfileRepository.hasHrAdvisorId;
import static ca.gov.dtsstn.vacman.api.data.repository.ProfileRepository.hasHrAdvisorIdIn;
import static ca.gov.dtsstn.vacman.api.data.repository.ProfileRepository.hasLastNameContaining;
import static ca.gov.dtsstn.vacman.api.data.repository.ProfileRepository.hasMiddleNameContaining;
import static ca.gov.dtsstn.vacman.api.data.repository.ProfileRepository.hasPreferredCityCodeIn;
import static ca.gov.dtsstn.vacman.api.data.repository.ProfileRepository.hasPreferredCityIdIn;
import static ca.gov.dtsstn.vacman.api.data.repository.ProfileRepository.hasPreferredClassificationCodeIn;
import static ca.gov.dtsstn.vacman.api.data.repository.ProfileRepository.hasPreferredClassificationIdIn;
import static ca.gov.dtsstn.vacman.api.data.repository.ProfileRepository.hasPreferredLanguageCodeIn;
import static ca.gov.dtsstn.vacman.api.data.repository.ProfileRepository.hasPreferredLanguageIdIn;
import static ca.gov.dtsstn.vacman.api.data.repository.ProfileRepository.hasProfileStatusCodeIn;
import static ca.gov.dtsstn.vacman.api.data.repository.ProfileRepository.hasProfileStatusIdIn;
import static ca.gov.dtsstn.vacman.api.data.repository.ProfileRepository.hasUserId;
import static ca.gov.dtsstn.vacman.api.data.repository.ProfileRepository.hasUserMicrosoftEntraId;
import static ca.gov.dtsstn.vacman.api.data.repository.ProfileRepository.isAvailableForReferral;
import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.data.jpa.test.autoconfigure.DataJpaTest;
import org.springframework.boot.jdbc.test.autoconfigure.AutoConfigureTestDatabase;
import org.springframework.boot.jdbc.test.autoconfigure.AutoConfigureTestDatabase.Replace;
import org.springframework.context.annotation.Import;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;

import ca.gov.dtsstn.vacman.api.SecurityAuditor;
import ca.gov.dtsstn.vacman.api.config.DataSourceConfig;
import ca.gov.dtsstn.vacman.api.data.entity.CityEntity;
import ca.gov.dtsstn.vacman.api.data.entity.ClassificationEntity;
import ca.gov.dtsstn.vacman.api.data.entity.LanguageReferralTypeEntity;
import ca.gov.dtsstn.vacman.api.data.entity.ProfileEntity;
import ca.gov.dtsstn.vacman.api.data.entity.ProfileStatusEntity;
import ca.gov.dtsstn.vacman.api.data.entity.UserEntity;

@DataJpaTest
@ActiveProfiles("test")
@Import({ DataSourceConfig.class })
@DisplayName("ProfileRepository tests")
@AutoConfigureTestDatabase(replace = Replace.NONE)
class ProfileRepositoryTest {

	@Autowired
	CityRepository cityRepository;

	@Autowired
	ClassificationRepository classificationRepository;

	@Autowired
	LanguageRepository languageRepository;

	@Autowired
	LanguageReferralTypeRepository languageReferralTypeRepository;

	@Autowired
	ProfileRepository profileRepository;

	@Autowired
	ProfileStatusRepository profileStatusRepository;

	@Autowired
	UserRepository userRepository;

	@Autowired
	UserTypeRepository userTypeRepository;

	@MockitoBean
	SecurityAuditor securityAuditor;

	CityEntity cityOttawa;
	CityEntity cityStJohns;
	CityEntity cityBathurst;

	ClassificationEntity classificationAs01;
	ClassificationEntity classificationPm02;
	ClassificationEntity classificationIt03;

	LanguageReferralTypeEntity languageReferralTypeBilingual;
	LanguageReferralTypeEntity languageReferralTypeEnglish;
	LanguageReferralTypeEntity languageReferralTypeFrench;

	ProfileStatusEntity statusApproved;
	ProfileStatusEntity statusPending;

	UserEntity testUser;
	UserEntity hrAdvisor1;
	UserEntity hrAdvisor2;

	@BeforeEach
	void setUp() {
		when(securityAuditor.getCurrentAuditor())
			.thenReturn(Optional.of("test-user"));

		//
		// Create test users (user + HRAs) in database
		//

		testUser = userRepository.save(UserEntity.builder()
			.language(languageRepository.findByCode("EN").orElseThrow())
			.userType(userTypeRepository.findByCode("employee").orElseThrow())
			.microsoftEntraId("01010101-0101-0101-0101-010101010101")
			.businessEmailAddress("test.user@example.com")
			.firstName("Test")
			.lastName("User")
			.build());

		hrAdvisor1 = userRepository.save(UserEntity.builder()
			.language(languageRepository.findByCode("EN").orElseThrow())
			.userType(userTypeRepository.findByCode("HRA").orElseThrow())
			.microsoftEntraId("02020202-0202-0202-0202-020202020202")
			.businessEmailAddress("hr.advisor1@example.com")
			.firstName("HR")
			.lastName("Advisor 1")
			.build());

		hrAdvisor2 = userRepository.save(UserEntity.builder()
			.language(languageRepository.findByCode("FR").orElseThrow())
			.userType(userTypeRepository.findByCode("HRA").orElseThrow())
			.microsoftEntraId("03030303-0303-0303-0303-030303030303")
			.businessEmailAddress("hr.advisor2@example.com")
			.firstName("HR")
			.lastName("Advisor 2")
			.build());

		//
		// Get cities that will be used throughout the tests
		//

		cityBathurst = cityRepository.findByCode("NB1").orElseThrow();
		cityOttawa = cityRepository.findByCode("ON52").orElseThrow();
		cityStJohns = cityRepository.findByCode("NL14").orElseThrow();

		//
		// Get classifications that will be used throughout the tests
		//

		classificationAs01 = classificationRepository.findByCode("AS-01").orElseThrow();
		classificationIt03 = classificationRepository.findByCode("IT-03").orElseThrow();
		classificationPm02 = classificationRepository.findByCode("PM-02").orElseThrow();

		//
		// Get language referral types that will be used throughout the tests
		// Note: Using database IDs since we know these exist in test data
		//

		languageReferralTypeBilingual = languageReferralTypeRepository.findByCode("BILINGUAL").orElseThrow();
		languageReferralTypeEnglish = languageReferralTypeRepository.findByCode("ENGLISH").orElseThrow();
		languageReferralTypeFrench = languageReferralTypeRepository.findByCode("FRENCH").orElseThrow();

		//
		// Get profile statuses that will be throughout the tests
		//

		statusApproved = profileStatusRepository.findByCode("APPROVED").orElseThrow();
		statusPending = profileStatusRepository.findByCode("PENDING").orElseThrow();
	}

	@Nested
	@DisplayName("Availability Specification Tests")
	class AvailabilitySpecificationTests {

		@Test
		@DisplayName("isAvailableForReferral should find profiles available for referral")
		void testIsAvailableForReferral() {
			final var availableProfile1 = profileRepository.save(
				ProfileEntity.builder()
					.user(testUser)
					.profileStatus(statusApproved)
					.isAvailableForReferral(true)
					.build());

			final var availableProfile2 = profileRepository.save(
				ProfileEntity.builder()
					.user(testUser)
					.profileStatus(statusApproved)
					.isAvailableForReferral(true)
					.build());

			@SuppressWarnings("unused")
			final var notAvailableProfile = profileRepository.save(
				ProfileEntity.builder()
					.user(testUser)
					.profileStatus(statusApproved)
					.isAvailableForReferral(false)
					.build());

			@SuppressWarnings("unused")
			final var nullAvailableProfile = profileRepository.save(
				ProfileEntity.builder()
					.user(testUser)
					.profileStatus(statusApproved)
					.isAvailableForReferral(null)
					.build());

			final var results = profileRepository.findAll(
				isAvailableForReferral(true)
				.and(ProfileRepository.hasUserId(testUser.getId())));

			assertThat(results).hasSize(2);
			assertThat(results).extracting(ProfileEntity::getId)
				.containsExactlyInAnyOrder(availableProfile1.getId(), availableProfile2.getId());
		}

		@Test
		@DisplayName("isAvailableForReferral should return empty list when no profiles are available")
		void testIsAvailableForReferralNoMatches() {
			@SuppressWarnings("unused")
			final var notAvailableProfile = profileRepository.save(
				ProfileEntity.builder()
					.user(testUser)
					.profileStatus(statusApproved)
					.isAvailableForReferral(false)
					.build());

			final var results = profileRepository.findAll(
				isAvailableForReferral(true)
				.and(ProfileRepository.hasUserId(testUser.getId())));

			assertThat(results).isEmpty();
		}

		@Test
		@DisplayName("isAvailableForReferral should exclude null values")
		void testIsAvailableForReferralExcludesNull() {
			@SuppressWarnings("unused")
			final var nullAvailableProfile = profileRepository.save(
				ProfileEntity.builder()
					.user(testUser)
					.profileStatus(statusApproved)
					.isAvailableForReferral(null)
					.build());

			final var results = profileRepository.findAll(
				isAvailableForReferral(true)
				.and(ProfileRepository.hasUserId(testUser.getId())));

			assertThat(results).isEmpty();
		}

	}

	@Nested
	@DisplayName("City Specification Tests")
	class CitySpecificationTests {

		@Test
		@DisplayName("hasPreferredCityIdIn should find profiles by preferred city IDs")
		void testHasPreferredCityIdIn() {
			final var profile1 = profileRepository.save(
				ProfileEntity.builder()
					.user(testUser)
					.profileStatus(statusApproved)
					.preferredCities(List.of(cityOttawa, cityStJohns))
					.build());

			final var profile2 = profileRepository.save(
				ProfileEntity.builder()
					.user(testUser)
					.profileStatus(statusApproved)
					.preferredCities(List.of(cityStJohns))
					.build());

			@SuppressWarnings("unused")
			final var profile3 = profileRepository.save(
				ProfileEntity.builder()
					.user(testUser)
					.profileStatus(statusApproved)
					.preferredCities(List.of(cityBathurst))
					.build());

			final var results = profileRepository.findAll(
				hasPreferredCityIdIn(List.of(cityOttawa.getId(), cityStJohns.getId()))
				.and(hasUserId(testUser.getId())));

			assertThat(results).hasSize(2);
			assertThat(results).extracting(ProfileEntity::getId)
				.containsExactlyInAnyOrder(profile1.getId(), profile2.getId());
		}

		@Test
		@DisplayName("hasPreferredCityIdIn should find profiles with any matching city")
		void testHasPreferredCityIdInAnyMatch() {
			final var profile1 = profileRepository.save(
				ProfileEntity.builder()
					.user(testUser)
					.profileStatus(statusApproved)
					.preferredCities(List.of(cityOttawa))
					.build());

			@SuppressWarnings("unused")
			final var profile2 = profileRepository.save(
				ProfileEntity.builder()
					.user(testUser)
					.profileStatus(statusApproved)
					.preferredCities(List.of(cityBathurst))
					.build());

			final var results = profileRepository.findAll(
				hasPreferredCityIdIn(List.of(cityOttawa.getId()))
				.and(hasUserId(testUser.getId())));

			assertThat(results).hasSize(1);
			assertThat(results.get(0).getId()).isEqualTo(profile1.getId());
		}

		@Test
		@DisplayName("hasPreferredCityIdIn should return empty when no profiles match")
		void testHasPreferredCityIdInNoMatches() {
			@SuppressWarnings("unused")
			final var profile = profileRepository.save(
				ProfileEntity.builder()
					.user(testUser)
					.profileStatus(statusApproved)
					.preferredCities(List.of(cityOttawa))
					.build());

			final var results = profileRepository.findAll(
				hasPreferredCityIdIn(List.of(999999L))
				.and(hasUserId(testUser.getId())));

			assertThat(results).isEmpty();
		}

		@Test
		@DisplayName("hasPreferredCityIdIn should match all when collection is empty")
		void testHasPreferredCityIdInEmptyCollection() {
			@SuppressWarnings("unused")
			final var profile = profileRepository.save(
				ProfileEntity.builder()
					.user(testUser)
					.profileStatus(statusApproved)
					.preferredCities(List.of(cityOttawa))
					.build());

			final var results = profileRepository.findAll(hasPreferredCityIdIn(List.of()));

			assertThat(results).isNotNull();
		}

		@Test
		@DisplayName("hasPreferredCityIdIn should match all when collection is null")
		void testHasPreferredCityIdInNullCollection() {
			@SuppressWarnings("unused")
			final var profile = profileRepository.save(
				ProfileEntity.builder()
					.user(testUser)
					.profileStatus(statusApproved)
					.preferredCities(List.of(cityOttawa))
					.build());

			final var results = profileRepository.findAll(hasPreferredCityIdIn((Collection<Long>) null));

			assertThat(results).isNotNull();
		}

		@Test
		@DisplayName("hasPreferredCityCodeIn should find profiles by preferred city codes")
		void testHasPreferredCityCodeIn() {
			final var profile1 = profileRepository.save(
				ProfileEntity.builder()
					.user(testUser)
					.profileStatus(statusApproved)
					.preferredCities(List.of(cityOttawa, cityStJohns))
					.build());

			final var profile2 = profileRepository.save(
				ProfileEntity.builder()
					.user(testUser)
					.profileStatus(statusApproved)
					.preferredCities(List.of(cityStJohns))
					.build());

			@SuppressWarnings("unused")
			final var profile3 = profileRepository.save(
				ProfileEntity.builder()
					.user(testUser)
					.profileStatus(statusApproved)
					.preferredCities(List.of(cityBathurst))
					.build());

			final var results = profileRepository.findAll(
				hasPreferredCityCodeIn(List.of(cityOttawa.getCode(), cityStJohns.getCode()))
				.and(hasUserId(testUser.getId())));

			assertThat(results).hasSize(2);
			assertThat(results).extracting(ProfileEntity::getId)
				.containsExactlyInAnyOrder(profile1.getId(), profile2.getId());
		}

		@Test
		@DisplayName("hasPreferredCityCodeIn should find profiles with any matching city code")
		void testHasPreferredCityCodeInAnyMatch() {
			final var profile1 = profileRepository.save(
				ProfileEntity.builder()
					.user(testUser)
					.profileStatus(statusApproved)
					.preferredCities(List.of(cityOttawa))
					.build());

			@SuppressWarnings("unused")
			final var profile2 = profileRepository.save(
				ProfileEntity.builder()
					.user(testUser)
					.profileStatus(statusApproved)
					.preferredCities(List.of(cityBathurst))
					.build());

			final var results = profileRepository.findAll(
				hasPreferredCityCodeIn(List.of(cityOttawa.getCode()))
				.and(hasUserId(testUser.getId())));

			assertThat(results).hasSize(1);
			assertThat(results.get(0).getId()).isEqualTo(profile1.getId());
		}

		@Test
		@DisplayName("hasPreferredCityCodeIn should return empty when no profiles match")
		void testHasPreferredCityCodeInNoMatches() {
			@SuppressWarnings("unused")
			final var profile = profileRepository.save(
				ProfileEntity.builder()
					.user(testUser)
					.profileStatus(statusApproved)
					.preferredCities(List.of(cityOttawa))
					.build());

			final var results = profileRepository.findAll(
				hasPreferredCityCodeIn(List.of("NONEXISTENT"))
				.and(hasUserId(testUser.getId())));

			assertThat(results).isEmpty();
		}

		@Test
		@DisplayName("hasPreferredCityCodeIn should match all when collection is empty")
		void testHasPreferredCityCodeInEmptyCollection() {
			@SuppressWarnings("unused")
			final var profile = profileRepository.save(
				ProfileEntity.builder()
					.user(testUser)
					.profileStatus(statusApproved)
					.preferredCities(List.of(cityOttawa))
					.build());

			final var results = profileRepository.findAll(hasPreferredCityCodeIn(List.of()));

			assertThat(results).isNotNull();
		}

		@Test
		@DisplayName("hasPreferredCityCodeIn should match all when collection is null")
		void testHasPreferredCityCodeInNullCollection() {
			@SuppressWarnings("unused")
			final var profile = profileRepository.save(
				ProfileEntity.builder()
					.user(testUser)
					.profileStatus(statusApproved)
					.preferredCities(List.of(cityOttawa))
					.build());

			final var results = profileRepository.findAll(hasPreferredCityCodeIn((Collection<String>) null));

			assertThat(results).isNotNull();
		}

	}

	@Nested
	@DisplayName("Classification Specification Tests")
	class ClassificationSpecificationTests {

		@Test
		@DisplayName("hasPreferredClassificationIdIn should find profiles by preferred classification IDs")
		void testHasPreferredClassificationIdIn() {
			final var profile1 = profileRepository.save(
				ProfileEntity.builder()
					.user(testUser)
					.profileStatus(statusApproved)
					.preferredClassifications(List.of(classificationAs01, classificationPm02))
					.build());

			final var profile2 = profileRepository.save(
				ProfileEntity.builder()
					.user(testUser)
					.profileStatus(statusApproved)
					.preferredClassifications(List.of(classificationPm02))
					.build());

			@SuppressWarnings("unused")
			final var profile3 = profileRepository.save(
				ProfileEntity.builder()
					.user(testUser)
					.profileStatus(statusApproved)
					.preferredClassifications(List.of(classificationIt03))
					.build());

			final var results = profileRepository.findAll(
				hasPreferredClassificationIdIn(List.of(classificationAs01.getId(), classificationPm02.getId()))
				.and(hasUserId(testUser.getId())));

			assertThat(results).hasSize(2);
			assertThat(results).extracting(ProfileEntity::getId)
				.containsExactlyInAnyOrder(profile1.getId(), profile2.getId());
		}

		@Test
		@DisplayName("hasPreferredClassificationIdIn should find profiles with any matching classification")
		void testHasPreferredClassificationIdInAnyMatch() {
			final var profile1 = profileRepository.save(
				ProfileEntity.builder()
					.user(testUser)
					.profileStatus(statusApproved)
					.preferredClassifications(List.of(classificationAs01))
					.build());

			@SuppressWarnings("unused")
			final var profile2 = profileRepository.save(
				ProfileEntity.builder()
					.user(testUser)
					.profileStatus(statusApproved)
					.preferredClassifications(List.of(classificationIt03))
					.build());

			final var results = profileRepository.findAll(
				hasPreferredClassificationIdIn(List.of(classificationAs01.getId()))
				.and(hasUserId(testUser.getId())));

			assertThat(results).hasSize(1);
			assertThat(results.get(0).getId()).isEqualTo(profile1.getId());
		}

		@Test
		@DisplayName("hasPreferredClassificationIdIn should return empty when no profiles match")
		void testHasPreferredClassificationIdInNoMatches() {
			@SuppressWarnings("unused")
			final var profile = profileRepository.save(
				ProfileEntity.builder()
					.user(testUser)
					.profileStatus(statusApproved)
					.preferredClassifications(List.of(classificationAs01))
					.build());

			final var results = profileRepository.findAll(
				hasPreferredClassificationIdIn(List.of(999999L))
				.and(hasUserId(testUser.getId())));

			assertThat(results).isEmpty();
		}

		@Test
		@DisplayName("hasPreferredClassificationIdIn should match all when collection is empty")
		void testHasPreferredClassificationIdInEmptyCollection() {
			@SuppressWarnings("unused")
			final var profile = profileRepository.save(
				ProfileEntity.builder()
					.user(testUser)
					.profileStatus(statusApproved)
					.preferredClassifications(List.of(classificationAs01))
					.build());

			final var results = profileRepository.findAll(hasPreferredClassificationIdIn(List.of()));

			assertThat(results).isNotNull();
		}

		@Test
		@DisplayName("hasPreferredClassificationIdIn should match all when collection is null")
		void testHasPreferredClassificationIdInNullCollection() {
			@SuppressWarnings("unused")
			final var profile = profileRepository.save(
				ProfileEntity.builder()
					.user(testUser)
					.profileStatus(statusApproved)
					.preferredClassifications(List.of(classificationAs01))
					.build());

			final var results = profileRepository.findAll(hasPreferredClassificationIdIn((Collection<Long>) null));

			assertThat(results).isNotNull();
		}

		@Test
		@DisplayName("hasPreferredClassificationCodeIn should find profiles by preferred classification codes")
		void testHasPreferredClassificationCodeIn() {
			final var profile1 = profileRepository.save(
				ProfileEntity.builder()
					.user(testUser)
					.profileStatus(statusApproved)
					.preferredClassifications(List.of(classificationAs01, classificationPm02))
					.build());

			final var profile2 = profileRepository.save(
				ProfileEntity.builder()
					.user(testUser)
					.profileStatus(statusApproved)
					.preferredClassifications(List.of(classificationPm02))
					.build());

			@SuppressWarnings("unused")
			final var profile3 = profileRepository.save(
				ProfileEntity.builder()
					.user(testUser)
					.profileStatus(statusApproved)
					.preferredClassifications(List.of(classificationIt03))
					.build());

			final var results = profileRepository.findAll(
				hasPreferredClassificationCodeIn(List.of(classificationAs01.getCode(), classificationPm02.getCode()))
				.and(hasUserId(testUser.getId())));

			assertThat(results).hasSize(2);
			assertThat(results).extracting(ProfileEntity::getId)
				.containsExactlyInAnyOrder(profile1.getId(), profile2.getId());
		}

		@Test
		@DisplayName("hasPreferredClassificationCodeIn should find profiles with any matching classification code")
		void testHasPreferredClassificationCodeInAnyMatch() {
			final var profile1 = profileRepository.save(
				ProfileEntity.builder()
					.user(testUser)
					.profileStatus(statusApproved)
					.preferredClassifications(List.of(classificationAs01))
					.build());

			@SuppressWarnings("unused")
			final var profile2 = profileRepository.save(
				ProfileEntity.builder()
					.user(testUser)
					.profileStatus(statusApproved)
					.preferredClassifications(List.of(classificationIt03))
					.build());

			final var results = profileRepository.findAll(
				hasPreferredClassificationCodeIn(List.of(classificationAs01.getCode()))
				.and(hasUserId(testUser.getId())));

			assertThat(results).hasSize(1);
			assertThat(results.get(0).getId()).isEqualTo(profile1.getId());
		}

		@Test
		@DisplayName("hasPreferredClassificationCodeIn should return empty when no profiles match")
		void testHasPreferredClassificationCodeInNoMatches() {
			@SuppressWarnings("unused")
			final var profile = profileRepository.save(
				ProfileEntity.builder()
					.user(testUser)
					.profileStatus(statusApproved)
					.preferredClassifications(List.of(classificationAs01))
					.build());

			final var results = profileRepository.findAll(
				hasPreferredClassificationCodeIn(List.of("NONEXISTENT"))
				.and(hasUserId(testUser.getId())));

			assertThat(results).isEmpty();
		}

		@Test
		@DisplayName("hasPreferredClassificationCodeIn should match all when collection is empty")
		void testHasPreferredClassificationCodeInEmptyCollection() {
			@SuppressWarnings("unused")
			final var profile = profileRepository.save(
				ProfileEntity.builder()
					.user(testUser)
					.profileStatus(statusApproved)
					.preferredClassifications(List.of(classificationAs01))
					.build());

			final var results = profileRepository.findAll(hasPreferredClassificationCodeIn(List.of()));

			assertThat(results).isNotNull();
		}

		@Test
		@DisplayName("hasPreferredClassificationCodeIn should match all when collection is null")
		void testHasPreferredClassificationCodeInNullCollection() {
			@SuppressWarnings("unused")
			final var profile = profileRepository.save(
				ProfileEntity.builder()
					.user(testUser)
					.profileStatus(statusApproved)
					.preferredClassifications(List.of(classificationAs01))
					.build());

			final var results = profileRepository.findAll(hasPreferredClassificationCodeIn((Collection<String>) null));

			assertThat(results).isNotNull();
		}

	}

	@Nested
	@DisplayName("HR Advisor Specification Tests")
	class HrAdvisorSpecificationTests {

		@Test
		@DisplayName("hasHrAdvisorId should find profiles by HR advisor ID")
		void testHasHrAdvisorId() {
			//
			// Create profiles with different HR advisors
			//
			final var profile1 = profileRepository.save(
				ProfileEntity.builder()
					.user(testUser)
					.hrAdvisor(hrAdvisor1)
					.profileStatus(statusApproved)
					.build());

			@SuppressWarnings({ "unused" })
			final var profile2 = profileRepository.save(
				ProfileEntity.builder()
					.user(testUser)
					.hrAdvisor(hrAdvisor2)
					.profileStatus(statusApproved)
					.build());

			final var profile3 = profileRepository.save(
				ProfileEntity.builder()
					.user(testUser)
					.hrAdvisor(hrAdvisor1)
					.profileStatus(statusApproved)
					.build());

			final var results = profileRepository.findAll(hasHrAdvisorId(hrAdvisor1.getId()));

			assertThat(results).hasSize(2);
			assertThat(results).extracting(ProfileEntity::getId)
				.containsExactlyInAnyOrder(profile1.getId(), profile3.getId());
		}

		@Test
		@DisplayName("hasHrAdvisorId should return empty list when no profiles match")
		void testHasHrAdvisorIdNoMatches() {
			@SuppressWarnings({ "unused" })
			final var profile = profileRepository.save(
				ProfileEntity.builder()
					.user(testUser)
					.hrAdvisor(hrAdvisor1)
					.profileStatus(statusApproved)
					.build());

			final var results = profileRepository.findAll(hasHrAdvisorId(999999L));

			assertThat(results).isEmpty();
		}

		@Test
		@DisplayName("hasHrAdvisorIdIn should find profiles by multiple HR advisor IDs")
		void testHasHrAdvisorIdIn() {
			final var profile1 = profileRepository.save(
				ProfileEntity.builder()
					.user(testUser)
					.hrAdvisor(hrAdvisor1)
					.profileStatus(statusApproved)
					.build());

			final var profile2 = profileRepository.save(
				ProfileEntity.builder()
					.user(testUser)
					.hrAdvisor(hrAdvisor2)
					.profileStatus(statusApproved)
					.build());

			@SuppressWarnings({ "unused" })
			final var profile3 = profileRepository.save(
				ProfileEntity.builder()
					.user(testUser)
					.profileStatus(statusApproved)
					.build());

			final var results = profileRepository.findAll(hasHrAdvisorIdIn(List.of(
				hrAdvisor1.getId(),
				hrAdvisor2.getId())));

			assertThat(results).hasSize(2);
			assertThat(results).extracting(ProfileEntity::getId)
				.containsExactlyInAnyOrder(profile1.getId(), profile2.getId());
		}

		@Test
		@DisplayName("hasHrAdvisorIdIn should match all when collection is empty")
		void testHasHrAdvisorIdInEmptyCollection() {
			@SuppressWarnings({ "unused" })
			final var profile = profileRepository.save(
				ProfileEntity.builder()
					.user(testUser)
					.hrAdvisor(hrAdvisor1)
					.profileStatus(statusApproved)
					.build());

			final var results = profileRepository.findAll(hasHrAdvisorIdIn(List.of()));

			// Verify it returns results without error
			// (note: matches all due to conjunction)
			assertThat(results).isNotNull();
		}

		@Test
		@DisplayName("hasHrAdvisorIdIn should match all when collection is null")
		void testHasHrAdvisorIdInNullCollection() {
			@SuppressWarnings({ "unused" })
			final var profile = profileRepository.save(
				ProfileEntity.builder()
					.user(testUser)
					.hrAdvisor(hrAdvisor1)
					.profileStatus(statusApproved)
					.build());

			final var results = profileRepository.findAll(hasHrAdvisorIdIn((Collection<Long>) null));

			// Verify it returns results without error
			// (note: matches all due to conjunction)
			assertThat(results).isNotNull();
		}

	}

	@Nested
	@DisplayName("Language Specification Tests")
	class LanguageSpecificationTests {

		@Test
		@DisplayName("hasPreferredLanguageIdIn should find profiles by preferred language referral type IDs")
		void testHasPreferredLanguageIdIn() {
			final var profile1 = profileRepository.save(
				ProfileEntity.builder()
					.user(testUser)
					.profileStatus(statusApproved)
					.preferredLanguages(List.of(languageReferralTypeBilingual, languageReferralTypeEnglish))
					.build());

			final var profile2 = profileRepository.save(
				ProfileEntity.builder()
					.user(testUser)
					.profileStatus(statusApproved)
					.preferredLanguages(List.of(languageReferralTypeEnglish))
					.build());

			@SuppressWarnings("unused")
			final var profile3 = profileRepository.save(
				ProfileEntity.builder()
					.user(testUser)
					.profileStatus(statusApproved)
					.preferredLanguages(List.of(languageReferralTypeFrench))
					.build());

			final var results = profileRepository.findAll(
				hasPreferredLanguageIdIn(List.of(languageReferralTypeBilingual.getId(), languageReferralTypeEnglish.getId()))
				.and(hasUserId(testUser.getId())));

			assertThat(results).hasSize(2);
			assertThat(results).extracting(ProfileEntity::getId)
				.containsExactlyInAnyOrder(profile1.getId(), profile2.getId());
		}

		@Test
		@DisplayName("hasPreferredLanguageIdIn should find profiles with any matching language")
		void testHasPreferredLanguageIdInAnyMatch() {
			final var profile1 = profileRepository.save(
				ProfileEntity.builder()
					.user(testUser)
					.profileStatus(statusApproved)
					.preferredLanguages(List.of(languageReferralTypeBilingual))
					.build());

			@SuppressWarnings("unused")
			final var profile2 = profileRepository.save(
				ProfileEntity.builder()
					.user(testUser)
					.profileStatus(statusApproved)
					.preferredLanguages(List.of(languageReferralTypeFrench))
					.build());

			final var results = profileRepository.findAll(
				hasPreferredLanguageIdIn(List.of(languageReferralTypeBilingual.getId()))
				.and(hasUserId(testUser.getId())));

			assertThat(results).hasSize(1);
			assertThat(results.get(0).getId()).isEqualTo(profile1.getId());
		}

		@Test
		@DisplayName("hasPreferredLanguageIdIn should return empty when no profiles match")
		void testHasPreferredLanguageIdInNoMatches() {
			@SuppressWarnings("unused")
			final var profile = profileRepository.save(
				ProfileEntity.builder()
					.user(testUser)
					.profileStatus(statusApproved)
					.preferredLanguages(List.of(languageReferralTypeBilingual))
					.build());

			final var results = profileRepository.findAll(
				hasPreferredLanguageIdIn(List.of(999999L))
				.and(hasUserId(testUser.getId())));

			assertThat(results).isEmpty();
		}

		@Test
		@DisplayName("hasPreferredLanguageIdIn should match all when collection is empty")
		void testHasPreferredLanguageIdInEmptyCollection() {
			@SuppressWarnings("unused")
			final var profile = profileRepository.save(
				ProfileEntity.builder()
					.user(testUser)
					.profileStatus(statusApproved)
					.preferredLanguages(List.of(languageReferralTypeBilingual))
					.build());

			final var results = profileRepository.findAll(hasPreferredLanguageIdIn(List.of()));

			assertThat(results).isNotNull();
		}

		@Test
		@DisplayName("hasPreferredLanguageIdIn should match all when collection is null")
		void testHasPreferredLanguageIdInNullCollection() {
			@SuppressWarnings("unused")
			final var profile = profileRepository.save(
				ProfileEntity.builder()
					.user(testUser)
					.profileStatus(statusApproved)
					.preferredLanguages(List.of(languageReferralTypeBilingual))
					.build());

			final var results = profileRepository.findAll(hasPreferredLanguageIdIn((Collection<Long>) null));

			assertThat(results).isNotNull();
		}

		@Test
		@DisplayName("hasPreferredLanguageCodeIn should find profiles by preferred language referral type codes")
		void testHasPreferredLanguageCodeIn() {
			final var profile1 = profileRepository.save(
				ProfileEntity.builder()
					.user(testUser)
					.profileStatus(statusApproved)
					.preferredLanguages(List.of(languageReferralTypeBilingual, languageReferralTypeEnglish))
					.build());

			final var profile2 = profileRepository.save(
				ProfileEntity.builder()
					.user(testUser)
					.profileStatus(statusApproved)
					.preferredLanguages(List.of(languageReferralTypeEnglish))
					.build());

			@SuppressWarnings("unused")
			final var profile3 = profileRepository.save(
				ProfileEntity.builder()
					.user(testUser)
					.profileStatus(statusApproved)
					.preferredLanguages(List.of(languageReferralTypeFrench))
					.build());

			final var results = profileRepository.findAll(
				hasPreferredLanguageCodeIn(List.of(languageReferralTypeBilingual.getCode(), languageReferralTypeEnglish.getCode()))
				.and(hasUserId(testUser.getId())));

			assertThat(results).hasSize(2);
			assertThat(results).extracting(ProfileEntity::getId)
				.containsExactlyInAnyOrder(profile1.getId(), profile2.getId());
		}

		@Test
		@DisplayName("hasPreferredLanguageCodeIn should find profiles with any matching language code")
		void testHasPreferredLanguageCodeInAnyMatch() {
			final var profile1 = profileRepository.save(
				ProfileEntity.builder()
					.user(testUser)
					.profileStatus(statusApproved)
					.preferredLanguages(List.of(languageReferralTypeBilingual))
					.build());

			@SuppressWarnings("unused")
			final var profile2 = profileRepository.save(
				ProfileEntity.builder()
					.user(testUser)
					.profileStatus(statusApproved)
					.preferredLanguages(List.of(languageReferralTypeFrench))
					.build());

			final var results = profileRepository.findAll(
				hasPreferredLanguageCodeIn(List.of(languageReferralTypeBilingual.getCode()))
				.and(hasUserId(testUser.getId())));

			assertThat(results).hasSize(1);
			assertThat(results.get(0).getId()).isEqualTo(profile1.getId());
		}

		@Test
		@DisplayName("hasPreferredLanguageCodeIn should return empty when no profiles match")
		void testHasPreferredLanguageCodeInNoMatches() {
			@SuppressWarnings("unused")
			final var profile = profileRepository.save(
				ProfileEntity.builder()
					.user(testUser)
					.profileStatus(statusApproved)
					.preferredLanguages(List.of(languageReferralTypeBilingual))
					.build());

			final var results = profileRepository.findAll(
				hasPreferredLanguageCodeIn(List.of("NONEXISTENT"))
				.and(hasUserId(testUser.getId())));

			assertThat(results).isEmpty();
		}

		@Test
		@DisplayName("hasPreferredLanguageCodeIn should match all when collection is empty")
		void testHasPreferredLanguageCodeInEmptyCollection() {
			@SuppressWarnings("unused")
			final var profile = profileRepository.save(
				ProfileEntity.builder()
					.user(testUser)
					.profileStatus(statusApproved)
					.preferredLanguages(List.of(languageReferralTypeBilingual))
					.build());

			final var results = profileRepository.findAll(hasPreferredLanguageCodeIn(List.of()));

			assertThat(results).isNotNull();
		}

		@Test
		@DisplayName("hasPreferredLanguageCodeIn should match all when collection is null")
		void testHasPreferredLanguageCodeInNullCollection() {
			@SuppressWarnings("unused")
			final var profile = profileRepository.save(
				ProfileEntity.builder()
					.user(testUser)
					.profileStatus(statusApproved)
					.preferredLanguages(List.of(languageReferralTypeBilingual))
					.build());

			final var results = profileRepository.findAll(hasPreferredLanguageCodeIn((Collection<String>) null));

			assertThat(results).isNotNull();
		}

	}

	@Nested
	@DisplayName("Profile Status Specification Tests")
	class ProfileStatusSpecificationTests {

		@Test
		@DisplayName("hasProfileStatusCodeIn should find profiles by status codes")
		void testHasProfileStatusCodeIn() {
			final var activeProfile = profileRepository.save(
				ProfileEntity.builder()
					.user(testUser)
					.profileStatus(statusApproved)
					.build());

			@SuppressWarnings({ "unused" })
			final var pendingProfile = profileRepository.save(
				ProfileEntity.builder()
					.user(testUser)
					.profileStatus(statusPending)
					.build());

			final var results = profileRepository.findAll(
				hasProfileStatusCodeIn(List.of(statusApproved.getCode()))
				.and(hasUserId(testUser.getId())));

			assertThat(results).hasSize(1);
			assertThat(results.get(0).getId()).isEqualTo(activeProfile.getId());
		}

		@Test
		@DisplayName("hasProfileStatusCodeIn should find profiles by multiple status codes")
		void testHasProfileStatusCodeInMultiple() {
			final var activeProfile = profileRepository.save(
				ProfileEntity.builder()
					.user(testUser)
					.profileStatus(statusApproved)
					.build());

			final var pendingProfile = profileRepository.save(
				ProfileEntity.builder()
					.user(testUser)
					.profileStatus(statusPending)
					.build());

			final var results = profileRepository.findAll(
				hasProfileStatusCodeIn(List.of(statusApproved.getCode(), statusPending.getCode()))
				.and(hasUserId(testUser.getId())));

			assertThat(results).hasSize(2);
			assertThat(results).extracting(ProfileEntity::getId)
				.containsExactlyInAnyOrder(activeProfile.getId(), pendingProfile.getId());
		}

		@Test
		@DisplayName("hasProfileStatusCodeIn should match all when collection is empty")
		void testHasProfileStatusCodeInEmptyCollection() {
			@SuppressWarnings({ "unused" })
			final var profile = profileRepository.save(
				ProfileEntity.builder()
					.user(testUser)
					.profileStatus(statusApproved)
					.build());

			final var results = profileRepository.findAll(hasProfileStatusCodeIn(List.of()));

			assertThat(results).isNotNull();
		}

		@Test
		@DisplayName("hasProfileStatusCodeIn should match all when collection is null")
		void testHasProfileStatusCodeInNullCollection() {
			@SuppressWarnings({ "unused" })
			final var profile = profileRepository.save(
				ProfileEntity.builder()
					.user(testUser)
					.profileStatus(statusApproved)
					.build());

			final var results = profileRepository.findAll(hasProfileStatusCodeIn((Collection<String>) null));

			assertThat(results).isNotNull();
		}

		@Test
		@DisplayName("hasProfileStatusIdIn should find profiles by status IDs")
		void testHasProfileStatusIdIn() {
			final var activeProfile = profileRepository.save(
				ProfileEntity.builder()
					.user(testUser)
					.profileStatus(statusApproved)
					.build());

			@SuppressWarnings({ "unused" })
			final var pendingProfile = profileRepository.save(
				ProfileEntity.builder()
					.user(testUser)
					.profileStatus(statusPending)
					.build());

			final var results = profileRepository.findAll(
				hasProfileStatusIdIn(List.of(statusApproved.getId()))
				.and(hasUserId(testUser.getId())));

			assertThat(results).hasSize(1);
			assertThat(results.get(0).getId()).isEqualTo(activeProfile.getId());
		}

		@Test
		@DisplayName("hasProfileStatusIdIn should find profiles by multiple status IDs")
		void testHasProfileStatusIdInMultiple() {
			final var activeProfile = profileRepository.save(
				ProfileEntity.builder()
					.user(testUser)
					.profileStatus(statusApproved)
					.build());

			final var pendingProfile = profileRepository.save(
				ProfileEntity.builder()
					.user(testUser)
					.profileStatus(statusPending)
					.build());

			final var results = profileRepository.findAll(
				hasProfileStatusIdIn(List.of(statusApproved.getId(), statusPending.getId()))
				.and(hasUserId(testUser.getId())));

			assertThat(results).hasSize(2);
			assertThat(results).extracting(ProfileEntity::getId)
				.containsExactlyInAnyOrder(activeProfile.getId(), pendingProfile.getId());
		}

		@Test
		@DisplayName("hasProfileStatusIdIn should match all when collection is empty")
		void testHasProfileStatusIdInEmptyCollection() {
			@SuppressWarnings({ "unused" })
			final var profile = profileRepository.save(
				ProfileEntity.builder()
					.user(testUser)
					.profileStatus(statusApproved)
					.build());

			final var results = profileRepository.findAll(hasProfileStatusIdIn(List.of()));

			assertThat(results).isNotNull();
		}

		@Test
		@DisplayName("hasProfileStatusIdIn should match all when collection is null")
		void testHasProfileStatusIdInNullCollection() {
			@SuppressWarnings({ "unused" })
			final var profile = profileRepository.save(
				ProfileEntity.builder()
					.user(testUser)
					.profileStatus(statusApproved)
					.build());

			final var results = profileRepository.findAll(hasProfileStatusIdIn((Collection<Long>) null));

			assertThat(results).isNotNull();
		}

	}

	@Nested
	@DisplayName("User Specification Tests")
	class UserSpecificationTests {

		@Test
		@DisplayName("hasUserId should find profiles by user ID")
		void testHasUserId() {
			final var anotherUser = userRepository.save(
				UserEntity.builder()
					.language(languageRepository.findByCode("EN").orElseThrow())
					.userType(userTypeRepository.findByCode("employee").orElseThrow())
					.microsoftEntraId("04040404-0404-0404-0404-040404040404")
					.businessEmailAddress("another.user@example.com")
					.firstName("Another")
					.lastName("User")
					.build());

			final var profile1 = profileRepository.save(
				ProfileEntity.builder()
					.user(testUser)
					.profileStatus(statusApproved)
					.build());

			@SuppressWarnings({ "unused" })
			final var profile2 = profileRepository.save(
				ProfileEntity.builder()
					.user(anotherUser)
					.profileStatus(statusApproved)
					.build());

			final var results = profileRepository.findAll(hasUserId(testUser.getId()));

			assertThat(results).hasSize(1);
			assertThat(results.get(0).getId()).isEqualTo(profile1.getId());
		}

		@Test
		@DisplayName("hasUserId should return empty list when no profiles match")
		void testHasUserIdNoMatches() {
			@SuppressWarnings({ "unused" })
			final var profile = profileRepository.save(
				ProfileEntity.builder()
					.user(testUser)
					.profileStatus(statusApproved)
					.build());

			final var results = profileRepository.findAll(hasUserId(999999L));

			assertThat(results).isEmpty();
		}

		@Test
		@DisplayName("hasUserMicrosoftEntraId should find profiles by user's Microsoft Entra ID")
		void testHasUserMicrosoftEntraId() {
			final var anotherUser = userRepository.save(
				UserEntity.builder()
					.language(languageRepository.findByCode("EN").orElseThrow())
					.userType(userTypeRepository.findByCode("employee").orElseThrow())
					.microsoftEntraId("05050505-0505-0505-0505-050505050505")
					.businessEmailAddress("another.user@example.com")
					.firstName("Another")
					.lastName("User")
					.build());

			final var profile1 = profileRepository.save(
				ProfileEntity.builder()
					.user(testUser)
					.profileStatus(statusApproved)
					.build());

			@SuppressWarnings({ "unused" })
			final var profile2 = profileRepository.save(
				ProfileEntity.builder()
					.user(anotherUser)
					.profileStatus(statusApproved)
					.build());

			final var results = profileRepository.findAll(hasUserMicrosoftEntraId(testUser.getMicrosoftEntraId()));

			assertThat(results).hasSize(1);
			assertThat(results.get(0).getId()).isEqualTo(profile1.getId());
			assertThat(results.get(0).getUser().getMicrosoftEntraId())
				.isEqualTo(testUser.getMicrosoftEntraId());
		}

		@Test
		@DisplayName("hasUserMicrosoftEntraId should return empty list when no profiles match")
		void testHasUserMicrosoftEntraIdNoMatches() {
			@SuppressWarnings("unused")
			final var profile = profileRepository.save(
				ProfileEntity.builder()
					.user(testUser)
					.profileStatus(statusApproved)
					.build());

			final var results = profileRepository.findAll(hasUserMicrosoftEntraId("99999999-9999-9999-9999-999999999999"));

			assertThat(results).isEmpty();
		}

	}

	@Nested
	@DisplayName("Employee Name Search Tests")
	class EmployeeNameSearchTests {

		@Test
		@DisplayName("should find profiles across all name fields")
		void testFindAcrossAllNameFields() {
			// Create users with the search term in different name fields
			final var firstNameUser = userRepository.save(UserEntity.builder()
				.firstName("Robert")
				.lastName("Smith")
				.language(languageRepository.findByCode("EN").orElseThrow())
				.userType(userTypeRepository.findByCode("employee").orElseThrow())
				.microsoftEntraId("77777777-7777-7777-7777-777777777777")
				.businessEmailAddress("robert.smith2@example.com")
				.build());

			final var middleNameUser = userRepository.save(UserEntity.builder()
				.firstName("John")
				.middleName("Robert")
				.lastName("Smith")
				.language(languageRepository.findByCode("EN").orElseThrow())
				.userType(userTypeRepository.findByCode("employee").orElseThrow())
				.microsoftEntraId("88888888-8888-8888-8888-888888888888")
				.businessEmailAddress("john.robert.smith2@example.com")
				.build());

			final var lastNameUser = userRepository.save(UserEntity.builder()
				.firstName("John")
				.lastName("Robertson")
				.language(languageRepository.findByCode("EN").orElseThrow())
				.userType(userTypeRepository.findByCode("employee").orElseThrow())
				.microsoftEntraId("99999999-9999-9999-9999-999999999999")
				.businessEmailAddress("john.robertson2@example.com")
				.build());

			final var nonMatchingUser = userRepository.save(UserEntity.builder()
				.firstName("Jane")
				.lastName("Doe")
				.language(languageRepository.findByCode("EN").orElseThrow())
				.userType(userTypeRepository.findByCode("employee").orElseThrow())
				.microsoftEntraId("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa")
				.businessEmailAddress("jane.doe2@example.com")
				.build());

			// Create profiles with these users
			final var firstNameMatch = profileRepository.save(
				ProfileEntity.builder()
					.user(firstNameUser)
					.hrAdvisor(hrAdvisor1)
					.profileStatus(statusApproved)
					.build());

			final var middleNameMatch = profileRepository.save(
				ProfileEntity.builder()
					.user(middleNameUser)
					.hrAdvisor(hrAdvisor1)
					.profileStatus(statusApproved)
					.build());

			final var lastNameMatch = profileRepository.save(
				ProfileEntity.builder()
					.user(lastNameUser)
					.hrAdvisor(hrAdvisor1)
					.profileStatus(statusApproved)
					.build());

			// Create a profile that shouldn't match
			profileRepository.save(
				ProfileEntity.builder()
					.user(nonMatchingUser)
					.hrAdvisor(hrAdvisor1)
					.profileStatus(statusApproved)
					.build());

			// Search for "obert" using combined specification
			final var nameSpecification =
				hasFirstNameContaining("obert")
				.or(hasMiddleNameContaining("obert"))
				.or(hasLastNameContaining("obert"));

			final var results = profileRepository.findAll(nameSpecification);

			// Should find all three matching profiles
			assertThat(results).hasSize(3);
			assertThat(results).extracting("id")
				.containsExactlyInAnyOrder(
					firstNameMatch.getId(),
					middleNameMatch.getId(),
					lastNameMatch.getId()
				);
		}

		@Test
		@DisplayName("should perform case-insensitive search")
		void testCaseInsensitiveSearch() {
			// Create a user with uppercase name
			final var upperCaseUser = userRepository.save(UserEntity.builder()
				.firstName("Robert")
				.lastName("Smith")
				.language(languageRepository.findByCode("EN").orElseThrow())
				.userType(userTypeRepository.findByCode("employee").orElseThrow())
				.microsoftEntraId("bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb")
				.businessEmailAddress("robert.smith@example.com")
				.build());

			// Create a profile with the user
			final var targetProfile = profileRepository.save(
				ProfileEntity.builder()
					.user(upperCaseUser)
					.hrAdvisor(hrAdvisor1)
					.profileStatus(statusApproved)
					.build());

			// Search with upper case
			final var lowerCaseResults = profileRepository.findAll(hasFirstNameContaining("ROBERT"));
			assertThat(lowerCaseResults).hasSize(1);
			assertThat(lowerCaseResults.get(0).getId()).isEqualTo(targetProfile.getId());

			// Search with mixed case
			final var mixedCaseResults = profileRepository.findAll(hasFirstNameContaining("RoBerT"));
			assertThat(mixedCaseResults).hasSize(1);
			assertThat(mixedCaseResults.get(0).getId()).isEqualTo(targetProfile.getId());
		}

		@Test
		@DisplayName("should handle null or empty search term")
		void testNullOrEmptySearchTerm() {
			// Create a test user
			final var testUser = userRepository.save(UserEntity.builder()
				.firstName("Robert")
				.lastName("Smith")
				.language(languageRepository.findByCode("EN").orElseThrow())
				.userType(userTypeRepository.findByCode("employee").orElseThrow())
				.microsoftEntraId("cccccccc-cccc-cccc-cccc-cccccccccccc")
				.businessEmailAddress("robert.smith3@example.com")
				.build());

			// Create a profile with the user
			final var profile = profileRepository.save(
				ProfileEntity.builder()
					.user(testUser)
					.hrAdvisor(hrAdvisor1)
					.profileStatus(statusApproved)
					.build());

			// Test with a valid search term that matches our profile
			final var matchingSpec = hasFirstNameContaining("Rob");
			assertThat(profileRepository.findAll(matchingSpec)).containsExactly(profile);

			// Test with a valid search term that doesn't match any profile
			final var nonMatchingSpec = hasFirstNameContaining("xyz");
			assertThat(profileRepository.findAll(nonMatchingSpec)).isEmpty();

			// Verify the behavior of the specifications when the search term is null or empty
			// According to the implementation, they should return null, which means no filtering
			// This is different from returning an empty result

			// Create a specification that will only match our profile
			final var specificProfileSpec = hasUserId(testUser.getId());

			// Test with null search terms combined with a specific profile specification
			final var nullFirstNameWithSpecificProfile = hasFirstNameContaining(null).and(specificProfileSpec);
			final var nullMiddleNameWithSpecificProfile = hasMiddleNameContaining(null).and(specificProfileSpec);
			final var nullLastNameWithSpecificProfile = hasLastNameContaining(null).and(specificProfileSpec);

			// The result should be the specific profile, because the null specifications don't filter anything
			assertThat(profileRepository.findAll(nullFirstNameWithSpecificProfile)).containsExactly(profile);
			assertThat(profileRepository.findAll(nullMiddleNameWithSpecificProfile)).containsExactly(profile);
			assertThat(profileRepository.findAll(nullLastNameWithSpecificProfile)).containsExactly(profile);

			// Test with empty search terms combined with a specific profile specification
			final var emptyFirstNameWithSpecificProfile = hasFirstNameContaining("").and(specificProfileSpec);
			final var emptyMiddleNameWithSpecificProfile = hasMiddleNameContaining("").and(specificProfileSpec);
			final var emptyLastNameWithSpecificProfile = hasLastNameContaining("").and(specificProfileSpec);

			// The result should be the specific profile, because the empty specifications don't filter anything
			assertThat(profileRepository.findAll(emptyFirstNameWithSpecificProfile)).containsExactly(profile);
			assertThat(profileRepository.findAll(emptyMiddleNameWithSpecificProfile)).containsExactly(profile);
			assertThat(profileRepository.findAll(emptyLastNameWithSpecificProfile)).containsExactly(profile);
		}
	}

	@Nested
	@DisplayName("Combined Specification Tests")
	class CombinedSpecificationTests {

		@Test
		@DisplayName("should combine all major specifications in complex query")
		void testComplexCombinedQuery() {
			final var targetProfile = profileRepository.save(
				ProfileEntity.builder()
					.user(testUser)
					.hrAdvisor(hrAdvisor1)
					.profileStatus(statusApproved)
					.isAvailableForReferral(true)
					.preferredClassifications(List.of(classificationAs01, classificationPm02))
					.preferredCities(List.of(cityBathurst, cityStJohns))
					.preferredLanguages(List.of(languageReferralTypeBilingual))
					.build());

			@SuppressWarnings({ "unused" })
			final var wrongHrAdvisor = profileRepository.save(
				ProfileEntity.builder()
					.user(testUser)
					.hrAdvisor(hrAdvisor2)
					.profileStatus(statusApproved)
					.isAvailableForReferral(true)
					.preferredClassifications(List.of(classificationAs01))
					.preferredCities(List.of(cityBathurst))
					.preferredLanguages(List.of(languageReferralTypeBilingual))
					.build());

			@SuppressWarnings({ "unused" })
			final var notAvailable = profileRepository.save(
				ProfileEntity.builder()
					.user(testUser)
					.hrAdvisor(hrAdvisor1)
					.profileStatus(statusApproved)
					.isAvailableForReferral(false)
					.preferredClassifications(List.of(classificationAs01))
					.preferredCities(List.of(cityBathurst))
					.preferredLanguages(List.of(languageReferralTypeBilingual))
					.build());

			final var results = profileRepository.findAll(
				hasUserId(testUser.getId())
				.and(hasHrAdvisorId(hrAdvisor1.getId()))
				.and(hasProfileStatusCodeIn(List.of(statusApproved.getCode())))
				.and(isAvailableForReferral(true))
				.and(hasPreferredClassificationIdIn(List.of(classificationAs01.getId(), classificationPm02.getId())))
				.and(hasPreferredCityCodeIn(List.of(cityBathurst.getCode(), cityStJohns.getCode())))
				.and(hasPreferredLanguageCodeIn(List.of(languageReferralTypeBilingual.getCode()))));

			assertThat(results).hasSize(1);
			assertThat(results.get(0).getId()).isEqualTo(targetProfile.getId());
		}

	}

}
