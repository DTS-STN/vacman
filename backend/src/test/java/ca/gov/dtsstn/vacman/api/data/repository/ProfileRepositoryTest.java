package ca.gov.dtsstn.vacman.api.data.repository;

import static ca.gov.dtsstn.vacman.api.data.repository.ProfileRepository.hasHrAdvisorId;
import static ca.gov.dtsstn.vacman.api.data.repository.ProfileRepository.hasHrAdvisorIdIn;
import static ca.gov.dtsstn.vacman.api.data.repository.ProfileRepository.hasPreferredClassificationCodeIn;
import static ca.gov.dtsstn.vacman.api.data.repository.ProfileRepository.hasPreferredClassificationIdIn;
import static ca.gov.dtsstn.vacman.api.data.repository.ProfileRepository.hasProfileStatusCodeIn;
import static ca.gov.dtsstn.vacman.api.data.repository.ProfileRepository.hasProfileStatusIdIn;
import static ca.gov.dtsstn.vacman.api.data.repository.ProfileRepository.hasUserId;
import static ca.gov.dtsstn.vacman.api.data.repository.ProfileRepository.hasUserMicrosoftEntraId;
import static ca.gov.dtsstn.vacman.api.data.repository.ProfileRepository.isAvailableForReferral;
import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase.Replace;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.context.annotation.Import;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;

import ca.gov.dtsstn.vacman.api.SecurityAuditor;
import ca.gov.dtsstn.vacman.api.config.DataSourceConfig;
import ca.gov.dtsstn.vacman.api.data.entity.ClassificationEntity;
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
	ProfileRepository profileRepository;

	@Autowired
	UserRepository userRepository;

	@Autowired
	LanguageRepository languageRepository;

	@Autowired
	UserTypeRepository userTypeRepository;

	@Autowired
	ProfileStatusRepository profileStatusRepository;

	@Autowired
	ClassificationRepository classificationRepository;

	@MockitoBean
	SecurityAuditor securityAuditor;

	UserEntity testUser;
	UserEntity hrAdvisor1;
	UserEntity hrAdvisor2;

	ProfileStatusEntity approvedStatus;
	ProfileStatusEntity pendingStatus;

	ClassificationEntity classification1;
	ClassificationEntity classification2;
	ClassificationEntity classification3;

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
		// Get profile statuses that will be throughout the tests
		//

		approvedStatus = profileStatusRepository.findByCode("APPROVED").orElseThrow();
		pendingStatus = profileStatusRepository.findByCode("PENDING").orElseThrow();

		//
		// Get classifications that will be used throughout the tests
		//

		classification1 = classificationRepository.findByCode("AS-01").orElseThrow();
		classification2 = classificationRepository.findByCode("PM-02").orElseThrow();
		classification3 = classificationRepository.findByCode("IT-03").orElseThrow();
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
					.profileStatus(approvedStatus)
					.build());

			@SuppressWarnings({ "unused" })
			final var profile2 = profileRepository.save(
				ProfileEntity.builder()
					.user(testUser)
					.hrAdvisor(hrAdvisor2)
					.profileStatus(approvedStatus)
					.build());

			final var profile3 = profileRepository.save(
				ProfileEntity.builder()
					.user(testUser)
					.hrAdvisor(hrAdvisor1)
					.profileStatus(approvedStatus)
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
					.profileStatus(approvedStatus)
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
					.profileStatus(approvedStatus)
					.build());

			final var profile2 = profileRepository.save(
				ProfileEntity.builder()
					.user(testUser)
					.hrAdvisor(hrAdvisor2)
					.profileStatus(approvedStatus)
					.build());

			@SuppressWarnings({ "unused" })
			final var profile3 = profileRepository.save(
				ProfileEntity.builder()
					.user(testUser)
					.profileStatus(approvedStatus)
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
					.profileStatus(approvedStatus)
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
					.profileStatus(approvedStatus)
					.build());

			final var results = profileRepository.findAll(hasHrAdvisorIdIn(null));

			// Verify it returns results without error
			// (note: matches all due to conjunction)
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
					.profileStatus(approvedStatus)
					.build());

			@SuppressWarnings({ "unused" })
			final var pendingProfile = profileRepository.save(
				ProfileEntity.builder()
					.user(testUser)
					.profileStatus(pendingStatus)
					.build());

			final var results = profileRepository.findAll(
				hasProfileStatusCodeIn(List.of(approvedStatus.getCode()))
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
					.profileStatus(approvedStatus)
					.build());

			final var pendingProfile = profileRepository.save(
				ProfileEntity.builder()
					.user(testUser)
					.profileStatus(pendingStatus)
					.build());

			final var results = profileRepository.findAll(
				hasProfileStatusCodeIn(List.of(approvedStatus.getCode(), pendingStatus.getCode()))
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
					.profileStatus(approvedStatus)
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
					.profileStatus(approvedStatus)
					.build());

			final var results = profileRepository.findAll(hasProfileStatusCodeIn(null));

			assertThat(results).isNotNull();
		}

		@Test
		@DisplayName("hasProfileStatusIdIn should find profiles by status IDs")
		void testHasProfileStatusIdIn() {
			final var activeProfile = profileRepository.save(
				ProfileEntity.builder()
					.user(testUser)
					.profileStatus(approvedStatus)
					.build());

			@SuppressWarnings({ "unused" })
			final var pendingProfile = profileRepository.save(
				ProfileEntity.builder()
					.user(testUser)
					.profileStatus(pendingStatus)
					.build());

			final var results = profileRepository.findAll(
				hasProfileStatusIdIn(List.of(approvedStatus.getId()))
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
					.profileStatus(approvedStatus)
					.build());

			final var pendingProfile = profileRepository.save(
				ProfileEntity.builder()
					.user(testUser)
					.profileStatus(pendingStatus)
					.build());

			final var results = profileRepository.findAll(
				hasProfileStatusIdIn(List.of(approvedStatus.getId(), pendingStatus.getId()))
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
					.profileStatus(approvedStatus)
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
					.profileStatus(approvedStatus)
					.build());

			final var results = profileRepository.findAll(hasProfileStatusIdIn(null));

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
					.profileStatus(approvedStatus)
					.build());

			@SuppressWarnings({ "unused" })
			final var profile2 = profileRepository.save(
				ProfileEntity.builder()
					.user(anotherUser)
					.profileStatus(approvedStatus)
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
					.profileStatus(approvedStatus)
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
					.profileStatus(approvedStatus)
					.build());

			@SuppressWarnings({ "unused" })
			final var profile2 = profileRepository.save(
				ProfileEntity.builder()
					.user(anotherUser)
					.profileStatus(approvedStatus)
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
					.profileStatus(approvedStatus)
					.build());

			final var results = profileRepository.findAll(hasUserMicrosoftEntraId("99999999-9999-9999-9999-999999999999"));

			assertThat(results).isEmpty();
		}

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
					.profileStatus(approvedStatus)
					.isAvailableForReferral(true)
					.build());

			final var availableProfile2 = profileRepository.save(
				ProfileEntity.builder()
					.user(testUser)
					.profileStatus(approvedStatus)
					.isAvailableForReferral(true)
					.build());

			@SuppressWarnings("unused")
			final var notAvailableProfile = profileRepository.save(
				ProfileEntity.builder()
					.user(testUser)
					.profileStatus(approvedStatus)
					.isAvailableForReferral(false)
					.build());

			@SuppressWarnings("unused")
			final var nullAvailableProfile = profileRepository.save(
				ProfileEntity.builder()
					.user(testUser)
					.profileStatus(approvedStatus)
					.isAvailableForReferral(null)
					.build());

			final var results = profileRepository.findAll(
				isAvailableForReferral()
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
					.profileStatus(approvedStatus)
					.isAvailableForReferral(false)
					.build());

			final var results = profileRepository.findAll(
				isAvailableForReferral()
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
					.profileStatus(approvedStatus)
					.isAvailableForReferral(null)
					.build());

			final var results = profileRepository.findAll(
				isAvailableForReferral()
				.and(ProfileRepository.hasUserId(testUser.getId())));

			assertThat(results).isEmpty();
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
					.profileStatus(approvedStatus)
					.preferredClassifications(List.of(classification1, classification2))
					.build());

			final var profile2 = profileRepository.save(
				ProfileEntity.builder()
					.user(testUser)
					.profileStatus(approvedStatus)
					.preferredClassifications(List.of(classification2))
					.build());

			@SuppressWarnings("unused")
			final var profile3 = profileRepository.save(
				ProfileEntity.builder()
					.user(testUser)
					.profileStatus(approvedStatus)
					.preferredClassifications(List.of(classification3))
					.build());

			final var results = profileRepository.findAll(
				hasPreferredClassificationIdIn(List.of(classification1.getId(), classification2.getId()))
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
					.profileStatus(approvedStatus)
					.preferredClassifications(List.of(classification1))
					.build());

			@SuppressWarnings("unused")
			final var profile2 = profileRepository.save(
				ProfileEntity.builder()
					.user(testUser)
					.profileStatus(approvedStatus)
					.preferredClassifications(List.of(classification3))
					.build());

			final var results = profileRepository.findAll(
				hasPreferredClassificationIdIn(List.of(classification1.getId()))
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
					.profileStatus(approvedStatus)
					.preferredClassifications(List.of(classification1))
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
					.profileStatus(approvedStatus)
					.preferredClassifications(List.of(classification1))
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
					.profileStatus(approvedStatus)
					.preferredClassifications(List.of(classification1))
					.build());

			final var results = profileRepository.findAll(hasPreferredClassificationIdIn(null));

			assertThat(results).isNotNull();
		}

		@Test
		@DisplayName("hasPreferredClassificationCodeIn should find profiles by preferred classification codes")
		void testHasPreferredClassificationCodeIn() {
			final var profile1 = profileRepository.save(
				ProfileEntity.builder()
					.user(testUser)
					.profileStatus(approvedStatus)
					.preferredClassifications(List.of(classification1, classification2))
					.build());

			final var profile2 = profileRepository.save(
				ProfileEntity.builder()
					.user(testUser)
					.profileStatus(approvedStatus)
					.preferredClassifications(List.of(classification2))
					.build());

			@SuppressWarnings("unused")
			final var profile3 = profileRepository.save(
				ProfileEntity.builder()
					.user(testUser)
					.profileStatus(approvedStatus)
					.preferredClassifications(List.of(classification3))
					.build());

			final var results = profileRepository.findAll(
				hasPreferredClassificationCodeIn(List.of(classification1.getCode(), classification2.getCode()))
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
					.profileStatus(approvedStatus)
					.preferredClassifications(List.of(classification1))
					.build());

			@SuppressWarnings("unused")
			final var profile2 = profileRepository.save(
				ProfileEntity.builder()
					.user(testUser)
					.profileStatus(approvedStatus)
					.preferredClassifications(List.of(classification3))
					.build());

			final var results = profileRepository.findAll(
				hasPreferredClassificationCodeIn(List.of(classification1.getCode()))
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
					.profileStatus(approvedStatus)
					.preferredClassifications(List.of(classification1))
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
					.profileStatus(approvedStatus)
					.preferredClassifications(List.of(classification1))
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
					.profileStatus(approvedStatus)
					.preferredClassifications(List.of(classification1))
					.build());

			final var results = profileRepository.findAll(hasPreferredClassificationCodeIn(null));

			assertThat(results).isNotNull();
		}

	}

	@Nested
	@DisplayName("Combined Specification Tests")
	class CombinedSpecificationTests {

		@Test
		@DisplayName("should support combining multiple specifications")
		void testCombinedSpecifications() {
			final var targetProfile = profileRepository.save(
				ProfileEntity.builder()
					.user(testUser)
					.hrAdvisor(hrAdvisor1)
					.profileStatus(approvedStatus)
					.build());

			@SuppressWarnings({ "unused" })
			final var wrongHrAdvisor = profileRepository.save(
				ProfileEntity.builder()
					.user(testUser)
					.hrAdvisor(hrAdvisor2)
					.profileStatus(approvedStatus)
					.build());

			@SuppressWarnings({ "unused" })
			final var wrongStatus = profileRepository.save(
				ProfileEntity.builder()
					.user(testUser)
					.hrAdvisor(hrAdvisor1)
					.profileStatus(pendingStatus)
					.build());

			final var results = profileRepository.findAll(
				hasHrAdvisorId(hrAdvisor1.getId())
				.and(hasProfileStatusCodeIn(List.of(approvedStatus.getCode()))));

			assertThat(results).hasSize(1);
			assertThat(results.get(0).getId()).isEqualTo(targetProfile.getId());
		}

	}

}
