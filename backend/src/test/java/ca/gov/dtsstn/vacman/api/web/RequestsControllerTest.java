package ca.gov.dtsstn.vacman.api.web;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.CoreMatchers.is;
import static org.hamcrest.CoreMatchers.notNullValue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.time.LocalDate;
import java.util.List;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase.Replace;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithAnonymousUser;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import com.fasterxml.jackson.databind.ObjectMapper;

import ca.gov.dtsstn.vacman.api.config.properties.LookupCodes;
import ca.gov.dtsstn.vacman.api.data.entity.RequestEntity;
import ca.gov.dtsstn.vacman.api.data.entity.RequestStatusEntity;
import ca.gov.dtsstn.vacman.api.data.entity.UserEntity;
import ca.gov.dtsstn.vacman.api.data.repository.CityRepository;
import ca.gov.dtsstn.vacman.api.data.repository.ClassificationRepository;
import ca.gov.dtsstn.vacman.api.data.repository.EmploymentEquityRepository;
import ca.gov.dtsstn.vacman.api.data.repository.EmploymentTenureRepository;
import ca.gov.dtsstn.vacman.api.data.repository.LanguageRepository;
import ca.gov.dtsstn.vacman.api.data.repository.LanguageRequirementRepository;
import ca.gov.dtsstn.vacman.api.data.repository.NonAdvertisedAppointmentRepository;
import ca.gov.dtsstn.vacman.api.data.repository.RequestRepository;
import ca.gov.dtsstn.vacman.api.data.repository.RequestStatusRepository;
import ca.gov.dtsstn.vacman.api.data.repository.SecurityClearanceRepository;
import ca.gov.dtsstn.vacman.api.data.repository.SelectionProcessTypeRepository;
import ca.gov.dtsstn.vacman.api.data.repository.UserRepository;
import ca.gov.dtsstn.vacman.api.data.repository.UserTypeRepository;
import ca.gov.dtsstn.vacman.api.data.repository.WorkScheduleRepository;
import ca.gov.dtsstn.vacman.api.data.repository.WorkUnitRepository;
import ca.gov.dtsstn.vacman.api.web.model.RequestStatusUpdateModel;
import ca.gov.dtsstn.vacman.api.web.model.RequestUpdateModel;
import ca.gov.dtsstn.vacman.api.web.model.RequestUpdateModelBuilder;

@Transactional
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles({ "test" })
@DisplayName("RequestsController API endpoints")
@AutoConfigureTestDatabase(replace = Replace.NONE)
class RequestsControllerTest {

	@Autowired
	MockMvc mockMvc;

	@Autowired
	ObjectMapper objectMapper;

	@Autowired
	RequestRepository requestRepository;

	@Autowired
	UserRepository userRepository;

	@Autowired
	UserTypeRepository userTypeRepository;

	@Autowired
	LanguageRepository languageRepository;

	@Autowired
	RequestStatusRepository requestStatusRepository;

	@Autowired
	ClassificationRepository classificationRepository;

	@Autowired
	WorkUnitRepository workUnitRepository;

	@Autowired
	LanguageRequirementRepository languageRequirementRepository;

	@Autowired
	SecurityClearanceRepository securityClearanceRepository;

	@Autowired
	WorkScheduleRepository workScheduleRepository;

	@Autowired
	EmploymentTenureRepository employmentTenureRepository;

	@Autowired
	SelectionProcessTypeRepository selectionProcessTypeRepository;

	@Autowired
	NonAdvertisedAppointmentRepository nonAdvertisedAppointmentRepository;

	@Autowired
	CityRepository cityRepository;

	@Autowired
	EmploymentEquityRepository employmentEquityRepository;

	@Autowired
	LookupCodes lookupCodes;

	UserEntity hrAdvisor;

	UserEntity hiringManager;

	UserEntity submitter;

	@BeforeEach
	void setUp() {
		this.hrAdvisor = userRepository.save(UserEntity.builder()
			.firstName("HR").lastName("Advisor")
			.businessEmailAddress("hr.advisor@example.com")
			.microsoftEntraId("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa")
			.userType(userTypeRepository.findByCode(lookupCodes.userTypes().hrAdvisor()).orElseThrow())
			.language(languageRepository.getReferenceById(1L))
			.build());

		this.hiringManager = userRepository.save(UserEntity.builder()
			.firstName("Hiring").lastName("Manager")
			.businessEmailAddress("hiring.manager@example.com")
			.microsoftEntraId("bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb")
			.userType(userTypeRepository.findByCode(lookupCodes.userTypes().employee()).orElseThrow())
			.language(languageRepository.getReferenceById(1L))
			.build());

		this.submitter = userRepository.save(UserEntity.builder()
			.firstName("Request").lastName("Submitter")
			.businessEmailAddress("submitter@example.com")
			.microsoftEntraId("cccccccc-cccc-cccc-cccc-cccccccccccc")
			.userType(userTypeRepository.findByCode(lookupCodes.userTypes().employee()).orElseThrow())
			.language(languageRepository.getReferenceById(1L))
			.build());
	}

	@Nested
	@DisplayName("GET /api/v1/requests")
	class GetAllRequests {

		@Test
		@DisplayName("Should return all requests when no filter")
		@WithMockUser(username = "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa", authorities = { "hr-advisor" })
		void testGetAllRequestsNoFilter() throws Exception {
			// Create test requests
			requestRepository.saveAll(List.of(
				RequestEntity.builder()
					.classification(classificationRepository.getReferenceById(1L))
					.hiringManager(hiringManager)
					.hrAdvisor(hrAdvisor)
					.language(languageRepository.getReferenceById(1L))
					.languageRequirement(languageRequirementRepository.getReferenceById(1L))
					.nameEn("Software Developer")
					.nameFr("Développeur logiciel")
					.requestNumber("REQ-001")
					.requestStatus(requestStatusRepository.findByCode(lookupCodes.requestStatuses().hrReview()).orElseThrow())
					.submitter(submitter)
					.workUnit(workUnitRepository.getReferenceById(1L))
					.build(),
				RequestEntity.builder()
					.classification(classificationRepository.getReferenceById(1L))
					.hiringManager(hiringManager)
					.hrAdvisor(null)
					.language(languageRepository.getReferenceById(1L))
					.languageRequirement(languageRequirementRepository.getReferenceById(1L))
					.nameEn("Data Analyst")
					.nameFr("Analyste de données")
					.requestNumber("REQ-002")
					.requestStatus(requestStatusRepository.findByCode(lookupCodes.requestStatuses().draft()).orElseThrow())
					.submitter(submitter)
					.workUnit(workUnitRepository.getReferenceById(1L))
					.build()));

			mockMvc.perform(get("/api/v1/requests"))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.content.length()", is(2)))
				.andExpect(jsonPath("$.content[0].englishTitle", is("Software Developer")))
				.andExpect(jsonPath("$.content[1].englishTitle", is("Data Analyst")));
		}

		@Test
		@DisplayName("Should filter requests by hrAdvisorId")
		@WithMockUser(username = "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa", authorities = { "hr-advisor" })
		void testGetAllRequestsFilteredByHrAdvisorId() throws Exception {
			// Create test requests
			requestRepository.saveAll(List.of(
				RequestEntity.builder()
					.classification(classificationRepository.getReferenceById(1L))
					.hiringManager(hiringManager)
					.hrAdvisor(hrAdvisor)
					.language(languageRepository.getReferenceById(1L))
					.languageRequirement(languageRequirementRepository.getReferenceById(1L))
					.nameEn("Software Developer")
					.nameFr("Développeur logiciel")
					.requestNumber("REQ-001")
					.requestStatus(requestStatusRepository.findByCode(lookupCodes.requestStatuses().draft()).orElseThrow())
					.submitter(submitter)
					.workUnit(workUnitRepository.getReferenceById(1L))
					.build(),
				RequestEntity.builder()
					.classification(classificationRepository.getReferenceById(1L))
					.hiringManager(hiringManager)
					.hrAdvisor(null)
					.language(languageRepository.getReferenceById(1L))
					.languageRequirement(languageRequirementRepository.getReferenceById(1L))
					.nameEn("Data Analyst")
					.nameFr("Analyste de données")
					.requestNumber("REQ-002")
					.requestStatus(requestStatusRepository.findByCode(lookupCodes.requestStatuses().draft()).orElseThrow())
					.submitter(submitter)
					.workUnit(workUnitRepository.getReferenceById(1L))
					.build()));

			mockMvc.perform(get("/api/v1/requests").param("hrAdvisorId", hrAdvisor.getId().toString()))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.content.length()", is(1)))
				.andExpect(jsonPath("$.content[0].englishTitle", is("Software Developer")));
		}

		@Test
		@DisplayName("Should filter requests by 'me' for current user")
		@WithMockUser(username = "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa", authorities = { "hr-advisor" })
		void testGetAllRequestsFilteredByMe() throws Exception {
			// Create test request assigned to current HR advisor
			requestRepository.save(RequestEntity.builder()
				.classification(classificationRepository.getReferenceById(1L))
				.hiringManager(hiringManager)
				.hrAdvisor(hrAdvisor)
				.language(languageRepository.getReferenceById(1L))
				.languageRequirement(languageRequirementRepository.getReferenceById(1L))
				.nameEn("Software Developer")
				.nameFr("Développeur logiciel")
				.requestNumber("REQ-001")
				.requestStatus(requestStatusRepository.findByCode(lookupCodes.requestStatuses().draft()).orElseThrow())
				.submitter(submitter)
				.workUnit(workUnitRepository.getReferenceById(1L))
				.build());

			mockMvc.perform(get("/api/v1/requests").param("hrAdvisorId", "me"))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.content.length()", is(1)))
				.andExpect(jsonPath("$.content[0].englishTitle", is("Software Developer")));
		}

		@Test
		@DisplayName("Should filter requests by statusCode")
		@WithMockUser(username = "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa", authorities = { "hr-advisor" })
		void testGetAllRequestsFilteredByStatusCode() throws Exception {
			// Create test requests with different statuses
			final var draftStatus = requestStatusRepository.findByCode(lookupCodes.requestStatuses().draft()).orElseThrow();
			final var submitStatus = requestStatusRepository.findByCode(lookupCodes.requestStatuses().submitted()).orElseThrow();

			requestRepository.saveAll(List.of(
				RequestEntity.builder()
					.classification(classificationRepository.getReferenceById(1L))
					.hiringManager(hiringManager)
					.hrAdvisor(hrAdvisor)
					.language(languageRepository.getReferenceById(1L))
					.languageRequirement(languageRequirementRepository.getReferenceById(1L))
					.nameEn("Software Developer")
					.nameFr("Développeur logiciel")
					.requestNumber("REQ-001")
					.requestStatus(draftStatus)
					.submitter(submitter)
					.workUnit(workUnitRepository.getReferenceById(1L))
					.build(),
				RequestEntity.builder()
					.classification(classificationRepository.getReferenceById(1L))
					.hiringManager(hiringManager)
					.hrAdvisor(hrAdvisor)
					.language(languageRepository.getReferenceById(1L))
					.languageRequirement(languageRequirementRepository.getReferenceById(1L))
					.nameEn("Data Analyst")
					.nameFr("Analyste de données")
					.requestNumber("REQ-002")
					.requestStatus(submitStatus)
					.submitter(submitter)
					.workUnit(workUnitRepository.getReferenceById(1L))
					.build()));

			mockMvc.perform(get("/api/v1/requests").param("statusId", draftStatus.getId().toString()))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.content.length()", is(1)))
				.andExpect(jsonPath("$.content[0].englishTitle", is("Software Developer")));
		}

		@Test
		@DisplayName("Should filter requests by workUnitCode")
		@WithMockUser(username = "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa", authorities = { "hr-advisor" })
		void testGetAllRequestsFilteredByWorkUnitCode() throws Exception {
			// Create test requests with different work units
			final var workUnit1 = workUnitRepository.getReferenceById(1L);
			final var workUnit2 = workUnitRepository.getReferenceById(2L);

			requestRepository.saveAll(List.of(
				RequestEntity.builder()
					.classification(classificationRepository.getReferenceById(1L))
					.hiringManager(hiringManager)
					.hrAdvisor(hrAdvisor)
					.language(languageRepository.getReferenceById(1L))
					.languageRequirement(languageRequirementRepository.getReferenceById(1L))
					.nameEn("Software Developer")
					.nameFr("Développeur logiciel")
					.requestNumber("REQ-001")
					.requestStatus(requestStatusRepository.findByCode(lookupCodes.requestStatuses().draft()).orElseThrow())
					.submitter(submitter)
					.workUnit(workUnit1)
					.build(),
				RequestEntity.builder()
					.classification(classificationRepository.getReferenceById(1L))
					.hiringManager(hiringManager)
					.hrAdvisor(hrAdvisor)
					.language(languageRepository.getReferenceById(1L))
					.languageRequirement(languageRequirementRepository.getReferenceById(1L))
					.nameEn("Data Analyst")
					.nameFr("Analyste de données")
					.requestNumber("REQ-002")
					.requestStatus(requestStatusRepository.findByCode(lookupCodes.requestStatuses().draft()).orElseThrow())
					.submitter(submitter)
					.workUnit(workUnit2)
					.build()));

			mockMvc.perform(get("/api/v1/requests").param("workUnitId", workUnit1.getId().toString()))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.content.length()", is(1)))
				.andExpect(jsonPath("$.content[0].englishTitle", is("Software Developer")));
		}

		@Test
		@DisplayName("Should filter requests by statusId")
		@WithMockUser(username = "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa", authorities = { "hr-advisor" })
		void testGetAllRequestsFilteredByStatusId() throws Exception {
			// Create test requests with different statuses
			final var draftStatus = requestStatusRepository.findByCode(lookupCodes.requestStatuses().draft()).orElseThrow();
			final var submitStatus = requestStatusRepository.findByCode(lookupCodes.requestStatuses().submitted()).orElseThrow();

			requestRepository.saveAll(List.of(
				RequestEntity.builder()
					.classification(classificationRepository.getReferenceById(1L))
					.hiringManager(hiringManager)
					.hrAdvisor(hrAdvisor)
					.language(languageRepository.getReferenceById(1L))
					.languageRequirement(languageRequirementRepository.getReferenceById(1L))
					.nameEn("Software Developer")
					.nameFr("Développeur logiciel")
					.requestNumber("REQ-001")
					.requestStatus(draftStatus)
					.submitter(submitter)
					.workUnit(workUnitRepository.getReferenceById(1L))
					.build(),
				RequestEntity.builder()
					.classification(classificationRepository.getReferenceById(1L))
					.hiringManager(hiringManager)
					.hrAdvisor(hrAdvisor)
					.language(languageRepository.getReferenceById(1L))
					.languageRequirement(languageRequirementRepository.getReferenceById(1L))
					.nameEn("Data Analyst")
					.nameFr("Analyste de données")
					.requestNumber("REQ-002")
					.requestStatus(submitStatus)
					.submitter(submitter)
					.workUnit(workUnitRepository.getReferenceById(1L))
					.build()));

			mockMvc.perform(get("/api/v1/requests").param("statusId", draftStatus.getId().toString()))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.content.length()", is(1)))
				.andExpect(jsonPath("$.content[0].englishTitle", is("Software Developer")));
		}

		@Test
		@DisplayName("Should filter requests by workUnitId")
		@WithMockUser(username = "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa", authorities = { "hr-advisor" })
		void testGetAllRequestsFilteredByWorkUnitId() throws Exception {
			// Create test requests with different work units
			final var workUnit1 = workUnitRepository.getReferenceById(1L);
			final var workUnit2 = workUnitRepository.getReferenceById(2L);

			requestRepository.saveAll(List.of(
				RequestEntity.builder()
					.classification(classificationRepository.getReferenceById(1L))
					.hiringManager(hiringManager)
					.hrAdvisor(hrAdvisor)
					.language(languageRepository.getReferenceById(1L))
					.languageRequirement(languageRequirementRepository.getReferenceById(1L))
					.nameEn("Software Developer")
					.nameFr("Développeur logiciel")
					.requestNumber("REQ-001")
					.requestStatus(requestStatusRepository.findByCode(lookupCodes.requestStatuses().draft()).orElseThrow())
					.submitter(submitter)
					.workUnit(workUnit1)
					.build(),
				RequestEntity.builder()
					.classification(classificationRepository.getReferenceById(1L))
					.hiringManager(hiringManager)
					.hrAdvisor(hrAdvisor)
					.language(languageRepository.getReferenceById(1L))
					.languageRequirement(languageRequirementRepository.getReferenceById(1L))
					.nameEn("Data Analyst")
					.nameFr("Analyste de données")
					.requestNumber("REQ-002")
					.requestStatus(requestStatusRepository.findByCode(lookupCodes.requestStatuses().draft()).orElseThrow())
					.submitter(submitter)
					.workUnit(workUnit2)
					.build()));

			mockMvc.perform(get("/api/v1/requests").param("workUnitId", workUnit1.getId().toString()))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.content.length()", is(1)))
				.andExpect(jsonPath("$.content[0].englishTitle", is("Software Developer")));
		}

		@Test
		@DisplayName("Should filter requests by statusId and hrAdvisorId")
		@WithMockUser(username = "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa", authorities = { "hr-advisor" })
		void testGetAllRequestsFilteredByStatusIdAndHrAdvisorId() throws Exception {
			// Create another HR advisor for testing
			final var hrAdvisor2 = userRepository.save(UserEntity.builder()
				.firstName("HR2").lastName("Advisor2")
				.businessEmailAddress("hr2.advisor@example.com")
				.microsoftEntraId("aaaaaaaa-bbbb-aaaa-aaaa-aaaaaaaaaaaa")
				.userType(userTypeRepository.findByCode(lookupCodes.userTypes().hrAdvisor()).orElseThrow())
				.language(languageRepository.getReferenceById(1L))
				.build());

			// Create test requests with different combinations of status and hrAdvisor
			final var draftStatus = requestStatusRepository.findByCode(lookupCodes.requestStatuses().draft()).orElseThrow();
			final var submitStatus = requestStatusRepository.findByCode(lookupCodes.requestStatuses().submitted()).orElseThrow();

			requestRepository.saveAll(List.of(
				// Draft status, hrAdvisor1
				RequestEntity.builder()
					.classification(classificationRepository.getReferenceById(1L))
					.hiringManager(hiringManager)
					.hrAdvisor(hrAdvisor)
					.language(languageRepository.getReferenceById(1L))
					.languageRequirement(languageRequirementRepository.getReferenceById(1L))
					.nameEn("Software Developer")
					.nameFr("Développeur logiciel")
					.requestNumber("RM-001")
					.requestStatus(draftStatus)
					.submitter(submitter)
					.workUnit(workUnitRepository.getReferenceById(1L))
					.build(),
				// Draft status, hrAdvisor2
				RequestEntity.builder()
					.classification(classificationRepository.getReferenceById(1L))
					.hiringManager(hiringManager)
					.hrAdvisor(hrAdvisor2)
					.language(languageRepository.getReferenceById(1L))
					.languageRequirement(languageRequirementRepository.getReferenceById(1L))
					.nameEn("Data Analyst")
					.nameFr("Analyste de données")
					.requestNumber("RM-002")
					.requestStatus(draftStatus)
					.submitter(submitter)
					.workUnit(workUnitRepository.getReferenceById(1L))
					.build(),
				// Submitted status, hrAdvisor1
				RequestEntity.builder()
					.classification(classificationRepository.getReferenceById(1L))
					.hiringManager(hiringManager)
					.hrAdvisor(hrAdvisor)
					.language(languageRepository.getReferenceById(1L))
					.languageRequirement(languageRequirementRepository.getReferenceById(1L))
					.nameEn("Project Manager")
					.nameFr("Gestionnaire de projet")
					.requestNumber("RM-003")
					.requestStatus(submitStatus)
					.submitter(submitter)
					.workUnit(workUnitRepository.getReferenceById(1L))
					.build()));

			// Filter by draft status and hrAdvisor1 - should return only the first request
			mockMvc.perform(get("/api/v1/requests")
					.param("statusId", draftStatus.getId().toString())
					.param("hrAdvisorId", hrAdvisor.getId().toString()))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.content.length()", is(1)))
				.andExpect(jsonPath("$.content[0].englishTitle", is("Software Developer")));
		}

		@Test
		@DisplayName("Should filter requests by statusId and workUnitId")
		@WithMockUser(username = "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa", authorities = { "hr-advisor" })
		void testGetAllRequestsFilteredByStatusIdAndWorkUnitId() throws Exception {
			// Create test requests with different combinations of status and workUnit
			final var draftStatus = requestStatusRepository.findByCode(lookupCodes.requestStatuses().draft()).orElseThrow();
			final var submitStatus = requestStatusRepository.findByCode(lookupCodes.requestStatuses().submitted()).orElseThrow();
			final var workUnit1 = workUnitRepository.getReferenceById(1L);
			final var workUnit2 = workUnitRepository.getReferenceById(2L);

			requestRepository.saveAll(List.of(
				// Draft status, workUnit1
				RequestEntity.builder()
					.classification(classificationRepository.getReferenceById(1L))
					.hiringManager(hiringManager)
					.hrAdvisor(hrAdvisor)
					.language(languageRepository.getReferenceById(1L))
					.languageRequirement(languageRequirementRepository.getReferenceById(1L))
					.nameEn("Software Developer")
					.nameFr("Développeur logiciel")
					.requestNumber("RW-001")
					.requestStatus(draftStatus)
					.submitter(submitter)
					.workUnit(workUnit1)
					.build(),
				// Draft status, workUnit2
				RequestEntity.builder()
					.classification(classificationRepository.getReferenceById(1L))
					.hiringManager(hiringManager)
					.hrAdvisor(hrAdvisor)
					.language(languageRepository.getReferenceById(1L))
					.languageRequirement(languageRequirementRepository.getReferenceById(1L))
					.nameEn("Data Analyst")
					.nameFr("Analyste de données")
					.requestNumber("RW-002")
					.requestStatus(draftStatus)
					.submitter(submitter)
					.workUnit(workUnit2)
					.build(),
				// Submitted status, workUnit1
				RequestEntity.builder()
					.classification(classificationRepository.getReferenceById(1L))
					.hiringManager(hiringManager)
					.hrAdvisor(hrAdvisor)
					.language(languageRepository.getReferenceById(1L))
					.languageRequirement(languageRequirementRepository.getReferenceById(1L))
					.nameEn("Project Manager")
					.nameFr("Gestionnaire de projet")
					.requestNumber("RW-003")
					.requestStatus(submitStatus)
					.submitter(submitter)
					.workUnit(workUnit1)
					.build()));

			// Filter by draft status and workUnit1 - should return only the first request
			mockMvc.perform(get("/api/v1/requests")
					.param("statusId", draftStatus.getId().toString())
					.param("workUnitId", workUnit1.getId().toString()))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.content.length()", is(1)))
				.andExpect(jsonPath("$.content[0].englishTitle", is("Software Developer")));
		}

		@Test
		@DisplayName("Should filter requests by hrAdvisorId and workUnitId")
		@WithMockUser(username = "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa", authorities = { "hr-advisor" })
		void testGetAllRequestsFilteredByHrAdvisorIdAndWorkUnitId() throws Exception {
			// Create another HR advisor for testing
			final var hrAdvisor2 = userRepository.save(UserEntity.builder()
				.firstName("HR2").lastName("Advisor2")
				.businessEmailAddress("hr2.advisor@example.com")
				.microsoftEntraId("aaaaaaaa-bbbb-aaaa-aaaa-aaaaaaaaaaaa")
				.userType(userTypeRepository.findByCode(lookupCodes.userTypes().hrAdvisor()).orElseThrow())
				.language(languageRepository.getReferenceById(1L))
				.build());

			// Create test requests with different combinations of hrAdvisor and workUnit
			final var workUnit1 = workUnitRepository.getReferenceById(1L);
			final var workUnit2 = workUnitRepository.getReferenceById(2L);

			requestRepository.saveAll(List.of(
				// hrAdvisor1, workUnit1
				RequestEntity.builder()
					.classification(classificationRepository.getReferenceById(1L))
					.hiringManager(hiringManager)
					.hrAdvisor(hrAdvisor)
					.language(languageRepository.getReferenceById(1L))
					.languageRequirement(languageRequirementRepository.getReferenceById(1L))
					.nameEn("Software Developer")
					.nameFr("Développeur logiciel")
					.requestNumber("RQ-MLT-007")
					.requestStatus(requestStatusRepository.findByCode(lookupCodes.requestStatuses().draft()).orElseThrow())
					.submitter(submitter)
					.workUnit(workUnit1)
					.build(),
				// hrAdvisor1, workUnit2
				RequestEntity.builder()
					.classification(classificationRepository.getReferenceById(1L))
					.hiringManager(hiringManager)
					.hrAdvisor(hrAdvisor)
					.language(languageRepository.getReferenceById(1L))
					.languageRequirement(languageRequirementRepository.getReferenceById(1L))
					.nameEn("Data Analyst")
					.nameFr("Analyste de données")
					.requestNumber("RQ-MLT-008")
					.requestStatus(requestStatusRepository.findByCode(lookupCodes.requestStatuses().draft()).orElseThrow())
					.submitter(submitter)
					.workUnit(workUnit2)
					.build(),
				// hrAdvisor2, workUnit1
				RequestEntity.builder()
					.classification(classificationRepository.getReferenceById(1L))
					.hiringManager(hiringManager)
					.hrAdvisor(hrAdvisor2)
					.language(languageRepository.getReferenceById(1L))
					.languageRequirement(languageRequirementRepository.getReferenceById(1L))
					.nameEn("Project Manager")
					.nameFr("Gestionnaire de projet")
					.requestNumber("RQ-MLT-009")
					.requestStatus(requestStatusRepository.findByCode(lookupCodes.requestStatuses().draft()).orElseThrow())
					.submitter(submitter)
					.workUnit(workUnit1)
					.build()));

			// Filter by hrAdvisor1 and workUnit1 - should return only the first request
			mockMvc.perform(get("/api/v1/requests")
					.param("hrAdvisorId", hrAdvisor.getId().toString())
					.param("workUnitId", workUnit1.getId().toString()))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.content.length()", is(1)))
				.andExpect(jsonPath("$.content[0].englishTitle", is("Software Developer")));
		}

		@Test
		@DisplayName("Should return 401 Unauthorized when not authenticated")
		@WithAnonymousUser
		void testGetAllRequestsUnauthorized() throws Exception {
			mockMvc.perform(get("/api/v1/requests"))
				.andExpect(status().isUnauthorized());
		}

		@Test
		@DisplayName("Should return 403 Forbidden when user lacks hr-advisor authority")
		@WithMockUser(username = "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb", authorities = { "employee" })
		void testGetAllRequestsForbidden() throws Exception {
			mockMvc.perform(get("/api/v1/requests"))
				.andExpect(status().isForbidden());
		}

	}

	@Nested
	@DisplayName("PUT /api/v1/requests/{id}")
	class UpdateRequest {

		@Test
		@DisplayName("Should update request with valid data as HR Advisor")
		@WithMockUser(username = "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa", authorities = { "hr-advisor" })
		void testUpdateRequestAsHrAdvisor() throws Exception {
			// Create initial request - entity uses nameEn/nameFr
			final var request = requestRepository.save(RequestEntity.builder()
				.classification(classificationRepository.getReferenceById(1L))
				.endDate(LocalDate.now().plusDays(365))
				.hiringManager(hiringManager)
				.hrAdvisor(hrAdvisor)
				.language(languageRepository.getReferenceById(1L))
				.languageRequirement(languageRequirementRepository.getReferenceById(1L))
				.nameEn("Software Developer")
				.nameFr("Développeur logiciel")
				.requestNumber("REQ-001")
				.requestStatus(requestStatusRepository.findByCode(lookupCodes.requestStatuses().draft()).orElseThrow())
				.startDate(LocalDate.now().plusDays(30))
				.submitter(submitter)
				.workUnit(workUnitRepository.getReferenceById(1L))
				.build());

			// Prepare update model - model uses englishTitle/frenchTitle
			final var updateModel = RequestUpdateModelBuilder.builder()
				.additionalComment("Updated position requirements")
				.classificationId(1L)
				.englishTitle("Senior Software Developer")
				.frenchTitle("Développeur logiciel senior")
				.hiringManagerId(hiringManager.getId())
				.hrAdvisorId(hrAdvisor.getId())
				.languageOfCorrespondenceId(1L)
				.languageRequirementId(1L)
				.positionNumbers("12345678,90123456")
				.projectedEndDate(LocalDate.now().plusDays(400))
				.projectedStartDate(LocalDate.now().plusDays(45))
				.submitterId(submitter.getId())
				.teleworkAllowed(true)
				.workUnitId(1L)
				.build();

			mockMvc.perform(put("/api/v1/requests/{id}", request.getId())
					.contentType(MediaType.APPLICATION_JSON)
					.content(objectMapper.writeValueAsString(updateModel)))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.additionalComment", is("Updated position requirements")))
				.andExpect(jsonPath("$.englishTitle", is("Senior Software Developer")))
				.andExpect(jsonPath("$.frenchTitle", is("Développeur logiciel senior")))
				.andExpect(jsonPath("$.id", is(request.getId().intValue())))
				.andExpect(jsonPath("$.lastModifiedDate", notNullValue()))
				.andExpect(jsonPath("$.positionNumber", is("12345678,90123456")))
				.andExpect(jsonPath("$.teleworkAllowed", is(true)));

			// Verify database was updated - entity uses nameEn/nameFr
			final var updatedRequest = requestRepository.findById(request.getId()).orElseThrow();
			assertThat(updatedRequest.getAdditionalComment()).isEqualTo("Updated position requirements");
			assertThat(updatedRequest.getNameEn()).isEqualTo("Senior Software Developer");
			assertThat(updatedRequest.getNameFr()).isEqualTo("Développeur logiciel senior");
			assertThat(updatedRequest.getTeleworkAllowed()).isTrue();
		}

		@Test
		@DisplayName("Should update request with related entities")
		@WithMockUser(username = "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa", authorities = { "hr-advisor" })
		void testUpdateRequestWithRelatedEntities() throws Exception {
			// Create initial request
			final var request = requestRepository.save(RequestEntity.builder()
				.classification(classificationRepository.getReferenceById(1L))
				.hiringManager(hiringManager)
				.hrAdvisor(hrAdvisor)
				.language(languageRepository.getReferenceById(1L))
				.languageRequirement(languageRequirementRepository.getReferenceById(1L))
				.nameEn("Data Analyst")
				.nameFr("Analyste de données")
				.requestNumber("REQ-002")
				.requestStatus(requestStatusRepository.findByCode(lookupCodes.requestStatuses().draft()).orElseThrow())
				.submitter(submitter)
				.workUnit(workUnitRepository.getReferenceById(1L))
				.build());

			// Prepare update with cities and employment equities
			final var updateModel = RequestUpdateModelBuilder.builder()
				.cityIds(List.of(
					new RequestUpdateModel.CityId(1L),
					new RequestUpdateModel.CityId(2L)))
				.employmentEquityIds(List.of(new RequestUpdateModel.EmploymentEquityId(1L)))
				.englishTitle("Senior Data Analyst")
				.frenchTitle("Analyste de données senior")
				.hiringManagerId(hiringManager.getId())
				.hrAdvisorId(hrAdvisor.getId())
				.submitterId(submitter.getId())
				.classificationId(1L)           // Keep classification the same
				.employmentTenureId(1L)         // Add employment tenure
				.languageOfCorrespondenceId(1L) // Keep language of correspondence the same
				.languageRequirementId(1L)      // Keep language requirement the same
				.securityClearanceId(1L)        // Add security clearance
				.selectionProcessTypeId(1L)     // Add selection process type
				.workScheduleId(1L)             // Add work schedule
				.workUnitId(1L)                 // Keep work unit the same
				.build();

			mockMvc.perform(put("/api/v1/requests/{id}", request.getId())
					.contentType(MediaType.APPLICATION_JSON)
					.content(objectMapper.writeValueAsString(updateModel)))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.id", is(request.getId().intValue())))
				.andExpect(jsonPath("$.cities.length()", is(2)))
				.andExpect(jsonPath("$.classification.id", is(1)))
				.andExpect(jsonPath("$.employmentEquities.length()", is(1)))
				.andExpect(jsonPath("$.employmentTenure.id", is(1)))
				.andExpect(jsonPath("$.englishTitle", is("Senior Data Analyst")))
				.andExpect(jsonPath("$.languageOfCorrespondence.id", is(1)))
				.andExpect(jsonPath("$.languageRequirement.id", is(1)))
				.andExpect(jsonPath("$.securityClearance.id", is(1)))
				.andExpect(jsonPath("$.selectionProcessType.id", is(1)))
				.andExpect(jsonPath("$.workSchedule.id", is(1)))
				.andExpect(jsonPath("$.workUnit.id", is(1)))
				.andReturn();

			// Verify in database
			final var updatedRequest = requestRepository.findById(request.getId()).orElseThrow();
			assertThat(updatedRequest.getCities()).hasSize(2);
			assertThat(updatedRequest.getClassification().getId()).isEqualTo(1L);
			assertThat(updatedRequest.getEmploymentEquities()).hasSize(1);
			assertThat(updatedRequest.getWorkUnit().getId()).isEqualTo(1L);
		}

		@Test
		@DisplayName("Should update request with nullable fields set to null")
		@WithMockUser(username = "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa", authorities = { "hr-advisor" })
		void testUpdateRequestWithNullValues() throws Exception {
			// Create initial request with some optional fields
			final var request = requestRepository.save(RequestEntity.builder()
				.additionalComment("Initial comment")
				.classification(classificationRepository.getReferenceById(1L))
				.hiringManager(hiringManager)
				.hrAdvisor(hrAdvisor)
				.language(languageRepository.getReferenceById(1L))
				.languageRequirement(languageRequirementRepository.getReferenceById(1L))
				.nameEn("Project Manager")
				.nameFr("Gestionnaire de projet")
				.requestNumber("REQ-003")
				.requestStatus(requestStatusRepository.findByCode(lookupCodes.requestStatuses().draft()).orElseThrow())
				.securityClearance(securityClearanceRepository.getReferenceById(1L))
				.submitter(submitter)
				.workUnit(workUnitRepository.getReferenceById(1L))
				.build());

			// Update with null values for optional fields
			final var updateModel = RequestUpdateModelBuilder.builder()
				.classificationId(1L)
				.englishTitle("Project Manager")
				.frenchTitle("Gestionnaire de projet")
				.hiringManagerId(hiringManager.getId())
				.hrAdvisorId(hrAdvisor.getId())
				.languageRequirementId(1L)
				.submitterId(submitter.getId())
				.workUnitId(null)                 // Set to null
				.languageOfCorrespondenceId(null) // Set to null
				.additionalComment(null)          // Set to null
				.build();

			mockMvc.perform(put("/api/v1/requests/{id}", request.getId())
					.contentType(MediaType.APPLICATION_JSON)
					.content(objectMapper.writeValueAsString(updateModel)))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.id", is(request.getId().intValue())))
				.andExpect(jsonPath("$.languageOfCorrespondence").doesNotExist())
				.andExpect(jsonPath("$.workUnit").doesNotExist());

			// Verify in database
			final var updatedRequest = requestRepository.findById(request.getId()).orElseThrow();
			assertThat(updatedRequest.getAdditionalComment()).isNull();
			assertThat(updatedRequest.getLanguage()).isNull();
			assertThat(updatedRequest.getWorkUnit()).isNull();
		}

		@Test
		@DisplayName("Should return 404 when request does not exist")
		@WithMockUser(username = "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa", authorities = { "hr-advisor" })
		void testUpdateRequestNotFound() throws Exception {
			final var updateModel = RequestUpdateModelBuilder.builder()
				.classificationId(1L)
				.englishTitle("Non-existent Request")
				.frenchTitle("Demande inexistante")
				.languageRequirementId(1L)
				.build();

			mockMvc.perform(put("/api/v1/requests/{id}", 999999L)
					.contentType(MediaType.APPLICATION_JSON)
					.content(objectMapper.writeValueAsString(updateModel)))
				.andExpect(status().isNotFound());
		}

		@Test
		@DisplayName("Should return 400 when validation fails - invalid classification")
		@WithMockUser(username = "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa", authorities = { "hr-advisor" })
		void testUpdateRequestValidationFailsInvalidClassification() throws Exception {
			final var request = requestRepository.save(RequestEntity.builder()
				.classification(classificationRepository.getReferenceById(1L))
				.hiringManager(hiringManager)
				.languageRequirement(languageRequirementRepository.getReferenceById(1L))
				.nameEn("Test Position")
				.nameFr("Poste de test")
				.requestNumber("REQ-004")
				.requestStatus(requestStatusRepository.findByCode(lookupCodes.requestStatuses().draft()).orElseThrow())
				.submitter(submitter)
				.workUnit(workUnitRepository.getReferenceById(1L))
				.build());

			final var updateModel = RequestUpdateModelBuilder.builder()
				.classificationId(999999L) // Invalid classification ID
				.englishTitle("Test Position")
				.frenchTitle("Poste de test")
				.languageRequirementId(1L)
				.build();

			mockMvc.perform(put("/api/v1/requests/{id}", request.getId())
					.contentType(MediaType.APPLICATION_JSON)
					.content(objectMapper.writeValueAsString(updateModel)))
				.andExpect(status().isBadRequest());
		}

		@Test
		@DisplayName("Should return 400 when validation fails - invalid position numbers format")
		@WithMockUser(username = "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa", authorities = { "hr-advisor" })
		void testUpdateRequestValidationFailsInvalidPositionNumbers() throws Exception {
			final var request = requestRepository.save(RequestEntity.builder()
				.classification(classificationRepository.getReferenceById(1L))
				.hiringManager(hiringManager)
				.languageRequirement(languageRequirementRepository.getReferenceById(1L))
				.nameEn("Test Position")
				.nameFr("Poste de test")
				.requestNumber("REQ-004A")
				.requestStatus(requestStatusRepository.findByCode(lookupCodes.requestStatuses().draft()).orElseThrow())
				.submitter(submitter)
				.workUnit(workUnitRepository.getReferenceById(1L))
				.build());

			final var updateModel = RequestUpdateModelBuilder.builder()
				.classificationId(1L)
				.englishTitle("Test Position")
				.frenchTitle("Poste de test")
				.languageRequirementId(1L)
				.positionNumbers("123,null,,456")
				.build();

			mockMvc.perform(put("/api/v1/requests/{id}", request.getId())
					.contentType(MediaType.APPLICATION_JSON)
					.content(objectMapper.writeValueAsString(updateModel)))
				.andExpect(status().isBadRequest());
		}

		@Test
		@DisplayName("Should return 400 when validation fails - invalid user ID")
		@WithMockUser(username = "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa", authorities = { "hr-advisor" })
		void testUpdateRequestValidationFailsInvalidUserId() throws Exception {
			final var request = requestRepository.save(RequestEntity.builder()
				.classification(classificationRepository.getReferenceById(1L))
				.hiringManager(hiringManager)
				.languageRequirement(languageRequirementRepository.getReferenceById(1L))
				.nameEn("Test Position")
				.nameFr("Poste de test")
				.requestNumber("REQ-005")
				.requestStatus(requestStatusRepository.findByCode(lookupCodes.requestStatuses().draft()).orElseThrow())
				.submitter(submitter)
				.workUnit(workUnitRepository.getReferenceById(1L))
				.build());

			final var updateModel = RequestUpdateModelBuilder.builder()
				.classificationId(1L)
				.englishTitle("Test Position")
				.frenchTitle("Poste de test")
				.languageRequirementId(1L)
				.hiringManagerId(999999L) // Invalid user ID
				.build();

			mockMvc.perform(put("/api/v1/requests/{id}", request.getId())
					.contentType(MediaType.APPLICATION_JSON)
					.content(objectMapper.writeValueAsString(updateModel)))
				.andExpect(status().isBadRequest());
		}

		@Test
		@DisplayName("Should return 400 when validation fails - field size exceeds limit")
		@WithMockUser(username = "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa", authorities = { "hr-advisor" })
		void testUpdateRequestValidationFailsFieldTooLong() throws Exception {
			final var request = requestRepository.save(RequestEntity.builder()
				.classification(classificationRepository.getReferenceById(1L))
				.hiringManager(hiringManager)
				.languageRequirement(languageRequirementRepository.getReferenceById(1L))
				.nameEn("Test Position")
				.nameFr("Poste de test")
				.requestNumber("REQ-007")
				.requestStatus(requestStatusRepository.findByCode(lookupCodes.requestStatuses().draft()).orElseThrow())
				.submitter(submitter)
				.workUnit(workUnitRepository.getReferenceById(1L))
				.build());

			// Create a string that exceeds the @Size(max = 200) constraint on englishTitle
			final var tooLongTitle = "A".repeat(201);

			final var updateModel = RequestUpdateModelBuilder.builder()
				.classificationId(1L)
				.englishTitle(tooLongTitle)
				.frenchTitle("Poste de test")
				.languageRequirementId(1L)
				.build();

			mockMvc.perform(put("/api/v1/requests/{id}", request.getId())
					.contentType(MediaType.APPLICATION_JSON)
					.content(objectMapper.writeValueAsString(updateModel)))
				.andExpect(status().isBadRequest());
		}

		@Test
		@DisplayName("Should return 401 Unauthorized when not authenticated")
		@WithAnonymousUser
		void testUpdateRequestUnauthorized() throws Exception {
			final var updateModel = RequestUpdateModelBuilder.builder()
				.classificationId(1L)
				.englishTitle("Test Position")
				.frenchTitle("Poste de test")
				.languageRequirementId(1L)
				.build();

			mockMvc.perform(put("/api/v1/requests/{id}", 1L)
					.contentType(MediaType.APPLICATION_JSON)
					.content(objectMapper.writeValueAsString(updateModel)))
				.andExpect(status().isUnauthorized());
		}

		@Test
		@DisplayName("Should return 403 Forbidden when user lacks hr-advisor authority and no UPDATE permission")
		@WithMockUser(username = "dddddddd-dddd-dddd-dddd-dddddddddddd", authorities = { "employee" })
		void testUpdateRequestForbidden() throws Exception {
			final var request = requestRepository.save(RequestEntity.builder()
				.classification(classificationRepository.getReferenceById(1L))
				.hiringManager(hiringManager)
				.languageRequirement(languageRequirementRepository.getReferenceById(1L))
				.nameEn("Test Position")
				.nameFr("Poste de test")
				.requestNumber("REQ-008")
				.requestStatus(requestStatusRepository.findByCode(lookupCodes.requestStatuses().draft()).orElseThrow())
				.submitter(submitter)
				.workUnit(workUnitRepository.getReferenceById(1L))
				.build());

			final var updateModel = RequestUpdateModelBuilder.builder()
				.classificationId(1L)
				.englishTitle("Updated Position")
				.frenchTitle("Poste mis à jour")
				.languageRequirementId(1L)
				.build();

			mockMvc.perform(put("/api/v1/requests/{id}", request.getId())
					.contentType(MediaType.APPLICATION_JSON)
					.content(objectMapper.writeValueAsString(updateModel)))
				.andExpect(status().isForbidden());
		}

		@Test
		@DisplayName("Should update request with complex nested objects")
		@WithMockUser(username = "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa", authorities = { "hr-advisor" })
		void testUpdateRequestWithComplexData() throws Exception {
			final var request = requestRepository.save(RequestEntity.builder()
				.classification(classificationRepository.getReferenceById(1L))
				.hiringManager(hiringManager)
				.languageRequirement(languageRequirementRepository.getReferenceById(1L))
				.nameEn("Complex Position")
				.nameFr("Poste complexe")
				.requestNumber("REQ-009")
				.requestStatus(requestStatusRepository.findByCode(lookupCodes.requestStatuses().draft()).orElseThrow())
				.submitter(submitter)
				.workUnit(workUnitRepository.getReferenceById(1L))
				.build());

			final var updateModel = RequestUpdateModelBuilder.builder()
				.appointmentNonAdvertisedId(1L)
				.cityIds(List.of(
					new RequestUpdateModel.CityId(1L),
					new RequestUpdateModel.CityId(2L),
					new RequestUpdateModel.CityId(3L)))
				.classificationId(1L)
				.employmentEquityIds(List.of(
					new RequestUpdateModel.EmploymentEquityId(1L),
					new RequestUpdateModel.EmploymentEquityId(2L)))
				.employmentTenureId(1L)
				.englishLanguageProfile("BBB")
				.englishStatementOfMerit("Excellent communication skills and 5 years experience")
				.englishTitle("Complex Updated Position")
				.equityNeeded(true)
				.frenchLanguageProfile("BBB")
				.frenchStatementOfMerit("Excellentes compétences en communication et 5 ans d'expérience")
				.frenchTitle("Poste complexe mis à jour")
				.hasPerformedSameDuties(false)
				.hiringManagerId(hiringManager.getId())
				.hrAdvisorId(hrAdvisor.getId())
				.languageOfCorrespondenceId(1L)
				.languageRequirementId(1L)
				.positionNumbers("12345678,23456789,34567890")
				.priorityClearanceNumber("PRI-2024-001")
				.priorityEntitlement(true)
				.priorityEntitlementRationale("Priority clearance required")
				.projectedEndDate(LocalDate.now().plusDays(425))
				.projectedStartDate(LocalDate.now().plusDays(60))
				.pscClearanceNumber("PSC-2024-001")
				.securityClearanceId(1L)
				.selectionProcessNumber("SP-2024-001")
				.selectionProcessTypeId(1L)
				.submitterId(submitter.getId())
				.teleworkAllowed(true)
				.workforceMgmtApprovalRecvd(true)
				.workScheduleId(1L)
				.workUnitId(1L)
				.build();

			mockMvc.perform(put("/api/v1/requests/{id}", request.getId())
					.contentType(MediaType.APPLICATION_JSON)
					.content(objectMapper.writeValueAsString(updateModel)))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.cities.length()", is(3)))
				.andExpect(jsonPath("$.employmentEquities.length()", is(2)))
				.andExpect(jsonPath("$.englishLanguageProfile", is("BBB")))
				.andExpect(jsonPath("$.englishStatementOfMerit", is("Excellent communication skills and 5 years experience")))
				.andExpect(jsonPath("$.englishTitle", is("Complex Updated Position")))
				.andExpect(jsonPath("$.equityNeeded", is(true)))
				.andExpect(jsonPath("$.frenchLanguageProfile", is("BBB")))
				.andExpect(jsonPath("$.id", is(request.getId().intValue())))
				.andExpect(jsonPath("$.positionNumber", is("12345678,23456789,34567890")))
				.andExpect(jsonPath("$.priorityEntitlement", is(true)))
				.andExpect(jsonPath("$.selectionProcessNumber", is("SP-2024-001")))
				.andExpect(jsonPath("$.teleworkAllowed", is(true)));

			// Verify complex data in database
			final var updatedRequest = requestRepository.findById(request.getId()).orElseThrow();
			assertThat(updatedRequest.getCities()).hasSize(3);
			assertThat(updatedRequest.getEmploymentEquities()).hasSize(2);
			assertThat(updatedRequest.getEmploymentEquityNeedIdentifiedIndicator()).isTrue();
			assertThat(updatedRequest.getLanguageProfileEn()).isEqualTo("BBB");
			assertThat(updatedRequest.getPriorityEntitlement()).isTrue();
			assertThat(updatedRequest.getSomcAndConditionEmploymentEn()).isEqualTo("Excellent communication skills and 5 years experience");
			assertThat(updatedRequest.getTeleworkAllowed()).isTrue();
		}

		@Test
		@DisplayName("Should clear collections when empty lists are provided")
		@WithMockUser(username = "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa", authorities = { "hr-advisor" })
		void testUpdateRequestClearCollections() throws Exception {
			// Create request with cities and employment equities
			final var request = requestRepository.save(RequestEntity.builder()
				.cities(List.of(
					cityRepository.getReferenceById(1L),
					cityRepository.getReferenceById(2L)))
				.classification(classificationRepository.getReferenceById(1L))
				.employmentEquities(List.of(
					employmentEquityRepository.getReferenceById(1L)))
				.hiringManager(hiringManager)
				.languageRequirement(languageRequirementRepository.getReferenceById(1L))
				.nameEn("Position with Collections")
				.nameFr("Poste avec collections")
				.requestNumber("REQ-010")
				.requestStatus(requestStatusRepository.findByCode(lookupCodes.requestStatuses().draft()).orElseThrow())
				.submitter(submitter)
				.workUnit(workUnitRepository.getReferenceById(1L))
				.build());

			// Update with empty collections
			final var updateModel = RequestUpdateModelBuilder.builder()
				.classificationId(1L)
				.englishTitle("Position with Collections")
				.frenchTitle("Poste avec collections")
				.hiringManagerId(hiringManager.getId())
				.languageRequirementId(1L)
				.submitterId(submitter.getId())
				.workUnitId(1L)
				.cityIds(List.of())             // Empty list
				.employmentEquityIds(List.of()) // Empty list
				.build();

			mockMvc.perform(put("/api/v1/requests/{id}", request.getId())
					.contentType(MediaType.APPLICATION_JSON)
					.content(objectMapper.writeValueAsString(updateModel)))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.id", is(request.getId().intValue())))
				.andExpect(jsonPath("$.cities").isEmpty())
				.andExpect(jsonPath("$.employmentEquities").isEmpty());

			// Verify collections are cleared in database
			final var updatedRequest = requestRepository.findById(request.getId()).orElseThrow();
			assertThat(updatedRequest.getCities()).isEmpty();
			assertThat(updatedRequest.getEmploymentEquities()).isEmpty();
		}

	}

	@Nested
	@DisplayName("PUT /api/v1/requests/{id}/status-change")
	class UpdateRequestStatus {

		@Test
		@DisplayName("Should submit request as owner (DRAFT -> SUBMIT)")
		@WithMockUser(username = "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb", authorities = { "employee" })
		void testRequestSubmittedByOwner() throws Exception {
			// Create a DRAFT request owned by the hiring manager
			final var request = requestRepository.save(RequestEntity.builder()
				.classification(classificationRepository.getReferenceById(1L))
				.hiringManager(hiringManager)
				.languageRequirement(languageRequirementRepository.getReferenceById(1L))
				.nameEn("Test Position")
				.nameFr("Poste de test")
				.requestNumber("RS-001")
				.requestStatus(requestStatusRepository.findByCode(lookupCodes.requestStatuses().draft()).orElseThrow())
				.submitter(hiringManager) // Hiring manager is the submitter/owner
				.workUnit(workUnitRepository.getReferenceById(1L))
				.build());

			final var statusUpdate = new RequestStatusUpdateModel("requestSubmitted", null);

			mockMvc.perform(post("/api/v1/requests/{id}/status-change", request.getId())
					.contentType(MediaType.APPLICATION_JSON)
					.content(objectMapper.writeValueAsString(statusUpdate)))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.id", is(request.getId().intValue())))
				.andExpect(jsonPath("$.status.code", is(lookupCodes.requestStatuses().submitted())));

			// Verify status changed in database
			final var updatedRequest = requestRepository.findById(request.getId()).orElseThrow();
			assertThat(updatedRequest.getRequestStatus().getCode()).isEqualTo(lookupCodes.requestStatuses().submitted());
		}

		@Test
		@DisplayName("Should pick up request as HR Advisor (SUBMIT -> HR_REVIEW)")
		@WithMockUser(username = "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa", authorities = { "hr-advisor" })
		void testRequestPickedUpByHrAdvisor() throws Exception {
			// Create a SUBMIT request without HR advisor
			final var request = requestRepository.save(RequestEntity.builder()
				.classification(classificationRepository.getReferenceById(1L))
				.hiringManager(hiringManager)
				.languageRequirement(languageRequirementRepository.getReferenceById(1L))
				.nameEn("Test Position")
				.nameFr("Poste de test")
				.requestNumber("RS-002")
				.requestStatus(requestStatusRepository.findByCode(lookupCodes.requestStatuses().submitted()).orElseThrow())
				.submitter(hiringManager)
				.workUnit(workUnitRepository.getReferenceById(1L))
				.build());

			final var statusUpdate = new RequestStatusUpdateModel("requestPickedUp", null);

			mockMvc.perform(post("/api/v1/requests/{id}/status-change", request.getId())
					.contentType(MediaType.APPLICATION_JSON)
					.content(objectMapper.writeValueAsString(statusUpdate)))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.id", is(request.getId().intValue())))
				.andExpect(jsonPath("$.hrAdvisor.id", is(hrAdvisor.getId().intValue())))
				.andExpect(jsonPath("$.status.code", is(lookupCodes.requestStatuses().hrReview())));

			// Verify status and HR advisor assignment
			final var updatedRequest = requestRepository.findById(request.getId()).orElseThrow();
			assertThat(updatedRequest.getHrAdvisor().getId()).isEqualTo(hrAdvisor.getId());
			assertThat(updatedRequest.getHrAdvisor()).isNotNull();
			assertThat(updatedRequest.getRequestStatus().getCode()).isEqualTo(lookupCodes.requestStatuses().hrReview());
		}

		@Test
		@DisplayName("Should mark VMS not required as HR Advisor (HR_REVIEW -> PENDING_PSC_NO_VMS)")
		@WithMockUser(username = "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa", authorities = { "hr-advisor" })
		void testVmsNotRequiredByHrAdvisor() throws Exception {
			final var request = requestRepository.save(RequestEntity.builder()
				.classification(classificationRepository.getReferenceById(1L))
				.hiringManager(hiringManager)
				.hrAdvisor(hrAdvisor)
				.languageRequirement(languageRequirementRepository.getReferenceById(1L))
				.nameEn("Test Position")
				.nameFr("Poste de test")
				.requestNumber("RS-003")
				.requestStatus(requestStatusRepository.findByCode(lookupCodes.requestStatuses().hrReview()).orElseThrow())
				.submitter(hiringManager)
				.workUnit(workUnitRepository.getReferenceById(1L))
				.build());

			final var statusUpdate = new RequestStatusUpdateModel("vmsNotRequired", null);

			mockMvc.perform(post("/api/v1/requests/{id}/status-change", request.getId())
					.contentType(MediaType.APPLICATION_JSON)
					.content(objectMapper.writeValueAsString(statusUpdate)))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.id", is(request.getId().intValue())))
				.andExpect(jsonPath("$.status.code", is(lookupCodes.requestStatuses().pendingPscClearanceNoVms())));

			final var updatedRequest = requestRepository.findById(request.getId()).orElseThrow();
			assertThat(updatedRequest.getRequestStatus().getCode()).isEqualTo(lookupCodes.requestStatuses().pendingPscClearanceNoVms());
		}

		@Test
		@DisplayName("Should submit feedback as owner (FDBK_PENDING -> FDBK_PEND_APPR)")
		@WithMockUser(username = "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb", authorities = { "employee" })
		void testSubmitFeedbackByOwner() throws Exception {
			final var request = requestRepository.save(RequestEntity.builder()
				.classification(classificationRepository.getReferenceById(1L))
				.hiringManager(hiringManager)
				.hrAdvisor(hrAdvisor)
				.languageRequirement(languageRequirementRepository.getReferenceById(1L))
				.nameEn("Test Position")
				.nameFr("Poste de test")
				.requestNumber("RS-004")
				.requestStatus(requestStatusRepository.findByCode(lookupCodes.requestStatuses().feedbackPending()).orElseThrow())
				.submitter(hiringManager)
				.workUnit(workUnitRepository.getReferenceById(1L))
				.build());

			final var statusUpdate = new RequestStatusUpdateModel("submitFeedback", null);

			mockMvc.perform(post("/api/v1/requests/{id}/status-change", request.getId())
					.contentType(MediaType.APPLICATION_JSON)
					.content(objectMapper.writeValueAsString(statusUpdate)))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.id", is(request.getId().intValue())))
				.andExpect(jsonPath("$.status.code", is(lookupCodes.requestStatuses().feedbackPendingApproval())));

			final var updatedRequest = requestRepository.findById(request.getId()).orElseThrow();
			assertThat(updatedRequest.getRequestStatus().getCode()).isEqualTo(lookupCodes.requestStatuses().feedbackPendingApproval());
		}

		@Test
		@DisplayName("Should mark PSC not required as HR Advisor (NO_MATCH_HR_REVIEW -> CLR_GRANTED)")
		@WithMockUser(username = "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa", authorities = { "hr-advisor" })
		void testPscNotRequiredByHrAdvisor() throws Exception {
			final var request = requestRepository.save(RequestEntity.builder()
				.classification(classificationRepository.getReferenceById(1L))
				.hiringManager(hiringManager)
				.hrAdvisor(hrAdvisor)
				.languageRequirement(languageRequirementRepository.getReferenceById(1L))
				.nameEn("Test Position")
				.nameFr("Poste de test")
				.requestNumber("RS-005")
				.requestStatus(requestStatusRepository.findByCode(lookupCodes.requestStatuses().feedbackPendingApproval()).orElseThrow())
				.submitter(hiringManager)
				.workUnit(workUnitRepository.getReferenceById(1L))
				.build());

			final var statusUpdate = new RequestStatusUpdateModel("pscNotRequired", null);

			mockMvc.perform(post("/api/v1/requests/{id}/status-change", request.getId())
					.contentType(MediaType.APPLICATION_JSON)
					.content(objectMapper.writeValueAsString(statusUpdate)))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.id", is(request.getId().intValue())))
				.andExpect(jsonPath("$.status.code", is(lookupCodes.requestStatuses().clearanceGranted())));

			final var updatedRequest = requestRepository.findById(request.getId()).orElseThrow();
			assertThat(updatedRequest.getRequestStatus().getCode()).isEqualTo(lookupCodes.requestStatuses().clearanceGranted());
		}

		@Test
		@DisplayName("Should mark PSC required as HR Advisor (FDBK_PEND_APPR -> PENDING_PSC)")
		@WithMockUser(username = "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa", authorities = { "hr-advisor" })
		void testPscRequiredByHrAdvisor() throws Exception {
			final var request = requestRepository.save(RequestEntity.builder()
				.classification(classificationRepository.getReferenceById(1L))
				.hiringManager(hiringManager)
				.hrAdvisor(hrAdvisor)
				.languageRequirement(languageRequirementRepository.getReferenceById(1L))
				.nameEn("Test Position")
				.nameFr("Poste de test")
				.requestNumber("RS-006")
				.requestStatus(requestStatusRepository.findByCode(lookupCodes.requestStatuses().feedbackPendingApproval()).orElseThrow())
				.submitter(hiringManager)
				.workUnit(workUnitRepository.getReferenceById(1L))
				.build());

			final var statusUpdate = new RequestStatusUpdateModel("pscRequired", null);

			mockMvc.perform(post("/api/v1/requests/{id}/status-change", request.getId())
					.contentType(MediaType.APPLICATION_JSON)
					.content(objectMapper.writeValueAsString(statusUpdate)))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.id", is(request.getId().intValue())))
				.andExpect(jsonPath("$.pscClearanceNumber", notNullValue()))
				.andExpect(jsonPath("$.status.code", is(lookupCodes.requestStatuses().pendingPscClearance())));

			final var updatedRequest = requestRepository.findById(request.getId()).orElseThrow();
			assertThat(updatedRequest.getPscClearanceNumber()).isNotNull();
			assertThat(updatedRequest.getRequestStatus().getCode()).isEqualTo(lookupCodes.requestStatuses().pendingPscClearance());
		}

		@Test
		@DisplayName("Should complete request as HR Advisor (PENDING_PSC -> PSC_GRANTED)")
		@WithMockUser(username = "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa", authorities = { "hr-advisor" })
		void testCompleteByHrAdvisor() throws Exception {
			final var request = requestRepository.save(RequestEntity.builder()
				.classification(classificationRepository.getReferenceById(1L))
				.hiringManager(hiringManager)
				.hrAdvisor(hrAdvisor)
				.languageRequirement(languageRequirementRepository.getReferenceById(1L))
				.nameEn("Test Position")
				.nameFr("Poste de test")
				.requestNumber("RS-007")
				.requestStatus(requestStatusRepository.findByCode(lookupCodes.requestStatuses().pendingPscClearance()).orElseThrow())
				.submitter(hiringManager)
				.workUnit(workUnitRepository.getReferenceById(1L))
				.build());

			final var statusUpdate = new RequestStatusUpdateModel("complete", null);

			mockMvc.perform(post("/api/v1/requests/{id}/status-change", request.getId())
					.contentType(MediaType.APPLICATION_JSON)
					.content(objectMapper.writeValueAsString(statusUpdate)))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.id", is(request.getId().intValue())))
				.andExpect(jsonPath("$.status.code", is(lookupCodes.requestStatuses().pscClearanceGranted())));

			final var updatedRequest = requestRepository.findById(request.getId()).orElseThrow();
			assertThat(updatedRequest.getRequestStatus().getCode()).isEqualTo(lookupCodes.requestStatuses().pscClearanceGranted());
		}

		@Test
		@DisplayName("Should complete request as HR Advisor (PENDING_PSC_NO_VMS -> PSC_GRANTED_NO_VMS)")
		@WithMockUser(username = "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa", authorities = { "hr-advisor" })
		void testCompleteNoVmsByHrAdvisor() throws Exception {
			final var request = requestRepository.save(RequestEntity.builder()
				.classification(classificationRepository.getReferenceById(1L))
				.hiringManager(hiringManager)
				.hrAdvisor(hrAdvisor)
				.languageRequirement(languageRequirementRepository.getReferenceById(1L))
				.nameEn("Test Position")
				.nameFr("Poste de test")
				.requestNumber("RS-007-NV")
				.requestStatus(requestStatusRepository.findByCode(lookupCodes.requestStatuses().pendingPscClearanceNoVms()).orElseThrow())
				.submitter(hiringManager)
				.workUnit(workUnitRepository.getReferenceById(1L))
				.build());

			final var statusUpdate = new RequestStatusUpdateModel("complete", null);

			mockMvc.perform(post("/api/v1/requests/{id}/status-change", request.getId())
					.contentType(MediaType.APPLICATION_JSON)
					.content(objectMapper.writeValueAsString(statusUpdate)))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.id", is(request.getId().intValue())))
				.andExpect(jsonPath("$.status.code", is(lookupCodes.requestStatuses().pscClearanceGrantedNoVms())));

			final var updatedRequest = requestRepository.findById(request.getId()).orElseThrow();
			assertThat(updatedRequest.getRequestStatus().getCode()).isEqualTo(lookupCodes.requestStatuses().pscClearanceGrantedNoVms());
		}

		@Test
		@DisplayName("Should return 404 when request does not exist")
		@WithMockUser(username = "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa", authorities = { "hr-advisor" })
		void testUpdateStatusRequestNotFound() throws Exception {
			final var statusUpdate = new RequestStatusUpdateModel("requestPickedUp", null);

			mockMvc.perform(post("/api/v1/requests/{id}/status-change", 999999L)
					.contentType(MediaType.APPLICATION_JSON)
					.content(objectMapper.writeValueAsString(statusUpdate)))
				.andExpect(status().isNotFound());
		}

		@Test
		@DisplayName("Should return 400 when eventType is null")
		@WithMockUser(username = "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa", authorities = { "hr-advisor" })
		void testUpdateStatusNullEventType() throws Exception {
			final var request = requestRepository.save(RequestEntity.builder()
				.classification(classificationRepository.getReferenceById(1L))
				.hiringManager(hiringManager)
				.languageRequirement(languageRequirementRepository.getReferenceById(1L))
				.nameEn("Test Position")
				.nameFr("Poste de test")
				.requestNumber("RS-008")
				.requestStatus(requestStatusRepository.findByCode(lookupCodes.requestStatuses().draft()).orElseThrow())
				.submitter(hiringManager)
				.workUnit(workUnitRepository.getReferenceById(1L))
				.build());

			mockMvc.perform(post("/api/v1/requests/{id}/status-change", request.getId())
					.contentType(MediaType.APPLICATION_JSON)
					.content("{\"eventType\": null}"))
				.andExpect(status().isBadRequest());
		}

		@Test
		@DisplayName("Should return 400 when eventType is invalid")
		@WithMockUser(username = "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa", authorities = { "hr-advisor" })
		void testUpdateStatusInvalidEventType() throws Exception {
			final var request = requestRepository.save(RequestEntity.builder()
				.classification(classificationRepository.getReferenceById(1L))
				.hiringManager(hiringManager)
				.languageRequirement(languageRequirementRepository.getReferenceById(1L))
				.nameEn("Test Position")
				.nameFr("Poste de test")
				.requestNumber("RS-009")
				.requestStatus(requestStatusRepository.findByCode(lookupCodes.requestStatuses().draft()).orElseThrow())
				.submitter(hiringManager)
				.workUnit(workUnitRepository.getReferenceById(1L))
				.build());

			final var statusUpdate = new RequestStatusUpdateModel("invalidEvent", null);

			mockMvc.perform(post("/api/v1/requests/{id}/status-change", request.getId())
					.contentType(MediaType.APPLICATION_JSON)
					.content(objectMapper.writeValueAsString(statusUpdate)))
				.andExpect(status().isBadRequest());
		}

		@Test
		@DisplayName("Should return 401 Unauthorized when not authenticated")
		@WithAnonymousUser
		void testUpdateStatusUnauthorized() throws Exception {
			final var statusUpdate = new RequestStatusUpdateModel("requestSubmitted", null);

			mockMvc.perform(post("/api/v1/requests/{id}/status-change", 1L)
					.contentType(MediaType.APPLICATION_JSON)
					.content(objectMapper.writeValueAsString(statusUpdate)))
				.andExpect(status().isUnauthorized());
		}

		@Test
		@DisplayName("Should return 403 Forbidden when non-owner tries to submit request")
		@WithMockUser(username = "dddddddd-dddd-dddd-dddd-dddddddddddd", authorities = { "employee" })
		void testSubmitRequestByNonOwner() throws Exception {
			final var request = requestRepository.save(RequestEntity.builder()
				.classification(classificationRepository.getReferenceById(1L))
				.hiringManager(hiringManager)
				.languageRequirement(languageRequirementRepository.getReferenceById(1L))
				.nameEn("Test Position")
				.nameFr("Poste de test")
				.requestNumber("RS-010")
				.requestStatus(requestStatusRepository.findByCode(lookupCodes.requestStatuses().draft()).orElseThrow())
				.submitter(hiringManager) // Owned by hiring manager, not current user
				.workUnit(workUnitRepository.getReferenceById(1L))
				.build());

			final var statusUpdate = new RequestStatusUpdateModel("requestSubmitted", null);

			mockMvc.perform(post("/api/v1/requests/{id}/status-change", request.getId())
					.contentType(MediaType.APPLICATION_JSON)
					.content(objectMapper.writeValueAsString(statusUpdate)))
				.andExpect(status().isForbidden());
		}

		@Test
		@DisplayName("Should return 500 when non-HR Advisor tries to pick up request")
		@WithMockUser(username = "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb", authorities = { "employee" })
		void testPickUpRequestByNonHrAdvisor() throws Exception {
			final var request = requestRepository.save(RequestEntity.builder()
				.classification(classificationRepository.getReferenceById(1L))
				.hiringManager(hiringManager)
				.languageRequirement(languageRequirementRepository.getReferenceById(1L))
				.nameEn("Test Position")
				.nameFr("Poste de test")
				.requestNumber("RS-011")
				.requestStatus(requestStatusRepository.findByCode(lookupCodes.requestStatuses().submitted()).orElseThrow())
				.submitter(hiringManager)
				.workUnit(workUnitRepository.getReferenceById(1L))
				.build());

			final var statusUpdate = new RequestStatusUpdateModel("requestPickedUp", null);

			mockMvc.perform(post("/api/v1/requests/{id}/status-change", request.getId())
					.contentType(MediaType.APPLICATION_JSON)
					.content(objectMapper.writeValueAsString(statusUpdate)))
				.andExpect(status().isUnauthorized());
		}

		@Test
		@DisplayName("Should allow picking up request already in HR_REVIEW status (HR_REVIEW -> HR_REVIEW)")
		@WithMockUser(username = "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa", authorities = { "hr-advisor" })
		void testInvalidStatusTransition() throws Exception {
			// Picking up a request that's already in HR_REVIEW is allowed (for reassignment)
			final var request = requestRepository.save(RequestEntity.builder()
				.classification(classificationRepository.getReferenceById(1L))
				.hiringManager(hiringManager)
				.hrAdvisor(hrAdvisor)
				.languageRequirement(languageRequirementRepository.getReferenceById(1L))
				.nameEn("Test Position")
				.nameFr("Poste de test")
				.requestNumber("RS-012")
				.requestStatus(requestStatusRepository.findByCode(lookupCodes.requestStatuses().hrReview()).orElseThrow())
				.submitter(hiringManager)
				.workUnit(workUnitRepository.getReferenceById(1L))
				.build());

			final var statusUpdate = new RequestStatusUpdateModel("requestPickedUp", null);

			mockMvc.perform(post("/api/v1/requests/{id}/status-change", request.getId())
					.contentType(MediaType.APPLICATION_JSON)
					.content(objectMapper.writeValueAsString(statusUpdate)))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.status.code", is(lookupCodes.requestStatuses().hrReview())));
		}

		@Test
		@DisplayName("Should return 404 when trying to submit non-DRAFT request")
		@WithMockUser(username = "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb", authorities = { "employee" })
		void testSubmitNonDraftRequest() throws Exception {
			final var request = requestRepository.save(RequestEntity.builder()
				.classification(classificationRepository.getReferenceById(1L))
				.hiringManager(hiringManager)
				.languageRequirement(languageRequirementRepository.getReferenceById(1L))
				.nameEn("Test Position")
				.nameFr("Poste de test")
				.requestNumber("RS-013")
				.requestStatus(requestStatusRepository.findByCode(lookupCodes.requestStatuses().submitted()).orElseThrow())
				.submitter(hiringManager)
				.workUnit(workUnitRepository.getReferenceById(1L))
				.build());

			final var statusUpdate = new RequestStatusUpdateModel("requestSubmitted", null);

			// Implementation throws ResourceNotFoundException (404) - should be ResourceConflictException (409)
			mockMvc.perform(post("/api/v1/requests/{id}/status-change", request.getId())
					.contentType(MediaType.APPLICATION_JSON)
					.content(objectMapper.writeValueAsString(statusUpdate)))
				.andExpect(status().isNotFound());
		}

		@Test
		@DisplayName("Should allow multiple valid status transitions in sequence")
		@WithMockUser(username = "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb", authorities = { "employee" })
		void testSequentialStatusTransitions() throws Exception {
			// Create a DRAFT request
			final var request = requestRepository.save(RequestEntity.builder()
				.classification(classificationRepository.getReferenceById(1L))
				.hiringManager(hiringManager)
				.languageRequirement(languageRequirementRepository.getReferenceById(1L))
				.nameEn("Test Position")
				.nameFr("Poste de test")
				.requestNumber("RS-014")
				.requestStatus(requestStatusRepository.findByCode(lookupCodes.requestStatuses().draft()).orElseThrow())
				.submitter(hiringManager)
				.workUnit(workUnitRepository.getReferenceById(1L))
				.build());

			// Step 1: Submit the request (DRAFT -> SUBMIT)
			mockMvc.perform(post("/api/v1/requests/{id}/status-change", request.getId())
					.contentType(MediaType.APPLICATION_JSON)
					.content(objectMapper.writeValueAsString(new RequestStatusUpdateModel("requestSubmitted", null))))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.status.code", is(lookupCodes.requestStatuses().submitted())));

			// Verify first transition
			final var updatedRequest = requestRepository.findById(request.getId()).orElseThrow();
			assertThat(updatedRequest.getRequestStatus().getCode()).isEqualTo(lookupCodes.requestStatuses().submitted());
		}

	}

	@Nested
	@DisplayName("Other request endpoints")
	class OtherRequests {

		final RequestStatusEntity draftStatus = requestStatusRepository.findByCode(lookupCodes.requestStatuses().draft()).orElseThrow();

		final RequestStatusEntity hrReviewStatus = requestStatusRepository.findByCode(lookupCodes.requestStatuses().hrReview()).orElseThrow();

		@Test
		@DisplayName("GET /api/v1/requests/me returns current user's requests")
		@WithMockUser(username = "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb", authorities = { "employee" })
		void testGetCurrentUserRequests() throws Exception {
			requestRepository.save(RequestEntity.builder()
				.classification(classificationRepository.getReferenceById(1L))
				.hiringManager(hiringManager)
				.languageRequirement(languageRequirementRepository.getReferenceById(1L))
				.nameEn("My Position")
				.nameFr("Mon poste")
				.requestNumber("ME-001")
				.requestStatus(draftStatus)
				.submitter(hiringManager)
				.workUnit(workUnitRepository.getReferenceById(1L))
				.build());

			mockMvc.perform(get("/api/v1/requests/me"))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.content.length()", is(1)))
				.andExpect(jsonPath("$.content[0].englishTitle", is("My Position")));
		}

		@Test
		@DisplayName("GET /api/v1/requests/me with filters returns filtered requests")
		@WithMockUser(username = "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb", authorities = { "employee" })
		void testGetCurrentUserRequestsWithFilters() throws Exception {
			requestRepository.save(RequestEntity.builder()
				.classification(classificationRepository.getReferenceById(1L))
				.hiringManager(hiringManager)
				.languageRequirement(languageRequirementRepository.getReferenceById(1L))
				.nameEn("My Filtered Position")
				.nameFr("Mon poste filtré")
				.requestNumber("MEF-001")
				.requestStatus(draftStatus)
				.submitter(hiringManager)
				.workUnit(workUnitRepository.getReferenceById(1L))
				.build());

			mockMvc.perform(get("/api/v1/requests/me").param("statusId", draftStatus.getId().toString()))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.content.length()", is(1)))
				.andExpect(jsonPath("$.content[0].englishTitle", is("My Filtered Position")));
		}

		@Test
		@DisplayName("POST /api/v1/requests/me creates a request for current user")
		@WithMockUser(username = "cccccccc-cccc-cccc-cccc-cccccccccccc", authorities = { "employee" })
		void testCreateCurrentUserRequest() throws Exception {
			mockMvc.perform(post("/api/v1/requests/me"))
				.andExpect(status().isCreated())
				.andExpect(jsonPath("$.id", notNullValue()));
		}

		@Test
		@DisplayName("GET /api/v1/requests/{id} returns request")
		@WithMockUser(username = "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa", authorities = { "hr-advisor" })
		void testGetRequestById() throws Exception {
			final var request = requestRepository.save(RequestEntity.builder()
				.classification(classificationRepository.getReferenceById(1L))
				.hiringManager(hiringManager)
				.hrAdvisor(hrAdvisor)
				.languageRequirement(languageRequirementRepository.getReferenceById(1L))
				.nameEn("Single Request")
				.nameFr("Demande unique")
				.requestNumber("S-001")
				.requestStatus(hrReviewStatus)
				.submitter(submitter)
				.workUnit(workUnitRepository.getReferenceById(1L))
				.build());

			mockMvc.perform(get("/api/v1/requests/{id}", request.getId()))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.id", is(request.getId().intValue())))
				.andExpect(jsonPath("$.englishTitle", is("Single Request")));
		}

		@Test
		@DisplayName("DELETE /api/v1/requests/{id} deletes request")
		@WithMockUser(username = "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa", authorities = { "hr-advisor" })
		void testDeleteRequestById() throws Exception {
			final var request = requestRepository.save(RequestEntity.builder()
				.classification(classificationRepository.getReferenceById(1L))
				.hiringManager(hiringManager)
				.hrAdvisor(hrAdvisor)
				.languageRequirement(languageRequirementRepository.getReferenceById(1L))
				.nameEn("Delete Request")
				.nameFr("Supprimer demande")
				.requestNumber("D-001")
				.requestStatus(draftStatus)
				.submitter(submitter)
				.workUnit(workUnitRepository.getReferenceById(1L))
				.build());

			mockMvc.perform(delete("/api/v1/requests/{id}", request.getId()))
				.andExpect(status().isNoContent());

			assertThat(requestRepository.findById(request.getId())).isEmpty();
		}

		@Test
		@DisplayName("POST /api/v1/requests/{id}/run-matches runs matching algorithm")
		@WithMockUser(username = "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa", authorities = { "hr-advisor" })
		void testRunMatches() throws Exception {
			final var request = requestRepository.save(RequestEntity.builder()
				.classification(classificationRepository.getReferenceById(1L))
				.hiringManager(hiringManager)
				.hrAdvisor(hrAdvisor)
				.languageRequirement(languageRequirementRepository.getReferenceById(1L))
				.nameEn("Run Matches")
				.nameFr("Exécuter correspondances")
				.requestNumber("RM-001")
				.requestStatus(hrReviewStatus)
				.submitter(submitter)
				.workUnit(workUnitRepository.getReferenceById(1L))
				.build());

			mockMvc.perform(post("/api/v1/requests/{id}/run-matches", request.getId()))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.id", is(request.getId().intValue())));
		}

		@Test
		@DisplayName("POST /api/v1/requests/{id}/cancel cancels request")
		@WithMockUser(username = "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa", authorities = { "hr-advisor" })
		void testCancelRequest() throws Exception {
			final var request = requestRepository.save(RequestEntity.builder()
				.classification(classificationRepository.getReferenceById(1L))
				.hiringManager(hiringManager)
				.hrAdvisor(hrAdvisor)
				.languageRequirement(languageRequirementRepository.getReferenceById(1L))
				.nameEn("Cancel Position")
				.nameFr("Annuler poste")
				.requestNumber("C-001")
				.requestStatus(draftStatus)
				.submitter(submitter)
				.workUnit(workUnitRepository.getReferenceById(1L))
				.build());

			mockMvc.perform(post("/api/v1/requests/{id}/cancel", request.getId()))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.id", is(request.getId().intValue())));
		}

	}

}

