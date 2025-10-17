package ca.gov.dtsstn.vacman.api.data.repository;

import static ca.gov.dtsstn.vacman.api.data.repository.RequestRepository.hasHrAdvisorId;
import static ca.gov.dtsstn.vacman.api.data.repository.RequestRepository.hasHrAdvisorIdIn;
import static ca.gov.dtsstn.vacman.api.data.repository.RequestRepository.hasRequestStatusId;
import static ca.gov.dtsstn.vacman.api.data.repository.RequestRepository.hasRequestStatusIdIn;
import static ca.gov.dtsstn.vacman.api.data.repository.RequestRepository.hasStatusCode;
import static ca.gov.dtsstn.vacman.api.data.repository.RequestRepository.hasStatusCodeIn;
import static ca.gov.dtsstn.vacman.api.data.repository.RequestRepository.hasWorkUnitCode;
import static ca.gov.dtsstn.vacman.api.data.repository.RequestRepository.hasWorkUnitCodeIn;
import static ca.gov.dtsstn.vacman.api.data.repository.RequestRepository.hasWorkUnitId;
import static ca.gov.dtsstn.vacman.api.data.repository.RequestRepository.hasWorkUnitIdIn;
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
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase.Replace;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.context.annotation.Import;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;

import ca.gov.dtsstn.vacman.api.SecurityAuditor;
import ca.gov.dtsstn.vacman.api.config.DataSourceConfig;
import ca.gov.dtsstn.vacman.api.data.entity.RequestEntity;
import ca.gov.dtsstn.vacman.api.data.entity.RequestStatusEntity;
import ca.gov.dtsstn.vacman.api.data.entity.UserEntity;
import ca.gov.dtsstn.vacman.api.data.entity.WorkUnitEntity;

@DataJpaTest
@ActiveProfiles("test")
@Import({ DataSourceConfig.class })
@DisplayName("RequestRepository tests")
@AutoConfigureTestDatabase(replace = Replace.NONE)
class RequestRepositoryTest {

	@Autowired
	LanguageRepository languageRepository;

	@Autowired
	RequestRepository requestRepository;

	@Autowired
	RequestStatusRepository requestStatusRepository;

	@Autowired
	UserRepository userRepository;

	@Autowired
	UserTypeRepository userTypeRepository;

	@Autowired
	WorkUnitRepository workUnitRepository;

	@MockitoBean
	SecurityAuditor securityAuditor;

	RequestStatusEntity statusDraft;
	RequestStatusEntity statusSubmitted;

	UserEntity hrAdvisor1;
	UserEntity hrAdvisor2;
	UserEntity submitter;

	WorkUnitEntity workUnit1;
	WorkUnitEntity workUnit2;

	@BeforeEach
	void setUp() {
		when(securityAuditor.getCurrentAuditor())
			.thenReturn(Optional.of("test-user"));

		//
		// Create test users (submitter + HRAs)
		//

		submitter = userRepository.save(UserEntity.builder()
			.language(languageRepository.findByCode("EN").orElseThrow())
			.userType(userTypeRepository.findByCode("employee").orElseThrow())
			.microsoftEntraId("01010101-0101-0101-0101-010101010101")
			.businessEmailAddress("submitter@example.com")
			.firstName("Test")
			.lastName("Submitter")
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
		// Get or create request statuses
		//

		statusDraft = requestStatusRepository.findByCode("DRAFT").orElseThrow();
		statusSubmitted = requestStatusRepository.findByCode("SUBMIT").orElseThrow();

		//
		// Get or create work units
		//

		workUnit1 = workUnitRepository.findByCode("100713").orElseThrow();
		workUnit2 = workUnitRepository.findByCode("100732").orElseThrow();
	}

	@Nested
	@DisplayName("HR Advisor Specification Tests")
	class HrAdvisorSpecificationTests {

		@Test
		@DisplayName("hasHrAdvisorId should find requests by HR advisor ID")
		void testHasHrAdvisorId() {
			final var request1 = requestRepository.save(
				RequestEntity.builder()
					.submitter(submitter)
					.requestStatus(statusDraft)
					.hrAdvisor(hrAdvisor1)
					.build());

			final var request2 = requestRepository.save(
				RequestEntity.builder()
					.submitter(submitter)
					.requestStatus(statusDraft)
					.hrAdvisor(hrAdvisor1)
					.build());

			@SuppressWarnings("unused")
			final var request3 = requestRepository.save(
				RequestEntity.builder()
					.submitter(submitter)
					.requestStatus(statusDraft)
					.hrAdvisor(hrAdvisor2)
					.build());

			final var results = requestRepository.findAll(hasHrAdvisorId(hrAdvisor1.getId()));

			assertThat(results).as("Should find 2 requests assigned to HR advisor 1").hasSize(2);
			assertThat(results).extracting(RequestEntity::getId)
				.as("Should contain the IDs of the two requests assigned to HR advisor 1")
				.containsExactlyInAnyOrder(request1.getId(), request2.getId());
		}

		@Test
		@DisplayName("hasHrAdvisorId should return empty list when no requests match")
		void testHasHrAdvisorIdNoMatches() {
			requestRepository.save(
				RequestEntity.builder()
					.submitter(submitter)
					.requestStatus(statusDraft)
					.hrAdvisor(hrAdvisor1)
					.build());

			final var results = requestRepository.findAll(hasHrAdvisorId(999999L));

			assertThat(results).as("Should return empty list when no requests match the HR advisor ID").isEmpty();
		}

		@Test
		@DisplayName("hasHrAdvisorIdIn should find requests by multiple HR advisor IDs")
		void testHasHrAdvisorIdIn() {
			final var request1 = requestRepository.save(
				RequestEntity.builder()
					.submitter(submitter)
					.requestStatus(statusDraft)
					.hrAdvisor(hrAdvisor1)
					.build());

			final var request2 = requestRepository.save(
				RequestEntity.builder()
					.submitter(submitter)
					.requestStatus(statusDraft)
					.hrAdvisor(hrAdvisor1)
					.build());

			final var request3 = requestRepository.save(
				RequestEntity.builder()
					.submitter(submitter)
					.requestStatus(statusDraft)
					.hrAdvisor(hrAdvisor2)
					.build());

			@SuppressWarnings("unused")
			final var request4 = requestRepository.save(
				RequestEntity.builder()
					.submitter(submitter)
					.requestStatus(statusDraft)
					.build()); // no hrAdvisor

			final var results = requestRepository.findAll(hasHrAdvisorIdIn(hrAdvisor1.getId(), hrAdvisor2.getId()));

			assertThat(results).as("Should find 3 requests assigned to either HR advisor 1 or 2").hasSize(3);
			assertThat(results).extracting(RequestEntity::getId)
				.as("Should contain the IDs of the three requests assigned to HR advisors 1 or 2")
				.containsExactlyInAnyOrder(request1.getId(), request2.getId(), request3.getId());
		}

		@Test
		@DisplayName("hasHrAdvisorIdIn should match all when collection is empty")
		void testHasHrAdvisorIdInEmptyCollection() {
			requestRepository.save(
				RequestEntity.builder()
					.submitter(submitter)
					.requestStatus(statusDraft)
					.hrAdvisor(hrAdvisor1)
					.build());

			final var results = requestRepository.findAll(hasHrAdvisorIdIn(List.of()));

			assertThat(results).as("Should match all requests when HR advisor ID collection is empty").hasSize(1);
		}

		@Test
		@DisplayName("hasHrAdvisorIdIn should match all when collection is null")
		void testHasHrAdvisorIdInNullCollection() {
			requestRepository.save(
				RequestEntity.builder()
					.submitter(submitter)
					.requestStatus(statusDraft)
					.hrAdvisor(hrAdvisor1)
					.build());

			final var results = requestRepository.findAll(hasHrAdvisorIdIn((Collection<Long>) null));

			assertThat(results).as("Should match all requests when HR advisor ID collection is null").hasSize(1);
		}

	}

	@Nested
	@DisplayName("Status Specification Tests")
	class StatusSpecificationTests {

		@Test
		@DisplayName("hasStatusCode should find requests by status code")
		void testHasStatusCode() {
			final var request1 = requestRepository.save(
				RequestEntity.builder()
					.submitter(submitter)
					.requestStatus(statusDraft)
					.build());

			final var request2 = requestRepository.save(
				RequestEntity.builder()
					.submitter(submitter)
					.requestStatus(statusDraft)
					.build());

			@SuppressWarnings("unused")
			final var request3 = requestRepository.save(
				RequestEntity.builder()
					.submitter(submitter)
					.requestStatus(statusSubmitted)
					.build());

			final var results = requestRepository.findAll(hasStatusCode(statusDraft.getCode()));

			assertThat(results).as("Should find 2 requests with DRAFT status").hasSize(2);
			assertThat(results).extracting(RequestEntity::getId)
				.as("Should contain the IDs of the two DRAFT requests")
				.containsExactlyInAnyOrder(request1.getId(), request2.getId());
		}

		@Test
		@DisplayName("hasStatusCode should return empty list when no requests match")
		void testHasStatusCodeNoMatches() {
			@SuppressWarnings("unused")
			final var request = requestRepository.save(
				RequestEntity.builder()
					.submitter(submitter)
					.requestStatus(statusDraft)
					.build());

			final var results = requestRepository.findAll(hasStatusCode("NONEXISTENT"));

			assertThat(results).as("Should return empty list when no requests match the status code").isEmpty();
		}

		@Test
		@DisplayName("hasStatusCodeIn should find requests by multiple status codes")
		void testHasStatusCodeIn() {
			final var request1 = requestRepository.save(
				RequestEntity.builder()
					.submitter(submitter)
					.requestStatus(statusDraft)
					.build());

			final var request2 = requestRepository.save(
				RequestEntity.builder()
					.submitter(submitter)
					.requestStatus(statusDraft)
					.build());

			final var request3 = requestRepository.save(
				RequestEntity.builder()
					.submitter(submitter)
					.requestStatus(statusSubmitted)
					.build());

			final var results = requestRepository.findAll(hasStatusCodeIn(statusDraft.getCode(), statusSubmitted.getCode()));

			assertThat(results).as("Should find 3 requests with either DRAFT or SUBMIT status").hasSize(3);
			assertThat(results).extracting(RequestEntity::getId)
				.as("Should contain the IDs of the three requests with DRAFT or SUBMIT status")
				.containsExactlyInAnyOrder(request1.getId(), request2.getId(), request3.getId());
		}

		@Test
		@DisplayName("hasStatusCodeIn should match all when collection is empty")
		void testHasStatusCodeInEmptyCollection() {
			requestRepository.save(
				RequestEntity.builder()
					.submitter(submitter)
					.requestStatus(statusDraft)
					.build());

			final var results = requestRepository.findAll(hasStatusCodeIn(List.of()));

			assertThat(results).as("Should match all requests when status code collection is empty").hasSize(1);
		}

		@Test
		@DisplayName("hasStatusCodeIn should match all when collection is null")
		void testHasStatusCodeInNullCollection() {
			requestRepository.save(
				RequestEntity.builder()
					.submitter(submitter)
					.requestStatus(statusDraft)
					.build());

			final var results = requestRepository.findAll(hasStatusCodeIn((Collection<String>) null));

			assertThat(results).as("Should match all requests when status code collection is null").hasSize(1);
		}

		@Test
		@DisplayName("hasRequestStatusId should find requests by status ID")
		void testHasRequestStatusId() {
			final var request1 = requestRepository.save(
				RequestEntity.builder()
					.submitter(submitter)
					.requestStatus(statusDraft)
					.build());

			final var request2 = requestRepository.save(
				RequestEntity.builder()
					.submitter(submitter)
					.requestStatus(statusDraft)
					.build());

			@SuppressWarnings("unused")
			final var request3 = requestRepository.save(
				RequestEntity.builder()
					.submitter(submitter)
					.requestStatus(statusSubmitted)
					.build());

			final var results = requestRepository.findAll(hasRequestStatusId(statusDraft.getId()));

			assertThat(results).as("Should find 2 requests with DRAFT status ID").hasSize(2);
			assertThat(results).extracting(RequestEntity::getId)
				.as("Should contain the IDs of the two DRAFT requests")
				.containsExactlyInAnyOrder(request1.getId(), request2.getId());
		}

		@Test
		@DisplayName("hasRequestStatusId should return empty list when no requests match")
		void testHasRequestStatusIdNoMatches() {
			@SuppressWarnings("unused")
			final var request = requestRepository.save(
				RequestEntity.builder()
					.submitter(submitter)
					.requestStatus(statusDraft)
					.build());

			final var results = requestRepository.findAll(hasRequestStatusId(999999L));

			assertThat(results).as("Should return empty list when no requests match the status ID").isEmpty();
		}

		@Test
		@DisplayName("hasRequestStatusIdIn should find requests by multiple status IDs")
		void testHasRequestStatusIdIn() {
			final var request1 = requestRepository.save(
				RequestEntity.builder()
					.submitter(submitter)
					.requestStatus(statusDraft)
					.build());

			final var request2 = requestRepository.save(
				RequestEntity.builder()
					.submitter(submitter)
					.requestStatus(statusDraft)
					.build());

			final var request3 = requestRepository.save(
				RequestEntity.builder()
					.submitter(submitter)
					.requestStatus(statusSubmitted)
					.build());

			final var results = requestRepository.findAll(hasRequestStatusIdIn(statusDraft.getId(), statusSubmitted.getId()));

			assertThat(results).as("Should find 3 requests with either DRAFT or SUBMIT status ID").hasSize(3);
			assertThat(results).extracting(RequestEntity::getId)
				.as("Should contain the IDs of the three requests with DRAFT or SUBMIT status ID")
				.containsExactlyInAnyOrder(request1.getId(), request2.getId(), request3.getId());
		}

		@Test
		@DisplayName("hasRequestStatusIdIn should match all when collection is empty")
		void testHasRequestStatusIdInEmptyCollection() {
			requestRepository.save(
				RequestEntity.builder()
					.submitter(submitter)
					.requestStatus(statusDraft)
					.build());

			final var results = requestRepository.findAll(hasRequestStatusIdIn(List.of()));

			assertThat(results).as("Should match all requests when status ID collection is empty").hasSize(1);
		}

		@Test
		@DisplayName("hasRequestStatusIdIn should match all when collection is null")
		void testHasRequestStatusIdInNullCollection() {
			requestRepository.save(
				RequestEntity.builder()
					.submitter(submitter)
					.requestStatus(statusDraft)
					.build());

			final var results = requestRepository.findAll(hasRequestStatusIdIn((Collection<Long>) null));

			assertThat(results).as("Should match all requests when status ID collection is null").hasSize(1);
		}

	}

	@Nested
	@DisplayName("Work Unit Specification Tests")
	class WorkUnitSpecificationTests {

		@Test
		@DisplayName("hasWorkUnitCode should find requests by work unit code")
		void testHasWorkUnitCode() {
			final var request1 = requestRepository.save(
				RequestEntity.builder()
					.submitter(submitter)
					.requestStatus(statusDraft)
					.workUnit(workUnit1)
					.build());

			final var request2 = requestRepository.save(
				RequestEntity.builder()
					.submitter(submitter)
					.requestStatus(statusDraft)
					.workUnit(workUnit1)
					.build());

			@SuppressWarnings("unused")
			final var request3 = requestRepository.save(
				RequestEntity.builder()
					.submitter(submitter)
					.requestStatus(statusDraft)
					.workUnit(workUnit2)
					.build());

			final var results = requestRepository.findAll(hasWorkUnitCode(workUnit1.getCode()));

			assertThat(results).as("Should find 2 requests with work unit 100713").hasSize(2);
			assertThat(results).extracting(RequestEntity::getId)
				.as("Should contain the IDs of the two requests with work unit 100713")
				.containsExactlyInAnyOrder(request1.getId(), request2.getId());
		}

		@Test
		@DisplayName("hasWorkUnitCode should return empty list when no requests match")
		void testHasWorkUnitCodeNoMatches() {
			@SuppressWarnings("unused")
			final var request = requestRepository.save(
				RequestEntity.builder()
					.submitter(submitter)
					.requestStatus(statusDraft)
					.workUnit(workUnit1)
					.build());

			final var results = requestRepository.findAll(hasWorkUnitCode("NONEXISTENT"));

			assertThat(results).as("Should return empty list when no requests match the work unit code").isEmpty();
		}

		@Test
		@DisplayName("hasWorkUnitCodeIn should find requests by multiple work unit codes")
		void testHasWorkUnitCodeIn() {
			final var request1 = requestRepository.save(
				RequestEntity.builder()
					.submitter(submitter)
					.requestStatus(statusDraft)
					.workUnit(workUnit1)
					.build());

			final var request2 = requestRepository.save(
				RequestEntity.builder()
					.submitter(submitter)
					.requestStatus(statusDraft)
					.workUnit(workUnit1)
					.build());

			final var request3 = requestRepository.save(
				RequestEntity.builder()
					.submitter(submitter)
					.requestStatus(statusDraft)
					.workUnit(workUnit2)
					.build());

			@SuppressWarnings("unused")
			final var request4 = requestRepository.save(
				RequestEntity.builder()
					.submitter(submitter)
					.requestStatus(statusDraft)
					.build()); // no workUnit

			final var results = requestRepository.findAll(hasWorkUnitCodeIn(workUnit1.getCode(), workUnit2.getCode()));

			assertThat(results).as("Should find 3 requests with either work unit 100713 or 100732").hasSize(3);
			assertThat(results).extracting(RequestEntity::getId)
				.as("Should contain the IDs of the three requests with work units 100713 or 100732")
				.containsExactlyInAnyOrder(request1.getId(), request2.getId(), request3.getId());
		}

		@Test
		@DisplayName("hasWorkUnitCodeIn should match all when collection is empty")
		void testHasWorkUnitCodeInEmptyCollection() {
			requestRepository.save(
				RequestEntity.builder()
					.submitter(submitter)
					.requestStatus(statusDraft)
					.workUnit(workUnit1)
					.build());

			final var results = requestRepository.findAll(hasWorkUnitCodeIn(List.of()));

			assertThat(results).as("Should match all requests when work unit code collection is empty").hasSize(1);
		}

		@Test
		@DisplayName("hasWorkUnitCodeIn should match all when collection is null")
		void testHasWorkUnitCodeInNullCollection() {
			requestRepository.save(
				RequestEntity.builder()
					.submitter(submitter)
					.requestStatus(statusDraft)
					.workUnit(workUnit1)
					.build());

			final var results = requestRepository.findAll(hasWorkUnitCodeIn((Collection<String>) null));

			assertThat(results).as("Should match all requests when work unit code collection is null").hasSize(1);
		}

		@Test
		@DisplayName("hasWorkUnitId should find requests by work unit ID")
		void testHasWorkUnitId() {
			final var request1 = requestRepository.save(
				RequestEntity.builder()
					.submitter(submitter)
					.requestStatus(statusDraft)
					.workUnit(workUnit1)
					.build());

			final var request2 = requestRepository.save(
				RequestEntity.builder()
					.submitter(submitter)
					.requestStatus(statusDraft)
					.workUnit(workUnit1)
					.build());

			@SuppressWarnings("unused")
			final var request3 = requestRepository.save(
				RequestEntity.builder()
					.submitter(submitter)
					.requestStatus(statusDraft)
					.workUnit(workUnit2)
					.build());

			final var results = requestRepository.findAll(hasWorkUnitId(workUnit1.getId()));

			assertThat(results).as("Should find 2 requests with work unit 100713 ID").hasSize(2);
			assertThat(results).extracting(RequestEntity::getId)
				.as("Should contain the IDs of the two requests with work unit 100713 ID")
				.containsExactlyInAnyOrder(request1.getId(), request2.getId());
		}

		@Test
		@DisplayName("hasWorkUnitId should return empty list when no requests match")
		void testHasWorkUnitIdNoMatches() {
			@SuppressWarnings("unused")
			final var request = requestRepository.save(
				RequestEntity.builder()
					.submitter(submitter)
					.requestStatus(statusDraft)
					.workUnit(workUnit1)
					.build());

			final var results = requestRepository.findAll(hasWorkUnitId(999999L));

			assertThat(results).as("Should return empty list when no requests match the work unit ID").isEmpty();
		}

		@Test
		@DisplayName("hasWorkUnitIdIn should find requests by multiple work unit IDs")
		void testHasWorkUnitIdIn() {
			final var request1 = requestRepository.save(
				RequestEntity.builder()
					.submitter(submitter)
					.requestStatus(statusDraft)
					.workUnit(workUnit1)
					.build());

			final var request2 = requestRepository.save(
				RequestEntity.builder()
					.submitter(submitter)
					.requestStatus(statusDraft)
					.workUnit(workUnit1)
					.build());

			final var request3 = requestRepository.save(
				RequestEntity.builder()
					.submitter(submitter)
					.requestStatus(statusDraft)
					.workUnit(workUnit2)
					.build());

			@SuppressWarnings("unused")
			final var request4 = requestRepository.save(
				RequestEntity.builder()
					.submitter(submitter)
					.requestStatus(statusDraft)
					.build()); // no workUnit

			final var results = requestRepository.findAll(hasWorkUnitIdIn(workUnit1.getId(), workUnit2.getId()));

			assertThat(results).as("Should find 3 requests with either work unit 100713 or 100732 ID").hasSize(3);
			assertThat(results).extracting(RequestEntity::getId)
				.as("Should contain the IDs of the three requests with work units 100713 or 100732 ID")
				.containsExactlyInAnyOrder(request1.getId(), request2.getId(), request3.getId());
		}

		@Test
		@DisplayName("hasWorkUnitIdIn should match all when collection is empty")
		void testHasWorkUnitIdInEmptyCollection() {
			requestRepository.save(
				RequestEntity.builder()
					.submitter(submitter)
					.requestStatus(statusDraft)
					.workUnit(workUnit1)
					.build());

			final var results = requestRepository.findAll(hasWorkUnitIdIn(List.of()));

			assertThat(results).as("Should match all requests when work unit ID collection is empty").hasSize(1);
		}

		@Test
		@DisplayName("hasWorkUnitIdIn should match all when collection is null")
		void testHasWorkUnitIdInNullCollection() {
			requestRepository.save(
				RequestEntity.builder()
					.submitter(submitter)
					.requestStatus(statusDraft)
					.workUnit(workUnit1)
					.build());

			final var results = requestRepository.findAll(hasWorkUnitIdIn((Collection<Long>) null));

			assertThat(results).as("Should match all requests when work unit ID collection is null").hasSize(1);
		}

	}

}
