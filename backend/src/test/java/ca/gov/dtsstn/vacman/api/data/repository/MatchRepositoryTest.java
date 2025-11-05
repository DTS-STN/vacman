package ca.gov.dtsstn.vacman.api.data.repository;

import static ca.gov.dtsstn.vacman.api.data.repository.MatchRepository.hasMatchFeedbackIdIn;
import static ca.gov.dtsstn.vacman.api.data.repository.MatchRepository.hasProfileFirstNameContaining;
import static ca.gov.dtsstn.vacman.api.data.repository.MatchRepository.hasProfileId;
import static ca.gov.dtsstn.vacman.api.data.repository.MatchRepository.hasProfileLastNameContaining;
import static ca.gov.dtsstn.vacman.api.data.repository.MatchRepository.hasProfileMiddleNameContaining;
import static ca.gov.dtsstn.vacman.api.data.repository.MatchRepository.hasProfileWfaStatusIdIn;
import static ca.gov.dtsstn.vacman.api.data.repository.MatchRepository.hasRequestId;
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
import ca.gov.dtsstn.vacman.api.data.entity.MatchEntity;
import ca.gov.dtsstn.vacman.api.data.entity.MatchFeedbackEntity;
import ca.gov.dtsstn.vacman.api.data.entity.MatchStatusEntity;
import ca.gov.dtsstn.vacman.api.data.entity.ProfileEntity;
import ca.gov.dtsstn.vacman.api.data.entity.RequestEntity;
import ca.gov.dtsstn.vacman.api.data.entity.UserEntity;
import ca.gov.dtsstn.vacman.api.data.entity.WfaStatusEntity;

@DataJpaTest
@ActiveProfiles("test")
@Import({ DataSourceConfig.class })
@DisplayName("MatchRepository tests")
@AutoConfigureTestDatabase(replace = Replace.NONE)
class MatchRepositoryTest {

	@Autowired
	LanguageRepository languageRepository;

	@Autowired
	MatchFeedbackRepository matchFeedbackRepository;

	@Autowired
	MatchRepository matchRepository;

	@Autowired
	MatchStatusRepository matchStatusRepository;

	@Autowired
	ProfileRepository profileRepository;

	@Autowired
	ProfileStatusRepository profileStatusRepository;

	@Autowired
	RequestRepository requestRepository;

	@Autowired
	RequestStatusRepository requestStatusRepository;

	@Autowired
	UserRepository userRepository;

	@Autowired
	UserTypeRepository userTypeRepository;

	@Autowired
	WfaStatusRepository wfaStatusRepository;

	@MockitoBean
	SecurityAuditor securityAuditor;

	MatchFeedbackEntity matchFeedbackAccepted;
	MatchFeedbackEntity matchFeedbackRejected;

	MatchStatusEntity matchStatusActive;
	MatchStatusEntity matchStatusInactive;

	ProfileEntity profileJohnDoe;
	ProfileEntity profileJaneSmith;
	ProfileEntity profileBobJohnson;

	RequestEntity request1;
	RequestEntity request2;

	UserEntity hiringManager1;
	UserEntity hiringManager2;
	UserEntity employee1;
	UserEntity employee2;
	UserEntity employee3;

	WfaStatusEntity wfaStatusActive;
	WfaStatusEntity wfaStatusInactive;

	@BeforeEach
	void setUp() {
		when(securityAuditor.getCurrentAuditor())
			.thenReturn(Optional.of("test-user"));

		//
		// Create test users
		//

		hiringManager1 = userRepository.save(UserEntity.builder()
			.language(languageRepository.findByCode("EN").orElseThrow())
			.userType(userTypeRepository.findByCode("HRA").orElseThrow())
			.microsoftEntraId("11111111-1111-1111-1111-111111111111")
			.businessEmailAddress("hiring.manager1@example.com")
			.firstName("Hiring")
			.lastName("Manager 1")
			.build());

		hiringManager2 = userRepository.save(UserEntity.builder()
			.language(languageRepository.findByCode("EN").orElseThrow())
			.userType(userTypeRepository.findByCode("HRA").orElseThrow())
			.microsoftEntraId("22222222-2222-2222-2222-222222222222")
			.businessEmailAddress("hiring.manager2@example.com")
			.firstName("Hiring")
			.lastName("Manager 2")
			.build());

		employee1 = userRepository.save(UserEntity.builder()
			.language(languageRepository.findByCode("EN").orElseThrow())
			.userType(userTypeRepository.findByCode("employee").orElseThrow())
			.microsoftEntraId("33333333-3333-3333-3333-333333333333")
			.businessEmailAddress("john.doe@example.com")
			.firstName("John")
			.middleName("William")
			.lastName("Doe")
			.build());

		employee2 = userRepository.save(UserEntity.builder()
			.language(languageRepository.findByCode("EN").orElseThrow())
			.userType(userTypeRepository.findByCode("employee").orElseThrow())
			.microsoftEntraId("44444444-4444-4444-4444-444444444444")
			.businessEmailAddress("jane.smith@example.com")
			.firstName("Jane")
			.middleName("Marie")
			.lastName("Smith")
			.build());

		employee3 = userRepository.save(UserEntity.builder()
			.language(languageRepository.findByCode("EN").orElseThrow())
			.userType(userTypeRepository.findByCode("employee").orElseThrow())
			.microsoftEntraId("55555555-5555-5555-5555-555555555555")
			.businessEmailAddress("bob.johnson@example.com")
			.firstName("Bob")
			.middleName("Robert")
			.lastName("Johnson")
			.build());

		//
		// Get WFA statuses
		//

		wfaStatusActive = wfaStatusRepository.findByCode("AFFECTED").orElseThrow();
		wfaStatusInactive = wfaStatusRepository.findByCode("SURPLUS_GRJO").orElseThrow();

		//
		// Get profile status
		//

		final var profileStatusApproved = profileStatusRepository.findByCode("APPROVED").orElseThrow();

		//
		// Create profiles
		//

		profileJohnDoe = profileRepository.save(ProfileEntity.builder()
			.user(employee1)
			.profileStatus(profileStatusApproved)
			.wfaStatus(wfaStatusActive)
			.build());

		profileJaneSmith = profileRepository.save(ProfileEntity.builder()
			.user(employee2)
			.profileStatus(profileStatusApproved)
			.wfaStatus(wfaStatusActive)
			.build());

		profileBobJohnson = profileRepository.save(ProfileEntity.builder()
			.user(employee3)
			.profileStatus(profileStatusApproved)
			.wfaStatus(wfaStatusInactive)
			.build());

		//
		// Get match statuses
		//

		matchStatusActive = matchStatusRepository.findByCode("A-A").orElseThrow();
		matchStatusInactive = matchStatusRepository.findByCode("IP-EC").orElseThrow();

		//
		// Get match feedbacks
		//

		matchFeedbackAccepted = matchFeedbackRepository.findByCode("QA-QOA").orElseThrow();
		matchFeedbackRejected = matchFeedbackRepository.findByCode("QNS").orElseThrow();

		//
		// Create requests
		//

		final var requestStatus = requestStatusRepository.findByCode("DRAFT").orElseThrow();

		request1 = requestRepository.save(RequestEntity.builder()
			.hiringManager(hiringManager1)
			.submitter(hiringManager1)
			.requestStatus(requestStatus)
			.build());

		request2 = requestRepository.save(RequestEntity.builder()
			.hiringManager(hiringManager2)
			.submitter(hiringManager2)
			.requestStatus(requestStatus)
			.build());
	}

	@Nested
	@DisplayName("Request ID Specification Tests")
	class RequestIdSpecificationTests {

		@Test
		@DisplayName("hasRequestId should find matches by request ID")
		void testHasRequestId() {
			final var match1 = matchRepository.save(MatchEntity.builder()
				.request(request1)
				.profile(profileJohnDoe)
				.matchStatus(matchStatusActive)
				.build());

			final var match2 = matchRepository.save(MatchEntity.builder()
				.request(request1)
				.profile(profileJaneSmith)
				.matchStatus(matchStatusActive)
				.build());

			@SuppressWarnings("unused")
			final var match3 = matchRepository.save(MatchEntity.builder()
				.request(request2)
				.profile(profileBobJohnson)
				.matchStatus(matchStatusActive)
				.build());

			final var results = matchRepository.findAll(hasRequestId(request1.getId()));

			assertThat(results).hasSize(2);
			assertThat(results).extracting(MatchEntity::getId)
				.containsExactlyInAnyOrder(match1.getId(), match2.getId());
		}

		@Test
		@DisplayName("hasRequestId should return empty list when no matches found")
		void testHasRequestIdNoMatches() {
			@SuppressWarnings("unused")
			final var match = matchRepository.save(MatchEntity.builder()
				.request(request1)
				.profile(profileJohnDoe)
				.matchStatus(matchStatusActive)
				.build());

			final var results = matchRepository.findAll(hasRequestId(999999L));

			assertThat(results).isEmpty();
		}

	}

	@Nested
	@DisplayName("Profile ID Specification Tests")
	class ProfileIdSpecificationTests {

		@Test
		@DisplayName("hasProfileId should find matches by profile ID")
		void testHasProfileId() {
			final var match1 = matchRepository.save(MatchEntity.builder()
				.request(request1)
				.profile(profileJohnDoe)
				.matchStatus(matchStatusActive)
				.build());

			@SuppressWarnings("unused")
			final var match2 = matchRepository.save(MatchEntity.builder()
				.request(request2)
				.profile(profileJaneSmith)
				.matchStatus(matchStatusActive)
				.build());

			final var results = matchRepository.findAll(hasProfileId(profileJohnDoe.getId()));

			assertThat(results).hasSize(1);
			assertThat(results.get(0).getId()).isEqualTo(match1.getId());
		}

		@Test
		@DisplayName("hasProfileId should return empty list when no matches found")
		void testHasProfileIdNoMatches() {
			@SuppressWarnings("unused")
			final var match = matchRepository.save(MatchEntity.builder()
				.request(request1)
				.profile(profileJohnDoe)
				.matchStatus(matchStatusActive)
				.build());

			final var results = matchRepository.findAll(hasProfileId(999999L));

			assertThat(results).isEmpty();
		}

	}

	@Nested
	@DisplayName("Match Feedback ID Specification Tests")
	class MatchFeedbackIdSpecificationTests {

		@Test
		@DisplayName("hasMatchFeedbackIdIn should find matches by match feedback IDs")
		void testHasMatchFeedbackIdIn() {
			final var match1 = matchRepository.save(MatchEntity.builder()
				.request(request1)
				.profile(profileJohnDoe)
				.matchStatus(matchStatusActive)
				.matchFeedback(matchFeedbackAccepted)
				.build());

			final var match2 = matchRepository.save(MatchEntity.builder()
				.request(request2)
				.profile(profileJaneSmith)
				.matchStatus(matchStatusActive)
				.matchFeedback(matchFeedbackAccepted)
				.build());

			@SuppressWarnings("unused")
			final var match3 = matchRepository.save(MatchEntity.builder()
				.request(request1)
				.profile(profileBobJohnson)
				.matchStatus(matchStatusActive)
				.matchFeedback(matchFeedbackRejected)
				.build());

			final var results = matchRepository.findAll(hasMatchFeedbackIdIn(matchFeedbackAccepted.getId()));

			assertThat(results).hasSize(2);
			assertThat(results).extracting(MatchEntity::getId)
				.containsExactlyInAnyOrder(match1.getId(), match2.getId());
		}

		@Test
		@DisplayName("hasMatchFeedbackIdIn should find matches with any matching feedback ID")
		void testHasMatchFeedbackIdInAnyMatch() {
			final var match1 = matchRepository.save(MatchEntity.builder()
				.request(request1)
				.profile(profileJohnDoe)
				.matchStatus(matchStatusActive)
				.matchFeedback(matchFeedbackAccepted)
				.build());

			@SuppressWarnings("unused")
			final var match2 = matchRepository.save(MatchEntity.builder()
				.request(request2)
				.profile(profileJaneSmith)
				.matchStatus(matchStatusActive)
				.matchFeedback(matchFeedbackRejected)
				.build());

			final var results = matchRepository.findAll(hasMatchFeedbackIdIn(matchFeedbackAccepted.getId()));

			assertThat(results).hasSize(1);
			assertThat(results.get(0).getId()).isEqualTo(match1.getId());
		}

		@Test
		@DisplayName("hasMatchFeedbackIdIn should return empty when no matches found")
		void testHasMatchFeedbackIdInNoMatches() {
			@SuppressWarnings("unused")
			final var match = matchRepository.save(MatchEntity.builder()
				.request(request1)
				.profile(profileJohnDoe)
				.matchStatus(matchStatusActive)
				.matchFeedback(matchFeedbackAccepted)
				.build());

			final var results = matchRepository.findAll(hasMatchFeedbackIdIn(999999L));

			assertThat(results).isEmpty();
		}

		@Test
		@DisplayName("hasMatchFeedbackIdIn should match all when collection is empty")
		void testHasMatchFeedbackIdInEmptyCollection() {
			@SuppressWarnings("unused")
			final var match = matchRepository.save(MatchEntity.builder()
				.request(request1)
				.profile(profileJohnDoe)
				.matchStatus(matchStatusActive)
				.matchFeedback(matchFeedbackAccepted)
				.build());

			final var results = matchRepository.findAll(hasMatchFeedbackIdIn(List.of()));

			assertThat(results).isNotNull();
		}

		@Test
		@DisplayName("hasMatchFeedbackIdIn should match all when collection is null")
		void testHasMatchFeedbackIdInNullCollection() {
			@SuppressWarnings("unused")
			final var match = matchRepository.save(MatchEntity.builder()
				.request(request1)
				.profile(profileJohnDoe)
				.matchStatus(matchStatusActive)
				.matchFeedback(matchFeedbackAccepted)
				.build());

			final var results = matchRepository.findAll(hasMatchFeedbackIdIn((List<Long>) null));

			assertThat(results).isNotNull();
		}

	}

	@Nested
	@DisplayName("Profile Name Search Tests")
	class ProfileNameSearchTests {

		@Test
		@DisplayName("hasProfileFirstNameContaining should find matches by profile first name")
		void testHasProfileFirstNameContaining() {
			final var match1 = matchRepository.save(MatchEntity.builder()
				.request(request1)
				.profile(profileJohnDoe)
				.matchStatus(matchStatusActive)
				.build());

			@SuppressWarnings("unused")
			final var match2 = matchRepository.save(MatchEntity.builder()
				.request(request2)
				.profile(profileJaneSmith)
				.matchStatus(matchStatusActive)
				.build());

			@SuppressWarnings("unused")
			final var match3 = matchRepository.save(MatchEntity.builder()
				.request(request1)
				.profile(profileBobJohnson)
				.matchStatus(matchStatusActive)
				.build());

			final var results = matchRepository.findAll(hasProfileFirstNameContaining("John"));

			assertThat(results).hasSize(1);
			assertThat(results.get(0).getId()).isEqualTo(match1.getId());
		}

		@Test
		@DisplayName("hasProfileFirstNameContaining should perform case-insensitive search")
		void testHasProfileFirstNameContainingCaseInsensitive() {
			final var match = matchRepository.save(MatchEntity.builder()
				.request(request1)
				.profile(profileJohnDoe)
				.matchStatus(matchStatusActive)
				.build());

			final var results = matchRepository.findAll(hasProfileFirstNameContaining("JOHN"));

			assertThat(results).hasSize(1);
			assertThat(results.get(0).getId()).isEqualTo(match.getId());
		}

		@Test
		@DisplayName("hasProfileFirstNameContaining should handle null or empty search term")
		void testHasProfileFirstNameContainingNullOrEmpty() {
			@SuppressWarnings("unused")
			final var match = matchRepository.save(MatchEntity.builder()
				.request(request1)
				.profile(profileJohnDoe)
				.matchStatus(matchStatusActive)
				.build());

			final var resultsNull = matchRepository.findAll(hasProfileFirstNameContaining(null));
			final var resultsEmpty = matchRepository.findAll(hasProfileFirstNameContaining(""));

			assertThat(resultsNull).isNotNull();
			assertThat(resultsEmpty).isNotNull();
		}

		@Test
		@DisplayName("hasProfileMiddleNameContaining should find matches by profile middle name")
		void testHasProfileMiddleNameContaining() {
			final var match1 = matchRepository.save(MatchEntity.builder()
				.request(request1)
				.profile(profileJohnDoe)
				.matchStatus(matchStatusActive)
				.build());

			@SuppressWarnings("unused")
			final var match2 = matchRepository.save(MatchEntity.builder()
				.request(request2)
				.profile(profileJaneSmith)
				.matchStatus(matchStatusActive)
				.build());

			final var results = matchRepository.findAll(hasProfileMiddleNameContaining("William"));

			assertThat(results).hasSize(1);
			assertThat(results.get(0).getId()).isEqualTo(match1.getId());
		}

		@Test
		@DisplayName("hasProfileLastNameContaining should find matches by profile last name")
		void testHasProfileLastNameContaining() {
			@SuppressWarnings("unused")
			final var match1 = matchRepository.save(MatchEntity.builder()
				.request(request1)
				.profile(profileJohnDoe)
				.matchStatus(matchStatusActive)
				.build());

			final var match2 = matchRepository.save(MatchEntity.builder()
				.request(request2)
				.profile(profileJaneSmith)
				.matchStatus(matchStatusActive)
				.build());

			@SuppressWarnings("unused")
			final var match3 = matchRepository.save(MatchEntity.builder()
				.request(request1)
				.profile(profileBobJohnson)
				.matchStatus(matchStatusActive)
				.build());

			final var results = matchRepository.findAll(hasProfileLastNameContaining("Smith"));

			assertThat(results).hasSize(1);
			assertThat(results.get(0).getId()).isEqualTo(match2.getId());
		}

	}

	@Nested
	@DisplayName("Profile WFA Status Specification Tests")
	class ProfileWfaStatusSpecificationTests {

		@Test
		@DisplayName("hasProfileWfaStatusIdIn should find matches by profile WFA status IDs")
		void testHasProfileWfaStatusIdIn() {
			final var match1 = matchRepository.save(MatchEntity.builder()
				.request(request1)
				.profile(profileJohnDoe)
				.matchStatus(matchStatusActive)
				.build());

			final var match2 = matchRepository.save(MatchEntity.builder()
				.request(request2)
				.profile(profileJaneSmith)
				.matchStatus(matchStatusActive)
				.build());

			@SuppressWarnings("unused")
			final var match3 = matchRepository.save(MatchEntity.builder()
				.request(request1)
				.profile(profileBobJohnson)
				.matchStatus(matchStatusActive)
				.build());

			final var results = matchRepository.findAll(hasProfileWfaStatusIdIn(wfaStatusActive.getId()));

			assertThat(results).hasSize(2);
			assertThat(results).extracting(MatchEntity::getId)
				.containsExactlyInAnyOrder(match1.getId(), match2.getId());
		}

		@Test
		@DisplayName("hasProfileWfaStatusIdIn should find matches with any matching WFA status")
		void testHasProfileWfaStatusIdInAnyMatch() {
			final var match1 = matchRepository.save(MatchEntity.builder()
				.request(request1)
				.profile(profileJohnDoe)
				.matchStatus(matchStatusActive)
				.build());

			@SuppressWarnings("unused")
			final var match2 = matchRepository.save(MatchEntity.builder()
				.request(request2)
				.profile(profileBobJohnson)
				.matchStatus(matchStatusActive)
				.build());

			final var results = matchRepository.findAll(hasProfileWfaStatusIdIn(wfaStatusActive.getId()));

			assertThat(results).hasSize(1);
			assertThat(results.get(0).getId()).isEqualTo(match1.getId());
		}

		@Test
		@DisplayName("hasProfileWfaStatusIdIn should return empty when no matches found")
		void testHasProfileWfaStatusIdInNoMatches() {
			@SuppressWarnings("unused")
			final var match = matchRepository.save(MatchEntity.builder()
				.request(request1)
				.profile(profileJohnDoe)
				.matchStatus(matchStatusActive)
				.build());

			final var results = matchRepository.findAll(hasProfileWfaStatusIdIn(999999L));

			assertThat(results).isEmpty();
		}

		@Test
		@DisplayName("hasProfileWfaStatusIdIn should match all when collection is empty")
		void testHasProfileWfaStatusIdInEmptyCollection() {
			@SuppressWarnings("unused")
			final var match = matchRepository.save(MatchEntity.builder()
				.request(request1)
				.profile(profileJohnDoe)
				.matchStatus(matchStatusActive)
				.build());

			final var results = matchRepository.findAll(hasProfileWfaStatusIdIn(List.of()));

			assertThat(results).isNotNull();
		}

		@Test
		@DisplayName("hasProfileWfaStatusIdIn should match all when collection is null")
		void testHasProfileWfaStatusIdInNullCollection() {
			@SuppressWarnings("unused")
			final var match = matchRepository.save(MatchEntity.builder()
				.request(request1)
				.profile(profileJohnDoe)
				.matchStatus(matchStatusActive)
				.build());

			final var results = matchRepository.findAll(hasProfileWfaStatusIdIn((List<Long>) null));

			assertThat(results).isNotNull();
		}

	}

}