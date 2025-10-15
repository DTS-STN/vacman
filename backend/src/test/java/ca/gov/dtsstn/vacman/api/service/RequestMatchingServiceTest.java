package ca.gov.dtsstn.vacman.api.service;

import static ca.gov.dtsstn.vacman.api.data.entity.AbstractCodeEntity.byCode;
import static java.util.Comparator.comparing;
import static java.util.Objects.nonNull;
import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import java.time.Duration;
import java.time.LocalDate;
import java.util.Arrays;
import java.util.List;
import java.util.function.Predicate;

import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.TestInstance;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.context.annotation.Import;
import org.springframework.util.Assert;

import ca.gov.dtsstn.vacman.api.SecurityAuditor;
import ca.gov.dtsstn.vacman.api.config.DataSourceConfig;
import ca.gov.dtsstn.vacman.api.config.properties.ApplicationProperties;
import ca.gov.dtsstn.vacman.api.config.properties.LookupCodes;
import ca.gov.dtsstn.vacman.api.data.entity.CityEntity;
import ca.gov.dtsstn.vacman.api.data.entity.ClassificationEntity;
import ca.gov.dtsstn.vacman.api.data.entity.LanguageEntity;
import ca.gov.dtsstn.vacman.api.data.entity.LanguageReferralTypeEntity;
import ca.gov.dtsstn.vacman.api.data.entity.LanguageRequirementEntity;
import ca.gov.dtsstn.vacman.api.data.entity.MatchEntity;
import ca.gov.dtsstn.vacman.api.data.entity.ProfileEntity;
import ca.gov.dtsstn.vacman.api.data.entity.ProfileStatusEntity;
import ca.gov.dtsstn.vacman.api.data.entity.RequestEntity;
import ca.gov.dtsstn.vacman.api.data.entity.RequestStatusEntity;
import ca.gov.dtsstn.vacman.api.data.entity.UserEntity;
import ca.gov.dtsstn.vacman.api.data.entity.UserTypeEntity;
import ca.gov.dtsstn.vacman.api.data.entity.WfaStatusEntity;
import ca.gov.dtsstn.vacman.api.data.repository.CityRepository;
import ca.gov.dtsstn.vacman.api.data.repository.ClassificationRepository;
import ca.gov.dtsstn.vacman.api.data.repository.LanguageReferralTypeRepository;
import ca.gov.dtsstn.vacman.api.data.repository.LanguageRepository;
import ca.gov.dtsstn.vacman.api.data.repository.LanguageRequirementRepository;
import ca.gov.dtsstn.vacman.api.data.repository.MatchRepository;
import ca.gov.dtsstn.vacman.api.data.repository.MatchStatusRepository;
import ca.gov.dtsstn.vacman.api.data.repository.ProfileRepository;
import ca.gov.dtsstn.vacman.api.data.repository.ProfileStatusRepository;
import ca.gov.dtsstn.vacman.api.data.repository.RequestRepository;
import ca.gov.dtsstn.vacman.api.data.repository.RequestStatusRepository;
import ca.gov.dtsstn.vacman.api.data.repository.UserRepository;
import ca.gov.dtsstn.vacman.api.data.repository.UserTypeRepository;
import ca.gov.dtsstn.vacman.api.data.repository.WfaStatusRepository;

/**
 * Integration tests for {@link RequestMatchingService}.
 *
 * Test Strategy
 * =============
 *
 * This test suite validates the profile matching algorithm used to find employee profiles
 * that match staffing request criteria. Tests use real database interactions via {@code @DataJpaTest}
 * to ensure the JPA specifications and queries work correctly with actual data.
 *
 * Core Matching Criteria
 * ======================
 *
 * The service matches profiles based on the following criteria (ALL must match):
 *
 *   - Profile Status: Only APPROVED profiles are matched
 *   - Availability: Profile must be marked as available for referral
 *   - Language: Profile language preference must match request language requirement
 *   - Classification: Profile must include the requested classification in preferences
 *   - Location: Profile must include at least one of the requested cities in preferences
 *   - WFA Start Date: Must be null or before/equal to current date (already started)
 *   - WFA End Date: Must be null or after/equal to current date (not yet ended)
 *
 * Language Matching Rules
 * =======================
 *
 * Language matching follows a specific decision table:
 *   - BI (Bilingual Imperative): Matches profiles with BILINGUAL preference only
 *   - BNI (Bilingual Non-imperative): Matches profiles with BILINGUAL preference only
 *   - EE-AE (English Essential): Matches profiles with ENGLISH preference only
 *   - FE (French Essential): Matches profiles with FRENCH preference only
 *   - EF-AF (Either/Or): Matches profiles with ENGLISH or FRENCH preference (not BILINGUAL)
 *   - VAR (Various): Matches all profiles regardless of language preference
 *
 * Prioritization and Selection
 * ============================
 *
 * When multiple profiles match, they are prioritized using a hierarchical sorting strategy:
 *
 *   1. Primary Sort: WFA status sort order (lower = higher priority)
 *   2. Secondary Sort: Grace period prioritization within each WFA status level
 *      - Profiles with WFA end dates within the grace period are prioritized
 *      - Null end dates are not considered within the grace period
 *   3. Tertiary Sort: Random selection to ensure fairness
 *
 * WFA dates influence selection in two ways:
 *   - Filtering: Profiles must have started (null or past start date) and not ended (null or future end date)
 *   - Prioritization: Profiles whose WFA assignment is ending soon (within grace period) receive higher priority
 *     within their WFA status level to give them preference for new opportunities
 *
 * The service returns up to the requested maximum number of profiles.
 *
 * Test Data Management
 * ====================
 *
 * Tests use {@link ProfileTestBuilder} to create test profiles with sensible defaults and a fluent API.
 * Lookup data (cities, classifications, languages, etc.) is pre-populated by liquibase and loaded in
 * {@code setUp()}. Each test creates its own isolated profile data to avoid interference between tests.
 *
 * Coverage Areas
 * ==============
 *
 *   - All six language requirement types (BI, BNI, EE-AE, FE, EF-AF, VAR)
 *   - Profile status filtering (approved vs. other statuses)
 *   - Availability filtering (available vs. unavailable profiles)
 *   - WFA date validation (null, past, present, future dates)
 *   - Max limit enforcement and priority-based selection
 *   - Multiple city and classification matching
 *   - Empty result sets and edge cases
 *   - Error handling for invalid language codes
 *
 * @see RequestMatchingService
 * @see ProfileTestBuilder
 */
@DataJpaTest
@DisplayName("RequestMatchingService tests")
@Import({ DataSourceConfig.class, SecurityAuditor.class })
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
@TestInstance(TestInstance.Lifecycle.PER_CLASS)
class RequestMatchingServiceTest {

	@Autowired LookupCodes lookupCodes;

	@Autowired CityRepository cityRepository;
	@Autowired ClassificationRepository classificationRepository;
	@Autowired LanguageReferralTypeRepository languageReferralTypeRepository;
	@Autowired LanguageRepository languageRepository;
	@Autowired LanguageRequirementRepository languageRequirementRepository;
	@Autowired MatchRepository matchRepository;
	@Autowired MatchStatusRepository matchStatusRepository;
	@Autowired ProfileRepository profileRepository;
	@Autowired ProfileStatusRepository profileStatusRepository;
	@Autowired RequestRepository requestRepository;
	@Autowired RequestStatusRepository requestStatusRepository;
	@Autowired UserRepository userRepository;
	@Autowired UserTypeRepository userTypeRepository;
	@Autowired WfaStatusRepository wfaStatusRepository;

	List<CityEntity> cities;
	List<ClassificationEntity> classifications;
	List<LanguageEntity> languages;
	List<LanguageReferralTypeEntity> languageReferralTypes;
	List<LanguageRequirementEntity> languageRequirements;
	List<ProfileStatusEntity> profileStatuses;
	List<RequestStatusEntity> requestStatuses;
	List<UserTypeEntity> userTypes;
	List<WfaStatusEntity> wfaStatuses;

	CityEntity montreal;
	CityEntity ottawa;
	CityEntity stjohns;
	CityEntity toronto;
	CityEntity vancouver;

	UserEntity requestSubmitter;

	RequestMatchingService requestMatchingService;


	@BeforeAll
	void beforeAll() {
		this.cities = cityRepository.findAll();
		this.classifications = classificationRepository.findAll();
		this.languages = languageRepository.findAll();
		this.languageReferralTypes = languageReferralTypeRepository.findAll();
		this.languageRequirements = languageRequirementRepository.findAll();
		this.profileStatuses = profileStatusRepository.findAll();
		this.requestStatuses = requestStatusRepository.findAll();
		this.userTypes = userTypeRepository.findAll();
		this.wfaStatuses = wfaStatusRepository.findAll();

		this.montreal = findCity("QC40");
		this.ottawa = findCity("ON52");
		this.stjohns = findCity("NL14");
		this.toronto = findCity("ON72");
		this.vancouver = findCity("BC32");
	}

	@BeforeEach
	void setUp() {
		final var applicationProperties = mock(ApplicationProperties.class, org.mockito.Answers.RETURNS_DEEP_STUBS);
		when(applicationProperties.matches().wfaEndDateGracePeriod()).thenReturn(Duration.ofDays(30));

		this.requestMatchingService = new RequestMatchingService(
			applicationProperties,
			lookupCodes,
			matchRepository,
			matchStatusRepository,
			profileRepository,
			requestRepository
		);

		this.requestSubmitter = userRepository.save(UserEntity.builder()
			.firstName("Request")
			.lastName("Submitter")
			.businessEmailAddress("request.submitter@example.com")
			.language(findLanguage("EN"))
			.microsoftEntraId("request-submitter")
			.userType(findUserType("hiring-manager"))
			.build());
	}

	/**
	 * Tests for basic filtering criteria like cities, classifications, status, and availability.
	 */
	@Nested
	@DisplayName("Filtering Criteria")
	class FilteringCriteria {

		/**
		 * Tests that the service correctly matches profiles when the request specifies multiple cities.
		 *
		 * Business Rule: A profile matches if it includes ANY of the requested cities in its
		 * preferred cities list (OR logic, not AND). This allows profiles to be considered even if they
		 * only express interest in one of several requested locations.
		 *
		 * Test Scenario: Request asks for profiles in Ottawa, Toronto, OR Montreal. Profiles
		 * that prefer only Ottawa, only Toronto, only Montreal, or any combination should all match.
		 *
		 * Why This Matters: Confirms the matching algorithm uses inclusive OR logic for location
		 * matching, maximizing the pool of available candidates for multi-location requests.
		 */
		@Test
		@DisplayName("Should match profiles that prefer ANY of multiple requested cities")
		void shouldMatchProfilesWithAnyOfMultipleCities() {
			final var request = requestRepository.save(
				RequestEntity.builder()
					.startDate(LocalDate.now().minusDays(60))
					.endDate(LocalDate.now().plusDays(60))
					.cities(List.of(ottawa, toronto, montreal))
					.classification(findClassification("IT-01"))
					.languageRequirement(findLanguageRequirement("BI"))
					.requestStatus(findRequestStatus("SUBMIT"))
					.submitter(requestSubmitter)
					.build());

			// Create profiles preferring only Ottawa (should match)
			for (var i = 0; i < 3; i++) {
				final var profile = new ProfileTestBuilder(i)
					.withNamePrefix("Ottawa")
					.withUserLanguage(findLanguage("EN"))
					.withUserType(findUserType("employee"))
					.withCity(ottawa)
					.withClassification(findClassification("IT-01"))
					.withLanguage(findLanguageReferralType("BILINGUAL"))
					.withProfileStatus(findProfileStatus("APPROVED"))
					.withWfaStatus(findWfaStatus("AFFECTED"))
					.build();

				userRepository.save(profile.getUser());
				profileRepository.save(profile);
			}

			// Create profiles preferring only Toronto (should match)
			for (var i = 0; i < 3; i++) {
				final var profile = new ProfileTestBuilder(i)
					.withNamePrefix("Toronto")
					.withUserLanguage(findLanguage("EN"))
					.withUserType(findUserType("employee"))
					.withCity(toronto)
					.withClassification(findClassification("IT-01"))
					.withLanguage(findLanguageReferralType("BILINGUAL"))
					.withProfileStatus(findProfileStatus("APPROVED"))
					.withWfaStatus(findWfaStatus("AFFECTED"))
					.build();

				userRepository.save(profile.getUser());
				profileRepository.save(profile);
			}

			// Create profiles preferring only Montreal (should match)
			for (var i = 0; i < 3; i++) {
				final var profile = new ProfileTestBuilder(i)
					.withNamePrefix("Montreal")
					.withUserLanguage(findLanguage("EN"))
					.withUserType(findUserType("employee"))
					.withCity(montreal)
					.withClassification(findClassification("IT-01"))
					.withLanguage(findLanguageReferralType("BILINGUAL"))
					.withProfileStatus(findProfileStatus("APPROVED"))
					.withWfaStatus(findWfaStatus("AFFECTED"))
					.build();

				userRepository.save(profile.getUser());
				profileRepository.save(profile);
			}

			// Create profiles preferring all three cities (should match)
			for (var i = 0; i < 2; i++) {
				final var profile = new ProfileTestBuilder(i)
					.withNamePrefix("AllCities")
					.withUserLanguage(findLanguage("EN"))
					.withUserType(findUserType("employee"))
					.withCities(List.of(ottawa, toronto, montreal))
					.withClassification(findClassification("IT-01"))
					.withLanguage(findLanguageReferralType("BILINGUAL"))
					.withProfileStatus(findProfileStatus("APPROVED"))
					.withWfaStatus(findWfaStatus("AFFECTED"))
					.build();

				userRepository.save(profile.getUser());
				profileRepository.save(profile);
			}

			// Create profiles preferring a different city (should NOT match)
			for (var i = 0; i < 3; i++) {
				final var profile = new ProfileTestBuilder(i)
					.withNamePrefix("Vancouver")
					.withUserLanguage(findLanguage("EN"))
					.withUserType(findUserType("employee"))
					.withCity(vancouver)
					.withClassification(findClassification("IT-01"))
					.withLanguage(findLanguageReferralType("BILINGUAL"))
					.withProfileStatus(findProfileStatus("APPROVED"))
					.withWfaStatus(findWfaStatus("AFFECTED"))
					.build();

				userRepository.save(profile.getUser());
				profileRepository.save(profile);
			}

			final var matches = requestMatchingService.findMatches(request.getId(), 20);

			final Predicate<ProfileEntity> hasOttawa = p -> p.getPreferredCities().stream().anyMatch(byCode("ON52"));
			final Predicate<ProfileEntity> hasToronto = p -> p.getPreferredCities().stream().anyMatch(byCode("ON72"));
			final Predicate<ProfileEntity> hasMontreal = p -> p.getPreferredCities().stream().anyMatch(byCode("QC40"));
			final Predicate<ProfileEntity> hasVancouver = p -> p.getPreferredCities().stream().anyMatch(byCode("BC32"));

			assertThat(matches).as("Should match all profiles preferring at least one of the requested cities")
				.extracting(MatchEntity::getProfile)
				.hasSize(11) // 3 Ottawa + 3 Toronto + 3 Montreal + 2 all three = 11
				.allMatch(anyOf(hasOttawa, hasToronto, hasMontreal))
				.noneMatch(hasVancouver);
		}

		/**
		 * Tests that profiles with multiple preferred classifications can match a single-classification request.
		 *
		 * Business Rule: A profile matches if the requested classification is included anywhere
		 * in the profile's list of preferred classifications. Profiles can express interest in multiple
		 * classifications, and any one match is sufficient.
		 *
		 * Test Scenario: Request asks for IT-01 classification. Profiles preferring only IT-01,
		 * profiles preferring IT-01 plus other classifications, and profiles with multiple classifications
		 * including IT-01 should all match. Profiles with only other classifications should not match.
		 *
		 * Why This Matters: Validates that the matching algorithm correctly handles the many-to-one
		 * relationship between profile classifications and request classification, maximizing candidate pool.
		 */
		@Test
		@DisplayName("Should match profiles with multiple classifications when one matches the request")
		void shouldMatchProfilesWithMultipleClassifications() {
			final var request = requestRepository.save(
				RequestEntity.builder()
					.startDate(LocalDate.now().minusDays(60))
					.endDate(LocalDate.now().plusDays(60))
					.cities(List.of(ottawa))
					.classification(findClassification("IT-01"))
					.languageRequirement(findLanguageRequirement("BI"))
					.requestStatus(findRequestStatus("SUBMIT"))
					.submitter(requestSubmitter)
					.build());

			// Create profiles with only IT-01 (should match)
			for (var i = 0; i < 3; i++) {
				final var profile = new ProfileTestBuilder(i)
					.withNamePrefix("SingleClassification")
					.withUserLanguage(findLanguage("EN"))
					.withUserType(findUserType("employee"))
					.withCity(ottawa)
					.withClassification(findClassification("IT-01"))
					.withLanguage(findLanguageReferralType("BILINGUAL"))
					.withProfileStatus(findProfileStatus("APPROVED"))
					.withWfaStatus(findWfaStatus("AFFECTED"))
					.build();

				userRepository.save(profile.getUser());
				profileRepository.save(profile);
			}

			// Create profiles with IT-01 plus other classifications (should match)
			for (var i = 0; i < 4; i++) {
				final var profile = new ProfileTestBuilder(i)
					.withNamePrefix("MultiClassifications")
					.withUserLanguage(findLanguage("EN"))
					.withUserType(findUserType("employee"))
					.withCity(ottawa)
					.withClassifications(List.of(
						findClassification("IT-01"),
						findClassification("IT-02"),
						findClassification("IT-03")
					))
					.withLanguage(findLanguageReferralType("BILINGUAL"))
					.withProfileStatus(findProfileStatus("APPROVED"))
					.withWfaStatus(findWfaStatus("AFFECTED"))
					.build();

				userRepository.save(profile.getUser());
				profileRepository.save(profile);
			}

			// Create profiles with only other classifications (should NOT match)
			for (var i = 0; i < 3; i++) {
				final var profile = new ProfileTestBuilder(i)
					.withNamePrefix("OtherClassifications")
					.withUserLanguage(findLanguage("EN"))
					.withUserType(findUserType("employee"))
					.withCity(ottawa)
					.withClassifications(List.of(
						findClassification("EX-01"), // ⚠️
						findClassification("EX-02")  // ⚠️
					))
					.withLanguage(findLanguageReferralType("BILINGUAL"))
					.withProfileStatus(findProfileStatus("APPROVED"))
					.withWfaStatus(findWfaStatus("AFFECTED"))
					.build();

				userRepository.save(profile.getUser());
				profileRepository.save(profile);
			}

			final var matches = requestMatchingService.findMatches(request.getId(), 20);

			assertThat(matches).as("Should match all profiles that include IT-01 in their preferred classifications")
				.extracting(MatchEntity::getProfile)
				.hasSize(7) // 3 single + 4 multi = 7
				.allMatch((Predicate<ProfileEntity>) p -> p.getPreferredClassifications().stream().anyMatch(byCode("IT-01")));
		}

		/**
		 * Tests that only profiles with APPROVED status are included in matching results.
		 *
		 * Business Rule: The matching algorithm must filter profiles by status, including
		 * only those with APPROVED status. Profiles with PENDING, INCOMPLETE, ARCHIVED, or other
		 * non-approved statuses should be excluded even if they match all other criteria.
		 *
		 * Test Scenario: Create profiles with identical attributes except for status.
		 * Only APPROVED profiles should appear in results.
		 *
		 * Why This Matters: Ensures that only fully vetted and approved profiles are
		 * presented as matches, maintaining data quality and business process integrity.
		 */
		@Test
		@DisplayName("Should exclude profiles with non-approved statuses")
		void shouldExcludeNonApprovedProfiles() {
			final var request = requestRepository.save(
				RequestEntity.builder()
					.startDate(LocalDate.now().minusDays(60))
					.endDate(LocalDate.now().plusDays(60))
					.cities(List.of(ottawa))
					.classification(findClassification("IT-01"))
					.languageRequirement(findLanguageRequirement("BI"))
					.requestStatus(findRequestStatus("SUBMIT"))
					.submitter(requestSubmitter)
					.build());

			// Create APPROVED profiles (should match)
			for (var i = 0; i < 5; i++) {
				final var profile = new ProfileTestBuilder(i)
					.withNamePrefix("Approved")
					.withUserLanguage(findLanguage("EN"))
					.withUserType(findUserType("employee"))
					.withCity(ottawa)
					.withClassification(findClassification("IT-01"))
					.withLanguage(findLanguageReferralType("BILINGUAL"))
					.withProfileStatus(findProfileStatus("APPROVED"))
					.withWfaStatus(findWfaStatus("AFFECTED"))
					.build();

				userRepository.save(profile.getUser());
				profileRepository.save(profile);
			}

			// Create PENDING profiles (should NOT match)
			for (var i = 0; i < 3; i++) {
				final var profile = new ProfileTestBuilder(i)
					.withNamePrefix("Pending")
					.withUserLanguage(findLanguage("EN"))
					.withUserType(findUserType("employee"))
					.withCity(ottawa)
					.withClassification(findClassification("IT-01"))
					.withLanguage(findLanguageReferralType("BILINGUAL"))
					.withProfileStatus(findProfileStatus("PENDING")) // ⚠️
					.withWfaStatus(findWfaStatus("AFFECTED"))
					.build();

				userRepository.save(profile.getUser());
				profileRepository.save(profile);
			}

			// Create INCOMPLETE profiles (should NOT match)
			for (var i = 0; i < 2; i++) {
				final var profile = new ProfileTestBuilder(i)
					.withNamePrefix("Incomplete")
					.withUserLanguage(findLanguage("EN"))
					.withUserType(findUserType("employee"))
					.withCity(ottawa)
					.withClassification(findClassification("IT-01"))
					.withLanguage(findLanguageReferralType("BILINGUAL"))
					.withProfileStatus(findProfileStatus("INCOMPLETE")) // ⚠️
					.withWfaStatus(findWfaStatus("AFFECTED"))
					.build();

				userRepository.save(profile.getUser());
				profileRepository.save(profile);
			}

			final var matches = requestMatchingService.findMatches(request.getId(), 10);

			assertThat(matches).as("Should find only profiles with APPROVED status")
				.extracting(MatchEntity::getProfile)
				.hasSize(5)
				.allMatch(p -> p.getProfileStatus().getCode().equals("APPROVED"));
		}

		/**
		 * Tests that profiles marked as unavailable for referral are excluded from matching.
		 *
		 * Business Rule: The {@code isAvailableForReferral} flag acts as a master switch that
		 * allows profiles to opt out of matching regardless of other criteria. This might be used when
		 * an employee is temporarily unavailable, on leave, or has been recently referred.
		 *
		 * Test Scenario: Creates 7 available profiles and 8 unavailable profiles that otherwise
		 * match all criteria. Verifies that only the 7 available profiles are returned.
		 *
		 * Why This Matters: Ensures the system respects profile availability status and doesn't
		 * suggest candidates who have explicitly indicated they shouldn't be matched at this time.
		 */
		@Test
		@DisplayName("Should exclude profiles that are not available for referral")
		void shouldExcludeProfilesNotAvailableForReferral() {
			final var request = requestRepository.save(
				RequestEntity.builder()
					.startDate(LocalDate.now().minusDays(60))
					.endDate(LocalDate.now().plusDays(60))
					.cities(List.of(ottawa))
					.classification(findClassification("IT-01"))
					.languageRequirement(findLanguageRequirement("BI"))
					.requestStatus(findRequestStatus("SUBMIT"))
					.submitter(requestSubmitter)
					.build());

			// Create available profiles
			for (var i = 0; i < 7; i++) {
				final var profile = new ProfileTestBuilder(i)
					.withNamePrefix("Available")
					.withUserLanguage(findLanguage("EN"))
					.withUserType(findUserType("employee"))
					.withCity(ottawa)
					.withClassification(findClassification("IT-01"))
					.withLanguage(findLanguageReferralType("BILINGUAL"))
					.withProfileStatus(findProfileStatus("APPROVED"))
					.withWfaStatus(findWfaStatus("AFFECTED"))
					.withAvailability(true)
					.build();

				userRepository.save(profile.getUser());
				profileRepository.save(profile);
			}

			// Create unavailable profiles
			for (var i = 0; i < 8; i++) {
				final var profile = new ProfileTestBuilder(i)
					.withNamePrefix("Unavailable")
					.withUserLanguage(findLanguage("EN"))
					.withUserType(findUserType("employee"))
					.withCity(ottawa)
					.withClassification(findClassification("IT-01"))
					.withLanguage(findLanguageReferralType("BILINGUAL"))
					.withProfileStatus(findProfileStatus("APPROVED"))
					.withWfaStatus(findWfaStatus("AFFECTED"))
					.withAvailability(false) // ⚠️
					.build();

				userRepository.save(profile.getUser());
				profileRepository.save(profile);
			}

			final var matches = requestMatchingService.findMatches(request.getId(), 10);

			assertThat(matches).as("Should find only profiles available for referral (7 available, capped at max)")
				.extracting(MatchEntity::getProfile)
				.hasSizeLessThanOrEqualTo(7)
				.allMatch(ProfileEntity::getIsAvailableForReferral);
		}

	}

	/**
	 * Tests for WFA end date grace period prioritization.
	 */
	@Nested
	@DisplayName("Grace Period Logic")
	class GracePeriodLogic {

		/**
		 * Tests that profiles with WFA end dates within the grace period are prioritized over other profiles.
		 *
		 * Business Rule: Profiles whose WFA end date falls within the grace period (30 days from now)
		 * should be prioritized for matching. This ensures employees whose WFA assignment is ending soon
		 * are matched first, giving them priority for new opportunities before their current assignment expires.
		 *
		 * Within the same WFA status priority level, profiles are ordered as:
		 *   1. Grace period profiles (randomly shuffled among themselves for fairness)
		 *   2. Other profiles (randomly shuffled among themselves for fairness)
		 *
		 * Test Scenario: Creates profiles with identical WFA status (same priority level) but different
		 * end dates:
		 *   - 5 profiles with end dates within grace period (e.g., 10 days from now)
		 *   - 5 profiles with end dates beyond grace period (e.g., 60 days from now)
		 *
		 * When requesting only 7 matches, we expect all 5 grace period profiles plus 2 others.
		 *
		 * Why This Matters: Validates the grace period prioritization logic to ensure employees
		 * with expiring assignments get priority access to new opportunities. This is a key business
		 * requirement for fair and effective workforce allocation.
		 */
		@Test
		@DisplayName("Should prioritize profiles with WFA end date within grace period")
		void shouldPrioritizeProfilesWithinGracePeriod() {
			final var request = requestRepository.save(
				RequestEntity.builder()
					.startDate(LocalDate.now().minusDays(60))
					.endDate(LocalDate.now().plusDays(180))
					.cities(List.of(ottawa))
					.classification(findClassification("IT-01"))
					.languageRequirement(findLanguageRequirement("BI"))
					.requestStatus(findRequestStatus("SUBMIT"))
					.submitter(requestSubmitter)
					.build());

			// Create profiles with end dates WITHIN grace period (< 30 days from now)
			for (var i = 0; i < 5; i++) {
				final var profile = new ProfileTestBuilder(i)
					.withNamePrefix("GracePeriod" + System.nanoTime())
					.withUserLanguage(findLanguage("EN"))
					.withUserType(findUserType("employee"))
					.withCity(ottawa)
					.withClassification(findClassification("IT-01"))
					.withLanguage(findLanguageReferralType("BILINGUAL"))
					.withProfileStatus(findProfileStatus("APPROVED"))
					.withWfaDates(LocalDate.now().minusDays(90), LocalDate.now().plusDays(10)) // Ends in 10 days
					.withWfaStatus(findWfaStatus("AFFECTED"))
					.build();

				userRepository.save(profile.getUser());
				profileRepository.save(profile);
			}

			// Create profiles with end dates BEYOND grace period (> 30 days from now)
			for (var i = 5; i < 10; i++) {
				final var profile = new ProfileTestBuilder(i)
					.withNamePrefix("BeyondGrace" + System.nanoTime())
					.withUserLanguage(findLanguage("EN"))
					.withUserType(findUserType("employee"))
					.withCity(ottawa)
					.withClassification(findClassification("IT-01"))
					.withLanguage(findLanguageReferralType("BILINGUAL"))
					.withProfileStatus(findProfileStatus("APPROVED"))
					.withWfaDates(LocalDate.now().minusDays(90), LocalDate.now().plusDays(60)) // Ends in 60 days
					.withWfaStatus(findWfaStatus("AFFECTED"))
					.build();

				userRepository.save(profile.getUser());
				profileRepository.save(profile);
			}

			// Request 7 profiles. The expectation is to get:
			// - All 5 profiles from the high-priority "grace period" group.
			// - 2 randomly selected profiles from the "beyond grace period" group to fill the limit.
			final var matches = requestMatchingService.findMatches(request.getId(), 7);

			final var gracePeriodCount = matches.stream()
				.map(MatchEntity::getProfile)
				.filter(p -> {
					final var endDate = p.getWfaEndDate();
					final var cutoff = LocalDate.now().plusDays(30);
					return nonNull(endDate) && endDate.isBefore(cutoff);
				}).count();

			assertThat(matches).as("Should return exactly 7 profiles (max limit)")
				.hasSize(7);
			assertThat(gracePeriodCount).as("All 5 grace period profiles should be selected first")
				.isEqualTo(5);
		}

		/**
		 * Tests that profiles with null WFA end dates are not considered within the grace period.
		 *
		 * Business Rule: The grace period prioritization only applies to profiles with a specific
		 * WFA end date that falls within the grace period window. Profiles with null end dates
		 * (indicating open-ended or indefinite availability) are not prioritized and are treated
		 * as regular profiles subject to random selection.
		 *
		 * Test Scenario: Creates profiles with the same WFA status:
		 * - 4 profiles with end dates within grace period
		 * - 6 profiles with null end dates
		 *
		 * When requesting 7 matches, we expect all 4 grace period profiles plus 3 null-date profiles.
		 *
		 * Why This Matters: Ensures the grace period logic correctly handles null values and
		 * doesn't accidentally prioritize profiles without end dates. Null dates represent different
		 * business semantics (indefinite availability) and shouldn't receive grace period priority.
		 */
		@Test
		@DisplayName("Should not prioritize profiles with null WFA end date in grace period logic")
		void shouldNotPrioritizeNullEndDatesInGracePeriod() {
			final var request = requestRepository.save(
				RequestEntity.builder()
					.startDate(LocalDate.now().minusDays(60))
					.endDate(LocalDate.now().plusDays(180))
					.cities(List.of(ottawa))
					.classification(findClassification("IT-01"))
					.languageRequirement(findLanguageRequirement("BI"))
					.requestStatus(findRequestStatus("SUBMIT"))
					.submitter(requestSubmitter)
					.build());

			// Create profiles with end dates WITHIN grace period
			for (var i = 0; i < 4; i++) {
				final var profile = new ProfileTestBuilder(i)
					.withNamePrefix("GracePeriod" + System.nanoTime())
					.withUserLanguage(findLanguage("EN"))
					.withUserType(findUserType("employee"))
					.withCity(ottawa)
					.withClassification(findClassification("IT-01"))
					.withLanguage(findLanguageReferralType("BILINGUAL"))
					.withProfileStatus(findProfileStatus("APPROVED"))
					.withWfaDates(LocalDate.now().minusDays(90), LocalDate.now().plusDays(15)) // Ends in 15 days
					.withWfaStatus(findWfaStatus("AFFECTED"))
					.build();

				userRepository.save(profile.getUser());
				profileRepository.save(profile);
			}

			// Create profiles with NULL end dates (should not be in grace period)
			for (var i = 4; i < 10; i++) {
				final var profile = new ProfileTestBuilder(i)
					.withNamePrefix("NullEndDate" + System.nanoTime())
					.withUserLanguage(findLanguage("EN"))
					.withUserType(findUserType("employee"))
					.withCity(ottawa)
					.withClassification(findClassification("IT-01"))
					.withLanguage(findLanguageReferralType("BILINGUAL"))
					.withProfileStatus(findProfileStatus("APPROVED"))
					.withWfaDates(LocalDate.now().minusDays(90), null) // No end date
					.withWfaStatus(findWfaStatus("AFFECTED"))
					.build();

				userRepository.save(profile.getUser());
				profileRepository.save(profile);
			}

			// Request 7 profiles (less than the 10 available)
			final var matches = requestMatchingService.findMatches(request.getId(), 7);

			final var gracePeriodCount = matches.stream()
				.map(MatchEntity::getProfile)
				.filter(p -> {
					final var endDate = p.getWfaEndDate();
					final var cutoff = LocalDate.now().plusDays(30);
					return nonNull(endDate) && endDate.isBefore(cutoff);
				}).count();

			final var nullEndDateCount = matches.stream()
				.map(MatchEntity::getProfile)
				.filter(p -> p.getWfaEndDate() == null)
				.count();

			assertThat(matches).as("Should return exactly 7 profiles (max limit)")
				.hasSize(7);
			assertThat(gracePeriodCount).as("All 4 grace period profiles should be selected first")
				.isEqualTo(4);
			assertThat(nullEndDateCount).as("Exactly 3 null end date profiles should be selected to reach max of 7")
				.isEqualTo(3);
		}

		/**
		 * Tests grace period boundary conditions (end date exactly at the cutoff).
		 *
		 * Business Rule: The grace period cutoff is inclusive - profiles with end dates
		 * exactly at the cutoff (30 days from now) ARE considered within the grace period.
		 * The logic uses `!isAfter(cutoff)`, meaning dates before or on the cutoff qualify.
		 *
		 * Test Scenario: Creates profiles with end dates at critical boundaries:
		 * - 1 day before cutoff (29 days from now) - should be in grace period
		 * - Exactly at cutoff (30 days from now) - should be in grace period
		 * - 1 day after cutoff (31 days from now) - should NOT be in grace period
		 *
		 * Why This Matters: Validates the precise boundary logic to ensure consistent behavior
		 * at edge cases. Prevents off-by-one errors and ensures the grace period window is
		 * applied consistently.
		 */
		@Test
		@DisplayName("Should handle grace period boundary conditions correctly")
		void shouldHandleGracePeriodBoundary() {
			final var request = requestRepository.save(
				RequestEntity.builder()
					.startDate(LocalDate.now().minusDays(60))
					.endDate(LocalDate.now().plusDays(180))
					.cities(List.of(ottawa))
					.classification(findClassification("IT-01"))
					.languageRequirement(findLanguageRequirement("BI"))
					.requestStatus(findRequestStatus("SUBMIT"))
					.submitter(requestSubmitter)
					.build());

			// Profile ending 29 days from now (within grace period, should be prioritized)
			final var withinGrace = new ProfileTestBuilder(0)
				.withNamePrefix("Within" + System.nanoTime())
				.withUserLanguage(findLanguage("EN"))
				.withUserType(findUserType("employee"))
				.withCity(ottawa)
				.withClassification(findClassification("IT-01"))
				.withLanguage(findLanguageReferralType("BILINGUAL"))
				.withProfileStatus(findProfileStatus("APPROVED"))
				.withWfaDates(LocalDate.now().minusDays(90), LocalDate.now().plusDays(29))
				.withWfaStatus(findWfaStatus("AFFECTED"))
				.build();

			// Profile ending exactly 30 days from now (at boundary, in grace period)
			// The logic uses !isAfter(cutoff), so the cutoff date itself is inclusive.
			final var atBoundary = new ProfileTestBuilder(1)
				.withNamePrefix("AtBoundary" + System.nanoTime())
				.withUserLanguage(findLanguage("EN"))
				.withUserType(findUserType("employee"))
				.withCity(ottawa)
				.withClassification(findClassification("IT-01"))
				.withLanguage(findLanguageReferralType("BILINGUAL"))
				.withProfileStatus(findProfileStatus("APPROVED"))
				.withWfaDates(LocalDate.now().minusDays(90), LocalDate.now().plusDays(30))
				.withWfaStatus(findWfaStatus("AFFECTED"))
				.build();

			// Profile ending 31 days from now (beyond grace period)
			final var beyondGrace = new ProfileTestBuilder(2)
				.withNamePrefix("Beyond" + System.nanoTime())
				.withUserLanguage(findLanguage("EN"))
				.withUserType(findUserType("employee"))
				.withCity(ottawa)
				.withClassification(findClassification("IT-01"))
				.withLanguage(findLanguageReferralType("BILINGUAL"))
				.withProfileStatus(findProfileStatus("APPROVED"))
				.withWfaDates(LocalDate.now().minusDays(90), LocalDate.now().plusDays(31))
				.withWfaStatus(findWfaStatus("AFFECTED"))
				.build();

			userRepository.saveAll(List.of(withinGrace.getUser(), atBoundary.getUser(), beyondGrace.getUser()));
			profileRepository.saveAll(List.of(withinGrace, atBoundary, beyondGrace));

			// Request all 3 profiles to observe their ordering
			final var matches = requestMatchingService.findMatches(request.getId(), 3);

			assertThat(matches).as("Should return all 3 profiles")
				.hasSize(3);

			// Verify that 2 profiles are considered in grace period
			final var gracePeriodCount = matches.stream()
				.map(MatchEntity::getProfile)
				.filter(p -> {
					final var endDate = p.getWfaEndDate();
					final var cutoff = LocalDate.now().plusDays(30);
					return nonNull(endDate) && !endDate.isAfter(cutoff);
				}).count();

			assertThat(gracePeriodCount).as("Only 2 profiles should be in grace period (29 & 30 days, not 31)")
				.isEqualTo(2);

		// The first 2 profiles should be within grace period (order among them is randomized)
			assertThat(matches.get(0).getProfile().getWfaEndDate())
				.as("First profile should be within grace period (29 or 30 days)")
				.isIn(LocalDate.now().plusDays(29), LocalDate.now().plusDays(30));

			assertThat(matches.get(1).getProfile().getWfaEndDate())
				.as("Second profile should be within grace period (29 or 30 days)")
				.isIn(LocalDate.now().plusDays(29), LocalDate.now().plusDays(30));

			// The third profile should be beyond grace period
			assertThat(matches.get(2).getProfile().getWfaEndDate())
				.as("Third profile should be beyond grace period (31 days)")
				.isEqualTo(LocalDate.now().plusDays(31));
		}

		/**
		 * Tests that grace period prioritization respects WFA status priority levels.
		 *
		 * Business Rule: Grace period prioritization is a secondary sort within each WFA status
		 * priority level. WFA status priority is ALWAYS the primary sort. This means:
		 * - High priority non-grace profiles come before low priority grace profiles
		 * - Within each priority level, grace period profiles come before non-grace profiles
		 *
		 * Test Scenario: Creates profiles across two priority levels:
		 * - High priority: 3 non-grace profiles, 2 grace profiles
		 * - Low priority: 2 grace profiles, 3 non-grace profiles
		 *
		 * Expected order (for max=7):
		 * 1. High priority grace profiles (2)
		 * 2. High priority non-grace profiles (3)
		 * 3. Low priority grace profiles (2)
		 * 4. Low priority non-grace profiles (0, since we hit max of 7)
		 *
		 * Why This Matters: Validates the hierarchical sorting logic ensures WFA status
		 * remains the dominant factor while grace period provides meaningful secondary prioritization.
		 */
		@Test
		@DisplayName("Should prioritize WFA status before grace period")
		void shouldPrioritizeWfaStatusBeforeGracePeriod() {
			final var request = requestRepository.save(
				RequestEntity.builder()
					.startDate(LocalDate.now().minusDays(60))
					.endDate(LocalDate.now().plusDays(180))
					.cities(List.of(ottawa))
					.classification(findClassification("IT-01"))
					.languageRequirement(findLanguageRequirement("BI"))
					.requestStatus(findRequestStatus("SUBMIT"))
					.submitter(requestSubmitter)
					.build());

			/*
			 * Test Setup:
			 * We will create four distinct groups of profiles to test the sorting hierarchy:
			 *  1. High Priority, Grace Period (2 profiles)  - Expected to be selected first
			 *  2. High Priority, Non-Grace (3 profiles)     - Expected to be selected second
			 *  3. Low Priority, Grace Period (2 profiles)   - Expected to be selected third
			 *  4. Low Priority, Non-Grace (3 profiles)      - Expected to be selected last
			 *
			 * With a max limit of 7, we expect to get all 5 High Priority profiles and the 2 Low Priority Grace Period profiles.
			 */

			// Find two WFA statuses with different priorities
			final var highPriorityStatus = wfaStatuses.stream()
				.filter(s -> nonNull(s.getSortOrder()))
				.min(comparing(WfaStatusEntity::getSortOrder))
				.orElseThrow();

			final var lowPriorityStatus = wfaStatuses.stream()
				.filter(s -> nonNull(s.getSortOrder()))
				.filter(s -> s.getSortOrder() > highPriorityStatus.getSortOrder())
				.findFirst()
				.orElseThrow();

			// HIGH PRIORITY, non-grace period (3 profiles)
			for (var i = 0; i < 3; i++) {
				final var profile = new ProfileTestBuilder(i)
					.withNamePrefix("HighNonGrace" + System.nanoTime())
					.withUserLanguage(findLanguage("EN"))
					.withUserType(findUserType("employee"))
					.withCity(ottawa)
					.withClassification(findClassification("IT-01"))
					.withLanguage(findLanguageReferralType("BILINGUAL"))
					.withProfileStatus(findProfileStatus("APPROVED"))
					.withWfaDates(LocalDate.now().minusDays(90), LocalDate.now().plusDays(60))
					.withWfaStatus(highPriorityStatus)
					.build();

				userRepository.save(profile.getUser());
				profileRepository.save(profile);
			}

			// HIGH PRIORITY, grace period (2 profiles)
			for (var i = 3; i < 5; i++) {
				final var profile = new ProfileTestBuilder(i)
					.withNamePrefix("HighGrace" + System.nanoTime())
					.withUserLanguage(findLanguage("EN"))
					.withUserType(findUserType("employee"))
					.withCity(ottawa)
					.withClassification(findClassification("IT-01"))
					.withLanguage(findLanguageReferralType("BILINGUAL"))
					.withProfileStatus(findProfileStatus("APPROVED"))
					.withWfaDates(LocalDate.now().minusDays(90), LocalDate.now().plusDays(15))
					.withWfaStatus(highPriorityStatus)
					.build();

				userRepository.save(profile.getUser());
				profileRepository.save(profile);
			}

			// LOW PRIORITY, grace period (2 profiles)
			for (var i = 5; i < 7; i++) {
				final var profile = new ProfileTestBuilder(i)
					.withNamePrefix("LowGrace" + System.nanoTime())
					.withUserLanguage(findLanguage("EN"))
					.withUserType(findUserType("employee"))
					.withCity(ottawa)
					.withClassification(findClassification("IT-01"))
					.withLanguage(findLanguageReferralType("BILINGUAL"))
					.withProfileStatus(findProfileStatus("APPROVED"))
					.withWfaDates(LocalDate.now().minusDays(90), LocalDate.now().plusDays(20))
					.withWfaStatus(lowPriorityStatus)
					.build();

				userRepository.save(profile.getUser());
				profileRepository.save(profile);
			}

			// LOW PRIORITY, non-grace period (3 profiles)
			for (var i = 7; i < 10; i++) {
				final var profile = new ProfileTestBuilder(i)
					.withNamePrefix("LowNonGrace" + System.nanoTime())
					.withUserLanguage(findLanguage("EN"))
					.withUserType(findUserType("employee"))
					.withCity(ottawa)
					.withClassification(findClassification("IT-01"))
					.withLanguage(findLanguageReferralType("BILINGUAL"))
					.withProfileStatus(findProfileStatus("APPROVED"))
					.withWfaDates(LocalDate.now().minusDays(90), LocalDate.now().plusDays(90))
					.withWfaStatus(lowPriorityStatus)
					.build();

				userRepository.save(profile.getUser());
				profileRepository.save(profile);
			}

			// Request 7 profiles
			final var matches = requestMatchingService.findMatches(request.getId(), 7);

			// Count profiles by priority level
			final var highPriorityCount = matches.stream()
				.map(MatchEntity::getProfile)
				.filter(p -> p.getWfaStatus().getId().equals(highPriorityStatus.getId()))
				.count();

			final var lowPriorityCount = matches.stream()
				.map(MatchEntity::getProfile)
				.filter(p -> p.getWfaStatus().getId().equals(lowPriorityStatus.getId()))
				.count();

			// Within high priority, count grace vs non-grace
			final var highPriorityGraceCount = matches.stream()
				.map(MatchEntity::getProfile)
				.filter(p -> p.getWfaStatus().getId().equals(highPriorityStatus.getId()))
				.filter(p -> {
					final var endDate = p.getWfaEndDate();
					final var cutoff = LocalDate.now().plusDays(30);
					return nonNull(endDate) && endDate.isBefore(cutoff);
				}).count();

			assertThat(matches).as("Should return exactly 7 profiles (max limit)")
				.hasSize(7);

			assertThat(highPriorityCount).as("All 5 high priority profiles should be selected")
				.isEqualTo(5);

			assertThat(lowPriorityCount).as("Only 2 low priority profiles should be selected (to reach max of 7)")
				.isEqualTo(2);

			assertThat(highPriorityGraceCount).as("All 2 high priority grace profiles should be included")
				.isEqualTo(2);

			// Verify the first 5 profiles are all high priority (order of grace vs non-grace within high priority may vary due to insertion order)
			matches.subList(0, 5)
				.forEach(p -> assertThat(p.getProfile().getWfaStatus().getId()).as("First 5 profiles should all be high priority")
					.isEqualTo(highPriorityStatus.getId())
			);
		}

	}

	/**
	 * Tests for language requirement matching rules (BI, BNI, EE-AE, FE, EF-AF, VAR).
	 */
	@Nested
	@DisplayName("Language Requirement Matching")
	class LanguageRequirementMatching {

		/**
		 * Tests the language matching rule for English Essential (EE-AE) requirements.
		 *
		 * Business Rule: When a request has language requirement "EE-AE" (English Essential),
		 * only profiles with "ENGLISH" language referral type should match. Profiles with FRENCH or
		 * BILINGUAL preferences should be excluded.
		 *
		 * Test Scenario: Creates 10 profiles with ENGLISH preference (should match) and 5
		 * with FRENCH preference (should not match). Verifies that only ENGLISH profiles are returned.
		 *
		 * Why This Matters: Validates one branch of the language decision table, ensuring
		 * English-only positions don't incorrectly match bilingual or French-only candidates.
		 */
		@Test
		@DisplayName("Should match profiles with 'english essential' language requirement")
		void shouldMatchProfilesWithEnglishEssentialLanguage() {
			final var request = requestRepository.save(
				RequestEntity.builder()
					.startDate(LocalDate.now().minusDays(60))
					.endDate(LocalDate.now().plusDays(60))
					.cities(List.of(ottawa))
					.classification(findClassification("IT-01"))
					.languageRequirement(findLanguageRequirement("EE-AE"))
					.requestStatus(findRequestStatus("SUBMIT"))
					.submitter(requestSubmitter)
					.build());

			// Create profiles with ENGLISH language preference
			for (var i = 0; i < 10; i++) {
				final var profile = new ProfileTestBuilder(i)
					.withNamePrefix("English")
					.withUserLanguage(findLanguage("EN"))
					.withUserType(findUserType("employee"))
					.withCity(ottawa)
					.withClassification(findClassification("IT-01"))
					.withLanguage(findLanguageReferralType("ENGLISH"))
					.withProfileStatus(findProfileStatus("APPROVED"))
					.withWfaStatus(findWfaStatus("AFFECTED"))
					.build();

				userRepository.save(profile.getUser());
				profileRepository.save(profile);
			}

			// Create profiles with other language preferences that should NOT match
			for (var i = 0; i < 5; i++) {
				final var profile = new ProfileTestBuilder(i)
					.withNamePrefix("French")
					.withUserLanguage(findLanguage("EN"))
					.withUserType(findUserType("employee"))
					.withCity(ottawa)
					.withClassification(findClassification("IT-01"))
					.withLanguage(findLanguageReferralType("FRENCH")) // ⚠️
					.withProfileStatus(findProfileStatus("APPROVED"))
					.withWfaStatus(findWfaStatus("AFFECTED"))
					.build();

				userRepository.save(profile.getUser());
				profileRepository.save(profile);
			}

			final var matches = requestMatchingService.findMatches(request.getId(), 10);

			assertThat(matches).as("Should find only profiles with ENGLISH language preference")
				.extracting(MatchEntity::getProfile)
				.hasSize(10)
				.allMatch((Predicate<ProfileEntity>) p -> p.getPreferredLanguages().stream().anyMatch(byCode("ENGLISH")));
		}

		/**
		 * Tests the language matching rule for French Essential (FE) requirements.
		 *
		 * Business Rule: When a request has language requirement "FE" (French Essential),
		 * only profiles with "FRENCH" language referral type should match. Profiles with ENGLISH or
		 * BILINGUAL preferences should be excluded.
		 *
		 * Test Scenario: Creates 8 profiles with FRENCH preference (should match) and 5
		 * with ENGLISH preference (should not match). Verifies that only FRENCH profiles are returned.
		 *
		 * Why This Matters: Validates another branch of the language decision table, ensuring
		 * French-only positions don't incorrectly match bilingual or English-only candidates.
		 */
		@Test
		@DisplayName("Should match profiles with 'french essential' language requirement")
		void shouldMatchProfilesWithFrenchEssentialLanguage() {
			final var request = requestRepository.save(
				RequestEntity.builder()
					.startDate(LocalDate.now().minusDays(60))
					.endDate(LocalDate.now().plusDays(60))
					.cities(List.of(ottawa))
					.classification(findClassification("IT-01"))
					.languageRequirement(findLanguageRequirement("FE"))
					.requestStatus(findRequestStatus("SUBMIT"))
					.submitter(requestSubmitter)
					.build());

			// Create profiles with FRENCH language preference
			for (var i = 0; i < 8; i++) {
				final var profile = new ProfileTestBuilder(i)
					.withNamePrefix("French")
					.withUserLanguage(findLanguage("EN"))
					.withUserType(findUserType("employee"))
					.withCity(ottawa)
					.withClassification(findClassification("IT-01"))
					.withLanguage(findLanguageReferralType("FRENCH"))
					.withProfileStatus(findProfileStatus("APPROVED"))
					.withWfaStatus(findWfaStatus("AFFECTED"))
					.build();

				userRepository.save(profile.getUser());
				profileRepository.save(profile);
			}

			// Create profiles with other language preferences that should NOT match
			for (var i = 0; i < 5; i++) {
				final var profile = new ProfileTestBuilder(i)
					.withNamePrefix("English")
					.withUserLanguage(findLanguage("EN"))
					.withUserType(findUserType("employee"))
					.withCity(ottawa)
					.withClassification(findClassification("IT-01"))
					.withLanguage(findLanguageReferralType("ENGLISH")) // ⚠️
					.withProfileStatus(findProfileStatus("APPROVED"))
					.withWfaStatus(findWfaStatus("AFFECTED"))
					.build();

				userRepository.save(profile.getUser());
				profileRepository.save(profile);
			}

			final var matches = requestMatchingService.findMatches(request.getId(), 10);

			assertThat(matches).as("Should find only profiles with FRENCH language preference")
				.extracting(MatchEntity::getProfile)
				.hasSize(8)
				.allMatch((Predicate<ProfileEntity>) p -> p.getPreferredLanguages().stream().anyMatch(byCode("FRENCH")));
		}

		/**
		 * Tests the language matching rule for Either/Or (EF-AF) requirements.
		 *
		 * Business Rule: When a request has language requirement "EF-AF" (Either English or French),
		 * profiles with either "ENGLISH" or "FRENCH" language referral type should match. However, profiles
		 * with "BILINGUAL" preference should NOT match - this requirement is specifically for unilingual
		 * positions that accept either language.
		 *
		 * Test Scenario: Creates 6 ENGLISH profiles, 4 FRENCH profiles (all should match), and
		 * 3 BILINGUAL profiles (should not match). Verifies correct filtering.
		 *
		 * Why This Matters: Tests the OR logic in language matching and confirms that BILINGUAL
		 * is treated as a distinct category, not as "ENGLISH or FRENCH".
		 */
		@Test
		@DisplayName("Should match profiles with 'either/or' language requirement")
		void shouldMatchProfilesWithEitherOrLanguage() {
			final var request = requestRepository.save(
				RequestEntity.builder()
					.startDate(LocalDate.now().minusDays(60))
					.endDate(LocalDate.now().plusDays(60))
					.cities(List.of(ottawa))
					.classification(findClassification("IT-01"))
					.languageRequirement(findLanguageRequirement("EF-AF"))
					.requestStatus(findRequestStatus("SUBMIT"))
					.submitter(requestSubmitter)
					.build());

			// Create profiles with ENGLISH language preference
			for (var i = 0; i < 6; i++) {
				final var profile = new ProfileTestBuilder(i)
					.withNamePrefix("English")
					.withUserLanguage(findLanguage("EN"))
					.withUserType(findUserType("employee"))
					.withCity(ottawa)
					.withClassification(findClassification("IT-01"))
					.withLanguage(findLanguageReferralType("ENGLISH"))
					.withProfileStatus(findProfileStatus("APPROVED"))
					.withWfaStatus(findWfaStatus("AFFECTED"))
					.build();

				userRepository.save(profile.getUser());
				profileRepository.save(profile);
			}

			// Create profiles with FRENCH language preference
			for (var i = 0; i < 4; i++) {
				final var profile = new ProfileTestBuilder(i)
					.withNamePrefix("French")
					.withUserLanguage(findLanguage("EN"))
					.withUserType(findUserType("employee"))
					.withCity(ottawa)
					.withClassification(findClassification("IT-01"))
					.withLanguage(findLanguageReferralType("FRENCH"))
					.withProfileStatus(findProfileStatus("APPROVED"))
					.withWfaStatus(findWfaStatus("AFFECTED"))
					.build();

				userRepository.save(profile.getUser());
				profileRepository.save(profile);
			}

			// Create profiles with BILINGUAL that should NOT match EF-AF
			for (var i = 0; i < 3; i++) {
				final var profile = new ProfileTestBuilder(i)
					.withNamePrefix("Bilingual")
					.withUserLanguage(findLanguage("EN"))
					.withUserType(findUserType("employee"))
					.withCity(ottawa)
					.withClassification(findClassification("IT-01"))
					.withLanguage(findLanguageReferralType("BILINGUAL")) // ⚠️
					.withProfileStatus(findProfileStatus("APPROVED"))
					.withWfaStatus(findWfaStatus("AFFECTED"))
					.build();

				userRepository.save(profile.getUser());
				profileRepository.save(profile);
			}

			final var matches = requestMatchingService.findMatches(request.getId(), 10);

			assertThat(matches).as("Should find profiles with either ENGLISH or FRENCH language preference")
				.extracting(MatchEntity::getProfile)
				.hasSize(10)
				.allMatch((Predicate<ProfileEntity>) p -> p.getPreferredLanguages().stream().anyMatch(anyOf(byCode("ENGLISH"), byCode("FRENCH"))));
		}

		/**
		 * Tests the language matching rule for Various (VAR) requirements.
		 *
		 * Business Rule: When a request has language requirement "VAR" (Various), all profiles
		 * should match regardless of their language referral type preference. This is used for positions
		 * where language is not a determining factor.
		 *
		 * Test Scenario: Creates equal numbers of ENGLISH, FRENCH, and BILINGUAL profiles.
		 * All should be eligible for matching (limited only by the max parameter).
		 *
		 * Why This Matters: Validates the "no language filter" scenario, ensuring the system
		 * can handle requests where language requirements are flexible or not applicable.
		 */
		@Test
		@DisplayName("Should match all profiles regardless of language when requirement is 'various'")
		void shouldMatchAllProfilesWithVariousLanguage() {
			final var request = requestRepository.save(
				RequestEntity.builder()
					.startDate(LocalDate.now().minusDays(60))
					.endDate(LocalDate.now().plusDays(60))
					.cities(List.of(ottawa))
					.classification(findClassification("IT-01"))
					.languageRequirement(findLanguageRequirement("VAR"))
					.requestStatus(findRequestStatus("SUBMIT"))
					.submitter(requestSubmitter)
					.build());

			// Create profiles with different language preferences
			for (var i = 0; i < 5; i++) {
				final var profile = new ProfileTestBuilder(i)
					.withNamePrefix("English")
					.withUserLanguage(findLanguage("EN"))
					.withUserType(findUserType("employee"))
					.withCity(ottawa)
					.withClassification(findClassification("IT-01"))
					.withLanguage(findLanguageReferralType("ENGLISH"))
					.withProfileStatus(findProfileStatus("APPROVED"))
					.withWfaStatus(findWfaStatus("AFFECTED"))
					.build();

				userRepository.save(profile.getUser());
				profileRepository.save(profile);
			}

			for (var i = 0; i < 5; i++) {
				final var profile = new ProfileTestBuilder(i)
					.withNamePrefix("French")
					.withUserLanguage(findLanguage("EN"))
					.withUserType(findUserType("employee"))
					.withCity(ottawa)
					.withClassification(findClassification("IT-01"))
					.withLanguage(findLanguageReferralType("FRENCH"))
					.withProfileStatus(findProfileStatus("APPROVED"))
					.withWfaStatus(findWfaStatus("AFFECTED"))
					.build();

				userRepository.save(profile.getUser());
				profileRepository.save(profile);
			}

			for (var i = 0; i < 5; i++) {
				final var profile = new ProfileTestBuilder(i)
					.withNamePrefix("Bilingual")
					.withUserLanguage(findLanguage("EN"))
					.withUserType(findUserType("employee"))
					.withCity(ottawa)
					.withClassification(findClassification("IT-01"))
					.withLanguage(findLanguageReferralType("BILINGUAL"))
					.withProfileStatus(findProfileStatus("APPROVED"))
					.withWfaStatus(findWfaStatus("AFFECTED"))
					.build();

				userRepository.save(profile.getUser());
				profileRepository.save(profile);
			}

			final var matches = requestMatchingService.findMatches(request.getId(), 10);

			assertThat(matches).as("Should find all profiles regardless of language preference")
				.hasSize(10);
		}

		/**
		 * Tests the language matching rule for Bilingual Imperative (BI) requirements.
		 *
		 * Business Rule: When a request has language requirement "BI" (Bilingual Imperative),
		 * only profiles with "BILINGUAL" language referral type should match. Unilingual profiles
		 * (ENGLISH or FRENCH only) should be excluded.
		 *
		 * Test Scenario: Creates 12 profiles with BILINGUAL preference (should match) and 4
		 * with ENGLISH preference (should not match). Verifies that only BILINGUAL profiles are returned.
		 *
		 * Why This Matters: Ensures that positions requiring bilingual competency only match
		 * candidates who have explicitly indicated bilingual capability.
		 */
		@Test
		@DisplayName("Should match profiles with 'bilingual imperative' language requirement")
		void shouldMatchProfilesWithBilingualImperativeLanguage() {
			final var request = requestRepository.save(
				RequestEntity.builder()
					.startDate(LocalDate.now().minusDays(60))
					.endDate(LocalDate.now().plusDays(60))
					.cities(List.of(ottawa))
					.classification(findClassification("IT-01"))
					.languageRequirement(findLanguageRequirement("BI"))
					.requestStatus(findRequestStatus("SUBMIT"))
					.submitter(requestSubmitter)
					.build());

			// Create profiles with BILINGUAL language preference
			for (var i = 0; i < 12; i++) {
				final var profile = new ProfileTestBuilder(i)
					.withNamePrefix("Bilingual")
					.withUserLanguage(findLanguage("EN"))
					.withUserType(findUserType("employee"))
					.withCity(ottawa)
					.withClassification(findClassification("IT-01"))
					.withLanguage(findLanguageReferralType("BILINGUAL"))
					.withProfileStatus(findProfileStatus("APPROVED"))
					.withWfaStatus(findWfaStatus("AFFECTED"))
					.build();

				userRepository.save(profile.getUser());
				profileRepository.save(profile);
			}

			// Create profiles with other language preferences that should NOT match
			for (var i = 0; i < 4; i++) {
				final var profile = new ProfileTestBuilder(i)
					.withNamePrefix("English")
					.withUserLanguage(findLanguage("EN"))
					.withUserType(findUserType("employee"))
					.withCity(ottawa)
					.withClassification(findClassification("IT-01"))
					.withLanguage(findLanguageReferralType("ENGLISH")) // ⚠️
					.withProfileStatus(findProfileStatus("APPROVED"))
					.withWfaStatus(findWfaStatus("AFFECTED"))
					.build();

				userRepository.save(profile.getUser());
				profileRepository.save(profile);
			}

			final var matches = requestMatchingService.findMatches(request.getId(), 10);

			assertThat(matches).as("Should find only profiles with BILINGUAL language preference")
				.extracting(MatchEntity::getProfile)
				.hasSize(10)
				.allMatch((Predicate<ProfileEntity>) p -> p.getPreferredLanguages().stream().anyMatch(byCode("BILINGUAL")));
		}

		/**
		 * Tests the language matching rule for Bilingual Non-Imperative (BNI) requirements.
		 *
		 * Business Rule: When a request has language requirement "BNI" (Bilingual Non-imperative),
		 * only profiles with "BILINGUAL" language referral type should match. Despite being "non-imperative",
		 * this requirement still maps to bilingual candidates in the matching algorithm.
		 *
		 * Test Scenario: Creates 12 profiles with BILINGUAL preference (should match) and 4
		 * with ENGLISH preference (should not match). Verifies that only BILINGUAL profiles are returned.
		 *
		 * Why This Matters: Confirms that both BI and BNI requirements map to the same matching
		 * behavior (BILINGUAL profiles only), even though they may differ in other ways in the business process.
		 */
		@Test
		@DisplayName("Should match profiles with 'bilingual non-imperative' language requirement")
		void shouldMatchProfilesWithBilingualNonImperativeLanguage() {
			final var request = requestRepository.save(
				RequestEntity.builder()
					.startDate(LocalDate.now().minusDays(60))
					.endDate(LocalDate.now().plusDays(60))
					.cities(List.of(ottawa))
					.classification(findClassification("IT-01"))
					.languageRequirement(findLanguageRequirement("BNI"))
					.requestStatus(findRequestStatus("SUBMIT"))
					.submitter(requestSubmitter)
					.build());

			// Create profiles with BILINGUAL language preference
			for (var i = 0; i < 12; i++) {
				final var profile = new ProfileTestBuilder(i)
					.withNamePrefix("Bilingual")
					.withUserLanguage(findLanguage("EN"))
					.withUserType(findUserType("employee"))
					.withCity(ottawa)
					.withClassification(findClassification("IT-01"))
					.withLanguage(findLanguageReferralType("BILINGUAL"))
					.withProfileStatus(findProfileStatus("APPROVED"))
					.withWfaStatus(findWfaStatus("AFFECTED"))
					.build();

				userRepository.save(profile.getUser());
				profileRepository.save(profile);
			}

			// Create profiles with other language preferences that should NOT match
			for (var i = 0; i < 4; i++) {
				final var profile = new ProfileTestBuilder(i)
					.withNamePrefix("English")
					.withUserLanguage(findLanguage("EN"))
					.withUserType(findUserType("employee"))
					.withCity(ottawa)
					.withClassification(findClassification("IT-01"))
					.withLanguage(findLanguageReferralType("ENGLISH")) // ⚠️
					.withProfileStatus(findProfileStatus("APPROVED"))
					.withWfaStatus(findWfaStatus("AFFECTED"))
					.build();

				userRepository.save(profile.getUser());
				profileRepository.save(profile);
			}

			final var matches = requestMatchingService.findMatches(request.getId(), 10);

			assertThat(matches).as("Should find only profiles with BILINGUAL language preference")
				.extracting(MatchEntity::getProfile)
				.hasSize(10)
				.allMatch((Predicate<ProfileEntity>) p -> p.getPreferredLanguages().stream().anyMatch(byCode("BILINGUAL")));
		}

	}

	/**
	 * Tests for WFA status prioritization and max limit enforcement.
	 */
	@Nested
	@DisplayName("Prioritization and Limits")
	class PrioritizationAndLimits {

		/**
		 * Tests the prioritization and max limit enforcement of the matching algorithm.
		 *
		 * Business Rule: When more profiles match than the requested maximum, the service should:
		 * 1. Group profiles by WFA status sort order (lower values = higher priority)
		 * 2. Select all profiles from highest priority groups first
		 * 3. Within each priority level, randomly select profiles to ensure fairness
		 * 4. Stop when the max limit is reached
		 *
		 * Lower-priority profiles should only be considered if higher-priority profiles don't fill all slots.
		 *
		 * Test Scenario: Creates 25 total profiles across three priority levels:
		 * - 5 high-priority profiles (lowest sort order)
		 * - 10 medium-priority profiles (middle sort order)
		 * - 10 low-priority profiles (highest sort order)
		 *
		 * With max=10, expects all 5 high-priority + 5 randomly selected medium-priority profiles,
		 * and no low-priority profiles.
		 *
		 * Why This Matters: Validates the core prioritization logic that ensures urgent or
		 * preferred profiles are selected first, while still providing fairness through randomization
		 * within priority levels. Critical for meeting business needs around profile selection order.
		 */
		@Test
		@DisplayName("Should respect max limit and prioritize by WFA status sort order")
		void shouldRespectMaxLimitAndPrioritizeByWfaStatus() {
			final var request = requestRepository.save(
				RequestEntity.builder()
					.startDate(LocalDate.now().minusDays(60))
					.endDate(LocalDate.now().plusDays(60))
					.cities(List.of(ottawa))
					.classification(findClassification("IT-01"))
					.languageRequirement(findLanguageRequirement("BI"))
					.requestStatus(findRequestStatus("SUBMIT"))
					.submitter(requestSubmitter)
					.build());

			// Create 5 profiles with highest priority (lowest sort order)
			final var highPriorityStatus = wfaStatuses.stream()
				.filter(s -> nonNull(s.getSortOrder()))
				.min(comparing(WfaStatusEntity::getSortOrder))
				.orElseThrow();

			for (var i = 0; i < 5; i++) {
				final var profile = new ProfileTestBuilder(i)
					.withNamePrefix("HighPriority")
					.withUserLanguage(findLanguage("EN"))
					.withUserType(findUserType("employee"))
					.withCity(ottawa)
					.withClassification(findClassification("IT-01"))
					.withLanguage(findLanguageReferralType("BILINGUAL"))
					.withProfileStatus(findProfileStatus("APPROVED"))
					.withWfaStatus(highPriorityStatus)
					.build();

				userRepository.save(profile.getUser());
				profileRepository.save(profile);
			}

			// Create 10 profiles with medium priority
			final var mediumPriorityStatus = wfaStatuses.stream()
				.filter(s -> nonNull(s.getSortOrder()) && s.getSortOrder() > highPriorityStatus.getSortOrder())
				.min(comparing(WfaStatusEntity::getSortOrder))
				.orElseThrow();

			for (var i = 0; i < 10; i++) {
				final var profile = new ProfileTestBuilder(100 + i)
					.withNamePrefix("MediumPriority")
					.withUserLanguage(findLanguage("EN"))
					.withUserType(findUserType("employee"))
					.withCity(ottawa)
					.withClassification(findClassification("IT-01"))
					.withLanguage(findLanguageReferralType("BILINGUAL"))
					.withProfileStatus(findProfileStatus("APPROVED"))
					.withWfaStatus(mediumPriorityStatus)
					.build();

				userRepository.save(profile.getUser());
				profileRepository.save(profile);
			}

			// Create 10 profiles with low priority
			final var lowPriorityStatus = wfaStatuses.stream()
				.filter(s -> nonNull(s.getSortOrder()) && s.getSortOrder() > mediumPriorityStatus.getSortOrder())
				.min(comparing(WfaStatusEntity::getSortOrder))
				.orElseThrow();

			for (var i = 0; i < 10; i++) {
				final var profile = new ProfileTestBuilder(200 + i)
					.withNamePrefix("LowPriority")
					.withUserLanguage(findLanguage("EN"))
					.withUserType(findUserType("employee"))
					.withCity(ottawa)
					.withClassification(findClassification("IT-01"))
					.withLanguage(findLanguageReferralType("BILINGUAL"))
					.withProfileStatus(findProfileStatus("APPROVED"))
					.withWfaStatus(lowPriorityStatus)
					.build();

				userRepository.save(profile.getUser());
				profileRepository.save(profile);
			}

			final var matches = requestMatchingService.findMatches(request.getId(), 10);

			// Count profiles by priority
			final var highPriorityCount = matches.stream()
				.filter(p -> p.getProfile().getWfaStatus().getSortOrder().equals(highPriorityStatus.getSortOrder()))
				.count();
			final var mediumPriorityCount = matches.stream()
				.filter(p -> p.getProfile().getWfaStatus().getSortOrder().equals(mediumPriorityStatus.getSortOrder()))
				.count();
			final var lowPriorityCount = matches.stream()
				.filter(p -> p.getProfile().getWfaStatus().getSortOrder().equals(lowPriorityStatus.getSortOrder()))
				.count();

			assertThat(matches).as("Should return exactly 10 profiles (max limit)")
				.hasSize(10);
			assertThat(highPriorityCount).as("All 5 high priority profiles should be selected first")
				.isEqualTo(5);
			assertThat(mediumPriorityCount).as("Should fill remaining 5 slots with medium priority profiles (randomly selected from 10)")
				.isEqualTo(5);
			assertThat(lowPriorityCount).as("No low priority profiles should be selected (max already reached)")
				.isEqualTo(0);
		}

		/**
		 * Tests that profiles are correctly ordered by WFA status priority and urgency with a large dataset.
		 *
		 * Business Rule: The matching algorithm applies a hierarchical sort:
		 *   1. Primary: WFA status sort order (ascending - lower values = higher priority)
		 *   2. Secondary: Grace period urgency (urgent profiles first within each WFA status)
		 *   3. Tertiary: Random order preserved from initial shuffle
		 *
		 * Test Scenario: Creates 100 profiles with various WFA statuses and end dates,
		 * then verifies the returned list satisfies two key ordering properties:
		 *   1. WFA sort orders are non-decreasing (ascending)
		 *   2. Within each WFA status group, urgent profiles appear before non-urgent profiles
		 *
		 * Why This Matters: Validates the complete prioritization hierarchy with realistic
		 * data volumes in a simple, verifiable way. This increases confidence that when
		 * a maximum number of profiles are requested, what is returned will be correctly
		 * prioritized.
		 */
		@Test
		@DisplayName("Should correctly order 100 profiles by WFA status priority and urgency")
		void shouldOrderProfilesByPriorityWithLargeDataset() {
			final var request = requestRepository.save(
				RequestEntity.builder()
					.startDate(LocalDate.now().minusDays(60))
					.endDate(LocalDate.now().plusDays(180))
					.cities(List.of(ottawa))
					.classification(findClassification("IT-01"))
					.languageRequirement(findLanguageRequirement("BI"))
					.requestStatus(findRequestStatus("SUBMIT"))
					.submitter(requestSubmitter)
					.build());

			// Find three WFA statuses with different priorities
			final var sortedStatuses = wfaStatuses.stream()
				.filter(s -> nonNull(s.getSortOrder()))
				.sorted(comparing(WfaStatusEntity::getSortOrder))
				.toList();

			final var highPriorityStatus = sortedStatuses.get(0);
			final var mediumPriorityStatus = sortedStatuses.get(1);
			final var lowPriorityStatus = sortedStatuses.get(2);

			// Create 100 profiles across 3 priority levels with mix of urgent and non-urgent
			// High priority: 20 urgent + 10 non-urgent
			for (var i = 0; i < 20; i++) {
				final var profile = new ProfileTestBuilder(i)
					.withNamePrefix("HighUrgent" + System.nanoTime())
					.withUserLanguage(findLanguage("EN"))
					.withUserType(findUserType("employee"))
					.withCity(ottawa)
					.withClassification(findClassification("IT-01"))
					.withLanguage(findLanguageReferralType("BILINGUAL"))
					.withProfileStatus(findProfileStatus("APPROVED"))
					.withWfaDates(LocalDate.now().minusDays(90), LocalDate.now().plusDays(15)) // urgent
					.withWfaStatus(highPriorityStatus)
					.build();
				userRepository.save(profile.getUser());
				profileRepository.save(profile);
			}

			for (var i = 20; i < 30; i++) {
				final var profile = new ProfileTestBuilder(i)
					.withNamePrefix("HighNonUrgent" + System.nanoTime())
					.withUserLanguage(findLanguage("EN"))
					.withUserType(findUserType("employee"))
					.withCity(ottawa)
					.withClassification(findClassification("IT-01"))
					.withLanguage(findLanguageReferralType("BILINGUAL"))
					.withProfileStatus(findProfileStatus("APPROVED"))
					.withWfaDates(LocalDate.now().minusDays(90), LocalDate.now().plusDays(60)) // non-urgent
					.withWfaStatus(highPriorityStatus)
					.build();
				userRepository.save(profile.getUser());
				profileRepository.save(profile);
			}

			// Medium priority: 25 urgent + 15 non-urgent
			for (var i = 30; i < 55; i++) {
				final var profile = new ProfileTestBuilder(i)
					.withNamePrefix("MediumUrgent" + System.nanoTime())
					.withUserLanguage(findLanguage("EN"))
					.withUserType(findUserType("employee"))
					.withCity(ottawa)
					.withClassification(findClassification("IT-01"))
					.withLanguage(findLanguageReferralType("BILINGUAL"))
					.withProfileStatus(findProfileStatus("APPROVED"))
					.withWfaDates(LocalDate.now().minusDays(90), LocalDate.now().plusDays(20)) // urgent
					.withWfaStatus(mediumPriorityStatus)
					.build();
				userRepository.save(profile.getUser());
				profileRepository.save(profile);
			}

			for (var i = 55; i < 70; i++) {
				final var profile = new ProfileTestBuilder(i)
					.withNamePrefix("MediumNonUrgent" + System.nanoTime())
					.withUserLanguage(findLanguage("EN"))
					.withUserType(findUserType("employee"))
					.withCity(ottawa)
					.withClassification(findClassification("IT-01"))
					.withLanguage(findLanguageReferralType("BILINGUAL"))
					.withProfileStatus(findProfileStatus("APPROVED"))
					.withWfaDates(LocalDate.now().minusDays(90), LocalDate.now().plusDays(90)) // non-urgent
					.withWfaStatus(mediumPriorityStatus)
					.build();
				userRepository.save(profile.getUser());
				profileRepository.save(profile);
			}

			// Low priority: 18 urgent + 12 non-urgent
			for (var i = 70; i < 88; i++) {
				final var profile = new ProfileTestBuilder(i)
					.withNamePrefix("LowUrgent" + System.nanoTime())
					.withUserLanguage(findLanguage("EN"))
					.withUserType(findUserType("employee"))
					.withCity(ottawa)
					.withClassification(findClassification("IT-01"))
					.withLanguage(findLanguageReferralType("BILINGUAL"))
					.withProfileStatus(findProfileStatus("APPROVED"))
					.withWfaDates(LocalDate.now().minusDays(90), LocalDate.now().plusDays(25)) // urgent
					.withWfaStatus(lowPriorityStatus)
					.build();
				userRepository.save(profile.getUser());
				profileRepository.save(profile);
			}

			for (var i = 88; i < 100; i++) {
				final var profile = new ProfileTestBuilder(i)
					.withNamePrefix("LowNonUrgent" + System.nanoTime())
					.withUserLanguage(findLanguage("EN"))
					.withUserType(findUserType("employee"))
					.withCity(ottawa)
					.withClassification(findClassification("IT-01"))
					.withLanguage(findLanguageReferralType("BILINGUAL"))
					.withProfileStatus(findProfileStatus("APPROVED"))
					.withWfaDates(LocalDate.now().minusDays(90), LocalDate.now().plusDays(120)) // non-urgent
					.withWfaStatus(lowPriorityStatus)
					.build();
				userRepository.save(profile.getUser());
				profileRepository.save(profile);
			}

			// Request all 100 profiles
			final var matches = requestMatchingService.findMatches(request.getId(), 100);

			assertThat(matches).as("Should return all 100 matching profiles")
				.hasSize(100);

			// Helper to check if a profile is urgent (within grace period of 30 days)
			final var cutoffDate = LocalDate.now().plusDays(30);
			final Predicate<ProfileEntity> isUrgent = p -> nonNull(p.getWfaEndDate()) && !p.getWfaEndDate().isAfter(cutoffDate);

			// Verify Property 1: WFA sort orders are non-decreasing (ascending)
			for (var i = 1; i < matches.size(); i++) {
				final var prevSortOrder = matches.get(i - 1).getProfile().getWfaStatus().getSortOrder();
				final var currSortOrder = matches.get(i).getProfile().getWfaStatus().getSortOrder();

				assertThat(currSortOrder)
					.as("Sort order at index %d should be >= sort order at index %d", i, i - 1)
					.isGreaterThanOrEqualTo(prevSortOrder);
			}

			// Verify Property 2: Within each WFA status group, urgent profiles come before non-urgent
			// Group profiles by sort order and check urgency ordering within each group
			Integer currentSortOrder = null;
			Boolean seenNonUrgent = false;

			for (var i = 0; i < matches.size(); i++) {
				final var profile = matches.get(i);
				final var sortOrder = profile.getProfile().getWfaStatus().getSortOrder();
				final var urgent = isUrgent.test(profile.getProfile());

				// When we encounter a new sort order, reset the non-urgent flag
				if (currentSortOrder == null || !sortOrder.equals(currentSortOrder)) {
					currentSortOrder = sortOrder;
					seenNonUrgent = false;
				}

				// If we've already seen a non-urgent profile in this group,
				// we shouldn't see any more urgent profiles
				if (seenNonUrgent && urgent) {
					assertThat(urgent).as("Profile at index %d is urgent but appears after non-urgent profiles in the same WFA status group (sort order %d)", i, sortOrder)
						.isFalse();
				}

				// Track if we've seen a non-urgent profile in this group
				if (!urgent) { seenNonUrgent = true; }
			}
		}

		/**
		 * Tests that profiles with null WFA status sort order are treated as lowest priority.
		 *
		 * Business Rule: When prioritizing profiles by WFA status sort order, profiles with
		 * a null sort order should be treated as lowest priority (as if their sort order were
		 * Integer.MAX_VALUE). This ensures they are only selected after all profiles with defined
		 * priorities have been exhausted.
		 *
		 * Test Scenario: Create profiles with defined priorities and profiles with null
		 * priority. When the max limit is less than the total, null-priority profiles should only
		 * be selected if higher-priority profiles don't fill all slots.
		 *
		 * Why This Matters: Validates the fallback logic for handling incomplete or missing
		 * priority data, ensuring the system degrades gracefully rather than failing.
		 */
		@Test
		@DisplayName("Should treat profiles with null WFA status sort order as lowest priority")
		void shouldTreatNullSortOrderAsLowestPriority() {
			final var request = requestRepository.save(
				RequestEntity.builder()
					.startDate(LocalDate.now().minusDays(60))
					.endDate(LocalDate.now().plusDays(60))
					.cities(List.of(ottawa))
					.classification(findClassification("IT-01"))
					.languageRequirement(findLanguageRequirement("BI"))
					.requestStatus(findRequestStatus("SUBMIT"))
					.submitter(requestSubmitter)
					.build());

			// Get a WFA status with a defined sort order (higher priority)
			final var definedPriorityStatus = wfaStatuses.stream()
				.filter(s -> nonNull(s.getSortOrder()))
				.min(comparing(WfaStatusEntity::getSortOrder))
				.orElseThrow();

			// Create profiles with defined priority (should be selected first)
			for (var i = 0; i < 7; i++) {
				final var profile = new ProfileTestBuilder(i)
					.withNamePrefix("DefinedPriority")
					.withUserLanguage(findLanguage("EN"))
					.withUserType(findUserType("employee"))
					.withCity(ottawa)
					.withClassification(findClassification("IT-01"))
					.withLanguage(findLanguageReferralType("BILINGUAL"))
					.withProfileStatus(findProfileStatus("APPROVED"))
					.withWfaStatus(definedPriorityStatus)
					.build();

				userRepository.save(profile.getUser());
				profileRepository.save(profile);
			}

			// Create a WFA status with null sort order for testing
			final var nullPriorityStatus = wfaStatuses.stream()
				.filter(s -> s.getSortOrder() == null)
				.findFirst()
				.orElse(wfaStatuses.get(wfaStatuses.size() - 1)); // fallback if all have sort orders

			// Create profiles with null priority (should be selected last)
			for (var i = 0; i < 5; i++) {
				final var profile = new ProfileTestBuilder(i)
					.withNamePrefix("NullPriority")
					.withUserLanguage(findLanguage("EN"))
					.withUserType(findUserType("employee"))
					.withCity(ottawa)
					.withClassification(findClassification("IT-01"))
					.withLanguage(findLanguageReferralType("BILINGUAL"))
					.withProfileStatus(findProfileStatus("APPROVED"))
					.withWfaStatus(nullPriorityStatus)
					.build();

				userRepository.save(profile.getUser());
				profileRepository.save(profile);
			}

			// Request only 10 profiles (less than the 12 available)
			final var matches = requestMatchingService.findMatches(request.getId(), 10);

			final var definedPriorityCount = matches.stream()
				.filter(p -> p.getProfile().getWfaStatus().getId().equals(definedPriorityStatus.getId()))
				.count();

			final var nullPriorityCount = matches.stream()
				.filter(p -> p.getProfile().getWfaStatus().getId().equals(nullPriorityStatus.getId()))
				.count();

			assertThat(matches).as("Should return exactly 10 profiles (max limit)")
				.hasSize(10);
			assertThat(definedPriorityCount).as("All 7 defined priority profiles should be selected first")
				.isEqualTo(7);
			assertThat(nullPriorityCount).as("Only 3 null priority profiles should be selected to reach max of 10")
				.isEqualTo(3);
		}

	}

	/**
	 * Tests for WFA start and end date validation logic.
	 */
	@Nested
	@DisplayName("WFA Date Filtering")
	class WfaDateFiltering {

		/**
		 * Tests that profiles with null WFA start date are included in matching.
		 *
		 * Business Rule: A null WFA start date is interpreted as "no start date restriction" -
		 * the profile is considered available immediately. This is distinct from a future start date,
		 * which would exclude the profile until that date arrives.
		 *
		 * Test Scenario: Creates 5 profiles with null start date and 3 with valid start dates.
		 * All should match since null is treated permissively (as "already started").
		 *
		 * Why This Matters: Validates the null-safe handling of date fields and ensures profiles
		 * without explicit start dates aren't incorrectly filtered out. Important for data migration and
		 * backward compatibility scenarios.
		 */
		@Test
		@DisplayName("Should match profiles with null WFA start date")
		void shouldMatchProfilesWithNullWfaStartDate() {
			final var request = requestRepository.save(
				RequestEntity.builder()
					.startDate(LocalDate.now().minusDays(60))
					.endDate(LocalDate.now().plusDays(60))
					.cities(List.of(ottawa))
					.classification(findClassification("IT-01"))
					.languageRequirement(findLanguageRequirement("BI"))
					.requestStatus(findRequestStatus("SUBMIT"))
					.submitter(requestSubmitter)
					.build());

			// Create profiles with null wfaStartDate
			for (var i = 0; i < 5; i++) {
				final var profile = new ProfileTestBuilder(i)
					.withNamePrefix("WfaDate" + System.nanoTime())
					.withUserLanguage(findLanguage("EN"))
					.withUserType(findUserType("employee"))
					.withCity(ottawa)
					.withClassification(findClassification("IT-01"))
					.withLanguage(findLanguageReferralType("BILINGUAL"))
					.withProfileStatus(findProfileStatus("APPROVED"))
					.withWfaDates(null, LocalDate.now().plusDays(180))
					.withWfaStatus(findWfaStatus("AFFECTED"))
					.build();

				userRepository.save(profile.getUser());
				profileRepository.save(profile);
			}

			// Create profiles with valid start date for comparison
			for (var i = 0; i < 3; i++) {
				final var profile = new ProfileTestBuilder(i)
					.withNamePrefix("WfaDate" + System.nanoTime())
					.withUserLanguage(findLanguage("EN"))
					.withUserType(findUserType("employee"))
					.withCity(ottawa)
					.withClassification(findClassification("IT-01"))
					.withLanguage(findLanguageReferralType("BILINGUAL"))
					.withProfileStatus(findProfileStatus("APPROVED"))
					.withWfaDates(LocalDate.now().minusDays(30), LocalDate.now().plusDays(180))
					.withWfaStatus(findWfaStatus("AFFECTED"))
					.build();

				userRepository.save(profile.getUser());
				profileRepository.save(profile);
			}

			final var matches = requestMatchingService.findMatches(request.getId(), 10);

			assertThat(matches).as("Should find profiles including those with null start date (8 total, capped at max)")
				.extracting(MatchEntity::getProfile)
				.hasSizeLessThanOrEqualTo(8)
				.anyMatch((Predicate<ProfileEntity>) p -> p.getWfaStartDate() == null);
		}

		/**
		 * Tests that profiles with null WFA end date are included in matching.
		 *
		 * Business Rule: A null WFA end date is interpreted as "no end date restriction" -
		 * the profile remains available indefinitely. This is distinct from a past end date, which
		 * would exclude the profile as its availability period has expired.
		 *
		 * Test Scenario: Creates 6 profiles with null end date and 4 with valid future end dates.
		 * All should match since null is treated permissively (as "hasn't ended yet").
		 *
		 * Why This Matters: Validates null-safe handling and ensures profiles with open-ended
		 * availability aren't incorrectly excluded. Common scenario for permanent or long-term availability.
		 */
		@Test
		@DisplayName("Should match profiles with null WFA end date")
		void shouldMatchProfilesWithNullWfaEndDate() {
			final var request = requestRepository.save(
				RequestEntity.builder()
					.startDate(LocalDate.now().minusDays(60))
					.endDate(LocalDate.now().plusDays(60))
					.cities(List.of(ottawa))
					.classification(findClassification("IT-01"))
					.languageRequirement(findLanguageRequirement("BI"))
					.requestStatus(findRequestStatus("SUBMIT"))
					.submitter(requestSubmitter)
					.build());

			// Create profiles with null wfaEndDate
			for (var i = 0; i < 6; i++) {
				final var profile = new ProfileTestBuilder(i)
					.withNamePrefix("WfaDate" + System.nanoTime())
					.withUserLanguage(findLanguage("EN"))
					.withUserType(findUserType("employee"))
					.withCity(ottawa)
					.withClassification(findClassification("IT-01"))
					.withLanguage(findLanguageReferralType("BILINGUAL"))
					.withProfileStatus(findProfileStatus("APPROVED"))
					.withWfaDates(LocalDate.now().minusDays(30), null)
					.withWfaStatus(findWfaStatus("AFFECTED"))
					.build();

				userRepository.save(profile.getUser());
				profileRepository.save(profile);
			}

			// Create profiles with valid end date for comparison
			for (var i = 0; i < 4; i++) {
				final var profile = new ProfileTestBuilder(i)
					.withNamePrefix("WfaDate" + System.nanoTime())
					.withUserLanguage(findLanguage("EN"))
					.withUserType(findUserType("employee"))
					.withCity(ottawa)
					.withClassification(findClassification("IT-01"))
					.withLanguage(findLanguageReferralType("BILINGUAL"))
					.withProfileStatus(findProfileStatus("APPROVED"))
					.withWfaDates(LocalDate.now().minusDays(30), LocalDate.now().plusDays(180))
					.withWfaStatus(findWfaStatus("AFFECTED"))
					.build();

				userRepository.save(profile.getUser());
				profileRepository.save(profile);
			}

			final var matches = requestMatchingService.findMatches(request.getId(), 10);

			assertThat(matches).as("Should find profiles including those with null end date (10 total, matches max limit)")
				.extracting(MatchEntity::getProfile)
				.hasSizeLessThanOrEqualTo(10)
				.anyMatch((Predicate<ProfileEntity>) p -> p.getWfaEndDate() == null);
		}

		/**
		 * Tests that profiles with future WFA start dates are excluded from matching.
		 *
		 * Business Rule: Profiles with a WFA start date in the future are not yet available
		 * and should be excluded from current matching. The filter uses "start date <= today" logic,
		 * meaning the profile must have already started or start today to be eligible.
		 *
		 * Test Scenario: Creates 5 profiles with future start dates (should be excluded) and
		 * 7 with past/current start dates (should be included). Verifies only the 7 are returned.
		 *
		 * Why This Matters: Prevents matching profiles that have been entered into the system
		 * but aren't available yet (e.g., someone starting next month). Ensures referrals are only for
		 * currently available candidates.
		 */
		@Test
		@DisplayName("Should exclude profiles with future WFA start date")
		void shouldExcludeProfilesWithFutureWfaStartDate() {
			final var request = requestRepository.save(
				RequestEntity.builder()
					.startDate(LocalDate.now().minusDays(60))
					.endDate(LocalDate.now().plusDays(60))
					.cities(List.of(ottawa))
					.classification(findClassification("IT-01"))
					.languageRequirement(findLanguageRequirement("BI"))
					.requestStatus(findRequestStatus("SUBMIT"))
					.submitter(requestSubmitter)
					.build());

			// Create profiles with past/present start dates (should be included)
			for (var i = 0; i < 7; i++) {
				final var profile = new ProfileTestBuilder(i)
					.withNamePrefix("WfaDate" + System.nanoTime())
					.withUserLanguage(findLanguage("EN"))
					.withUserType(findUserType("employee"))
					.withCity(ottawa)
					.withClassification(findClassification("IT-01"))
					.withLanguage(findLanguageReferralType("BILINGUAL"))
					.withProfileStatus(findProfileStatus("APPROVED"))
					.withWfaDates(LocalDate.now().minusDays(30), LocalDate.now().plusDays(180))
					.withWfaStatus(findWfaStatus("AFFECTED"))
					.build();

				userRepository.save(profile.getUser());
				profileRepository.save(profile);
			}

			// Create profiles with future start dates (should be excluded)
			for (var i = 0; i < 5; i++) {
				final var profile = new ProfileTestBuilder(i)
					.withNamePrefix("WfaDate" + System.nanoTime())
					.withUserLanguage(findLanguage("EN"))
					.withUserType(findUserType("employee"))
					.withCity(ottawa)
					.withClassification(findClassification("IT-01"))
					.withLanguage(findLanguageReferralType("BILINGUAL"))
					.withProfileStatus(findProfileStatus("APPROVED"))
					.withWfaDates(LocalDate.now().plusDays(30), LocalDate.now().plusDays(180)) // ⚠️
					.withWfaStatus(findWfaStatus("AFFECTED"))
					.build();

				userRepository.save(profile.getUser());
				profileRepository.save(profile);
			}

			final var matches = requestMatchingService.findMatches(request.getId(), 10);

			final Predicate<ProfileEntity> hasStartedOrNoStartDate = p ->
				p.getWfaStartDate() == null || !p.getWfaStartDate().isAfter(LocalDate.now());

			assertThat(matches).as("Should exclude profiles with future start dates (7 eligible, capped at max)")
				.extracting(MatchEntity::getProfile)
				.hasSizeLessThanOrEqualTo(7)
				.allMatch(hasStartedOrNoStartDate);
		}

		/**
		 * Tests that profiles with past WFA end dates are excluded from matching.
		 *
		 * Business Rule: Profiles with a WFA end date in the past have expired availability
		 * and should be excluded from matching. The filter uses "end date >= today" logic, meaning
		 * the profile's availability period must still be active (ends today or later) to be eligible.
		 *
		 * Test Scenario: Creates 4 profiles with past end dates (should be excluded) and 9
		 * with future end dates (should be included). Verifies only the 9 are returned.
		 *
		 * Why This Matters: Ensures expired profiles aren't matched for new requests. Critical
		 * for maintaining data accuracy and preventing referrals of candidates whose WFA period has ended.
		 */
		@Test
		@DisplayName("Should exclude profiles with past WFA end date")
		void shouldExcludeProfilesWithPastWfaEndDate() {
			final var request = requestRepository.save(
				RequestEntity.builder()
					.startDate(LocalDate.now().minusDays(60))
					.endDate(LocalDate.now().plusDays(60))
					.cities(List.of(ottawa))
					.classification(findClassification("IT-01"))
					.languageRequirement(findLanguageRequirement("BI"))
					.requestStatus(findRequestStatus("SUBMIT"))
					.submitter(requestSubmitter)
					.build());

			// Create profiles with future end dates (should be included)
			for (var i = 0; i < 9; i++) {
				final var profile = new ProfileTestBuilder(i)
					.withNamePrefix("WfaDate" + System.nanoTime())
					.withUserLanguage(findLanguage("EN"))
					.withUserType(findUserType("employee"))
					.withCity(ottawa)
					.withClassification(findClassification("IT-01"))
					.withLanguage(findLanguageReferralType("BILINGUAL"))
					.withProfileStatus(findProfileStatus("APPROVED"))
					.withWfaDates(LocalDate.now().minusDays(30), LocalDate.now().plusDays(180))
					.withWfaStatus(findWfaStatus("AFFECTED"))
					.build();

				userRepository.save(profile.getUser());
				profileRepository.save(profile);
			}

			// Create profiles with past end dates (should be excluded)
			for (var i = 0; i < 4; i++) {
				final var profile = new ProfileTestBuilder(i)
					.withNamePrefix("WfaDate" + System.nanoTime())
					.withUserLanguage(findLanguage("EN"))
					.withUserType(findUserType("employee"))
					.withCity(ottawa)
					.withClassification(findClassification("IT-01"))
					.withLanguage(findLanguageReferralType("BILINGUAL"))
					.withProfileStatus(findProfileStatus("APPROVED"))
					.withWfaDates(LocalDate.now().minusDays(180), LocalDate.now().minusDays(30)) // ⚠️
					.withWfaStatus(findWfaStatus("AFFECTED"))
					.build();

				userRepository.save(profile.getUser());
				profileRepository.save(profile);
			}

			final var matches = requestMatchingService.findMatches(request.getId(), 10);

			final Predicate<ProfileEntity> hasNotEndedOrNoEndDate = p ->
				p.getWfaEndDate() == null || !p.getWfaEndDate().isBefore(LocalDate.now());

			assertThat(matches).as("Should exclude profiles with past end dates (9 eligible, capped at max)")
				.extracting(MatchEntity::getProfile)
				.hasSizeLessThanOrEqualTo(9)
				.allMatch(hasNotEndedOrNoEndDate);
		}

	}

	/**
	 * Tests for edge cases, empty results, and error conditions.
	 */
	@Nested
	@DisplayName("Edge Cases and Error Handling")
	class EdgeCasesAndErrorHandling {

		/**
		 * Tests that the service returns an empty list when no profiles match the request criteria.
		 *
		 * Business Rule: If no profiles meet ALL the required matching criteria, the service
		 * should return an empty list rather than partial matches or an error.
		 *
		 * Test Scenario: Request asks for a specific combination that no profiles satisfy
		 * (e.g., BILINGUAL IT-01 in Vancouver). Even though profiles exist with some matching attributes,
		 * none satisfy all requirements simultaneously.
		 *
		 * Why This Matters: Confirms graceful handling of "no matches" scenarios and ensures
		 * the service doesn't return profiles that fail to meet all criteria.
		 */
		@Test
		@DisplayName("Should return empty list when no profiles match all request criteria")
		void shouldReturnEmptyListWhenNoProfilesMatch() {
			final var request = requestRepository.save(
				RequestEntity.builder()
					.startDate(LocalDate.now().minusDays(60))
					.endDate(LocalDate.now().plusDays(60))
					.cities(List.of(ottawa))
					.classification(findClassification("IT-01"))
					.languageRequirement(findLanguageRequirement("BI"))
					.requestStatus(findRequestStatus("SUBMIT"))
					.submitter(requestSubmitter)
					.build());

			// Create profiles that match some but not all criteria
			for (var i = 0; i < 5; i++) {
				final var profile = new ProfileTestBuilder(i)
					.withNamePrefix("PartialMatch")
					.withUserLanguage(findLanguage("EN"))
					.withUserType(findUserType("employee"))
					.withCity(ottawa)
					.withClassification(findClassification("IT-01"))
					.withLanguage(findLanguageReferralType("ENGLISH"))
					.withProfileStatus(findProfileStatus("APPROVED"))
					.withWfaStatus(findWfaStatus("AFFECTED"))
					.build();

				userRepository.save(profile.getUser());
				profileRepository.save(profile);
			}

			final var matches = requestMatchingService.findMatches(request.getId(), 10);

			assertThat(matches).as("Should return empty list when no profiles match all criteria")
				.isEmpty();
		}

		/**
		 * Tests that the service throws an appropriate exception for unrecognized language requirement codes.
		 *
		 * Business Rule: The service should fail fast with a clear error message when encountering
		 * a language requirement code that is not part of the defined decision table. This helps identify
		 * data quality issues or missing configuration early.
		 *
		 * Test Scenario: Creates a request with an unknown language requirement code and verifies
		 * that an IllegalArgumentException is thrown with a descriptive message.
		 *
		 * Why This Matters: Ensures the system doesn't silently fail or produce incorrect results
		 * when encountering unexpected data. Helps developers and operators quickly identify configuration
		 * or data issues.
		 */
		@Test
		@DisplayName("Should throw IllegalArgumentException for unknown language requirement code")
		void shouldThrowExceptionForUnknownLanguageRequirement() {
			final var request = requestRepository.save(
				RequestEntity.builder()
					.startDate(LocalDate.now().minusDays(60))
					.endDate(LocalDate.now().plusDays(60))
					.cities(List.of(ottawa))
					.classification(findClassification("IT-01"))
					.languageRequirement(LanguageRequirementEntity.builder()
						.code("UNKNOWN-CODE")
						.build())
					.requestStatus(findRequestStatus("SUBMIT"))
					.submitter(requestSubmitter)
					.build());

			assertThatThrownBy(() -> requestMatchingService.findMatches(request.getId(), 10))
				.isInstanceOf(IllegalArgumentException.class)
				.hasMessageContaining("Unknown language requirement code: UNKNOWN-CODE");
		}

	}


	/**
	 * Comprehensive integration test validating the complete matching workflow.
	 *
	 * Business Rule: This test validates the full end-to-end matching process, ensuring
	 * all matching criteria are applied correctly in combination, not just in isolation.
	 *
	 * Test Scenario: Request for bilingual IT-01 profiles in Ottawa or St. John's.
	 * Creates 50 profiles that match all criteria and 50 that don't. Verifies that:
	 *   - Only matching profiles are returned
	 *   - Max limit is respected (returns at most 25)
	 *   - All returned profiles satisfy ALL matching criteria
	 *   - Non-matching profiles are excluded
	 *
	 * Why This Matters: This is the primary "happy path" integration test that validates
	 * the service works correctly under realistic conditions with multiple matching and non-matching
	 * profiles. It also tests the max limit enforcement, ensuring the system performs well even when
	 * many profiles match.
	 */
	@Test
	@DisplayName("Should match profiles with bilingual IT-01 classification in Ottawa or St. John's")
	void shouldMatchProfilesWithMatchingCriteriaAndExcludeNonMatching() {
		final var request = requestRepository.save(RequestEntity.builder()
			.startDate(LocalDate.now().minusDays(60))
			.endDate(LocalDate.now().plusDays(60))
			.cities(List.of(ottawa, stjohns))
			.classification(findClassification("IT-01"))
			.languageRequirement(findLanguageRequirement("BI"))
			.requestStatus(findRequestStatus("SUBMIT"))
			.submitter(requestSubmitter)
			.build());

		// Create & persist profiles that should match the request
		for (var i = 0; i < 50; i++) {
			final var profile = new ProfileTestBuilder(i)
				.withNamePrefix("Matching")
				.withUserLanguage(findLanguage("EN"))
				.withUserType(findUserType("employee"))
				.withCity(i % 2 == 0 ? ottawa : stjohns)
				.withClassification(findClassification("IT-01"))
				.withLanguage(findLanguageReferralType("BILINGUAL"))
				.withProfileStatus(findProfileStatus("APPROVED"))
				.withWfaStatus(findWfaStatus("AFFECTED"))
				.build();

			userRepository.save(profile.getUser());
			profileRepository.save(profile);
		}

		// Create & persist non-matching profiles for noise
		for (var i = 0; i < 50; i++) {
			final var profile = new ProfileTestBuilder(i)
				.withNamePrefix("Nonmatching")
				.withUserLanguage(findLanguage("EN"))
				.withUserType(findUserType("employee"))
				.withCity(toronto)                                 // ⚠️
				.withClassification(findClassification("EX-01"))   // ⚠️
				.withLanguage(findLanguageReferralType("ENGLISH")) // ⚠️
				.withProfileStatus(findProfileStatus("PENDING"))   // ⚠️
				.withWfaStatus(findWfaStatus("AFFECTED"))
				.build();

			userRepository.save(profile.getUser());
			profileRepository.save(profile);
		}

		final var matches = requestMatchingService.findMatches(request.getId(), 25);

		// create some predicates to help make the assertions more readable
		final Predicate<ProfileEntity> hasApprovedStatus = p -> p.getProfileStatus().getCode().equals("APPROVED");
		final Predicate<ProfileEntity> hasBilingualLanguage = p -> p.getPreferredLanguages().stream().anyMatch(byCode("BILINGUAL"));
		final Predicate<ProfileEntity> hasIT01Classification = p -> p.getPreferredClassifications().stream().anyMatch(byCode("IT-01"));
		final Predicate<ProfileEntity> hasOttawaOrStJohns = p -> p.getPreferredCities().stream().anyMatch(anyOf(byCode("ON52"), byCode("NL14")));
		final Predicate<ProfileEntity> hasValidWfaEndDate = p -> p.getWfaEndDate() == null || p.getWfaEndDate().isAfter(LocalDate.now());
		final Predicate<ProfileEntity> hasValidWfaStartDate = p -> p.getWfaStartDate() == null || p.getWfaStartDate().isBefore(LocalDate.now());

		assertThat(matches)
			.isNotEmpty();
		assertThat(matches).as("Should return at most 25 profiles (current max limit), even though 50 match criteria")
			.hasSizeLessThanOrEqualTo(25);
		assertThat(matches).as("All matched profiles must meet the request criteria")
			.extracting(MatchEntity::getProfile)
			.allMatch(ProfileEntity::getIsAvailableForReferral)
			.allMatch(hasApprovedStatus)
			.allMatch(hasBilingualLanguage)
			.allMatch(hasIT01Classification)
			.allMatch(hasOttawaOrStJohns)
			.allMatch(hasValidWfaEndDate)
			.allMatch(hasValidWfaStartDate);
	}

	// -------------------------------------------------------------------------
	// Entity finders
	// -------------------------------------------------------------------------

	CityEntity findCity(String code) {
		return cities.stream().filter(byCode(code)).findFirst().orElseThrow();
	}

	ClassificationEntity findClassification(String code) {
		return classifications.stream().filter(byCode(code)).findFirst().orElseThrow();
	}

	LanguageEntity findLanguage(String code) {
		return languages.stream().filter(byCode(code)).findFirst().orElseThrow();
	}

	LanguageReferralTypeEntity findLanguageReferralType(String code) {
		return languageReferralTypes.stream().filter(byCode(code)).findFirst().orElseThrow();
	}

	LanguageRequirementEntity findLanguageRequirement(String code) {
		return languageRequirements.stream().filter(byCode(code)).findFirst().orElseThrow();
	}

	ProfileStatusEntity findProfileStatus(String code) {
		return profileStatuses.stream().filter(byCode(code)).findFirst().orElseThrow();
	}

	RequestStatusEntity findRequestStatus(String code) {
		return requestStatuses.stream().filter(byCode(code)).findFirst().orElseThrow();
	}

	UserTypeEntity findUserType(String code) {
		return userTypes.stream().filter(byCode(code)).findFirst().orElseThrow();
	}

	WfaStatusEntity findWfaStatus(String code) {
		return wfaStatuses.stream().filter(byCode(code)).findFirst().orElseThrow();
	}

	@SafeVarargs
	static <T> Predicate<T> anyOf(Predicate<T>... predicates) {
		return Arrays.stream(predicates).reduce(t -> false, Predicate::or);
	}

}

/**
 * Test data builder for creating ProfileEntity instances with
 * sensible defaults and fluent API for overriding specific fields.
 */
class ProfileTestBuilder {

	final int index;

	String namePrefix = "User";

	String firstName = null;            // Will be auto-generated if null
	String lastName = null;             // Will be auto-generated if null
	String businessEmailAddress = null; // Will be auto-generated if null
	String microsoftEntraId = null;     // Will be auto-generated if null
	String personalEmailAddress = null; // Will be auto-generated if null
	String personalPhoneNumber = null;  // Will be auto-generated if null


	List<CityEntity> preferredCities = null;                    // Required - must be set
	List<ClassificationEntity> preferredClassifications = null; // Required - must be set
	List<LanguageReferralTypeEntity> preferredLanguages = null; // Required - must be set
	ProfileStatusEntity profileStatus = null;                   // Required - must be set
	LanguageEntity userLanguage = null;                         // Required - must be set
	UserTypeEntity userType = null;                             // Required - must be set
	WfaStatusEntity wfaStatus = null;                           // Required - must be set

	Boolean hasConsentedToPrivacyTerms = true;
	Boolean isAvailableForReferral = true;
	Boolean isInterestedInAlternation = true;
	LocalDate wfaStartDate = LocalDate.now().minusDays(30);
	LocalDate wfaEndDate = LocalDate.now().plusDays(180);

	ProfileTestBuilder(int index) {
		this.index = index;
	}

	// -------------------------------------------------------------------------
	// User field builders
	// -------------------------------------------------------------------------

	ProfileTestBuilder withFirstName(String firstName) {
		this.firstName = firstName;
		return this;
	}

	ProfileTestBuilder withLastName(String lastName) {
		this.lastName = lastName;
		return this;
	}

	ProfileTestBuilder withNamePrefix(String namePrefix) {
		this.namePrefix = namePrefix;
		return this;
	}

	ProfileTestBuilder withUserLanguage(LanguageEntity language) {
		this.userLanguage = language;
		return this;
	}

	ProfileTestBuilder withUserType(UserTypeEntity userType) {
		this.userType = userType;
		return this;
	}

	// -------------------------------------------------------------------------
	// Profile field builders
	// -------------------------------------------------------------------------

	ProfileTestBuilder withAvailability(boolean isAvailable) {
		this.isAvailableForReferral = isAvailable;
		return this;
	}

	ProfileTestBuilder withCity(CityEntity city) {
		this.preferredCities = List.of(city);
		return this;
	}

	ProfileTestBuilder withCities(List<CityEntity> cities) {
		this.preferredCities = cities;
		return this;
	}

	ProfileTestBuilder withClassification(ClassificationEntity classification) {
		this.preferredClassifications = List.of(classification);
		return this;
	}

	ProfileTestBuilder withClassifications(List<ClassificationEntity> classifications) {
		this.preferredClassifications = classifications;
		return this;
	}

	ProfileTestBuilder withLanguage(LanguageReferralTypeEntity language) {
		this.preferredLanguages = List.of(language);
		return this;
	}

	ProfileTestBuilder withLanguages(List<LanguageReferralTypeEntity> languages) {
		this.preferredLanguages = languages;
		return this;
	}

	ProfileTestBuilder withProfileStatus(ProfileStatusEntity profileStatus) {
		this.profileStatus = profileStatus;
		return this;
	}

	ProfileTestBuilder withWfaStatus(WfaStatusEntity wfaStatus) {
		this.wfaStatus = wfaStatus;
		return this;
	}

	ProfileTestBuilder withWfaStartDate(LocalDate wfaStartDate) {
		this.wfaStartDate = wfaStartDate;
		return this;
	}

	ProfileTestBuilder withWfaEndDate(LocalDate wfaEndDate) {
		this.wfaEndDate = wfaEndDate;
		return this;
	}

	ProfileTestBuilder withWfaDates(LocalDate startDate, LocalDate endDate) {
		this.wfaStartDate = startDate;
		this.wfaEndDate = endDate;
		return this;
	}

	ProfileTestBuilder withConsentToPrivacyTerms(boolean hasConsented) {
		this.hasConsentedToPrivacyTerms = hasConsented;
		return this;
	}

	ProfileTestBuilder withAlternationInterest(boolean isInterested) {
		this.isInterestedInAlternation = isInterested;
		return this;
	}

	// -------------------------------------------------------------------------
	// Build method
	// -------------------------------------------------------------------------

	ProfileEntity build() {
		Assert.notNull(preferredCities, "preferredCities must be set before building");
		Assert.notNull(preferredClassifications, "preferredClassifications must be set before building");
		Assert.notNull(preferredLanguages, "preferredLanguages must be set before building");
		Assert.notNull(profileStatus, "profileStatus must be set before building");
		Assert.notNull(wfaStatus, "wfaStatus must be set before building");
		Assert.notNull(userLanguage, "userLanguage must be set before building");
		Assert.notNull(userType, "userType must be set before building");

		//
		// Generate defaults for optional fields
		//

		final var actualFirstName = nonNull(firstName)
			? firstName
			: namePrefix + index;
		final var actualLastName = nonNull(lastName)
			? lastName
			: "User" + index;
		final var actualBusinessEmail = nonNull(businessEmailAddress)
			? businessEmailAddress
			: namePrefix.toLowerCase() + ".user" + index + "@example.com";
		final var actualEntraId = nonNull(microsoftEntraId)
			? microsoftEntraId
			: namePrefix.toLowerCase() + "-entra-id-" + index;
		final var actualPersonalEmail = nonNull(personalEmailAddress)
			? personalEmailAddress
			: namePrefix.toLowerCase() + "-personal" + index + "@example.com";
		final var actualPhoneNumber = nonNull(personalPhoneNumber)
			? personalPhoneNumber
			: "555-%04d".formatted(index);

		final var user = UserEntity.builder()
			.firstName(actualFirstName)
			.lastName(actualLastName)
			.businessEmailAddress(actualBusinessEmail)
			.language(userLanguage)
			.microsoftEntraId(actualEntraId)
			.userType(userType)
			.build();

		return ProfileEntity.builder()
			.user(user)
			.isAvailableForReferral(isAvailableForReferral)
			.preferredCities(preferredCities)
			.preferredClassifications(preferredClassifications)
			.preferredLanguages(preferredLanguages)
			.profileStatus(profileStatus)
			.wfaStartDate(wfaStartDate)
			.wfaEndDate(wfaEndDate)
			.wfaStatus(wfaStatus)
			.hasConsentedToPrivacyTerms(hasConsentedToPrivacyTerms)
			.isInterestedInAlternation(isInterestedInAlternation)
			.personalEmailAddress(actualPersonalEmail)
			.personalPhoneNumber(actualPhoneNumber)
			.build();
	}

}
